// File: utils/ai-content-generator.ts
import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

interface ContentGenerationParams {
  contentType: "email" | "call" | "both";
  context: {
    userName?: string;
    eventName?: string;
    eventDate?: string;
    eventTime?: string;
    eventLocation?: string;
    alertSeverity?: "critical" | "high" | "medium" | "low";
    alertType?: "intrusion" | "anomaly" | "movement";
    alertStatus?: "unresolved" | "investigating" | "resolved";
    requiredAction?: string;
    additionalDetails?: string;
    contactInformation?: string;
    urgencyLevel?: "low" | "medium" | "high";
    [key: string]: any; // Allow for additional context properties
  };
}

export async function generateContent({
  contentType,
  context,
}: ContentGenerationParams) {
  try {
    let emailContent: string | null = null;
    let callScript: string | null = null;

    // Generate email content if needed
    if (contentType === "email" || contentType === "both") {
      const emailPrompt = `
        Generate a professional security alert email notification with the following details:
        
        EVENT DETAILS:
        - Recipient: ${context.userName || "Security Admin"}
        - Alert Type: ${context.alertType || "security incident"} 
        - Alert Severity: ${context.alertSeverity || "medium"}
        - Event: ${context.eventName || "Security Alert"}
        - Date: ${context.eventDate || "Today"}
        - Time: ${context.eventTime || "Recently"}
        - Location: ${context.eventLocation || "Facility"}
        - Current Status: ${context.alertStatus || "under investigation"}
        - Required Action: ${context.requiredAction || "Review alert details and respond according to protocol"}
        - Urgency: ${context.urgencyLevel || "medium"}
        
        ADDITIONAL CONTEXT:
        ${context.additionalDetails || "No additional details available."}
        
        CONTACT INFORMATION:
        ${context.contactInformation || "Contact the security operations center for assistance."}
        
        REQUIREMENTS:
        1. Write a concise, professional security notification email
        2. Include a clear subject line that communicates the severity and type (format: [SEVERITY] Alert Type - Location)
        3. Start with a brief executive summary of the situation (1-2 sentences)
        4. Include all relevant details structured in an easily scannable format
        5. Clearly state what action is required and by when
        6. Use a tone appropriate for the severity level (more urgent for high/critical)
        7. End with contact information for questions
        8. No salesy language or unnecessary pleasantries - this is a security communication
        9. Do not use markdown or special formatting - just plain text with clear structure

        The email should be formatted professionally with clear sections and follow security communication best practices.
      `;

      const emailResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert security notification system that creates clear, concise, and actionable security alerts. Your communications follow best practices for security incident reporting and are optimized for rapid comprehension and response. You format your responses as plain text emails with clear section breaks.",
          },
          { role: "user", content: emailPrompt },
        ],
        temperature: 0.5, // Lower temperature for more consistent, professional output
        max_tokens: 750,
      });

      //@ts-ignore
      emailContent = emailResponse?.choices[0].message.content!;
    }

    // Generate call script if needed
    if (contentType === "call" || contentType === "both") {
      const callPrompt = `
        Generate a brief, clear security alert phone call script with the following details:
        
        ALERT DETAILS:
        - Recipient: ${context.userName || "Security Admin"}
        - Alert Type: ${context.alertType || "security incident"}
        - Alert Severity: ${context.alertSeverity || "medium"}
        - Event: ${context.eventName || "Security Alert"}
        - Location: ${context.eventLocation || "Facility"}
        - Current Status: ${context.alertStatus || "under investigation"}
        - Required Action: ${context.requiredAction || "Check email and security dashboard immediately"}
        - Urgency: ${context.urgencyLevel || "medium"}
        
        REQUIREMENTS:
        1. VERY brief (under 25 seconds when spoken)
        2. Start with clear identification as a security alert system
        3. State the severity and type immediately
        4. Include only critical information needed for immediate response
        5. Provide clear, specific instructions on what to do next
        6. Use natural, spoken language optimized for text-to-speech systems
        7. No complex sentences or technical jargon unless absolutely necessary
        8. End with a clear call-to-action
        
        The script must be optimized for automated text-to-speech delivery and easy comprehension when heard.
      `;

      const callResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo", // Using GPT-4 for shorter but more precise output
        messages: [
          {
            role: "system",
            content:
              "You are an expert security notification system that creates clear, concise, and actionable automated voice alerts. Your scripts are optimized for text-to-speech systems and follow best practices for emergency communications. You create short, direct scripts that convey urgency appropriate to the situation without causing undue panic.",
          },
          { role: "user", content: callPrompt },
        ],
        temperature: 0.3, // Very low temperature for consistent, predictable voice script
        max_tokens: 250,
      });

      //@ts-ignore
      callScript = callResponse?.choices[0].message.content!;
    }

    // Return the generated content
    return {
      emailContent,
      callScript,
      success: true,
    };
  } catch (error: any) {
    console.error("Error generating AI content:", error);
    return {
      success: false,
      error: error.message,
      emailContent: null,
      callScript: null,
    };
  }
}
