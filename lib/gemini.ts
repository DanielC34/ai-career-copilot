import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GOOGLE_API_KEY) {
    throw new Error("Missing GOOGLE_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Using gemini-2.0-flash-exp - latest experimental model
export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
