import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tab } from "@/types/tabs";
import { AlertCircle, ChevronRight } from "lucide-react";
import type { DiagnosticIssue } from "@/lib/api";

interface CriticalIssuesProps {
	issues: DiagnosticIssue[];
	onNavigate: (tab: Tab) => void;
}

export function CriticalIssues({ issues, onNavigate }: CriticalIssuesProps) {
	const errorIssues = issues.filter((i) => i.severity === "error");
	const displayIssues = errorIssues.slice(0, 5);
	const hasMore = errorIssues.length > 5;

	if (errorIssues.length === 0) {
		return null;
	}

	function handleClickViewAll() {
		onNavigate(Tab.Issues);
	}

	function handleClickIssue() {
		onNavigate(Tab.Issues);
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-base font-medium">
					Critical Issues
				</CardTitle>
				<Button
					variant="ghost"
					size="sm"
					className="text-xs"
					onClick={handleClickViewAll}
				>
					View All
					<ChevronRight className="ml-1 h-3 w-3" />
				</Button>
			</CardHeader>
			<CardContent className="space-y-2">
				{displayIssues.map((issue, idx) => (
					<button
						key={idx}
						onClick={handleClickIssue}
						className="flex w-full items-start gap-2 rounded-md p-2 text-left text-sm transition-colors hover:bg-accent/50"
					>
						<AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
						<span className="line-clamp-2">{issue.message}</span>
					</button>
				))}
				{hasMore && (
					<div className="pt-1 text-xs text-muted-foreground">
						+{errorIssues.length - 5} more issues
					</div>
				)}
			</CardContent>
		</Card>
	);
}
