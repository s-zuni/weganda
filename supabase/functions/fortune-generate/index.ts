import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 운세 스마트 기본값 (네트워크 또는 장애 시 안전한 폴백)
const DEFAULT_FORTUNE = {
  title: "오늘의 간호 운세",
  fortuneText: "동료들과의 인수인계 호흡이 매끄럽고 라운딩이 여유로운 날입니다. 꼼꼼한 투약 확인으로 환자에게 큰 신뢰를 얻겠습니다.",
  overallScore: 94,
  scores: {
    colleague: 92,
    career: 95,
    rest: 96,
  },
  biorhythm: {
    injectionScore: 98,
    communicationScore: 90,
    mentalScore: 94,
  },
  lucky: {
    item: "3색 볼펜",
    color: "비바 코랄 핑크 (#FF507C)",
    number: 7,
    direction: "스테이션 동쪽",
  },
  advice: "스스로를 아끼는 마음이 최고의 간호입니다. 오늘도 칼퇴를 응원해요!",
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

    // 1. 유저 인증 확인 (선택적: 로그인 사용자면 캐시 활용, 비로그인/게스트도 운세 생성 허용)
    let userId: string | null = null;
    try {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      if (user) userId = user.id;
    } catch (_) {}

    const body = await req.json().catch(() => ({}));
    const fortuneType = body.fortune_type || "daily";
    const birthInfo = body.birth_info || {};
    const partnerInfo = body.partner_info || {};
    const colleagueInfo = body.colleague_info || {};
    const today = new Date().toISOString().split("T")[0];

    // 2. 캐시 확인 (로그인 사용자인 경우 당일 기생성 운세 재활용)
    if (userId) {
      try {
        const { data: cached } = await supabaseClient
          .from("fortune_cache")
          .select("result")
          .eq("user_id", userId)
          .eq("date", today)
          .eq("fortune_type", fortuneType)
          .maybeSingle();

        if (cached?.result) {
          return new Response(JSON.stringify({ ...cached.result, cached: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (cacheErr) {
        console.warn("Notice checking cache:", cacheErr);
      }
    }

    // 3. OpenAI 시스템 프롬프트 구성
    let systemPrompt = `당신은 대한민국 3교대 간호사(Day/Evening/Night)의 일상과 임상 현장을 깊이 이해하고 공감하는 20년 경력의 수간호사이자 전문 사주/운세 카운슬러입니다.
사용자 생년월일(${birthInfo.birthDate || "미상"}, 태어난시간: ${birthInfo.birthTime || "미상"}, 양음력: ${birthInfo.calendarType || "양력"}, 성별: ${birthInfo.gender || "여성"})을 바탕으로 오늘의 간호 운세와 임상 바이오리듬을 생성하세요.
오늘 날짜: ${today}

답변은 반드시 다음 JSON 형식만을 순수 JSON으로 반환해야 합니다:
{
  "title": "오늘의 간호 운세",
  "fortuneText": "오늘 근무 중 일어날 수 있는 상황과 칼퇴 팁, 위로가 되는 문장 (2~3문장)",
  "overallScore": 95,
  "scores": {
    "colleague": 92,
    "career": 95,
    "rest": 98
  },
  "biorhythm": {
    "injectionScore": 98,
    "communicationScore": 88,
    "mentalScore": 92
  },
  "lucky": {
    "item": "3색 볼펜",
    "color": "비바 코랄 핑크 (#FF507C)",
    "number": 7,
    "direction": "스테이션 동쪽"
  },
  "advice": "오늘의 한줄 힐링 조언"
}`;

    if (fortuneType === "saju") {
      systemPrompt += `\n[간호사주 모드]: 직장 오행 궁합, 간호사 적합도(%), 추천 병동 랭킹 및 10년 대운 해석을 상세히 포함하세요.`;
    } else if (fortuneType === "love") {
      systemPrompt += `\n[애인/연애운 모드]: 상대방 정보(${partnerInfo.birthDate || ""}, MBTI: ${partnerInfo.mbti || ""})와의 3교대 연애 케미와 데이트 팁을 포함하세요.`;
    } else if (fortuneType === "career") {
      systemPrompt += `\n[직업/이직운 모드]: 동료(${colleagueInfo.name || "동료"})와의 듀티 호흡, 이직 및 승진 운세를 포함하세요.`;
    } else if (fortuneType === "wealth") {
      systemPrompt += `\n[재물운 모드]: 3교대 특수 수당, 야간 나이트 수당 활용법 및 소비 성향 조언을 포함하세요.`;
    }

    let resultJson = null;

    // 4. OpenAI 호출 (gpt-4o-mini)
    if (OPENAI_API_KEY) {
      try {
        const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `오늘 날짜는 ${today}입니다. ${fortuneType} 운세를 생성해주세요.` },
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
          }),
        });

        if (openAiResponse.ok) {
          const aiData = await openAiResponse.json();
          resultJson = JSON.parse(aiData.choices[0].message.content);
        } else {
          const errText = await openAiResponse.text();
          console.warn("OpenAI fortune call failed with status:", openAiResponse.status, errText);
        }
      } catch (e) {
        console.warn("OpenAI fortune call error:", e);
      }
    }

    // 5. OpenAI 미응답/크레딧 오류 시 스마트 운세 폴백 적용
    if (!resultJson) {
      resultJson = DEFAULT_FORTUNE;
    }

    // 캐시에 저장 (로그인 사용자인 경우)
    if (userId) {
      try {
        await supabaseClient.from("fortune_cache").upsert({
          user_id: userId,
          date: today,
          fortune_type: fortuneType,
          result: resultJson,
        });
      } catch (upsertErr) {
        console.warn("Notice saving to fortune_cache:", upsertErr);
      }
    }

    return new Response(JSON.stringify({ ...resultJson, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "운세 생성 중 오류가 발생했습니다." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
