import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SnapshotDiff } from "@/lib/api";

const CHANGE_COLORS: Record<string, string> = {
  added: "bg-green-500/10 text-green-400",
  removed: "bg-red-500/10 text-red-400",
  changed: "bg-yellow-500/10 text-yellow-400",
};

const CHANGE_LABELS: Record<string, string> = {
  added: "Added",
  removed: "Removed",
  changed: "Changed",
};

interface SnapshotDiffViewProps {
  diff: SnapshotDiff;
}

export function SnapshotDiffView({ diff }: SnapshotDiffViewProps) {
  const addedCount = diff.entries.filter((e) => e.changeType === "added").length;
  const removedCount = diff.entries.filter((e) => e.changeType === "removed").length;
  const changedCount = diff.entries.filter((e) => e.changeType === "changed").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diff Result</CardTitle>
        <CardDescription>
          Comparing "{diff.left.name}" vs "{diff.right.name}" — {diff.entries.length} difference(s)
        </CardDescription>
        <div className="flex gap-2">
          <Badge className="bg-green-500/20 text-green-400">{addedCount} added</Badge>
          <Badge className="bg-red-500/20 text-red-400">{removedCount} removed</Badge>
          <Badge className="bg-yellow-500/20 text-yellow-400">{changedCount} changed</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {diff.entries.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No differences found
          </div>
        ) : (
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Path</th>
                  <th className="px-4 py-3 text-left font-medium">Change</th>
                  <th className="px-4 py-3 text-left font-medium">Old Value</th>
                  <th className="px-4 py-3 text-left font-medium">New Value</th>
                </tr>
              </thead>
              <tbody>
                {diff.entries.map((entry) => (
                  <tr key={entry.path} className={`border-b last:border-b-0 ${CHANGE_COLORS[entry.changeType] ?? ""}`}>
                    <td className="px-4 py-3 font-mono text-xs">{entry.path}</td>
                    <td className="px-4 py-3">
                      <Badge className={CHANGE_COLORS[entry.changeType] ?? ""}>
                        {CHANGE_LABELS[entry.changeType] ?? entry.changeType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs max-w-[200px] truncate">
                      {entry.oldValue !== undefined ? String(entry.oldValue) : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs max-w-[200px] truncate">
                      {entry.newValue !== undefined ? String(entry.newValue) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
