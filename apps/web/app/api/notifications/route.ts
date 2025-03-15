// File: app/api/notifications/route.ts
import { NextResponse } from "next/server";
import nodemailer, { SentMessageInfo } from "nodemailer";
import twilio from "twilio";
import { generateContent } from "@/lib/ai-generator";
import { auth } from "@/auth";

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
  message?: string; // Now optional as it can be AI-generated
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

  // AI content generation
  useAI?: boolean;
  aiContext?: {
    userName?: string;
    eventName?: string;
    eventDate?: string;
    eventLocation?: string;
    additionalDetails?: string;
    urgencyLevel?: "low" | "medium" | "high";
    [key: string]: any;
  };
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

    let { notificationType, subject, recipient, message, phoneNumber } = body;

    let aiGeneratedContent = null;

    // Generate content with AI if requested
    if (body.useAI && body.aiContext) {
      console.log("Generating AI content...");
      aiGeneratedContent = await generateContent({
        contentType: notificationType,
        context: body.aiContext,
      });

      if (!aiGeneratedContent.success) {
        console.error(
          "AI content generation failed:",
          aiGeneratedContent.error,
        );
        return NextResponse.json(
          {
            error: "Failed to generate AI content",
            details: aiGeneratedContent.error,
          },
          { status: 500 },
        );
      }

      // For email, extract subject line if AI generated one (assuming first line is subject)
      if (
        (notificationType === "email" || notificationType === "both") &&
        aiGeneratedContent.emailContent
      ) {
        const emailLines = aiGeneratedContent.emailContent.split("\n");
        if (emailLines[0]?.toLowerCase().startsWith("subject:")) {
          subject = emailLines[0].substring(8).trim();
          // Remove the subject line from the email content
          aiGeneratedContent.emailContent = emailLines
            .slice(1)
            .join("\n")
            .trim();
        }

        // Use AI-generated email content
        message = aiGeneratedContent.emailContent;
      }

      // For call, use AI-generated call script
      if (
        (notificationType === "call" || notificationType === "both") &&
        aiGeneratedContent.callScript
      ) {
        if (
          notificationType === "both" &&
          message === aiGeneratedContent.emailContent
        ) {
          // If both notifications are being sent, use the call script for the call
          body.secondMessage = message; // Use the email content as the second part of the call
          message = aiGeneratedContent.callScript;
        } else {
          message = aiGeneratedContent.callScript;
        }
      }
    }

    let results: {
      email?: any;
      call?: any;
      aiGenerated?: boolean;
    } = {};

    if (aiGeneratedContent) {
      results.aiGenerated = true;
    }

    // Handle email notifications
    if (notificationType === "email" || notificationType === "both") {
      if (!recipient) {
        return NextResponse.json(
          { error: "Missing recipient for email" },
          { status: 400 },
        );
      }

      if (!subject) {
        return NextResponse.json(
          { error: "Missing subject for email" },
          { status: 400 },
        );
      }

      if (!message) {
        return NextResponse.json(
          { error: "Missing message content for email" },
          { status: 400 },
        );
      }

      // Extract email options if provided
      const senderName = body.senderName || "Aryan @ Overwatch";
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
      if (!phoneNumber) {
        return NextResponse.json(
          { error: "Missing phone number for call" },
          { status: 400 },
        );
      }

      if (!message) {
        return NextResponse.json(
          { error: "Missing message content for call" },
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
// // File: app/api/notifications/route.ts
// import { NextResponse } from "next/server";
// import nodemailer, { SentMessageInfo } from "nodemailer";
// import twilio from "twilio";

// // Twilio configuration for calls
// const twilioClient = twilio(
//   process.env.TWILIO_ACCOUNT_SID as string,
//   process.env.TWILIO_AUTH_TOKEN as string,
// );

// // Helper function to send email
// async function sendMail(
//   subject: string,
//   toEmail: string | string[],
//   emailText: string,
//   senderName: string = "Yash @ Olly",
//   replyTo?: string,
//   isImportant: boolean = false,
//   cc?: string | string[],
// ): Promise<SentMessageInfo> {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.NODEMAILER_EMAIL,
//       pass: process.env.NODEMAILER_PW,
//     },
//   });
//   const mailOptions: nodemailer.SendMailOptions = {
//     from: `${senderName} <${process.env.NODEMAILER_EMAIL}>`,
//     to: Array.isArray(toEmail) ? toEmail.join(", ") : toEmail,
//     subject: subject,
//     text: emailText,
//     replyTo: replyTo || process.env.NODEMAILER_EMAIL,
//     headers: isImportant
//       ? { Importance: "high", "X-Priority": "1" }
//       : undefined,
//   };
//   // Add cc to mailOptions if it exists
//   if (cc) {
//     mailOptions.cc = Array.isArray(cc) ? cc.join(", ") : cc;
//   }
//   return await new Promise((resolve, reject) => {
//     transporter.sendMail(
//       mailOptions,
//       (err: Error | null, response: SentMessageInfo) => {
//         if (err) {
//           console.error("Error sending email:", err);
//           reject(err);
//         } else {
//           resolve(response);
//         }
//       },
//     );
//   });
// }

// // Helper function to make a call
// async function makeCall(
//   phoneNumber: string,
//   message: string,
//   options: {
//     voice?: string;
//     language?: string;
//     loop?: number;
//     pauseDuration?: number;
//     introPause?: number;
//     secondMessage?: string;
//   } = {},
// ): Promise<{ success: boolean; callSid: string }> {
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
//       from: process.env.TWILIO_PHONE_NUMBER as string,
//     });

//     console.log("Call initiated: ", call.sid);
//     return { success: true, callSid: call.sid };
//   } catch (error) {
//     console.error("Error making call:", error);
//     throw error;
//   }
// }

// // Define the request body interface
// interface NotificationRequest {
//   apiKey: string;
//   notificationType: "email" | "call" | "both";
//   recipient?: string | string[];
//   subject?: string;
//   message: string;
//   phoneNumber?: string;
//   senderName?: string;
//   replyTo?: string;
//   isImportant?: boolean;
//   cc?: string | string[];
//   voice?: string;
//   language?: string;
//   loop?: number;
//   pauseDuration?: number;
//   introPause?: number;
//   secondMessage?: string;
// }

// // POST handler for the API route
// export async function POST(request: Request) {
//   try {
//     // Parse the request body
//     const body: NotificationRequest = await request.json();

//     // Validate the request
//     if (!body.apiKey || body.apiKey !== process.env.API_SECRET_KEY) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Process the notification based on type
//     const { notificationType, recipient, subject, message, phoneNumber } = body;

//     let results: {
//       email?: any;
//       call?: any;
//     } = {};

//     // Handle email notifications
//     if (notificationType === "email" || notificationType === "both") {
//       if (!recipient || !subject || !message) {
//         return NextResponse.json(
//           { error: "Missing required fields for email" },
//           { status: 400 },
//         );
//       }

//       // Extract email options if provided
//       const senderName = body.senderName || "Yash @ Olly";
//       const replyTo = body.replyTo;
//       const isImportant = body.isImportant || false;
//       const cc = body.cc;

//       try {
//         const emailResult = await sendMail(
//           subject,
//           recipient,
//           message,
//           senderName,
//           replyTo,
//           isImportant,
//           cc,
//         );
//         results.email = {
//           success: true,
//           messageId: emailResult.messageId,
//         };
//       } catch (error: any) {
//         console.error("Error sending email:", error);
//         results.email = {
//           success: false,
//           error: error.message,
//         };
//       }
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

//       try {
//         const callResult = await makeCall(phoneNumber, message, callOptions);
//         results.call = callResult;
//       } catch (error: any) {
//         console.error("Error making call:", error);
//         results.call = {
//           success: false,
//           error: error.message,
//         };
//       }
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
