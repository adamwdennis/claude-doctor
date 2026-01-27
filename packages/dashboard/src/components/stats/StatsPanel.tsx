import { useStats } from "@/hooks/useStats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardLoader } from "@/components/ui/card-loader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
];

export function StatsPanel() {
  const { stats, isLoading, error } = useStats();

  if (isLoading) {
    return <CardLoader />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load stats: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  const configFiles = (stats.configFiles ?? []) as { name: string; exists: boolean }[];
  const mcpServers = (stats.mcpServers ?? 0) as number;
  const plugins = (stats.plugins ?? 0) as number;
  const issues = (stats.issues ?? { error: 0, warning: 0, info: 0 }) as {
    error: number;
    warning: number;
    info: number;
  };

  const issueData = [
    { name: "Errors", value: issues.error, color: "#ef4444" },
    { name: "Warnings", value: issues.warning, color: "#f59e0b" },
    { name: "Info", value: issues.info, color: "#3b82f6" },
  ];

  const configData = configFiles.map((f) => ({
    name: f.name,
    exists: f.exists ? 1 : 0,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Configuration summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">
                {mcpServers}
              </div>
              <div className="text-sm text-muted-foreground">MCP Servers</div>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">
                {plugins}
              </div>
              <div className="text-sm text-muted-foreground">Plugins</div>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-3xl font-bold text-amber-400">
                {configFiles.length}
              </div>
              <div className="text-sm text-muted-foreground">Config Files</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Issues by Severity</CardTitle>
          <CardDescription>Distribution of diagnostic issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={issueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {issueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4">
            {issueData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Config Files</CardTitle>
          <CardDescription>Status of configuration files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={configData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 1]} hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                  formatter={(value) =>
                    value === 1 ? "Exists" : "Missing"
                  }
                />
                <Bar dataKey="exists" radius={[0, 4, 4, 0]}>
                  {configData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.exists ? COLORS[index % COLORS.length] : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
