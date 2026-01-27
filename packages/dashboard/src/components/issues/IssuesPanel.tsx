import { useIssues } from "@/hooks/useIssues";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardLoader } from "@/components/ui/card-loader";
import { AlertTriangle, AlertCircle, Info, FileText } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { DiagnosticIssue } from "@/lib/api";

const SEVERITY_CONFIG = {
  error: {
    icon: AlertCircle,
    variant: "destructive" as const,
    className: "bg-red-500/20 text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    variant: "warning" as const,
    className: "bg-yellow-500/20 text-yellow-400",
  },
  info: {
    icon: Info,
    variant: "secondary" as const,
    className: "bg-blue-500/20 text-blue-400",
  },
};

const columns: ColumnDef<DiagnosticIssue>[] = [
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => {
      const severity = row.getValue("severity") as DiagnosticIssue["severity"];
      const config = SEVERITY_CONFIG[severity];
      const Icon = config.icon;
      return (
        <Badge className={config.className}>
          <Icon className="mr-1 h-3 w-3" />
          {severity}
        </Badge>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("category")}</Badge>
    ),
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("message")}</span>
    ),
  },
  {
    accessorKey: "file",
    header: "File",
    cell: ({ row }) => {
      const file = row.getValue("file") as string | undefined;
      if (!file) return null;
      return (
        <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
          <FileText className="h-3 w-3" />
          {file}
        </span>
      );
    },
  },
];

export function IssuesPanel() {
  const { issues, isLoading, error } = useIssues();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data: issues,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  });

  if (isLoading) {
    return <CardLoader />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load issues: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const infoCount = issues.filter((i) => i.severity === "info").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagnostic Issues</CardTitle>
        <CardDescription className="flex gap-4">
          <span className="text-red-400">{errorCount} errors</span>
          <span className="text-yellow-400">{warningCount} warnings</span>
          <span className="text-blue-400">{infoCount} info</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Filter issues..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
        {issues.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No issues found
          </div>
        ) : (
          <div className="rounded-md border" role="region" aria-label="Issues table">
            <table className="w-full" aria-label="Diagnostic issues">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b bg-muted/50">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-sm font-medium"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
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
