import { useForecast } from "@/hooks/useForecast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardLoader } from "@/components/ui/card-loader";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const TREND_CONFIG = {
  up: { icon: TrendingUp, color: "text-red-400", label: "Trending Up" },
  down: { icon: TrendingDown, color: "text-green-400", label: "Trending Down" },
  stable: { icon: Minus, color: "text-muted-foreground", label: "Stable" },
};

function formatCost(cost: number): string {
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(2)}`;
}

export function CostForecastCard() {
  const { data, isLoading } = useForecast(30);

  if (isLoading) return <CardLoader />;
  if (!data || data.periodAnalyzedDays === 0) return null;

  const trend = TREND_CONFIG[data.trend];
  const TrendIcon = trend.icon;

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cost Forecast</CardTitle>
            <CardDescription>
              Based on {data.periodAnalyzedDays} days of data
            </CardDescription>
          </div>
          <Badge className={trend.color}>
            <TrendIcon className="mr-1 h-3 w-3" />
            {trend.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {formatCost(data.dailyAverage)}
            </div>
            <div className="text-xs text-muted-foreground">Daily Average</div>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {formatCost(data.weeklyAverage)}
            </div>
            <div className="text-xs text-muted-foreground">Weekly Average</div>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">
              {formatCost(data.monthlyProjection)}
            </div>
            <div className="text-xs text-muted-foreground">Monthly Projection</div>
          </div>
        </div>

        {data.dataPoints.length > 1 && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dataPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={(v: number) => `$${v.toFixed(2)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                  formatter={(value: number | undefined) => [`$${(value ?? 0).toFixed(4)}`, "Cost"]}
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
