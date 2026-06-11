"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";

export const description = "A simple area chart";

interface ChartData {
  date: string;
  data: number;
}

const chartConfig = {
  data: {
    label: "Data",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function TrendChart({
  title,
  description,
  chartData,
  trendMessage,
  trendValue,
  periodMessage,
}: {
  title: string;
  description: string;
  chartData: ChartData[];
  trendMessage: string;
  trendValue: string;
  periodMessage: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(5, 10)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="data"
              type="natural"
              fill="var(--color-data)"
              fillOpacity={0.4}
              stroke="var(--color-data)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {trendMessage} <TrendingUp className="h-4 w-4" />+{trendValue}%
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {periodMessage}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
