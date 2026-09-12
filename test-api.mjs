async function testEndpoints() {
  console.log("=== 1. Testing clinical-ai-qa ===");
  try {
    const qaRes = await fetch("https://vegtlnhgfjxdntnxbztb.supabase.co/functions/v1/clinical-ai-qa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "나이트 근무할 때 너무 졸려요. 어떻게 버텨야 하나요?" })
    });
    console.log("clinical-ai-qa status:", qaRes.status);
    const qaData = await qaRes.json();
    console.log("clinical-ai-qa response:", JSON.stringify(qaData, null, 2));
  } catch (e) {
    console.error("clinical-ai-qa error:", e);
  }

  console.log("\n=== 2. Testing fortune-generate ===");
  try {
    const fortuneRes = await fetch("https://vegtlnhgfjxdntnxbztb.supabase.co/functions/v1/fortune-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fortune_type: "daily",
        birth_info: { birthDate: "1997-05-15", gender: "여성", calendarType: "양력" }
      })
    });
    console.log("fortune-generate status:", fortuneRes.status);
    const fortuneData = await fortuneRes.json();
    console.log("fortune-generate response:", JSON.stringify(fortuneData, null, 2));
  } catch (e) {
    console.error("fortune-generate error:", e);
  }
  console.log("\n=== 3. Testing schedule-ocr ===");
  try {
    // 1x1 white pixel base64
    const dummyImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
    const ocrRes = await fetch("https://vegtlnhgfjxdntnxbztb.supabase.co/functions/v1/schedule-ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_base64: dummyImage,
        mime_type: "image/png",
        year_month: "2026-09",
        custom_codes: {
          D: { code: "D", name: "데이", isOff: false },
          E: { code: "E", name: "이브닝", isOff: false },
          N: { code: "N", name: "나이트", isOff: false },
          O: { code: "O", name: "오프", isOff: true }
        },
        off_codes: ["O", "OFF", "/"]
      })
    });
    console.log("schedule-ocr status:", ocrRes.status);
    const ocrData = await ocrRes.json();
    console.log("schedule-ocr response:", JSON.stringify(ocrData, null, 2));
  } catch (e) {
    console.error("schedule-ocr error:", e);
  }
}

testEndpoints();
