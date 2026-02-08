import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    responseMimeType: "application/json",
  }
});

export async function POST(req: Request) {
  try {
    const { messages, currentFiles } = await req.json();

    const prompt = `
      ${SYSTEM_PROMPT}

      Current Project State:
      ${JSON.stringify(currentFiles, null, 2)}

      User Request:
      ${messages[messages.length - 1].content}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}
