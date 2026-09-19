import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 🩺 따뜻하고 지혜로운 20년차 임상 수간호사 & 간호학과 교수님 시스템 프롬프트
const SYSTEM_PROMPT = `당신은 대한민국 대학병원 20년 임상 수간호사 경력을 거쳐 현재 대학에서 간호학과 교수로 학생과 간호사들을 양성하고 있는 따뜻하고 신뢰성 높은 '간호 멘토 교수님' AI입니다.

[절대 원칙 - 반드시 준수]
1. 페르소나 및 어조:
- 후배 간호사를 아끼고 사랑하는 선배이자 교수님으로서, 존중과 다정함이 묻어나는 구어체("선생님, 오늘 정말 고생 많으셨어요", "~해보시는 건 어떨까요?")로 대답하세요.
- 모든 답변에서 마크다운 볼드(**) 표시 사용은 절대 금지입니다. 별표 기호(**)는 일절 쓰지 마세요.
- 가독성은 줄바꿈, 이모지(🩺, ☕, 💡, 💊, 🌿 등), 목록 기호(-, 1., 2.)로 정갈하게 정돈하세요.

2. 질문 맥락별 1:1 맞춤 응답 (고정 템플릿 절대 금지):
- [환자/보호자와의 갈등, 소통 어려움, 비협조적인 환자]:
  * 절대 뜬금없는 투약 5원칙(5 Rights) 같은 임상 술기를 읊지 마세요!
  * 간호사의 속상하고 답답한 마음에 먼저 깊이 공감해 주세요.
  * 치료적 의사소통 기법(경청, 명료화, 감정 반영)과 현장에서 환자/보호자를 부드럽게 설득하는 현실적인 임상 팁을 구체적으로 제시해 주세요.
  * 폭언이나 신체적 위협이 있을 때는 즉시 병동 수간호사/책임간호사에게 알리고 보안팀 및 주치의와 공유하는 원내 보호 절차도 조언해 주세요.
- [정서적 고충, 퇴근 욕구, 번아웃, 피로, 실수 후 자책]:
  * 따뜻한 위로와 격려, 셀프 케어(따뜻한 음료, 충분한 수면, 자기 비하 멈추기)를 건네며 든든한 버팀목이 되어주세요.
  * 마음이 조금 진정된 후, 오늘 근무나 처치에서 마음에 걸리는 점이 있다면 언제든 편히 나눠달라고 유도하세요.
- [전문 임상 질문 (약물 계산 gtt, ACLS, ABGA, SBAR, 드레싱 등)]:
  * 대한민국 기본간호학, 대한심폐소생협회(K-ACLS), 병원 표준 임상 간호 실무 지침에 입각하여 정확하고 상세하게 설명하세요.
  * 절대 거짓 정보나 확인되지 않은 의학 지식을 임의로 꾸며내지 마세요.
  * 답변 끝에 "⚠️ 본 답변은 표준 임상 참고용이며, 실제 처치는 주치의 처방과 원내 표준 지침을 준수해 주세요."를 덧붙이세요.`;

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

    // 유저 정보 추출 (선택적)
    let userId: string | null = null;
    try {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      if (user) userId = user.id;
    } catch (_) {}

    const body = await req.json().catch(() => ({}));
    const question = body.question;
    const chatHistory = body.chat_history || [];

    if (!question || typeof question !== "string" || !question.trim()) {
      return new Response(JSON.stringify({ error: "질문 내용이 필요합니다." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "OpenAI API 키가 설정되지 않았습니다. Supabase Secrets에서 OPENAI_API_KEY를 등록해 주세요.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ==========================================
    // 🧠 RAG (Retrieval-Augmented Generation) 지식 검색
    // ==========================================
    let retrievedSources: { title: string; sourceAgency: string; year?: string }[] = [];
    let ragContextText = "";

    // 임상/약물/술기/감염 관련 키워드 검출
    const clinicalKeywords = [
      "cre", "vre", "격리", "접촉주의", "공기주의", "결핵", "tb", "린넨", "소독",
      "분쇄", "서방정", "장용정", "crushing", "타이레놀", "kcl", "염화칼륨", "iv push",
      "수혈", "l-tube", "비위관", "위관영양", "gtt", "acls", "c-line", "foley"
    ];
    const isClinicalQuery = clinicalKeywords.some((kw) => question.toLowerCase().includes(kw));

    if (isClinicalQuery) {
      try {
        // 검색 키워드 추출 (질문에서 첫 매칭 키워드 또는 질문 자체)
        const matchedKw = clinicalKeywords.find((kw) => question.toLowerCase().includes(kw)) || "";
        const queryTerm = matchedKw || question.trim().slice(0, 30);

        const { data: chunks, error: rpcErr } = await supabaseClient.rpc("search_clinical_knowledge", {
          query_text: queryTerm,
          query_embedding: null,
          match_threshold: 0.5,
          match_count: 2,
        });

        if (!rpcErr && chunks && chunks.length > 0) {
          retrievedSources = chunks.map((c: any) => ({
            title: c.title,
            sourceAgency: c.source_agency,
            year: c.publication_year || "2024",
          }));

          ragContextText = chunks
            .map(
              (c: any, i: number) =>
                `[지침 ${i + 1}: ${c.title} (출처: ${c.source_agency} ${c.publication_year || "2024"})]\n${c.content}`
            )
            .join("\n\n");
        }
      } catch (searchErr) {
        console.warn("RAG knowledge retrieval notice:", searchErr);
      }
    }

    // RAG 컨텍스트가 있을 경우 시스템 프롬프트에 엄격한 Grounding 규칙 주입
    let augmentedSystemPrompt = SYSTEM_PROMPT;
    if (ragContextText) {
      augmentedSystemPrompt += `\n\n[대한민국 공식 임상 표준 가이드라인 (RAG 검색 컨텍스트)]\n${ragContextText}\n\n[답변 원칙]: 반드시 위 [대한민국 공식 임상 표준 가이드라인]의 사실에만 입각하여 정확하게 설명하세요. 마크다운 볼드(**) 기호는 절대 사용하지 마세요.`;
    }

    let answerText = "";

    // OpenAI API 호출 시도
    if (OPENAI_API_KEY) {
      try {
        const messages = [
          { role: "system", content: augmentedSystemPrompt },
          ...chatHistory.slice(-6).map((m: any) => ({
            role: m.role === "assistant" || m.sender === "ai" ? "assistant" : "user",
            content: (m.content || m.text || "").replace(/\*\*/g, ""),
          })),
          { role: "user", content: question },
        ];

        const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            messages,
            temperature: 0.5,
            max_tokens: 1200,
          }),
        });

        if (openAiResponse.ok) {
          const aiData = await openAiResponse.json();
          answerText = aiData.choices?.[0]?.message?.content || "";
        } else {
          console.warn("OpenAI API call returned non-200:", openAiResponse.status);
        }
      } catch (openAiErr) {
        console.warn("OpenAI API call exception:", openAiErr);
      }
    }

    // OpenAI 미사용 또는 일시 장애 시, RAG 검색 지침 기반 고품질 폴백 응답 생성
    if (!answerText && ragContextText) {
      answerText = `선생님, 문의하신 임상 표준 지침 안내해 드릴게요. 🩺\n\n${ragContextText}\n\n💡 환자 안전을 위해 반드시 담당 주치의의 오더와 원내 임상 표준 지침을 함께 재확인해 주세요.`;
    } else if (!answerText) {
      answerText = `선생님, 오늘 근무 정말 고생 많으셨어요. 🩺\n문의하신 내용에 대해 원내 표준 간호 실무 지침 및 담당 주치의 처방을 함께 확인하여 안전하게 간호 처치하시길 권장드립니다.\n\n⚠️ 본 안내는 참고용이며 실제 처치는 원내 프로토콜을 우선 준수해 주세요.`;
    }

    // 마크다운 볼드(**) 절대 금지 처리
    answerText = answerText.replace(/\*\*/g, "");

    // DB 대화 기록 비동기 저장
    if (userId) {
      try {
        await supabaseClient.from("ai_chat_history").insert([
          { user_id: userId, role: "user", content: question },
          { user_id: userId, role: "assistant", content: answerText },
        ]);
      } catch (dbErr) {
        console.warn("Notice saving chat history:", dbErr);
      }
    }

    return new Response(
      JSON.stringify({
        answer: answerText,
        sources: retrievedSources,
        createdAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("clinical-ai-qa handler exception:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "AI 질문 처리 중 서버 오류가 발생했습니다.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

