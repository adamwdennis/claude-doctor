import { useSessionDetail } from "@/hooks/useSessionDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardLoader } from "@/components/ui/card-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	Calendar,
	MessageSquare,
	Wrench,
	Coins,
	Hash,
	FolderOpen,
	Cpu,
	Play,
	Zap,
} from "lucide-react";
import type { HistoryEntry } from "@/lib/api";
import { BlurText } from "@/components/reactbits/BlurText";
import { CountUp } from "@/components/reactbits/CountUp";

function formatCost(cost: number): string {
	if (cost < 0.01) return `$${cost.toFixed(4)}`;
	return `$${cost.toFixed(2)}`;
}

function formatTokens(tokens: number): string {
	if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
	if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
	return String(tokens);
}

function parseDate(dateStr: string): Date {
	const num = Number(dateStr);
	if (!Number.isNaN(num) && num > 1_000_000_000) {
		return new Date(num);
	}
	return new Date(dateStr);
}

function pad(n: number): string {
	return String(n).padStart(2, "0");
}

function formatDate(dateStr: string): string {
	const d = parseDate(dateStr);
	const yyyy = d.getFullYear();
	const mm = pad(d.getMonth() + 1);
	const dd = pad(d.getDate());
	let hh = d.getHours();
	const min = pad(d.getMinutes());
	const sec = pad(d.getSeconds());
	const ampm = hh >= 12 ? "PM" : "AM";
	hh = hh % 12 || 12;
	return `${yyyy}-${mm}-${dd}@${pad(hh)}:${min}:${sec} ${ampm}`;
}

function formatTime(dateStr: string): string {
	const d = parseDate(dateStr);
	let hh = d.getHours();
	const min = pad(d.getMinutes());
	const sec = pad(d.getSeconds());
	const ampm = hh >= 12 ? "PM" : "AM";
	hh = hh % 12 || 12;
	return `${pad(hh)}:${min}:${sec} ${ampm}`;
}

const TYPE_CONFIG: Record<
	string,
	{ icon: typeof MessageSquare; color: string; label: string; bg: string }
> = {
	session_start: {
		icon: Play,
		color: "text-green-400",
		label: "Session Start",
		bg: "bg-green-950/50",
	},
	message: {
		icon: MessageSquare,
		color: "text-blue-400",
		label: "Message",
		bg: "bg-blue-950/30",
	},
	tool_call: {
		icon: Wrench,
		color: "text-amber-400",
		label: "Tool Call",
		bg: "bg-amber-950/30",
	},
	api_request: {
		icon: Zap,
		color: "text-muted-foreground",
		label: "API Request",
		bg: "",
	},
	api_response: {
		icon: Zap,
		color: "text-muted-foreground",
		label: "API Response",
		bg: "",
	},
};

interface TimelineEntryRowProps {
	entry: HistoryEntry;
	index: number;
	isLast: boolean;
}

function TimelineEntryRow({ entry, index, isLast }: TimelineEntryRowProps) {
	const config = TYPE_CONFIG[entry.type] ?? TYPE_CONFIG.message;
	const Icon = config.icon;
	const hasTokenData =
		(entry.tokensIn !== undefined && entry.tokensIn > 0) ||
		(entry.tokensOut !== undefined && entry.tokensOut > 0);

	return (
		<div className={`relative flex items-start gap-4 py-3 px-4 ${config.bg}`}>
			{/* Timeline connector */}
			<div className="flex flex-col items-center">
				<div
					className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background ${config.color}`}
				>
					<Icon className="h-4 w-4" />
				</div>
				{!isLast && (
					<div className="w-px flex-1 bg-border min-h-[8px]" />
				)}
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0 pt-1">
				<div className="flex items-center gap-2 flex-wrap">
					<Badge variant="secondary" className="text-xs">
						{config.label}
					</Badge>
					{entry.toolName && (
						<Badge variant="outline" className="text-xs font-mono">
							{entry.toolName}
						</Badge>
					)}
					{entry.model && (
						<Badge variant="outline" className="text-xs">
							{entry.model}
						</Badge>
					)}
					<span className="text-xs text-muted-foreground ml-auto shrink-0">
						#{index + 1}
					</span>
				</div>

				{entry.message && (
					<div className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap break-words">
						{entry.message}
					</div>
				)}

				{/* Token/cost row */}
				{(hasTokenData || (entry.costUsd !== undefined && entry.costUsd > 0)) && (
					<div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
						{hasTokenData && (
							<>
								<span className="flex items-center gap-1">
									<Hash className="h-3 w-3" />
									In: {formatTokens(entry.tokensIn ?? 0)}
								</span>
								<span className="flex items-center gap-1">
									<Hash className="h-3 w-3" />
									Out: {formatTokens(entry.tokensOut ?? 0)}
								</span>
							</>
						)}
						{entry.costUsd !== undefined && entry.costUsd > 0 && (
							<span className="flex items-center gap-1">
								<Coins className="h-3 w-3" />
								{formatCost(entry.costUsd)}
							</span>
						)}
					</div>
				)}
			</div>

			{/* Timestamp */}
			<div className="text-xs text-muted-foreground shrink-0 pt-1">
				{formatTime(entry.timestamp)}
			</div>
		</div>
	);
}

interface SessionDetailPageProps {
	sessionId: string;
	onBack: () => void;
}

export function SessionDetailPage({ sessionId, onBack }: SessionDetailPageProps) {
	const { data, isLoading, error } = useSessionDetail(sessionId);

	if (isLoading) {
		return <CardLoader />;
	}

	if (error) {
		return (
			<div className="space-y-4">
				<Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
					<ArrowLeft className="h-4 w-4" />
					Back to sessions
				</Button>
				<Alert variant="destructive">
					<AlertDescription>
						Failed to load session: {error.message}
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="space-y-4">
				<Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
					<ArrowLeft className="h-4 w-4" />
					Back to sessions
				</Button>
				<Alert>
					<AlertDescription>Session not found</AlertDescription>
				</Alert>
			</div>
		);
	}

	const { session, entries, entryCount } = data;
	const hasTokens = session.tokensIn > 0 || session.tokensOut > 0 || session.costUsd > 0;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
					<ArrowLeft className="h-4 w-4" />
					Back
				</Button>
				<div>
					<h1 className="text-2xl font-bold"><BlurText text="Session Detail" /></h1>
					<p className="text-sm text-muted-foreground">
						{formatDate(session.startedAt)}
					</p>
				</div>
			</div>

			{/* Metadata cards */}
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
				<div className="flex items-center gap-3 rounded-lg border p-4">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
						<Calendar className="h-5 w-5 text-blue-500" />
					</div>
					<div>
						<div className="text-2xl font-bold"><CountUp to={entryCount} /></div>
						<div className="text-xs text-muted-foreground">Entries</div>
					</div>
				</div>
				<div className="flex items-center gap-3 rounded-lg border p-4">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
						<MessageSquare className="h-5 w-5 text-green-500" />
					</div>
					<div>
						<div className="text-2xl font-bold"><CountUp to={session.messageCount} /></div>
						<div className="text-xs text-muted-foreground">Messages</div>
					</div>
				</div>
				<div className="flex items-center gap-3 rounded-lg border p-4">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
						<Wrench className="h-5 w-5 text-orange-500" />
					</div>
					<div>
						<div className="text-2xl font-bold"><CountUp to={session.toolCalls.length} /></div>
						<div className="text-xs text-muted-foreground">Tool Calls</div>
					</div>
				</div>
				<div className="flex items-center gap-3 rounded-lg border p-4">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
						<Hash className="h-5 w-5 text-purple-500" />
					</div>
					<div>
						<div className="text-2xl font-bold">
							{hasTokens ? formatTokens(session.tokensIn + session.tokensOut) : "N/A"}
						</div>
						<div className="text-xs text-muted-foreground">Total Tokens</div>
					</div>
				</div>
				<div className="flex items-center gap-3 rounded-lg border p-4">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
						<Coins className="h-5 w-5 text-yellow-500" />
					</div>
					<div>
						<div className="text-2xl font-bold">
							{hasTokens ? formatCost(session.costUsd) : "N/A"}
						</div>
						<div className="text-xs text-muted-foreground">Cost</div>
					</div>
				</div>
				{session.model && (
					<div className="flex items-center gap-3 rounded-lg border p-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
							<Cpu className="h-5 w-5 text-pink-500" />
						</div>
						<div>
							<div className="text-sm font-bold truncate">{session.model}</div>
							<div className="text-xs text-muted-foreground">Model</div>
						</div>
					</div>
				)}
			</div>

			{/* Working directory */}
			{session.cwd && (
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<FolderOpen className="h-4 w-4" />
					<span className="font-mono text-xs">{session.cwd}</span>
				</div>
			)}

			{/* Tool calls summary */}
			{session.toolCalls.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-sm">Tools Used</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-1">
							{session.toolCalls.map((tool) => (
								<Badge key={tool} variant="secondary" className="text-xs">
									{tool}
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Timeline */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<span>Timeline</span>
						<span className="text-sm font-normal text-muted-foreground">
							{entryCount} entries
						</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					{entries.length === 0 ? (
						<div className="px-4 py-8 text-center text-muted-foreground">
							No entries found
						</div>
					) : (
						<div className="divide-y">
							{entries.map((entry, i) => (
								<TimelineEntryRow
									key={i}
									entry={entry}
									index={i}
									isLast={i === entries.length - 1}
								/>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
