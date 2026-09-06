import { supabase } from './supabase';
import { ShiftCode } from '../constants/shiftTypes';

export interface ParsedScheduleItem {
  date: string; // YYYY-MM-DD
  shiftCode: ShiftCode | string;
  memo?: string;
}

export interface OcrParseResponse {
  yearMonth: string;
  confidence: number;
  schedules: ParsedScheduleItem[];
}

export const ocrApi = {
  // 근무표 이미지 OCR 분석 (O1)
  async parseScheduleImage(params: {
    imageBase64: string;
    mimeType?: string;
    yearMonth?: string;
  }): Promise<OcrParseResponse> {
    const { data, error } = await supabase.functions.invoke('schedule-ocr', {
      body: {
        image_base64: params.imageBase64,
        mime_type: params.mimeType || 'image/jpeg',
        year_month: params.yearMonth,
      },
    });

    if (error) {
      console.error('Error invoking schedule-ocr Edge Function:', error);
      throw error;
    }

    return data as OcrParseResponse;
  },
};

