import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Save, RotateCcw, FileJson, FileText, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { useFileRead, useFileSave } from "@/hooks/useFileTrace";

function formatSize(size?: number): string {
	if (size === undefined) return "";
	if (size < 1024) return `${size}B`;
	if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
	return `${(size / 1024 / 1024).toFixed(1)}MB`;
}

interface FileViewerProps {
	path: string | null;
}

/** Outer wrapper that uses key-based reset to avoid useEffect setState */
export function FileViewer({ path }: FileViewerProps) {
	if (!path) {
		return (
			<div className="flex flex-1 items-center justify-center text-muted-foreground">
				<div className="text-center space-y-2">
					<FileSearch className="h-10 w-10 mx-auto opacity-40" />
					<p className="text-sm">Select a file from the tree</p>
				</div>
			</div>
		);
	}

	return <FileViewerInner key={path} path={path} />;
}

function FileViewerInner({ path }: { path: string }) {
	const { data, isLoading, error } = useFileRead(path);
	const saveMutation = useFileSave();
	const [editedContent, setEditedContent] = useState<string | null>(null);

	const content = editedContent ?? data?.content ?? "";
	const hasChanges = editedContent !== null && editedContent !== data?.content;

	const isJson = path.endsWith(".json");
	const isMd = path.endsWith(".md");

	const jsonError = useMemo(() => {
		if (!isJson || !content) return null;
		try {
			JSON.parse(content);
			return null;
		} catch (e) {
			return (e as Error).message;
		}
	}, [isJson, content]);

	function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
		setEditedContent(e.target.value);
	}

	function handleSave() {
		if (!hasChanges) return;
		saveMutation.mutate(
			{ path, content },
			{
				onSuccess: () => {
					toast.success("File saved");
					setEditedContent(null);
				},
				onError: (err) => {
					toast.error(`Save failed: ${err.message}`);
				},
			},
		);
	}

	function handleReset() {
		setEditedContent(null);
	}

	const canSave = hasChanges && !jsonError && !saveMutation.isPending;
	const fileName = path.split("/").pop() || path;

	return (
		<div className="flex flex-1 flex-col overflow-hidden">
			{/* Header */}
			<div className="flex items-center gap-3 border-b px-4 py-3">
				{isJson ? (
					<FileJson className="h-4 w-4 text-yellow-400 shrink-0" />
				) : (
					<FileText className="h-4 w-4 text-gray-400 shrink-0" />
				)}
				<div className="min-w-0 flex-1">
					<div className="font-mono text-sm font-medium truncate">
						{fileName}
					</div>
					<div className="text-xs text-muted-foreground truncate">
						{path}
					</div>
				</div>
				<div className="flex items-center gap-2 shrink-0">
					{isJson && (
						<span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-medium text-yellow-500">
							JSON
						</span>
					)}
					{isMd && (
						<span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-500">
							Markdown
						</span>
					)}
					{data?.content !== undefined && (
						<span className="text-xs text-muted-foreground">
							{formatSize(new TextEncoder().encode(data.content).length)}
						</span>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-auto p-4">
				{isLoading && (
					<div className="flex items-center justify-center py-12">
						<Spinner className="h-6 w-6" />
					</div>
				)}

				{error && (
					<Alert variant="destructive">
						<AlertDescription>
							Failed to load file: {error.message}
						</AlertDescription>
					</Alert>
				)}

				{!isLoading && !error && (
					<Textarea
						className="min-h-[400px] h-full font-mono text-sm resize-none"
						value={content}
						onChange={handleContentChange}
						placeholder="File content..."
					/>
				)}

				{jsonError && (
					<Alert variant="destructive" className="mt-2">
						<AlertDescription>JSON error: {jsonError}</AlertDescription>
					</Alert>
				)}
			</div>

			{/* Footer */}
			{!isLoading && !error && (
				<div className="flex items-center justify-end gap-2 border-t px-4 py-2">
					{hasChanges && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleReset}
						>
							<RotateCcw className="mr-1.5 h-3.5 w-3.5" />
							Reset
						</Button>
					)}
					<Button
						size="sm"
						onClick={handleSave}
						disabled={!canSave}
					>
						{saveMutation.isPending ? (
							<Spinner className="mr-1.5" />
						) : (
							<Save className="mr-1.5 h-3.5 w-3.5" />
						)}
						Save
					</Button>
				</div>
			)}
		</div>
	);
}
