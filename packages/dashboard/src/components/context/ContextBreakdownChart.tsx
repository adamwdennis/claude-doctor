import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ContextSourceEntry } from "@/lib/api";

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"];

interface ContextBreakdownChartProps {
  sources: ContextSourceEntry[];
}

export function ContextBreakdownChart({ sources }: ContextBreakdownChartProps) {
  const data = sources.map((s) => ({
    name: s.label,
    tokens: s.tokenEstimate,
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
          <YAxis
            dataKey="name"
            type="category"
            width={140}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
            formatter={(value: number | undefined) => [`${(value ?? 0).toLocaleString()} tokens`, "Tokens"]}
          />
          <Bar dataKey="tokens" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
