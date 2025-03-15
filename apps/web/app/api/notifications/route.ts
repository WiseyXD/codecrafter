// File: app/api/notifications/route.ts
import { NextResponse } from "next/server";
import nodemailer, { SentMessageInfo } from "nodemailer";
import twilio from "twilio";

// Twilio configuration for calls
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID as string,
  process.env.TWILIO_AUTH_TOKEN as string,
);

// Helper function to send email
async function sendMail(
  subject: string,
  toEmail: string | string[],
  emailText: string,
  senderName: string = "Yash @ Olly",
  replyTo?: string,
  isImportant: boolean = false,
  cc?: string | string[],
): Promise<SentMessageInfo> {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PW,
    },
  });
  const mailOptions: nodemailer.SendMailOptions = {
    from: `${senderName} <${process.env.NODEMAILER_EMAIL}>`,
    to: Array.isArray(toEmail) ? toEmail.join(", ") : toEmail,
    subject: subject,
    text: emailText,
    replyTo: replyTo || process.env.NODEMAILER_EMAIL,
    headers: isImportant
      ? { Importance: "high", "X-Priority": "1" }
      : undefined,
  };
  // Add cc to mailOptions if it exists
  if (cc) {
    mailOptions.cc = Array.isArray(cc) ? cc.join(", ") : cc;
  }
  return await new Promise((resolve, reject) => {
    transporter.sendMail(
      mailOptions,
      (err: Error | null, response: SentMessageInfo) => {
        if (err) {
          console.error("Error sending email:", err);
          reject(err);
        } else {
          resolve(response);
        }
      },
    );
  });
}

// Helper function to make a call
async function makeCall(
  phoneNumber: string,
  message: string,
  options: {
    voice?: string;
    language?: string;
    loop?: number;
    pauseDuration?: number;
    introPause?: number;
    secondMessage?: string;
  } = {},
): Promise<{ success: boolean; callSid: string }> {
  try {
    // Default voice settings
    const voice = options.voice || "Polly.Joanna"; // Default to Polly.Joanna (female voice)
    const language = options.language || "en-US";
    const loop = options.loop || 1;
    const pauseDuration = options.pauseDuration || 1;

    // Build TwiML with enhanced speech control
    let twiml = "<Response>";

    // If there's an intro pause requested
    if (options.introPause) {
      twiml += `<Pause length="${options.introPause}"/>`;
    }

    // Add the main message with voice settings
    twiml += `<Say voice="${voice}" language="${language}" loop="${loop}">${message}</Say>`;

    // Add a pause if specified
    if (pauseDuration > 0) {
      twiml += `<Pause length="${pauseDuration}"/>`;
    }

    // Optional: Add a second message if provided
    if (options.secondMessage) {
      twiml += `<Say voice="${voice}" language="${language}">${options.secondMessage}</Say>`;
    }

    twiml += "</Response>";

    const call = await twilioClient.calls.create({
      twiml: twiml,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER as string,
    });

    console.log("Call initiated: ", call.sid);
    return { success: true, callSid: call.sid };
  } catch (error) {
    console.error("Error making call:", error);
    throw error;
  }
}

// Define the request body interface
interface NotificationRequest {
  apiKey: string;
  notificationType: "email" | "call" | "both";
  recipient?: string | string[];
  subject?: string;
  message: string;
  phoneNumber?: string;
  senderName?: string;
  replyTo?: string;
  isImportant?: boolean;
  cc?: string | string[];
  voice?: string;
  language?: string;
  loop?: number;
  pauseDuration?: number;
  introPause?: number;
  secondMessage?: string;
}

// POST handler for the API route
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body: NotificationRequest = await request.json();

    // Validate the request
    if (!body.apiKey || body.apiKey !== process.env.API_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Process the notification based on type
    const { notificationType, recipient, subject, message, phoneNumber } = body;

    let results: {
      email?: any;
      call?: any;
    } = {};

    // Handle email notifications
    if (notificationType === "email" || notificationType === "both") {
      if (!recipient || !subject || !message) {
        return NextResponse.json(
          { error: "Missing required fields for email" },
          { status: 400 },
        );
      }

      // Extract email options if provided
      const senderName = body.senderName || "Yash @ Olly";
      const replyTo = body.replyTo;
      const isImportant = body.isImportant || false;
      const cc = body.cc;

      try {
        const emailResult = await sendMail(
          subject,
          recipient,
          message,
          senderName,
          replyTo,
          isImportant,
          cc,
        );
        results.email = {
          success: true,
          messageId: emailResult.messageId,
        };
      } catch (error: any) {
        console.error("Error sending email:", error);
        results.email = {
          success: false,
          error: error.message,
        };
      }
    }

    // Handle call notifications
    if (notificationType === "call" || notificationType === "both") {
      if (!phoneNumber || !message) {
        return NextResponse.json(
          { error: "Missing required fields for call" },
          { status: 400 },
        );
      }

      // Extract call options if provided
      const callOptions = {
        voice: body.voice || "Polly.Joanna",
        language: body.language || "en-US",
        loop: body.loop || 1,
        pauseDuration: body.pauseDuration || 1,
        introPause: body.introPause || 0,
        secondMessage: body.secondMessage || "",
      };

      try {
        const callResult = await makeCall(phoneNumber, message, callOptions);
        results.call = callResult;
      } catch (error: any) {
        console.error("Error making call:", error);
        results.call = {
          success: false,
          error: error.message,
        };
      }
    }

    // Return success response with results
    return NextResponse.json({
      success: true,
      message: "Notification(s) sent successfully",
      results,
    });
  } catch (error: any) {
    console.error("Error processing notification:", error);

    return NextResponse.json(
      {
        error: "Failed to process notification",
        message: error.message,
      },
      { status: 500 },
    );
  }
}

// Optional: GET handler to check if the API is up
export async function GET() {
  return NextResponse.json({
    status: "API is running",
    time: new Date().toISOString(),
  });
}
// import { NextRequest, NextResponse } from "next/server";
// import nodemailer from "nodemailer";
// import twilio from "twilio";

// // Email configuration
// const emailTransporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: process.env.EMAIL_SECURE === "true",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// // Twilio configuration for calls
// const twilioClient = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN,
// );

// // Helper function to send email
// async function sendEmail(recipient, subject, message) {
//   try {
//     const mailOptions = {
//       from: process.env.EMAIL_FROM,
//       to: recipient,
//       subject: subject,
//       html: message,
//     };

//     const info = await emailTransporter.sendMail(mailOptions);
//     console.log("Email sent: ", info.messageId);
//     return { success: true, messageId: info.messageId };
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw error;
//   }
// }

// // Helper function to make a call
// async function makeCall(phoneNumber, message, options = {}) {
//   try {
//     // Default voice settings
//     const voice = options.voice || "Polly.Joanna"; // Default to Polly.Joanna (female voice)
//     const language = options.language || "en-US";
//     const loop = options.loop || 1;
//     const pauseDuration = options.pauseDuration || 1;

//     // Build TwiML with enhanced speech control
//     let twiml = "<Response>";

//     // If there's an intro pause requested
//     if (options.introPause) {
//       twiml += `<Pause length="${options.introPause}"/>`;
//     }

//     // Add the main message with voice settings
//     twiml += `<Say voice="${voice}" language="${language}" loop="${loop}">${message}</Say>`;

//     // Add a pause if specified
//     if (pauseDuration > 0) {
//       twiml += `<Pause length="${pauseDuration}"/>`;
//     }

//     // Optional: Add a second message if provided
//     if (options.secondMessage) {
//       twiml += `<Say voice="${voice}" language="${language}">${options.secondMessage}</Say>`;
//     }

//     twiml += "</Response>";

//     const call = await twilioClient.calls.create({
//       twiml: twiml,
//       to: phoneNumber,
//       from: process.env.TWILIO_PHONE_NUMBER,
//     });

//     console.log("Call initiated: ", call.sid);
//     return { success: true, callSid: call.sid };
//   } catch (error) {
//     console.error("Error making call:", error);
//     throw error;
//   }
// }

// // POST handler for the API route
// export async function POST(request: NextRequest) {
//   try {
//     // Parse the request body
//     const body = await request.json();

//     // Validate the request
//     if (!body.apiKey || body.apiKey !== process.env.API_SECRET_KEY) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Process the notification based on type
//     const { notificationType, recipient, subject, message, phoneNumber } = body;

//     let results = {};

//     // Handle email notifications
//     if (notificationType === "email" || notificationType === "both") {
//       if (!recipient || !subject || !message) {
//         return NextResponse.json(
//           { error: "Missing required fields for email" },
//           { status: 400 },
//         );
//       }

//       const emailResult = await sendEmail(recipient, subject, message);
//       results.email = emailResult;
//     }

//     // Handle call notifications
//     if (notificationType === "call" || notificationType === "both") {
//       if (!phoneNumber || !message) {
//         return NextResponse.json(
//           { error: "Missing required fields for call" },
//           { status: 400 },
//         );
//       }

//       // Extract call options if provided
//       const callOptions = {
//         voice: body.voice || "Polly.Joanna",
//         language: body.language || "en-US",
//         loop: body.loop || 1,
//         pauseDuration: body.pauseDuration || 1,
//         introPause: body.introPause || 0,
//         secondMessage: body.secondMessage || "",
//       };

//       const callResult = await makeCall(phoneNumber, message, callOptions);
//       results.call = callResult;
//     }

//     // Return success response with results
//     return NextResponse.json({
//       success: true,
//       message: "Notification(s) sent successfully",
//       results,
//     });
//   } catch (error: any) {
//     console.error("Error processing notification:", error);

//     return NextResponse.json(
//       {
//         error: "Failed to process notification",
//         message: error.message,
//       },
//       { status: 500 },
//     );
//   }
// }

// // Optional: GET handler to check if the API is up
// export async function GET() {
//   return NextResponse.json({
//     status: "API is running",
//     time: new Date().toISOString(),
//   });
// }
