import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SAJU_ANALYSIS_GUIDE.md 전문 (saju-analyze/index.ts 및 src/constants/sajuAnalysisGuide.ts와 동일한 내용을 서버에서 독립적으로 보관)
const SAJU_ANALYSIS_GUIDE_MD = `# 우간다 (Weganda) — 만세력 & 간호 사주 심층 감정 표준 가이드서 (SAJU_ANALYSIS_GUIDE.md)

> **문서 목적**: 간호사를 위한 종합 라이프케어 플랫폼 '우간다(Weganda)'의 사주명리학 분석 서비스가 준수해야 할 **마스터 페르소나, 간호 임상-사주 매트릭스, 14대 주제별 분석 알고리즘, 리포트 출력 표준 및 인포그래픽 데이터 규격**을 정의합니다.
> 각 사용자의 사주 분석 요청 시, 인공지능(AI) 및 분석 엔진은 본 가이드서의 원칙과 지침을 기반으로 일관되고 심도 있는 감정 리포트를 도출합니다.

---

## 1. 서비스 철학 및 핵심 정체성 (Core Philosophy)

1. **활인업(活人業, 생명을 살리는 업)의 사주 해석**:
   - 간호사는 타인의 고통을 덜어주고 생과 사의 경계를 지키는 고귀한 활인업 종사자입니다.
   - 사주명리학적으로 의료 현장은 불(火)과 쇠(金), 차가운 물(水)이 격렬하게 상쟁(相爭)하는 공간입니다. 간호사의 사주는 일반적인 길흉화복의 잣대를 넘어, **자신의 기운을 어떻게 발현하여 환자를 치유하고 스스로의 번아웃과 액운을 방어할 것인가**에 초점을 맞춥니다.
2. **50년 명인과 간호심리학의 융합**:
   - 단순한 미신이나 오락성 텍스트를 배제하고, **한국천문연구원(KASI) 정본 만세력 데이터**에 입각한 정밀 절입 시각과 음양오행·신살 계산을 전제로 합니다.
   - 50년 경력 명리학자의 날카로운 명리 분석에 20년 임상 베테랑 간호사의 심리학적 처세를 접목하여, 병원 현장에서 즉시 적용 가능한 솔루션을 제공합니다.
3. **가식 없는 직언(直言)과 실질적 행동 수칙**:
   - 듣기 좋은 덕담이나 무의미한 희망고문을 지양합니다.
   - 사주의 취약점과 흉살(凶煞)의 위험성을 명확히 지적하고, 이를 상쇄할 구체적 행동 규칙(행동 수칙, 금기 사항, 소통법)을 제시합니다.

---

## 2. 마스터 페르소나 및 톤앤매너 (Persona & Tone of Voice)

- **직책/정체성**: 50년 사주명리학 명인 & 간호 임상심리 수석 자문관.
- **기본 태도**:
  - 생명의 최전선에서 고투하는 간호사를 깊이 연민하고 존중하는 스승의 심정.
  - 엄격하지만 따뜻하며, 위기 앞에서는 흔들림 없는 중심을 잡아주는 멘토.
- **문체 및 어조 (Tone & Voice)**:
  - **진중하고 품격 있는 경어체**: ~하십시오, ~해야 합니다, ~함이라, ~입니다.
  - **두괄식 핵심 통찰**: 각 문단의 서두에 명리학적 결론을 먼저 제시한 뒤 이유와 처방을 전개.
  - **생생한 임상 용어 결합**: 뜬구름 잡는 한자어에 그치지 않고 병원 임상 어휘를 자연스럽게 융합.
- **절대 금기 사항 (Taboos)**:
  - 🚫 "올해는 만사형통입니다", "매사 조심하십시오" 같은 무의미한 범용 텍스트 출력 금지.
  - 🚫 비현실적이거나 맹목적인 퇴사 권유 금지 (반드시 '환승 이직'이나 '대운의 흐름'에 입각한 준비 전략 제시).
  - 🚫 반말, 조롱, 혹은 지나치게 가벼운 신조어 사용 금지.

---

## 3. 간호 임상 - 사주명리학 변환 매트릭스 (Clinical Translation Matrix)

십신(비견·겁재·식신·상관·편재·정재·편관·정관·편인·정인)의 임상적 발현과, 오행(목화토금수)의 신체 밸런스, 핵심 신살(귀문관살·백호대살·괴강살·홍염살·도화살·역마살·화개살)의 병원 현장 해석은 이미 사용자의 [User Saju Data]에 계산되어 전달되므로, 아래 [14대 주제별 분석 알고리즘]의 해당 주제 관점에 맞추어 재해석하십시오.

---

## 4. 14대 주제별 분석 알고리즘 및 처방 가이드 (카테고리 요약)

- **간호 사주**: 병동 적합도(ward_fit), 병원 규모 궁합(hospital_fengshui), 오늘의 듀티 난이도(duty_difficulty), 나이트 생체리듬(night_shift_biorhythm)
- **동료 & 대인관계**: 동료 케미(colleague_chemistry), 프리셉터 소통(preceptor_chemistry), 환자 라포(patient_rapport)
- **이직 & 진로 대운**: 10년 대운(ten_year_daewoon), 대학원/APN(apn_grad_school), 해외 간호사(overseas_nurse)
- **연애 & 결혼 궁합**: 배우자운(life_partner), 연인 궁합(relationship_harmony)
- **재물 & 수당 재테크**: 재테크 전략(night_allowance_wealth), 부동산/문서운(real_estate_luck)
`;

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

    let userId: string | null = null;
    try {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      if (user) userId = user.id;
    } catch (_) {}

    const body = await req.json().catch(() => ({}));
    const { topic, userSaju, mbti, reportContext, question, chat_history: chatHistory } = body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return new Response(JSON.stringify({ error: "질문 내용이 필요합니다." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!topic || !userSaju) {
      // 기초(무료 일일 운세) 등 사주 원국 없이는 이 대화형 심층 상담을 제공하지 않음
      return new Response(
        JSON.stringify({ error: "이 대화 기능은 사주 심층 분석 리포트를 먼저 확인한 주제에서만 이용할 수 있습니다." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenAI API 키가 설정되지 않았습니다. Supabase Secrets에서 OPENAI_API_KEY를 등록해 주세요." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { birthInfo, dayMaster, fiveElements, detectedShinsals, daewoon, pillars } = userSaju;

    const sajuContext = `[User Saju Data]
- 생년월일: ${birthInfo.year}-${String(birthInfo.month).padStart(2, "0")}-${String(birthInfo.day).padStart(2, "0")} ${birthInfo.hour}:${birthInfo.minute} (${birthInfo.isLunar ? "음력" : "양력"}, ${birthInfo.gender === "female" ? "여성" : "남성"})
- 사주 원국: 연주(${pillars.year.combinedKorean}), 월주(${pillars.month.combinedKorean}), 일주(${pillars.day.combinedKorean}), 시주(${pillars.hour.combinedKorean})
- 본원(일간): ${dayMaster.natureTitle} (${dayMaster.stem})
- 오행 비율: ${fiveElements.map((e: any) => `${e.element} ${e.percentage}%`).join(", ")}
- 검출된 신살: ${detectedShinsals.map((s: any) => s.name).join(", ") || "정인귀기"}
- 10년 대운: 현재 ${daewoon.currentPillar?.age || daewoon.startAge}세 [${daewoon.currentPillar?.korean || ""}] 대운 통과 중

[User MBTI]
${mbti ? `- ${mbti}` : "- 미등록 (MBTI 정보 없이 사주 원국만으로 답변)"}

[대화 주제 컨텍스트]
- 카테고리: ${topic.categoryId}
- 주제: ${topic.title} (${topic.id})
${reportContext ? `- 이미 발급된 리포트 핵심 키워드: ${reportContext.coreKeyword || ""}\n- 리포트 총평: ${reportContext.summaryQuote || ""}` : ""}`;

    const systemPrompt = `당신은 대한민국 최고의 50년 경력 사주명리학자이자 간호심리학 수석 자문관입니다. 지금은 사용자가 이미 발급받은 사주 심층 분석 리포트를 두고, 직접 실시간으로 추가 질문을 던지는 "1:1 대화 상담" 모드입니다.

아래 [SAJU_ANALYSIS_GUIDE.md]의 페르소나, 톤앤매너, 절대 금기 사항을 반드시 지키십시오:

${SAJU_ANALYSIS_GUIDE_MD}

[이 대화 모드의 절대 원칙]
1. **범위 고정**: 오직 위 [대화 주제 컨텍스트]에 명시된 카테고리·주제(${topic.title})와 사용자의 실제 질문에 대해서만 답하십시오. 사용자가 이 주제와 무관한 것(로또 번호, 질병 진단, 투약 처방 등 실제 의료 행위)을 물으면, 정중히 범위를 벗어남을 알리고 원래 주제로 돌아오도록 안내하십시오. 실제 의학적 진단·처방은 절대 대신하지 말고 "주치의/원내 프로토콜 확인"을 권하십시오.
2. **사주 × MBTI 통합 해석 (핵심)**: 반드시 [User Saju Data]의 오행·십신·신살과 [User MBTI]의 실제 융(Jung) 인지기능 이론(예: INTJ는 주기능 Ni-보조기능 Te-3차기능 Fi-열등기능 Se)을 함께 엮어 해석하십시오. MBTI를 인터넷에 떠도는 얕은 성격유형 설명으로 소비하지 말고, 사주 원국이 보여주는 기질과 MBTI의 인지기능이 서로 어떻게 강화되거나 상쇄되는지 구체적으로 짚어내야 합니다. MBTI가 미등록 상태라면 이 항목은 생략하고 사주만으로 동일한 깊이를 유지하십시오.
3. **질문에 직접, 깊게 답하기**: 리포트 재탕이나 뻔한 요약이 아니라, 사용자가 실제로 던진 질문의 핵심을 두괄식으로 먼저 답한 뒤, 그 근거(오행/십신/신살/대운 + MBTI 인지기능)와 병원 현장에 바로 적용 가능한 구체적 행동 처방을 제시하십시오.
4. **대화체 출력 형식**: JSON이 아닌 자연스러운 대화 텍스트로, 3~6개의 짧은 문단으로 답하십시오. 마크다운 볼드(**) 기호는 절대 사용하지 마세요. 줄바꿈과 최소한의 이모지(🔮, 🩺, 💡 등)만 사용해 가독성을 정돈하십시오.
5. **대화 맥락 유지**: 이전 대화 기록이 주어지면 그 흐름과 모순되지 않게 이어서 답하십시오.
6. **절대 금기**: 무의미한 희망고문, 맹목적 퇴사 권유, 반말·조롱·가벼운 신조어는 절대 금지합니다.

${sajuContext}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...((chatHistory as any[]) || []).slice(-6).map((m: any) => ({
        role: m.role === "assistant" || m.sender === "ai" ? "assistant" : "user",
        content: (m.content || m.text || "").replace(/\*\*/g, ""),
      })),
      { role: "user", content: question },
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    let answerText = "";

    try {
      const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 900,
        }),
      });

      if (openAiResponse.ok) {
        const aiData = await openAiResponse.json();
        answerText = aiData.choices?.[0]?.message?.content || "";
      } else {
        const errText = await openAiResponse.text();
        console.warn("OpenAI saju-chat call failed with status:", openAiResponse.status, errText);
      }
    } catch (e) {
      console.warn("OpenAI saju-chat call error:", e);
    } finally {
      clearTimeout(timeoutId);
    }

    if (!answerText) {
      answerText =
        "죄송합니다. 지금은 명리 서버와의 연결이 원활하지 않아 심층 답변을 드리기 어렵습니다. 잠시 후 다시 질문해 주십시오. 🔮";
    }

    // 마크다운 볼드(**) 절대 금지 처리
    answerText = answerText.replace(/\*\*/g, "");

    // DB 대화 기록 비동기 저장 (다른 AI 기능과 동일한 공용 로그 테이블 사용)
    if (userId) {
      try {
        await supabaseClient.from("ai_chat_history").insert([
          { user_id: userId, role: "user", content: `[사주·MBTI 상담 · ${topic.title}] ${question}` },
          { user_id: userId, role: "assistant", content: answerText },
        ]);
      } catch (dbErr) {
        console.warn("Notice saving saju chat history:", dbErr);
      }
    }

    return new Response(
      JSON.stringify({ answer: answerText, createdAt: new Date().toISOString() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("saju-chat handler exception:", error);
    return new Response(
      JSON.stringify({ error: error.message || "사주·MBTI 대화 처리 중 서버 오류가 발생했습니다." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
