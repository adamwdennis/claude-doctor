import { useState } from "react";
import { useSnapshots } from "@/hooks/useSnapshots";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardLoader } from "@/components/ui/card-loader";
import { Spinner } from "@/components/ui/spinner";
import { SnapshotDiffView } from "./SnapshotDiffView";
import { Plus, Trash2, GitCompareArrows } from "lucide-react";

export function SnapshotsPanel() {
  const {
    snapshots,
    isLoading,
    error,
    createSnapshot,
    isCreating,
    deleteSnapshot,
    diffSnapshots,
    diffResult,
    isDiffing,
  } = useSnapshots();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function handleToggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 2) next.add(id);
      return next;
    });
  }

  function handleCompare() {
    const ids = [...selected];
    if (ids.length === 2) {
      diffSnapshots({ leftId: ids[0], rightId: ids[1] });
    }
  }

  if (isLoading) return <CardLoader />;
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load snapshots: {error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Config Snapshots</h1>
          <p className="text-sm text-muted-foreground">
            Save and compare configuration states over time
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size === 2 && (
            <Button onClick={handleCompare} disabled={isDiffing} variant="outline">
              {isDiffing ? <Spinner className="mr-2" /> : <GitCompareArrows className="mr-2 h-4 w-4" />}
              Compare
            </Button>
          )}
          <Button onClick={() => createSnapshot(undefined)} disabled={isCreating}>
            {isCreating ? <Spinner className="mr-2" /> : <Plus className="mr-2 h-4 w-4" />}
            Take Snapshot
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Snapshots</CardTitle>
          <CardDescription>
            {snapshots.length} snapshot(s) saved. Select 2 to compare.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {snapshots.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No snapshots yet. Click "Take Snapshot" to save current state.
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 w-8" />
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Created</th>
                    <th className="px-4 py-3 text-left font-medium">Project</th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {snapshots.map((snap) => (
                    <tr key={snap.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(snap.id)}
                          onChange={() => handleToggleSelect(snap.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium">{snap.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(snap.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-mono text-xs">
                          {snap.projectPath}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSnapshot(snap.id)}
                          aria-label="Delete snapshot"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {diffResult && <SnapshotDiffView diff={diffResult} />}
    </div>
  );
}
