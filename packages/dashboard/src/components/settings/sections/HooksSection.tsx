import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type SectionProps, type HookConfig, type HooksSettings, HookEvent } from "../types";

interface HookEditorProps {
	hook: HookConfig;
	onSave: (hook: HookConfig) => void;
	onCancel: () => void;
}

function HookEditor({ hook, onSave, onCancel }: HookEditorProps) {
	const [command, setCommand] = useState(hook.command);
	const [matcher, setMatcher] = useState(hook.matcher ?? "");
	const [timeout, setTimeout] = useState(hook.timeout?.toString() ?? "");

	function handleSave() {
		onSave({
			command,
			matcher: matcher || undefined,
			timeout: timeout ? parseInt(timeout, 10) : undefined,
		});
	}

	return (
		<div className="space-y-2 rounded border bg-muted/50 p-3">
			<div className="space-y-1">
				<label className="text-xs text-muted-foreground">Command</label>
				<Input
					value={command}
					onChange={(e) => setCommand(e.target.value)}
					placeholder="e.g. ./scripts/hook.sh"
				/>
			</div>
			<div className="grid grid-cols-2 gap-2">
				<div className="space-y-1">
					<label className="text-xs text-muted-foreground">Matcher (optional)</label>
					<Input
						value={matcher}
						onChange={(e) => setMatcher(e.target.value)}
						placeholder="e.g. Bash"
					/>
				</div>
				<div className="space-y-1">
					<label className="text-xs text-muted-foreground">Timeout ms (optional)</label>
					<Input
						type="number"
						value={timeout}
						onChange={(e) => setTimeout(e.target.value)}
						placeholder="e.g. 5000"
					/>
				</div>
			</div>
			<div className="flex justify-end gap-2">
				<Button variant="ghost" size="sm" onClick={onCancel}>
					<X className="mr-1 h-3 w-3" /> Cancel
				</Button>
				<Button size="sm" onClick={handleSave} disabled={!command}>
					<Check className="mr-1 h-3 w-3" /> Save
				</Button>
			</div>
		</div>
	);
}

interface HookListProps {
	event: HookEvent;
	hooks: HookConfig[];
	onChange: (hooks: HookConfig[]) => void;
}

function HookList({ event, hooks, onChange }: HookListProps) {
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [isAdding, setIsAdding] = useState(false);

	function handleSave(index: number, hook: HookConfig) {
		const newHooks = [...hooks];
		newHooks[index] = hook;
		onChange(newHooks);
		setEditingIndex(null);
	}

	function handleAdd(hook: HookConfig) {
		onChange([...hooks, hook]);
		setIsAdding(false);
	}

	function handleRemove(index: number) {
		onChange(hooks.filter((_, i) => i !== index));
	}

	return (
		<AccordionItem value={event}>
			<AccordionTrigger>
				<div className="flex items-center gap-2">
					{event}
					{hooks.length > 0 && (
						<Badge variant="secondary" className="ml-2">
							{hooks.length}
						</Badge>
					)}
				</div>
			</AccordionTrigger>
			<AccordionContent>
				<div className="space-y-2">
					<AnimatePresence mode="popLayout">
						{hooks.map((hook, index) => (
							<motion.div
								key={`${hook.command}-${index}`}
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
							>
								{editingIndex === index ? (
									<HookEditor
										hook={hook}
										onSave={(h) => handleSave(index, h)}
										onCancel={() => setEditingIndex(null)}
									/>
								) : (
									<div className="flex items-center gap-2 rounded border bg-muted/30 p-2">
										<code className="flex-1 text-sm">{hook.command}</code>
										{hook.matcher && (
											<Badge variant="outline" className="text-xs">
												{hook.matcher}
											</Badge>
										)}
										{hook.timeout && (
											<Badge variant="outline" className="text-xs">
												{hook.timeout}ms
											</Badge>
										)}
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7"
											onClick={() => setEditingIndex(index)}
										>
											<Edit className="h-3 w-3" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7 text-destructive"
											onClick={() => handleRemove(index)}
										>
											<Trash2 className="h-3 w-3" />
										</Button>
									</div>
								)}
							</motion.div>
						))}
					</AnimatePresence>

					{isAdding ? (
						<HookEditor
							hook={{ command: "" }}
							onSave={handleAdd}
							onCancel={() => setIsAdding(false)}
						/>
					) : (
						<Button
							variant="outline"
							size="sm"
							onClick={() => setIsAdding(true)}
							className="w-full"
						>
							<Plus className="mr-2 h-4 w-4" />
							Add Hook
						</Button>
					)}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}

export function HooksSection({ data, onChange }: SectionProps) {
	const hooks = (data.hooks as HooksSettings) ?? {};

	function handleChange(event: HookEvent, newHooks: HookConfig[]) {
		onChange({
			...data,
			hooks: {
				...hooks,
				[event]: newHooks.length ? newHooks : undefined,
			},
		});
	}

	return (
		<Accordion type="multiple" className="w-full">
			{Object.values(HookEvent).map((event) => (
				<HookList
					key={event}
					event={event}
					hooks={hooks[event] ?? []}
					onChange={(h) => handleChange(event, h)}
				/>
			))}
		</Accordion>
	);
}
