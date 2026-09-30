import { supabase } from './supabase';
import type { MonthlySalaryRecord } from '../store/useSalaryStore';

// 월별 급여 기록 서버 동기화 (RLS: 본인 행만 접근).
// 게스트/미로그인 상태(세션 없음)에서는 서버 호출 없이 로컬에만 저장되도록 no-op 처리한다.
// 사용자 ID는 스토어 값이 아닌 실제 Supabase 세션에서 얻는다(테스터 계정처럼 스토어 id가 로컬 전용인 경우 대비).
const getSessionUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
};

export const salaryApi = {
  // 내 급여 기록 전체 조회
  async getMyRecords(): Promise<Record<string, MonthlySalaryRecord> | null> {
    const userId = await getSessionUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('monthly_salary_records')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching salary records:', error);
      throw error;
    }

    const records: Record<string, MonthlySalaryRecord> = {};
    (data || []).forEach((row) => {
      records[row.year_month] = {
        yearMonth: row.year_month,
        totalSalary: Number(row.total_salary),
        baseAllowance: Number(row.base_allowance),
        nightAllowance: Number(row.night_allowance),
        extraAllowance: row.extra_allowance != null ? Number(row.extra_allowance) : undefined,
        holidayAllowance: row.holiday_allowance != null ? Number(row.holiday_allowance) : undefined,
        memo: row.memo || undefined,
        updatedAt: row.updated_at || new Date().toISOString(),
      };
    });
    return records;
  },

  // 월별 급여 기록 저장(있으면 갱신)
  async upsertRecord(record: MonthlySalaryRecord): Promise<void> {
    const userId = await getSessionUserId();
    if (!userId) return;

    const { error } = await supabase.from('monthly_salary_records').upsert(
      {
        user_id: userId,
        year_month: record.yearMonth,
        total_salary: record.totalSalary,
        base_allowance: record.baseAllowance,
        night_allowance: record.nightAllowance,
        extra_allowance: record.extraAllowance ?? null,
        holiday_allowance: record.holidayAllowance ?? null,
        memo: record.memo ?? null,
        updated_at: record.updatedAt,
      },
      { onConflict: 'user_id,year_month' }
    );

    if (error) {
      console.error('Error saving salary record:', error);
      throw error;
    }
  },

  // 월별 급여 기록 삭제
  async deleteRecord(yearMonth: string): Promise<void> {
    const userId = await getSessionUserId();
    if (!userId) return;

    const { error } = await supabase
      .from('monthly_salary_records')
      .delete()
      .eq('user_id', userId)
      .eq('year_month', yearMonth);

    if (error) {
      console.error('Error deleting salary record:', error);
      throw error;
    }
  },
};
