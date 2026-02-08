import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        error: "GEMINI_API_KEY is missing. Please add it to your environment variables."
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const { messages, currentFiles, brandConfig } = await req.json();

    const brandSection = brandConfig ? `
      ### Brand Configuration:
      - Primary Color: ${brandConfig.primaryColor}
      - Border Radius: ${brandConfig.borderRadius}
      - Font Family: ${brandConfig.fontFamily}
      Apply these tokens globally in the CSS and component styles.
    ` : "";

    const lastMessage = messages[messages.length - 1];
    const isAudit = lastMessage.isAudit;

    const prompt = `
      ${SYSTEM_PROMPT}

      ${brandSection}

      ${isAudit ? "### TASK: Perform a comprehensive Design Audit and improve the project." : ""}

      Current Project State:
      ${JSON.stringify(currentFiles, null, 2)}

      User Request:
      ${lastMessage.content}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    try {
      return NextResponse.json(JSON.parse(responseText));
    } catch (e) {
      console.error("JSON Parse Error:", responseText);
      return NextResponse.json({ error: "AI returned invalid JSON. Please try again." }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json({
      error: error.message || "Failed to generate content. Please check your API key and quota."
    }, { status: 500 });
  }
}
