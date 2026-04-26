import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });
const SYSTEM_INSTRUCTION = "You are JalDrishti AI...";

async function test() {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    console.log("Chat created");
    const response = await chat.sendMessage({ message: "No water supply in Kormangala" });
    console.log("Response text:", response.text);
  } catch (err) {
    console.error("CAUGHT ERROR:", err.message);
  }
}

test();
