import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization") ?? "" },
        },
      }
    );

    // 유저 확인 (선택적: 게스트 사용자도 OCR 이용 가능)
    let userId: string | null = null;
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) userId = user.id;
    } catch (_) {}

    const body = await req.json().catch(() => ({}));
    const {
      image_base64,
      mime_type = "image/jpeg",
      year_month,
      custom_codes = {},
      off_codes = ["O", "/", "OFF"],
    } = body;

    const currentYearMonth = year_month || new Date().toISOString().slice(0, 7);

    if (!image_base64) {
      return new Response(
        JSON.stringify({
          success: false,
          schedules: [],
          error: "근무표 이미지 데이터가 전달되지 않았습니다.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!OPENAI_API_KEY && !GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          schedules: [],
          error: "AI API 키(OpenAI 또는 Gemini)가 서버에 구성되지 않았습니다.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 사용자가 등록한 병동 표기 규칙 설명 동적 생성
    const customCodeDescriptions = Object.values(custom_codes)
      .map((c: any) => `- [${c.code}]: ${c.name}${c.isOff ? " (오프/휴무)" : ""}`)
      .join("\n");

    const offCodeString = Array.isArray(off_codes) && off_codes.length > 0
      ? off_codes.join(", ")
      : "O, /, OFF, X, F, 휴";

    const prompt = `당신은 대한민국 병원 간호사 근무표(Duty Table / 듀티 캘린더)를 전문으로 판독하는 OCR 전문가입니다.
첨부된 이미지에서 간호사의 날짜별 근무 일정을 정확하게 분석하세요.
기준 년월: ${currentYearMonth}

[해당 병동의 근무 표기 및 매핑 규칙]
${customCodeDescriptions || "- D: 데이(Day)\n- E: 이브닝(Evening)\n- N: 나이트(Night)\n- O: 오프(Off)\n- V: 휴가/연차"}

[중요: 오프(OFF/휴무) 복수 표기 인식 규칙]
- 다음 기호들은 모두 오프(OFF/휴무)로 분류하여 인식하세요: [ ${offCodeString} ]
- 슬래시(/)나 영문 O, 대소문자 f/F, 'OFF', 'X', '휴' 등의 오프 표기가 발견되면 사용자가 지정한 오프 코드로 정확히 매칭하세요.

[출력 형식 규칙]
- 이미지에서 날짜와 근무 코드를 판독할 수 없는 경우, 임의로 가짜 데이터를 지어내지 말고 "schedules": [] 로 비워두세요.
- 판독 성공 시 마크다운 코드블록이나 불필요한 설명 없이 오직 순수한 JSON 문자열만을 출력하세요:
{
  "yearMonth": "${currentYearMonth}",
  "confidence": 0.95,
  "schedules": [
    { "date": "${currentYearMonth}-01", "shiftCode": "D", "memo": "" }
  ]
}`;

    let parsedResult = null;
    let lastErrorMsg = "";

    // 1. OpenAI Vision (gpt-4o-mini) 1차 시도 (정밀도 및 속도 최적화)
    if (OPENAI_API_KEY) {
      try {
        const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mime_type};base64,${image_base64}`,
                    },
                  },
                ],
              },
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
          }),
        });

        if (openAiResponse.ok) {
          const aiData = await openAiResponse.json();
          const contentText = aiData.choices?.[0]?.message?.content;
          if (contentText) {
            try {
              parsedResult = JSON.parse(contentText);
              lastErrorMsg = `OpenAI Vision 분석 완료: ${parsedResult?.schedules?.length || 0}개 스케줄 판독됨`;
            } catch (pErr) {
              lastErrorMsg = `OpenAI Vision JSON 파싱 오류: ${pErr}`;
            }
          }
        } else {
          const errBody = await openAiResponse.text();
          lastErrorMsg = `OpenAI Vision (${openAiResponse.status}): ${errBody}`;
        }
      } catch (openAiErr: any) {
        lastErrorMsg = `OpenAI Vision 에러: ${openAiErr?.message || String(openAiErr)}`;
      }
    } else {
      lastErrorMsg = "OPENAI_API_KEY 미설정";
    }

    // 2. OpenAI 미인식/장애 시 Google Gemini 2차 폴백
    if ((!parsedResult || !parsedResult.schedules || parsedResult.schedules.length === 0) && GEMINI_API_KEY) {
      const preferredModels = [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
      ];
      let candidateModels = [...preferredModels];

      try {
        const listModelsRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
        );
        if (listModelsRes.ok) {
          const listData = await listModelsRes.json();
          const available = (listData.models || [])
            .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
            .map((m: any) => m.name.replace("models/", ""))
            .filter((name: string) => !name.includes("preview") && !name.includes("tuning") && !name.includes("experimental"));
          const matched = preferredModels.filter((p) => available.includes(p));
          if (matched.length > 0) {
            candidateModels = matched;
          }
        }
      } catch (_) {}

      for (const model of candidateModels) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
          const geminiBody = {
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: mime_type,
                      data: image_base64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              response_mime_type: "application/json",
              temperature: 0.1,
            },
          };

          const geminiResponse = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(geminiBody),
          });

          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            const contentText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (contentText) {
              const cleaned = contentText.replace(/```json/g, "").replace(/```/g, "").trim();
              parsedResult = JSON.parse(cleaned);
              if (parsedResult?.schedules && parsedResult.schedules.length > 0) {
                break;
              }
            }
          } else {
            const geminiErr = await geminiResponse.text();
            lastErrorMsg = (lastErrorMsg ? `${lastErrorMsg} | ` : "") + `Gemini (${model}): ${geminiErr}`;
          }
        } catch (callErr: any) {
          const cMsg = callErr?.message || String(callErr);
          lastErrorMsg = (lastErrorMsg ? `${lastErrorMsg} | ` : "") + `Gemini (${model}): ${cMsg}`;
          console.warn(`Gemini model ${model} call error:`, callErr);
        }
      }
    }

    if (!parsedResult || !parsedResult.schedules || parsedResult.schedules.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          yearMonth: currentYearMonth,
          confidence: 0,
          schedules: [],
          error: "근무표 이미지에서 스케줄을 인식하지 못했습니다. 사진의 조명이나 글자가 선명한지 확인해 주세요.",
          details: lastErrorMsg,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        yearMonth: parsedResult.yearMonth || currentYearMonth,
        confidence: parsedResult.confidence || 0.9,
        schedules: parsedResult.schedules,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("schedule-ocr handler error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        schedules: [],
        error: error.message || "OCR 분석 중 오류가 발생했습니다.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
