import TrendCard from "../components/trend-card";
import { TrendChart } from "../components/trend-chart";
import type { Route } from "./+types/dashboard";
import { supabase } from "~/postgres/supaclient";
import { DateTime } from "luxon";
import {
  getNumberData,
  getSurveyCountData,
  getLiveSurveyChartData,
} from "../query";

//Archived Surveys 차트에 들어갈 임의 데이터
const archivedSurveyChartMock = [
  { date: "2025-12-01", data: 1 },
  { date: "2025-12-15", data: 3 },
  { date: "2026-01-10", data: 2 },
  { date: "2026-02-05", data: 4 },
  { date: "2026-03-01", data: 2 },
  { date: "2026-04-12", data: 5 },
  { date: "2026-05-01", data: 3 },
];

export const loader = async ({ request }: Route.LoaderArgs) => {
  await supabase.rpc("increment_daily_visitor", {
    day: DateTime.now().startOf("day").toISO({ includeOffset: false }),
  });

  const thisWeekStart = DateTime.now()
    .startOf("week")
    .toISO({ includeOffset: false })!;
  const thisWeekEnd = DateTime.now().toISO({ includeOffset: false })!;
  const lastWeekStart = DateTime.now()
    .startOf("week")
    .minus({ weeks: 1 })
    .toISO({ includeOffset: false })!;

  const [visitors, liveSurveys, archivedSurveys, liveSurveyChart] =
    await Promise.all([
      getNumberData(lastWeekStart, thisWeekStart, thisWeekEnd),
      getSurveyCountData(false, lastWeekStart, thisWeekStart, thisWeekEnd),
      getSurveyCountData(true, lastWeekStart, thisWeekStart, thisWeekEnd),
      getLiveSurveyChartData(),
      // getArchivedSurveyChartData(), // 실제 데이터
    ]);

  // 위 Archived Surveys 차트 데이터
  const archivedSurveyChart = archivedSurveyChartMock;

  return {
    visitors,
    liveSurveys,
    archivedSurveys,
    liveSurveyChart,
    archivedSurveyChart,
  };
};

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        <TrendCard
          title="Total Visitors"
          value={loaderData.visitors.value}
          trendValue={loaderData.visitors.trendValue}
          trendMessage={
            loaderData.visitors.upAndDown ? "Trending up" : "Trending down"
          }
          periodMessage="This week"
        />
        <TrendCard
          title="Live surveys"
          value={loaderData.liveSurveys.value}
          trendValue={loaderData.liveSurveys.trendValue}
          trendMessage={
            loaderData.liveSurveys.upAndDown ? "Trending up" : "Trending down"
          }
          periodMessage="This week"
        />
        <TrendCard
          title="Archived surveys"
          value={loaderData.archivedSurveys.value}
          trendValue={loaderData.archivedSurveys.trendValue}
          trendMessage={
            loaderData.archivedSurveys.upAndDown
              ? "Trending up"
              : "Trending down"
          }
          periodMessage="This week"
        />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <TrendChart
          title="Live Surveys"
          description="Showing live surveys for the last 6 months"
          chartData={loaderData.liveSurveyChart}
          trendMessage={
            loaderData.liveSurveys.upAndDown ? "Trending up" : "Trending down"
          }
          trendValue={loaderData.liveSurveys.trendValue}
          periodMessage="Last 6 months"
        />
        <TrendChart
          title="Archived Surveys"
          description="Showing archived surveys for the last 6 months"
          chartData={loaderData.archivedSurveyChart}
          trendMessage={
            loaderData.archivedSurveys.upAndDown
              ? "Trending up"
              : "Trending down"
          }
          trendValue={loaderData.archivedSurveys.trendValue}
          periodMessage="Last 6 months"
        />
      </div>
    </div>
  );
}
