import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: undefined });
async function run() {
  try {
    const chat = ai.chats.create({ model: 'gemini-2.5-flash' });
    await chat.sendMessage({ message: "Hello" });
  } catch (e) {
    console.error("ERROR CAUGHT:", e.message);
  }
}
run();
