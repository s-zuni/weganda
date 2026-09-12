const GEMINI_KEY = "AIzaSyCHnto6h-UThCVTRQ9f7ctM1ECrnmnwRWU";

async function checkGeminiModels() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEY}`);
  const data = await res.json();
  if (data.models) {
    const supported = data.models
      .filter(m => m.supportedGenerationMethods?.includes("generateContent"))
      .map(m => ({ name: m.name, displayName: m.displayName, methods: m.supportedGenerationMethods }));
    console.log("Supported Models with generateContent:", JSON.stringify(supported, null, 2));
  } else {
    console.log("Models query error:", data);
  }
}

checkGeminiModels();

