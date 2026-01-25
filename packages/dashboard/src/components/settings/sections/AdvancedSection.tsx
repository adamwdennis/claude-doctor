import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import type { SectionProps } from "../types";

export function AdvancedSection({ data, onChange }: SectionProps) {
	function handleToggle(key: string, value: boolean) {
		onChange({ ...data, [key]: value });
	}

	function handleTextChange(key: string, value: string) {
		onChange({ ...data, [key]: value || undefined });
	}

	function handleNumberChange(key: string, value: string) {
		const num = parseInt(value, 10);
		onChange({ ...data, [key]: isNaN(num) ? undefined : num });
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<label className="text-sm font-medium">Model</label>
				<Input
					placeholder="e.g. claude-sonnet-4-5-20250929"
					value={(data.model as string) ?? ""}
					onChange={(e) => handleTextChange("model", e.target.value)}
				/>
				<p className="text-xs text-muted-foreground">Override default model</p>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium">Cleanup Period (days)</label>
				<Input
					type="number"
					placeholder="30"
					value={(data.cleanupPeriodDays as number) ?? ""}
					onChange={(e) => handleNumberChange("cleanupPeriodDays", e.target.value)}
				/>
				<p className="text-xs text-muted-foreground">
					Days before old sessions are cleaned up
				</p>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium">Plans Directory</label>
				<Input
					placeholder="relative path"
					value={(data.plansDirectory as string) ?? ""}
					onChange={(e) => handleTextChange("plansDirectory", e.target.value)}
				/>
			</div>

			<div className="flex items-center justify-between">
				<div>
					<label className="text-sm font-medium">Respect .gitignore</label>
					<p className="text-xs text-muted-foreground">
						Exclude files matching gitignore patterns
					</p>
				</div>
				<Switch
					checked={data.respectGitignore !== false}
					onCheckedChange={(checked) => handleToggle("respectGitignore", checked)}
				/>
			</div>

			<div className="flex items-center justify-between">
				<div>
					<label className="text-sm font-medium">Always Thinking</label>
					<p className="text-xs text-muted-foreground">
						Enable extended thinking mode
					</p>
				</div>
				<Switch
					checked={(data.alwaysThinkingEnabled as boolean) ?? false}
					onCheckedChange={(checked) =>
						handleToggle("alwaysThinkingEnabled", checked)
					}
				/>
			</div>
		</div>
	);
}
