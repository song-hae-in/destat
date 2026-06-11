import { supabase } from "~/postgres/supaclient";
import { DateTime } from "luxon";

// TrendCard / Chart 공통 타입
export type TrendData = {
  value: string;
  trendValue: string;
  upAndDown: boolean;
};

export type ChartPoint = {
  date: string;
  data: number;
};

// 주간 비교 결과 만들기
function buildTrendResult(thisCount: number, lastCount: number): TrendData {
  return {
    value: thisCount.toString(),
    trendValue: ((thisCount / (lastCount || 1)) * 100).toString(),
    upAndDown: thisCount > lastCount,
  };
}

// TrendCard — Total Visitors
export const getNumberData = async (
  lastStart: string,
  thisStart: string,
  End: string,
): Promise<TrendData> => {
  const { data: lastWeek } = await supabase
    .from("daily_visitor")
    .select("count")
    .lt("day_start", thisStart)
    .gte("day_start", lastStart);

  const { data: thisWeek } = await supabase
    .from("daily_visitor")
    .select("count")
    .lt("day_start", End)
    .gte("day_start", thisStart);

  if (lastWeek && thisWeek) {
    const lastWeekCount = lastWeek.reduce(
      (sum, value) => sum + (value.count ?? 0),
      0,
    );
    const thisWeekCount = thisWeek.reduce(
      (sum, value) => sum + (value.count ?? 0),
      0,
    );

    return buildTrendResult(thisWeekCount, lastWeekCount);
  }

  return { value: "0", trendValue: "0", upAndDown: false };
};

// TrendCard — Live / Archived surveys
export const getSurveyCountData = async (
  finished: boolean,
  lastStart: string,
  thisStart: string,
  End: string,
): Promise<TrendData> => {
  const countInRange = async (start: string, endExclusive: string) => {
    const { count, error } = await supabase
      .from("survey")
      .select("*", { count: "exact", head: true })
      .eq("finished", finished)
      .gte("created_at", start)
      .lt("created_at", endExclusive);

    if (error) {
      console.error("Survey count query failed:", error);
      return 0;
    }

    return count ?? 0;
  };

  const lastWeekCount = await countInRange(lastStart, thisStart);
  const thisWeekCount = await countInRange(thisStart, End);

  return buildTrendResult(thisWeekCount, lastWeekCount);
};

// Chart — Live surveys (daily_live_survey)
export const getLiveSurveyChartData = async (
  months = 6,
): Promise<ChartPoint[]> => {
  const start = DateTime.now()
    .minus({ months })
    .startOf("day")
    .toISO({ includeOffset: false })!;

  const { data, error } = await supabase
    .from("daily_live_survey")
    .select("count, created_at")
    .gte("created_at", start)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("Daily live survey chart query failed:", error);
    return [];
  }

  return data.map((row) => ({
    date: DateTime.fromISO(row.created_at).toFormat("yyyy-MM-dd"),
    data: row.count ?? 0,
  }));
};

// Chart — Archived surveys 데이터
// export const getArchivedSurveyChartData = async (
//   months = 6,
// ): Promise<ChartPoint[]> => {
//   const start = DateTime.now()
//     .minus({ months })
//     .startOf("day")
//     .toISO({ includeOffset: false })!;
//
//   const { data, error } = await supabase
//     .from("survey")
//     .select("created_at")
//     .eq("finished", true)
//     .gte("created_at", start)
//     .order("created_at", { ascending: true });
//
//   if (error || !data) {
//     console.error("Archived survey chart query failed:", error);
//     return [];
//   }
//
//   const byDay = new Map<string, number>();
//   for (const row of data) {
//     const date = DateTime.fromISO(row.created_at).toFormat("yyyy-MM-dd");
//     byDay.set(date, (byDay.get(date) ?? 0) + 1);
//   }
//
//   return Array.from(byDay.entries())
//     .sort(([a], [b]) => a.localeCompare(b))
//     .map(([date, count]) => ({ date, data: count }));
// };
