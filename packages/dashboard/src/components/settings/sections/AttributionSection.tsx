import { Textarea } from "@/components/ui/textarea";
import type { SectionProps, AttributionSettings } from "../types";

export function AttributionSection({ data, onChange }: SectionProps) {
	const attribution = (data.attribution as AttributionSettings) ?? {};

	function handleChange(key: keyof AttributionSettings, value: string) {
		onChange({
			...data,
			attribution: {
				...attribution,
				[key]: value || undefined,
			},
		});
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<label className="text-sm font-medium">Commit Template</label>
				<Textarea
					className="min-h-[100px] font-mono text-sm"
					placeholder="Commit message template..."
					value={attribution.commit ?? ""}
					onChange={(e) => handleChange("commit", e.target.value)}
				/>
				<p className="text-xs text-muted-foreground">
					Multiline template for commit messages
				</p>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium">PR Template</label>
				<Textarea
					className="min-h-[100px] font-mono text-sm"
					placeholder="PR description template..."
					value={attribution.pr ?? ""}
					onChange={(e) => handleChange("pr", e.target.value)}
				/>
				<p className="text-xs text-muted-foreground">
					Multiline template for pull request descriptions
				</p>
			</div>
		</div>
	);
}
