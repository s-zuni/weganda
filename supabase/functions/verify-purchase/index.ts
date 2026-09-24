import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// weganda+ SKU 가격 정보 — src/constants/membership.ts의 IAP_SKUS/PRICING과 반드시 동기화 유지할 것.
const SKU_INFO: Record<string, { planType: "monthly" | "yearly"; isEarlybird: boolean; price: number }> = {
  "com.weganda.app.sub.monthly.standard": { planType: "monthly", isEarlybird: false, price: 7900 },
  "com.weganda.app.sub.yearly.standard": { planType: "yearly", isEarlybird: false, price: 79000 },
  "com.weganda.app.sub.monthly.earlybird.plus": { planType: "monthly", isEarlybird: true, price: 5900 },
  "com.weganda.app.sub.monthly.earlybird": { planType: "monthly", isEarlybird: true, price: 5900 }, // 하위 호환
  "com.weganda.app.sub.yearly.earlybird": { planType: "yearly", isEarlybird: true, price: 59000 },
};

function resolveSkuInfo(productId: string) {
  return (
    SKU_INFO[productId] || {
      planType: productId.includes("yearly") ? ("yearly" as const) : ("monthly" as const),
      isEarlybird: productId.includes("earlybird"),
      price: 0,
    }
  );
}

// ---------- base64url / JWT 서명 유틸 (외부 라이브러리 없이 Web Crypto만 사용) ----------

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlEncodeJson(obj: unknown): string {
  return base64UrlEncodeBytes(new TextEncoder().encode(JSON.stringify(obj)));
}

function base64UrlDecodeToBytes(input: string): Uint8Array {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function pemToDer(pem: string): ArrayBuffer {
  const cleaned = pem
    .trim()
    .replace(/-----BEGIN [^-]+-----/, "")
    .replace(/-----END [^-]+-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// Apple .p8 키(EC P-256, PKCS8)로 App Store Server API 인증용 ES256 JWT 생성
async function createAppleJwt(): Promise<string> {
  const issuerId = Deno.env.get("APPLE_ISSUER_ID");
  const keyId = Deno.env.get("APPLE_KEY_ID");
  const privateKeyPem = Deno.env.get("APPLE_PRIVATE_KEY");
  const bundleId = Deno.env.get("APPLE_BUNDLE_ID");
  if (!issuerId || !keyId || !privateKeyPem || !bundleId) {
    throw new Error("Apple App Store Server API 자격증명(APPLE_ISSUER_ID/APPLE_KEY_ID/APPLE_PRIVATE_KEY/APPLE_BUNDLE_ID)이 설정되지 않았습니다.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "ES256", kid: keyId, typ: "JWT" };
  const payload = { iss: issuerId, iat: now, exp: now + 1200, aud: "appstoreconnect-v1", bid: bundleId };
  const signingInput = `${base64UrlEncodeJson(header)}.${base64UrlEncodeJson(payload)}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(privateKeyPem),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(signingInput));
  return `${signingInput}.${base64UrlEncodeBytes(new Uint8Array(signature))}`;
}

// Google 서비스 계정(RS256)으로 OAuth2 access token 발급 (Play Developer API 호출용)
async function createGoogleAccessToken(): Promise<string> {
  const email = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKeyPem = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
  if (!email || !privateKeyPem) {
    throw new Error("Google Play Developer API 자격증명(GOOGLE_SERVICE_ACCOUNT_EMAIL/GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)이 설정되지 않았습니다.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const signingInput = `${base64UrlEncodeJson(header)}.${base64UrlEncodeJson(payload)}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(privateKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signingInput));
  const assertion = `${signingInput}.${base64UrlEncodeBytes(new Uint8Array(signature))}`;

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!resp.ok) throw new Error(`Google OAuth 토큰 발급 실패: ${await resp.text()}`);
  const tokenData = await resp.json();
  return tokenData.access_token as string;
}

function decodeJwsPayload(jws: string): any {
  const parts = jws.split(".");
  if (parts.length < 2) throw new Error("Invalid JWS format");
  const json = new TextDecoder().decode(base64UrlDecodeToBytes(parts[1]));
  return JSON.parse(json);
}

interface VerifiedPurchase {
  productId: string;
  transactionId: string;
  status: "active" | "trial" | "grace_period" | "expired" | "revoked" | "canceled";
  isTrial: boolean;
  purchasedAt: string | null;
  expiresAt: string | null;
  trialEndDate: string | null;
  raw: unknown;
}

// Apple App Store Server API: 구독 상태 조회 (transactionId는 해당 구독 계열의 아무 거래 ID나 가능)
// https://developer.apple.com/documentation/appstoreserverapi/get_all_subscription_statuses
async function verifyAppleTransaction(transactionId: string): Promise<VerifiedPurchase | null> {
  const jwt = await createAppleJwt();
  const hosts = ["https://api.storekit.itunes.apple.com", "https://api.storekit-sandbox.itunes.apple.com"];

  for (const host of hosts) {
    try {
      const resp = await fetch(`${host}/inApps/v1/subscriptions/${transactionId}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (resp.status === 404) continue; // 프로덕션에 없으면(샌드박스/테스트플라이트) 다음 호스트 시도
      if (!resp.ok) {
        console.warn("[verify-purchase] Apple subscriptions API 오류:", resp.status, await resp.text());
        continue;
      }

      const data = await resp.json();
      const group = data.data?.[0];
      const last = group?.lastTransactions?.[0];
      if (!last) return null;

      const txPayload = decodeJwsPayload(last.signedTransactionInfo);
      const renewalPayload = last.signedRenewalInfo ? decodeJwsPayload(last.signedRenewalInfo) : null;

      // status: 1=ACTIVE, 2=EXPIRED, 3=BILLING_RETRY, 4=BILLING_GRACE_PERIOD, 5=REVOKED
      const statusMap: Record<number, VerifiedPurchase["status"]> = {
        1: "active",
        2: "expired",
        3: "grace_period",
        4: "grace_period",
        5: "revoked",
      };
      let status = statusMap[last.status] ?? "expired";
      const isTrial = txPayload.offerType === 1; // 1 = introductory offer(도입 오퍼, 무료체험 트라이얼로 사용 중)
      if (status === "active" && isTrial) status = "trial";

      return {
        productId: txPayload.productId,
        transactionId: String(txPayload.transactionId),
        status,
        isTrial,
        purchasedAt: txPayload.purchaseDate ? new Date(txPayload.purchaseDate).toISOString() : null,
        expiresAt: txPayload.expiresDate ? new Date(txPayload.expiresDate).toISOString() : null,
        trialEndDate: isTrial && txPayload.expiresDate ? new Date(txPayload.expiresDate).toISOString() : null,
        raw: { transaction: txPayload, renewal: renewalPayload, statusCode: last.status },
      };
    } catch (e) {
      console.warn(`[verify-purchase] Apple 검증 중 오류 (${host}):`, e);
    }
  }
  return null;
}

// Google Play Developer API v2 (subscriptionsv2): 구독 상태 조회
// https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptionsv2
async function verifyGooglePurchase(purchaseToken: string, fallbackProductId: string): Promise<VerifiedPurchase | null> {
  const packageName = Deno.env.get("ANDROID_PACKAGE_NAME");
  if (!packageName) {
    throw new Error("ANDROID_PACKAGE_NAME 환경변수가 설정되지 않았습니다.");
  }

  const accessToken = await createGoogleAccessToken();
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptionsv2/tokens/${purchaseToken}`;
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!resp.ok) {
    console.warn("[verify-purchase] Google 검증 실패:", resp.status, await resp.text());
    return null;
  }

  const data = await resp.json();
  const lineItem = data.lineItems?.[0];

  const stateMap: Record<string, VerifiedPurchase["status"]> = {
    SUBSCRIPTION_STATE_ACTIVE: "active",
    SUBSCRIPTION_STATE_IN_GRACE_PERIOD: "grace_period",
    SUBSCRIPTION_STATE_ON_HOLD: "grace_period",
    SUBSCRIPTION_STATE_CANCELED: "canceled",
    SUBSCRIPTION_STATE_EXPIRED: "expired",
    SUBSCRIPTION_STATE_PAUSED: "canceled",
    SUBSCRIPTION_STATE_PENDING: "expired",
  };
  const status = stateMap[data.subscriptionState] ?? "expired";
  // Google v2 API는 결제상태 필드로 트라이얼 여부를 명확히 노출하지 않아, 오퍼 ID 문자열로 보수적으로만 추정(과금 판단에는 미사용).
  const isTrial = Boolean(lineItem?.offerDetails?.offerId?.toLowerCase().includes("trial"));
  const expiresAt = lineItem?.expiryTime ? new Date(lineItem.expiryTime).toISOString() : null;
  const purchasedAt = data.startTime ? new Date(data.startTime).toISOString() : null;

  return {
    productId: lineItem?.productId || fallbackProductId,
    transactionId: data.latestOrderId || purchaseToken,
    status,
    isTrial,
    purchasedAt,
    expiresAt,
    trialEndDate: isTrial ? expiresAt : null,
    raw: data,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } }
    );

    // 1. 반드시 인증된 사용자만 허용 (프리미엄을 부여받을 본인 확인)
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "인증이 필요합니다." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const platform = body.platform as "ios" | "android" | undefined;
    const productId = body.productId as string | undefined;
    const transactionId = body.transactionId as string | undefined;
    const purchaseToken = (body.purchaseToken || body.purchaseTokenAndroid) as string | undefined;

    if (!platform || !productId) {
      return new Response(JSON.stringify({ error: "platform, productId는 필수입니다." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let verified: VerifiedPurchase | null = null;

    if (platform === "ios") {
      if (!transactionId) {
        return new Response(JSON.stringify({ error: "iOS 검증에는 transactionId가 필요합니다." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      verified = await verifyAppleTransaction(transactionId);
    } else if (platform === "android") {
      if (!purchaseToken) {
        return new Response(JSON.stringify({ error: "Android 검증에는 purchaseToken이 필요합니다." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      verified = await verifyGooglePurchase(purchaseToken, productId);
    } else {
      return new Response(JSON.stringify({ error: "지원하지 않는 platform입니다." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 검증 실패(위조/취소/스토어 응답 없음) — 절대 프리미엄을 부여하지 않고 실패로 응답
    if (!verified) {
      return new Response(JSON.stringify({ verified: false, isPremium: false, reason: "스토어에서 유효한 구매 내역을 확인하지 못했습니다." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const skuInfo = resolveSkuInfo(verified.productId || productId);
    const isPremium = verified.status === "active" || verified.status === "trial" || verified.status === "grace_period";

    const row = {
      user_id: user.id,
      platform,
      product_id: verified.productId,
      store_transaction_id: verified.transactionId,
      status: verified.status,
      plan_type: skuInfo.planType,
      is_earlybird: skuInfo.isEarlybird,
      price: skuInfo.price,
      is_trial: verified.isTrial,
      purchased_at: verified.purchasedAt,
      trial_end_date: verified.trialEndDate,
      expires_at: verified.expiresAt,
      verified_at: new Date().toISOString(),
      raw_response: verified.raw,
      updated_at: new Date().toISOString(),
    };

    // 서비스 롤 키로 RLS를 우회해 기록 (클라이언트는 이 테이블에 절대 직접 쓰기 권한이 없음)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const { error: upsertError } = await serviceClient.from("subscriptions").upsert(row, { onConflict: "user_id" });
    if (upsertError) throw upsertError;

    return new Response(
      JSON.stringify({
        verified: true,
        isPremium,
        subscription: {
          status: row.status,
          planType: row.plan_type,
          isEarlybird: row.is_earlybird,
          price: row.price,
          isTrial: row.is_trial,
          trialEndDate: row.trial_end_date,
          expiresAt: row.expires_at,
          subscribedAt: row.purchased_at,
          storeSku: row.product_id,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[verify-purchase] 처리 실패:", error);
    return new Response(JSON.stringify({ error: error.message || "구매 검증 중 오류가 발생했습니다." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

