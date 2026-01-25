import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SectionProps } from "../types";

interface StringArrayEditorProps {
	label: string;
	values: string[];
	onChange: (values: string[]) => void;
	placeholder?: string;
}

function StringArrayEditor({
	label,
	values,
	onChange,
	placeholder,
}: StringArrayEditorProps) {
	const [newValue, setNewValue] = useState("");

	function handleAdd() {
		if (newValue && !values.includes(newValue)) {
			onChange([...values, newValue]);
			setNewValue("");
		}
	}

	function handleRemove(value: string) {
		onChange(values.filter((v) => v !== value));
	}

	return (
		<div className="space-y-2">
			<label className="text-sm font-medium">{label}</label>
			<div className="flex flex-wrap gap-2">
				<AnimatePresence mode="popLayout">
					{values.map((value) => (
						<motion.div
							key={value}
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
						>
							<Badge variant="secondary" className="gap-1 pr-1">
								{value}
								<button
									className="ml-1 rounded-full p-0.5 hover:bg-white/20"
									onClick={() => handleRemove(value)}
								>
									<X className="h-3 w-3" />
								</button>
							</Badge>
						</motion.div>
					))}
				</AnimatePresence>
			</div>
			<div className="flex items-center gap-2">
				<Input
					className="flex-1"
					placeholder={placeholder}
					value={newValue}
					onChange={(e) => setNewValue(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleAdd()}
				/>
				<Button variant="outline" size="sm" onClick={handleAdd} disabled={!newValue}>
					<Plus className="mr-2 h-4 w-4" />
					Add
				</Button>
			</div>
		</div>
	);
}

export function McpSection({ data, onChange }: SectionProps) {
	const enabledServers = (data.enabledMcpjsonServers as string[]) ?? [];
	const disabledServers = (data.disabledMcpjsonServers as string[]) ?? [];

	function handleToggle(key: string, value: boolean) {
		onChange({ ...data, [key]: value });
	}

	function handleEnabledChange(values: string[]) {
		onChange({ ...data, enabledMcpjsonServers: values.length ? values : undefined });
	}

	function handleDisabledChange(values: string[]) {
		onChange({
			...data,
			disabledMcpjsonServers: values.length ? values : undefined,
		});
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<label className="text-sm font-medium">Enable All Project Servers</label>
					<p className="text-xs text-muted-foreground">
						Auto-approve all MCP servers from .mcp.json
					</p>
				</div>
				<Switch
					checked={(data.enableAllProjectMcpServers as boolean) ?? false}
					onCheckedChange={(checked) =>
						handleToggle("enableAllProjectMcpServers", checked)
					}
				/>
			</div>

			<StringArrayEditor
				label="Enabled Servers"
				values={enabledServers}
				onChange={handleEnabledChange}
				placeholder="Server name to approve"
			/>

			<StringArrayEditor
				label="Disabled Servers"
				values={disabledServers}
				onChange={handleDisabledChange}
				placeholder="Server name to reject"
			/>
		</div>
	);
}
