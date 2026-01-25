import { Switch } from "@/components/ui/switch";
import type { SectionProps } from "../types";

export function PluginsSection({ data, onChange }: SectionProps) {
	const enabledPlugins = (data.enabledPlugins as Record<string, boolean>) ?? {};
	const entries = Object.entries(enabledPlugins);

	// Group plugins by marketplace (after @)
	const grouped = entries.reduce(
		(acc, [key, enabled]) => {
			const [name, marketplace] = key.split("@");
			const group = marketplace || "local";
			if (!acc[group]) acc[group] = [];
			acc[group].push({ key, name, enabled });
			return acc;
		},
		{} as Record<string, { key: string; name: string; enabled: boolean }[]>
	);

	function handleToggle(key: string, enabled: boolean) {
		onChange({
			...data,
			enabledPlugins: {
				...enabledPlugins,
				[key]: enabled,
			},
		});
	}

	if (entries.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">No plugins configured.</p>
		);
	}

	return (
		<div className="space-y-6">
			{Object.entries(grouped).map(([marketplace, plugins]) => (
				<div key={marketplace} className="space-y-2">
					<h4 className="text-sm font-medium text-muted-foreground">
						{marketplace === "local" ? "Local Plugins" : `@${marketplace}`}
					</h4>
					<div className="space-y-2">
						{plugins.map(({ key, name, enabled }) => (
							<div key={key} className="flex items-center justify-between">
								<label className="text-sm">{name}</label>
								<Switch
									checked={enabled}
									onCheckedChange={(checked) => handleToggle(key, checked)}
								/>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
