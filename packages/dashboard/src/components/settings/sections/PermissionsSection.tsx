import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { type SectionProps, type PermissionsSettings, DefaultPermissionMode } from "../types";

const RULE_COLORS = {
	allow: "bg-green-950 text-green-300 border-green-800",
	deny: "bg-red-950 text-red-300 border-red-800",
	ask: "bg-yellow-950 text-yellow-300 border-yellow-800",
	additionalDirectories: "bg-blue-950 text-blue-300 border-blue-800",
};

interface RuleListProps {
	label: string;
	rules: string[];
	colorClass: string;
	placeholder: string;
	onChange: (rules: string[]) => void;
}

function RuleList({ label, rules, colorClass, placeholder, onChange }: RuleListProps) {
	const [newRule, setNewRule] = useState("");

	function handleAdd() {
		if (newRule && !rules.includes(newRule)) {
			onChange([...rules, newRule]);
			setNewRule("");
		}
	}

	function handleRemove(rule: string) {
		onChange(rules.filter((r) => r !== rule));
	}

	return (
		<div className="space-y-2">
			<label className="text-sm font-medium">{label}</label>
			<div className="flex flex-wrap gap-2">
				<AnimatePresence mode="popLayout">
					{rules.map((rule) => (
						<motion.div
							key={rule}
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
						>
							<Badge variant="outline" className={cn("gap-1 border pr-1", colorClass)}>
								{rule}
								<button
									className="ml-1 rounded-full p-0.5 hover:bg-white/20"
									onClick={() => handleRemove(rule)}
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
					value={newRule}
					onChange={(e) => setNewRule(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleAdd()}
				/>
				<Button variant="outline" size="sm" onClick={handleAdd} disabled={!newRule}>
					<Plus className="mr-2 h-4 w-4" />
					Add
				</Button>
			</div>
		</div>
	);
}

export function PermissionsSection({ data, onChange }: SectionProps) {
	const permissions = (data.permissions as PermissionsSettings) ?? {};
	const allow = permissions.allow ?? [];
	const deny = permissions.deny ?? [];
	const ask = permissions.ask ?? [];
	const additionalDirectories = permissions.additionalDirectories ?? [];

	function updatePermissions(updates: Partial<PermissionsSettings>) {
		onChange({
			...data,
			permissions: { ...permissions, ...updates },
		});
	}

	return (
		<div className="space-y-6">
			<RuleList
				label="Allow Rules"
				rules={allow}
				colorClass={RULE_COLORS.allow}
				placeholder='e.g. Bash(npm run:*), Read(~/.zshrc)'
				onChange={(rules) => updatePermissions({ allow: rules })}
			/>

			<RuleList
				label="Deny Rules"
				rules={deny}
				colorClass={RULE_COLORS.deny}
				placeholder='e.g. Bash(curl:*), Read(./.env)'
				onChange={(rules) => updatePermissions({ deny: rules })}
			/>

			<RuleList
				label="Ask Rules"
				rules={ask}
				colorClass={RULE_COLORS.ask}
				placeholder='e.g. Bash(git push:*)'
				onChange={(rules) => updatePermissions({ ask: rules })}
			/>

			<RuleList
				label="Additional Directories"
				rules={additionalDirectories}
				colorClass={RULE_COLORS.additionalDirectories}
				placeholder="e.g. ../docs/"
				onChange={(rules) => updatePermissions({ additionalDirectories: rules })}
			/>

			<div className="space-y-2">
				<label className="text-sm font-medium">Default Mode</label>
				<select
					className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
					value={permissions.defaultMode ?? DefaultPermissionMode.Default}
					onChange={(e) =>
						updatePermissions({ defaultMode: e.target.value as DefaultPermissionMode })
					}
				>
					<option value={DefaultPermissionMode.Default}>Default</option>
					<option value={DefaultPermissionMode.Plan}>Plan</option>
					<option value={DefaultPermissionMode.AcceptEdits}>Accept Edits</option>
					<option value={DefaultPermissionMode.BypassPermissions}>
						Bypass Permissions
					</option>
				</select>
			</div>

			<div className="flex items-center justify-between">
				<div>
					<label className="text-sm font-medium">Disable Bypass Mode</label>
					<p className="text-xs text-muted-foreground">
						Prevent using bypassPermissions mode
					</p>
				</div>
				<Switch
					checked={permissions.disableBypassPermissionsMode === "disable"}
					onCheckedChange={(checked) =>
						updatePermissions({
							disableBypassPermissionsMode: checked ? "disable" : undefined,
						})
					}
				/>
			</div>
		</div>
	);
}
