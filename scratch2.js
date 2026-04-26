import { GoogleGenAI } from '@google/genai';

globalThis.fetch = async (url, options) => {
  console.log("FETCH BODY:", options.body);
  return new Response(JSON.stringify({ candidates: [{ content: { parts: [{text: "Hi"}]}}]}));
};

const ai = new GoogleGenAI({ apiKey: "test" });
async function run() {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are a bot",
        temperature: 0.7,
      }
    });
    const response = await chat.sendMessage({ message: "Hello" });
    console.log("RESPONSE:", response.text);
  } catch (e) {
    console.error("ERROR:", e.message, Object.keys(e));
  }
}
run();
