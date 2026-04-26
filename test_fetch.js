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
  
  console.log("Fetching API_URL:", API_URL.replace(API_KEY, "HIDDEN"));
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response:", JSON.stringify(data).substring(0, 200));
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}
test();
