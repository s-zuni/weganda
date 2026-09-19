import { Platform } from 'react-native';

export interface CrashLoggerContext {
  componentStack?: string;
  userId?: string | null;
  route?: string;
  extra?: Record<string, any>;
}

class CrashLogger {
  private currentUserId: string | null = null;

  public setUserId(userId: string | null): void {
    this.currentUserId = userId;
  }

  public recordError(error: Error | unknown, context?: CrashLoggerContext): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const timestamp = new Date().toISOString();

    const report = {
      timestamp,
      platform: Platform.OS,
      name: errorObj.name,
      message: errorObj.message,
      stack: errorObj.stack,
      userId: this.currentUserId || context?.userId,
      context,
    };

    if (__DEV__) {
      console.warn('[CrashLogger DEV]', report);
    } else {
      // 상용 빌드 시 Sentry나 Supabase 로깅으로 안전하게 전송
      try {
        // 추후 Sentry 초기화 시: Sentry.captureException(errorObj, { extra: report });
      } catch {
        // 로거 자체 실패로 인한 크래시 방지
      }
    }
  }

  public recordMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (__DEV__) {
      console.log(`[CrashLogger ${level.toUpperCase()}]`, message);
    }
  }
}

export const crashLogger = new CrashLogger();
export default crashLogger;
