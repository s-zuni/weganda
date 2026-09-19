import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// 🔒 보안: 공개 가능한 anon key만 사용 (RLS가 실제 보안을 담당)
// AI API 키(OpenAI, Gemini)는 Edge Function 환경변수에서만 관리
export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://vegtlnhgfjxdntnxbztb.supabase.co';
export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3RsbmhnZmp4ZG50bnhienRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NjU2NzUsImV4cCI6MjEwNDE0MTY3NX0.BouXAkcbuwwUvIBWxpP6Rxs7BhzN9evcEQMJiIwqo2g';

// 🛡️ 모바일 하드웨어 보안 스토리지 어댑터 (iOS Keychain / Android Keystore 청킹 지원)
const CHUNK_SIZE = 1800;

export const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      } catch {
        return null;
      }
    }
    try {
      const countStr = await SecureStore.getItemAsync(`${key}_chunks`);
      if (countStr) {
        const count = parseInt(countStr, 10);
        let fullValue = '';
        for (let i = 0; i < count; i++) {
          const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
          if (chunk) fullValue += chunk;
        }
        return fullValue || null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.warn('SecureStore getItem error:', e);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      } catch {}
      return;
    }
    try {
      if (value.length > CHUNK_SIZE) {
        const chunks = Math.ceil(value.length / CHUNK_SIZE);
        await SecureStore.setItemAsync(`${key}_chunks`, chunks.toString());
        for (let i = 0; i < chunks; i++) {
          const chunk = value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
          await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunk);
        }
      } else {
        await SecureStore.deleteItemAsync(`${key}_chunks`).catch(() => {});
        await SecureStore.setItemAsync(key, value);
      }
    } catch (e) {
      console.warn('SecureStore setItem error:', e);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      } catch {}
      return;
    }
    try {
      const countStr = await SecureStore.getItemAsync(`${key}_chunks`);
      if (countStr) {
        const count = parseInt(countStr, 10);
        for (let i = 0; i < count; i++) {
          await SecureStore.deleteItemAsync(`${key}_chunk_${i}`).catch(() => {});
        }
        await SecureStore.deleteItemAsync(`${key}_chunks`).catch(() => {});
      }
      await SecureStore.deleteItemAsync(key).catch(() => {});
    } catch (e) {
      console.warn('SecureStore removeItem error:', e);
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
