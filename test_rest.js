const API_KEY = process.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

async function test() {
  const requestPayload = {
    systemInstruction: {
      parts: [{ text: "You are a bot" }]
    },
    contents: [{ role: "user", parts: [{ text: "Hello" }] }],
    generationConfig: { temperature: 0.7 }
  };
  console.log(JSON.stringify(requestPayload));
}
test();
