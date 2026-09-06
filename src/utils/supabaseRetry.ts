/**
 * PostgREST PGRST303 ("JWT issued at future") 에러 발생 시
 * Auth 서버(GoTrue)와 Postgres DB 서버 간의 시계 차이(Clock drift)를 보정하기 위해
 * 잠시 대기 후 자동으로 재시도하는 안전 래퍼 함수
 */
export async function withClockSkewRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
  delayMs = 800
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const isClockSkew =
      error?.code === 'PGRST303' ||
      error?.message?.includes('JWT issued at future') ||
      error?.details?.includes('JWT issued at future') ||
      (typeof error === 'string' && error.includes('JWT issued at future'));

    if (isClockSkew && retries > 0) {
      // 0.8초 대기 후 재시도 (시차가 해소됨)
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return withClockSkewRetry(operation, retries - 1, delayMs);
    }

    throw error;
  }
}

