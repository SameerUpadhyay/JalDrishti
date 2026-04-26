import { GoogleGenAI } from '@google/genai';

globalThis.fetch = async (url, options) => {
  console.log("FETCH URL:", url);
  console.log("FETCH BODY:", options.body);
  return new Response(JSON.stringify({ candidates: [{ content: { parts: [{text: "Hi"}]}}]}));
};

const ai = new GoogleGenAI({ apiKey: "test" });
async function run() {
  try {
    const chat = ai.chats.create({ model: 'gemini-2.5-flash' });
    const response = await chat.sendMessage({ message: [{text: "Hello"}] });
    console.log("RESPONSE 4:", response.text);
  } catch (e) {
    console.error("ERROR 4:", e.message);
  }
}
run();
