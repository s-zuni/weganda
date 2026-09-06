import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// 브라우저 세션 완료 핸들러 등록
WebBrowser.maybeCompleteAuthSession();

export interface UserProfile {
  id: string;
  email?: string;
  name: string;
  hospitalName?: string;
  wardName?: string; // 병동
  experienceYears?: number; // 연차
  role?: 'nurse' | 'head_nurse' | 'student';
}

// URL에서 토큰 또는 파라미터 추출 헬퍼
function extractParamsFromUrl(url: string): Record<string, string> {
  const params: Record<string, string> = {};

  // 해시 파라미터 (#access_token=...&refresh_token=...)
  const hashIndex = url.indexOf('#');
  if (hashIndex !== -1) {
    const hash = url.substring(hashIndex + 1);
    const hashParts = hash.split('&');
    for (const part of hashParts) {
      const [key, val] = part.split('=');
      if (key && val) {
        params[decodeURIComponent(key)] = decodeURIComponent(val);
      }
    }
  }

  // 쿼리 파라미터 (?code=... or ?error=...)
  const queryIndex = url.indexOf('?');
  if (queryIndex !== -1) {
    const query = url.substring(queryIndex + 1).split('#')[0];
    const queryParts = query.split('&');
    for (const part of queryParts) {
      const [key, val] = part.split('=');
      if (key && val) {
        params[decodeURIComponent(key)] = decodeURIComponent(val);
      }
    }
  }

  return params;
}

export const authService = {
  // 현재 세션 및 사용자 가져오기
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // 🍏 Apple 네이티브 로그인 (Identity Token 방식)
  async signInWithApple() {
    try {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error(
          Platform.OS === 'ios'
            ? 'Apple 로그인을 사용할 수 없는 기기 또는 계정 환경입니다.'
            : 'Apple 로그인은 iOS 기기에서 지원됩니다.'
        );
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Apple identity token을 수신하지 못했습니다.');
      }

      // Supabase signInWithIdToken 연동
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) throw error;
      return data;
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED' || e.message?.includes('canceled')) {
        // 사용자가 Face ID/Touch ID 인증을 직접 취소한 경우
        return null;
      }
      throw e;
    }
  },

  // 🌐 Google 소셜 로그인 (OAuth PKCE / WebBrowser 딥링크)
  async signInWithGoogle() {
    try {
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'weganda',
        path: 'auth/callback',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data?.url) {
        throw new Error('Google 로그인 인증 주소를 생성하지 못했습니다.');
      }

      // 시스템 브라우저 인증 세션 실행
      const authResult = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (authResult.type === 'success' && authResult.url) {
        const params = extractParamsFromUrl(authResult.url);

        if (params.error_description || params.error) {
          throw new Error(params.error_description || params.error);
        }

        // Implicit Flow (access_token & refresh_token)
        if (params.access_token && params.refresh_token) {
          const { data: sessionData, error: sessionError } =
            await supabase.auth.setSession({
              access_token: params.access_token,
              refresh_token: params.refresh_token,
            });
          if (sessionError) throw sessionError;
          return sessionData;
        }

        // PKCE Flow (authorization code)
        if (params.code) {
          const { data: sessionData, error: sessionError } =
            await supabase.auth.exchangeCodeForSession(params.code);
          if (sessionError) throw sessionError;
          return sessionData;
        }

        throw new Error('인증 토큰을 전달받지 못했습니다.');
      }

      // 사용자가 브라우저를 닫은 경우
      return null;
    } catch (e: any) {
      console.error('Google login error:', e);
      throw e;
    }
  },

  // 🟡 카카오 로그인 (디벨로퍼스 연동 준비 상태 안내)
  async signInWithKakao() {
    throw new Error('카카오 로그인은 카카오 디벨로퍼스 심사 완료 후 오픈될 예정입니다. Google 또는 Apple 로그인을 이용해주세요.');
  },

  // 일반 OAuth 범용 호출 (하위 호환)
  async signInWithOAuth(provider: 'google' | 'kakao') {
    if (provider === 'google') {
      return this.signInWithGoogle();
    }
    return this.signInWithKakao();
  },

  // 로그아웃
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
