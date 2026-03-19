import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useFileTrace } from "@/hooks/useFileTrace";
import { FileTree } from "./FileTree";
import { FileViewer } from "./FileViewer";

export function FilesPage() {
	const { data, isLoading, error } = useFileTrace();
	const [selectedPath, setSelectedPath] = useState<string | null>(null);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Spinner className="h-6 w-6" />
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="text-sm text-destructive">
				Failed to load config files
			</div>
		);
	}

	return (
		<div className="flex h-[calc(100vh-7.5rem)] rounded-lg border bg-card overflow-hidden">
			{/* Inset sidebar — folder tree */}
			<div className="w-60 shrink-0 border-r overflow-y-auto">
				<div className="px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
					Config Files
				</div>
				<FileTree
					data={data}
					selectedPath={selectedPath}
					onSelectFile={setSelectedPath}
				/>
			</div>

			{/* Right panel — file viewer */}
			<div className="flex flex-1 flex-col overflow-hidden">
				<FileViewer path={selectedPath} />
			</div>
		</div>
	);
}
