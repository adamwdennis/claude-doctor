import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { type SectionProps, AutoUpdatesChannel } from "../types";

export function BehaviorSection({ data, onChange }: SectionProps) {
	function handleToggle(key: string, value: boolean) {
		onChange({ ...data, [key]: value });
	}

	function handleTextChange(key: string, value: string) {
		onChange({ ...data, [key]: value || undefined });
	}

	function handleSelectChange(key: string, value: string) {
		onChange({ ...data, [key]: value });
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<label className="text-sm font-medium">Show Turn Duration</label>
				<Switch
					checked={data.showTurnDuration !== false}
					onCheckedChange={(checked) => handleToggle("showTurnDuration", checked)}
				/>
			</div>

			<div className="flex items-center justify-between">
				<label className="text-sm font-medium">Spinner Tips</label>
				<Switch
					checked={data.spinnerTipsEnabled !== false}
					onCheckedChange={(checked) => handleToggle("spinnerTipsEnabled", checked)}
				/>
			</div>

			<div className="flex items-center justify-between">
				<label className="text-sm font-medium">Terminal Progress Bar</label>
				<Switch
					checked={data.terminalProgressBarEnabled !== false}
					onCheckedChange={(checked) =>
						handleToggle("terminalProgressBarEnabled", checked)
					}
				/>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium">Language</label>
				<Input
					placeholder="e.g. japanese"
					value={(data.language as string) ?? ""}
					onChange={(e) => handleTextChange("language", e.target.value)}
				/>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium">Output Style</label>
				<Input
					placeholder="e.g. Explanatory"
					value={(data.outputStyle as string) ?? ""}
					onChange={(e) => handleTextChange("outputStyle", e.target.value)}
				/>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium">Auto Updates Channel</label>
				<select
					className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
					value={(data.autoUpdatesChannel as string) ?? AutoUpdatesChannel.Stable}
					onChange={(e) => handleSelectChange("autoUpdatesChannel", e.target.value)}
				>
					<option value={AutoUpdatesChannel.Stable}>Stable</option>
					<option value={AutoUpdatesChannel.Latest}>Latest</option>
				</select>
			</div>
		</div>
	);
}
