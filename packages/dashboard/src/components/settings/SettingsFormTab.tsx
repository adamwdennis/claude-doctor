import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
	Puzzle,
	Shield,
	Webhook,
	Terminal,
	Server,
	Settings2,
	Box,
	Quote,
	Wrench,
} from "lucide-react";
import { PluginsSection } from "./sections/PluginsSection";
import { PermissionsSection } from "./sections/PermissionsSection";
import { HooksSection } from "./sections/HooksSection";
import { EnvSection } from "./sections/EnvSection";
import { McpSection } from "./sections/McpSection";
import { BehaviorSection } from "./sections/BehaviorSection";
import { SandboxSection } from "./sections/SandboxSection";
import { AttributionSection } from "./sections/AttributionSection";
import { AdvancedSection } from "./sections/AdvancedSection";
import type { PermissionsSettings, HooksSettings, SandboxSettings, AttributionSettings } from "./types";

interface SettingsFormTabProps {
	data: Record<string, unknown>;
	onChange: (data: Record<string, unknown>) => void;
}

interface SectionConfig {
	id: string;
	title: string;
	icon: React.ElementType;
	component: React.ComponentType<{
		data: Record<string, unknown>;
		onChange: (data: Record<string, unknown>) => void;
	}>;
	getBadge?: (data: Record<string, unknown>) => string | null;
}

const SECTIONS: SectionConfig[] = [
	{
		id: "plugins",
		title: "Plugins",
		icon: Puzzle,
		component: PluginsSection,
		getBadge: (data) => {
			const plugins = data.enabledPlugins as Record<string, boolean> | undefined;
			if (!plugins) return null;
			const count = Object.values(plugins).filter(Boolean).length;
			return count > 0 ? count.toString() : null;
		},
	},
	{
		id: "permissions",
		title: "Permissions",
		icon: Shield,
		component: PermissionsSection,
		getBadge: (data) => {
			const perms = data.permissions as PermissionsSettings | undefined;
			if (!perms) return null;
			const count =
				(perms.allow?.length ?? 0) +
				(perms.deny?.length ?? 0) +
				(perms.ask?.length ?? 0);
			return count > 0 ? count.toString() : null;
		},
	},
	{
		id: "hooks",
		title: "Hooks",
		icon: Webhook,
		component: HooksSection,
		getBadge: (data) => {
			const hooks = data.hooks as HooksSettings | undefined;
			if (!hooks) return null;
			const count = Object.values(hooks).reduce(
				(acc, arr) => acc + (arr?.length ?? 0),
				0
			);
			return count > 0 ? count.toString() : null;
		},
	},
	{
		id: "env",
		title: "Environment",
		icon: Terminal,
		component: EnvSection,
		getBadge: (data) => {
			const env = data.env as Record<string, string> | undefined;
			if (!env) return null;
			const count = Object.keys(env).length;
			return count > 0 ? count.toString() : null;
		},
	},
	{
		id: "mcp",
		title: "MCP Servers",
		icon: Server,
		component: McpSection,
		getBadge: (data) => {
			const enabled = data.enabledMcpjsonServers as string[] | undefined;
			const disabled = data.disabledMcpjsonServers as string[] | undefined;
			const count = (enabled?.length ?? 0) + (disabled?.length ?? 0);
			return count > 0 ? count.toString() : null;
		},
	},
	{
		id: "behavior",
		title: "Behavior",
		icon: Settings2,
		component: BehaviorSection,
	},
	{
		id: "sandbox",
		title: "Sandbox",
		icon: Box,
		component: SandboxSection,
		getBadge: (data) => {
			const sandbox = data.sandbox as SandboxSettings | undefined;
			return sandbox?.enabled ? "On" : null;
		},
	},
	{
		id: "attribution",
		title: "Attribution",
		icon: Quote,
		component: AttributionSection,
		getBadge: (data) => {
			const attr = data.attribution as AttributionSettings | undefined;
			if (!attr) return null;
			const count = (attr.commit ? 1 : 0) + (attr.pr ? 1 : 0);
			return count > 0 ? count.toString() : null;
		},
	},
	{
		id: "advanced",
		title: "Advanced",
		icon: Wrench,
		component: AdvancedSection,
	},
];

export function SettingsFormTab({ data, onChange }: SettingsFormTabProps) {
	return (
		<Accordion type="multiple" className="w-full" defaultValue={["permissions"]}>
			{SECTIONS.map((section) => {
				const Icon = section.icon;
				const badge = section.getBadge?.(data);
				const Component = section.component;

				return (
					<AccordionItem key={section.id} value={section.id}>
						<AccordionTrigger>
							<div className="flex items-center gap-2">
								<Icon className="h-4 w-4 text-muted-foreground" />
								{section.title}
								{badge && (
									<Badge variant="secondary" className="ml-2">
										{badge}
									</Badge>
								)}
							</div>
						</AccordionTrigger>
						<AccordionContent>
							<Component data={data} onChange={onChange} />
						</AccordionContent>
					</AccordionItem>
				);
			})}
		</Accordion>
	);
}
