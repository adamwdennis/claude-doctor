import { useState, useMemo } from "react";
import {
	ChevronDown,
	ChevronRight,
	Folder,
	FolderOpen,
	FileText,
	FileJson,
	Home,
	GitBranch,
	Check,
	X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
	FileTraceType,
	type FileTraceCollection,
	type FileTraceEntry,
} from "@/lib/api";

interface TreeNode {
	name: string;
	path: string;
	files: FileTraceEntry[];
	children: TreeNode[];
	isProjectRoot: boolean;
	isUserHome: boolean;
	/** Intermediate dirs with no files and exactly one child get collapsed into a path segment */
	collapsed?: string;
}

function buildTree(data: FileTraceCollection): TreeNode {
	const { levels, homePath, projectPath } = data;

	// Compute intermediate path segments between home and project
	const relProject = projectPath.startsWith(homePath + "/")
		? projectPath.slice(homePath.length + 1)
		: "";
	const segments = relProject ? relProject.split("/") : [];

	// Index levels by directory
	const levelMap = new Map(levels.map((l) => [l.directory, l]));

	// Root = home
	const homeLevel = levelMap.get(homePath);
	const root: TreeNode = {
		name: "~",
		path: homePath,
		files: homeLevel?.files ?? [],
		children: [],
		isProjectRoot: false,
		isUserHome: true,
	};

	// Build path from home → project through intermediate segments
	let current = root;
	let currentPath = homePath;
	for (const segment of segments) {
		currentPath = currentPath + "/" + segment;
		const level = levelMap.get(currentPath);
		const isProject = currentPath === projectPath;
		const node: TreeNode = {
			name: segment,
			path: currentPath,
			files: level?.files ?? [],
			children: [],
			isProjectRoot: isProject,
			isUserHome: false,
		};
		current.children.push(node);
		current = node;
	}

	// Attach any levels that are subdirectories (e.g. .claude dirs)
	for (const level of levels) {
		const dir = level.directory;
		if (dir === homePath || dir === projectPath) continue;

		// Find which node this belongs under
		let parent: TreeNode | null = null;
		const findParent = (node: TreeNode): boolean => {
			if (dir.startsWith(node.path + "/")) {
				// Check children first for a more specific match
				for (const child of node.children) {
					if (findParent(child)) return true;
				}
				parent = node;
				return true;
			}
			return false;
		};
		findParent(root);

		if (parent) {
			const p = parent as TreeNode;
			const relName = dir.slice(p.path.length + 1);
			// Only add if not already a child
			const existing = p.children.find((c) => c.path === dir);
			if (!existing) {
				p.children.push({
					name: relName,
					path: dir,
					files: level.files,
					children: [],
					isProjectRoot: level.isProjectRoot,
					isUserHome: level.isUserHome,
				});
			}
		}
	}

	// Collapse intermediate dirs that have no files and exactly one child
	function collapseIntermediates(node: TreeNode): TreeNode {
		node.children = node.children.map(collapseIntermediates);
		if (
			node.children.length === 1 &&
			node.files.length === 0 &&
			!node.isUserHome &&
			!node.isProjectRoot
		) {
			const child = node.children[0];
			return {
				...child,
				name: node.name + "/" + child.name,
			};
		}
		return node;
	}

	return collapseIntermediates(root);
}

function formatSize(size?: number): string {
	if (size === undefined) return "";
	if (size < 1024) return `${size}B`;
	if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
	return `${(size / 1024 / 1024).toFixed(1)}MB`;
}

function getFileIcon(entry: FileTraceEntry) {
	if (entry.type === FileTraceType.ClaudeDir) {
		return <Folder className="h-3.5 w-3.5 text-blue-400" />;
	}
	if (entry.path.endsWith(".json")) {
		return <FileJson className="h-3.5 w-3.5 text-yellow-400" />;
	}
	return <FileText className="h-3.5 w-3.5 text-gray-400" />;
}

function isEditableFile(entry: FileTraceEntry): boolean {
	if (!entry.exists) return false;
	if (entry.type === FileTraceType.ClaudeDir) return false;
	return entry.path.endsWith(".json") || entry.path.endsWith(".md");
}

interface TreeNodeItemProps {
	node: TreeNode;
	depth: number;
	selectedPath: string | null;
	onSelectFile: (path: string) => void;
}

function TreeNodeItem({
	node,
	depth,
	selectedPath,
	onSelectFile,
}: TreeNodeItemProps) {
	const hasContent = node.files.length > 0 || node.children.length > 0;
	const [expanded, setExpanded] = useState(
		node.isUserHome || node.isProjectRoot || hasContent,
	);

	function handleToggle() {
		if (hasContent) {
			setExpanded(!expanded);
		}
	}

	const editableFiles = node.files.filter(
		(f) => f.type !== FileTraceType.ClaudeDir,
	);
	const existingCount = editableFiles.filter((f) => f.exists).length;

	return (
		<div>
			<button
				onClick={handleToggle}
				className={cn(
					"flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-sm hover:bg-accent/50 transition-colors",
					!hasContent && "opacity-50 cursor-default",
				)}
				style={{ paddingLeft: `${depth * 12 + 8}px` }}
			>
				{hasContent ? (
					expanded ? (
						<ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
					) : (
						<ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
					)
				) : (
					<span className="w-3.5" />
				)}
				{expanded && hasContent ? (
					<FolderOpen className="h-4 w-4 shrink-0 text-blue-400" />
				) : (
					<Folder className="h-4 w-4 shrink-0 text-blue-400" />
				)}
				<span className="truncate font-medium">{node.name}</span>
				{node.isUserHome && (
					<Home className="ml-auto h-3.5 w-3.5 shrink-0 text-orange-400" />
				)}
				{node.isProjectRoot && (
					<GitBranch className="ml-auto h-3.5 w-3.5 shrink-0 text-green-400" />
				)}
				{!node.isUserHome &&
					!node.isProjectRoot &&
					existingCount > 0 && (
						<span className="ml-auto text-[10px] text-muted-foreground">
							{existingCount}
						</span>
					)}
			</button>
			{expanded && (
				<div>
					{editableFiles.map((file) => {
						const editable = isEditableFile(file);
						const fileName = file.path.split("/").pop() || file.path;
						const isSelected = selectedPath === file.path;

						function handleClickFile() {
							if (editable) {
								onSelectFile(file.path);
							}
						}

						return (
							<div
								key={file.path}
								onClick={handleClickFile}
								className={cn(
									"flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors",
									editable &&
										"cursor-pointer hover:bg-accent/50",
									!file.exists && "opacity-40",
									isSelected && "bg-accent text-accent-foreground",
								)}
								style={{
									paddingLeft: `${(depth + 1) * 12 + 8 + 14}px`,
								}}
								title={file.path}
							>
								{getFileIcon(file)}
								<span className="truncate">{fileName}</span>
								<span className="ml-auto flex items-center gap-1.5">
									{file.size !== undefined && (
										<span className="text-[10px] text-muted-foreground">
											{formatSize(file.size)}
										</span>
									)}
									{file.exists ? (
										<Check className="h-3 w-3 text-green-500" />
									) : (
										<X className="h-3 w-3 text-gray-500" />
									)}
								</span>
							</div>
						);
					})}
					{node.children.map((child) => (
						<TreeNodeItem
							key={child.path}
							node={child}
							depth={depth + 1}
							selectedPath={selectedPath}
							onSelectFile={onSelectFile}
						/>
					))}
				</div>
			)}
		</div>
	);
}

interface FileTreeProps {
	data: FileTraceCollection;
	selectedPath: string | null;
	onSelectFile: (path: string) => void;
}

export function FileTree({ data, selectedPath, onSelectFile }: FileTreeProps) {
	const tree = useMemo(() => buildTree(data), [data]);

	return (
		<div className="py-2 overflow-y-auto h-full">
			<TreeNodeItem
				node={tree}
				depth={0}
				selectedPath={selectedPath}
				onSelectFile={onSelectFile}
			/>
		</div>
	);
}
