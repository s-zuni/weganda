import { supabase } from './supabase';
import { ShiftCode } from '../constants/shiftTypes';
import { withClockSkewRetry } from '../utils/supabaseRetry';

export interface ParsedScheduleItem {
  date: string; // YYYY-MM-DD
  shiftCode: ShiftCode | string;
  memo?: string;
}

export interface OcrParseResponse {
  success: boolean;
  yearMonth: string;
  confidence: number;
  schedules: ParsedScheduleItem[];
  error?: string;
}

export const ocrApi = {
  // 근무표 이미지 OCR 분석 (O1)
  // 병동별 커스텀 근무 표기 및 복수 오프 기호 규칙 기반 분석
  async parseScheduleImage(params: {
    imageBase64: string;
    mimeType?: string;
    yearMonth?: string;
    customCodes?: Record<string, { code: string; name: string; isOff?: boolean }>;
    offCodes?: string[];
  }): Promise<OcrParseResponse> {
    return withClockSkewRetry(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('schedule-ocr', {
          body: {
            image_base64: params.imageBase64,
            mime_type: params.mimeType || 'image/jpeg',
            year_month: params.yearMonth,
            custom_codes: params.customCodes || {},
            off_codes: params.offCodes || ['O', '/', 'OFF'],
          },
        });

        if (error) {
          console.warn('schedule-ocr Edge Function error response:', error.message || error);
          return {
            success: false,
            yearMonth: params.yearMonth || new Date().toISOString().slice(0, 7),
            confidence: 0,
            schedules: [],
            error: error.message || '근무표 분석 서버와 통신 중 오류가 발생했습니다.',
          };
        }

        const res = data as any;
        if (!res || res.success === false || !res.schedules || res.schedules.length === 0) {
          return {
            success: false,
            yearMonth: res?.yearMonth || params.yearMonth || new Date().toISOString().slice(0, 7),
            confidence: 0,
            schedules: [],
            error: res?.error || '근무표 이미지에서 스케줄을 인식하지 못했습니다. 사진의 조명이나 글자가 선명한지 확인해 주세요.',
          };
        }

        return {
          success: true,
          yearMonth: res.yearMonth,
          confidence: res.confidence || 0.9,
          schedules: res.schedules,
        };
      } catch (e: any) {
        console.warn('OCR invocation exception:', e?.message || e);
        return {
          success: false,
          yearMonth: params.yearMonth || new Date().toISOString().slice(0, 7),
          confidence: 0,
          schedules: [],
          error: e?.message || '근무표 분석 중 문제가 발생했습니다.',
        };
      }
    });
  },
};

