import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SectionProps } from "../types";

export function EnvSection({ data, onChange }: SectionProps) {
	const [newKey, setNewKey] = useState("");
	const [newValue, setNewValue] = useState("");

	const env = (data.env as Record<string, string>) ?? {};
	const entries = Object.entries(env);

	function handleValueChange(key: string, value: string) {
		onChange({
			...data,
			env: { ...env, [key]: value },
		});
	}

	function handleRemove(key: string) {
		const newEnv = { ...env };
		delete newEnv[key];
		onChange({ ...data, env: newEnv });
	}

	function handleAdd() {
		if (newKey && !env[newKey]) {
			onChange({
				...data,
				env: { ...env, [newKey]: newValue },
			});
			setNewKey("");
			setNewValue("");
		}
	}

	return (
		<div className="space-y-3">
			<AnimatePresence mode="popLayout">
				{entries.map(([key, value]) => (
					<motion.div
						key={key}
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="flex items-center gap-2"
					>
						<Input
							className="w-40 font-mono text-sm"
							value={key}
							disabled
							aria-label="Environment variable name"
						/>
						<span className="text-muted-foreground">=</span>
						<Input
							className="flex-1 font-mono text-sm"
							value={value}
							onChange={(e) => handleValueChange(key, e.target.value)}
							aria-label={`Value for ${key}`}
						/>
						<Button
							variant="ghost"
							size="icon"
							className="text-destructive"
							onClick={() => handleRemove(key)}
							aria-label={`Remove ${key}`}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</motion.div>
				))}
			</AnimatePresence>

			<div className="flex items-center gap-2 pt-2">
				<Input
					className="w-40 font-mono text-sm"
					placeholder="KEY"
					value={newKey}
					onChange={(e) => setNewKey(e.target.value.toUpperCase())}
				/>
				<span className="text-muted-foreground">=</span>
				<Input
					className="flex-1 font-mono text-sm"
					placeholder="value"
					value={newValue}
					onChange={(e) => setNewValue(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleAdd()}
				/>
				<Button variant="outline" size="sm" onClick={handleAdd} disabled={!newKey}>
					<Plus className="mr-2 h-4 w-4" />
					Add
				</Button>
			</div>

			{entries.length === 0 && (
				<p className="text-sm text-muted-foreground">
					No environment variables configured.
				</p>
			)}
		</div>
	);
}
