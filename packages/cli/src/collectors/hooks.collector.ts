import { type HookEntry, type HooksCollection, HookEvent } from "../models/hooks.model.js";
import { collectSettings } from "./settings.collector.js";

const HOOK_EVENTS: HookEvent[] = [
	HookEvent.PreToolUse,
	HookEvent.PostToolUse,
	HookEvent.Notification,
	HookEvent.Stop,
];

interface RawHookConfig {
	command: string;
	matcher?: string;
	timeout?: number;
}

type RawHooksMap = Record<string, RawHookConfig[] | RawHookConfig>;

export function collectHooks(projectPath: string): HooksCollection {
	const settings = collectSettings(projectPath);
	const hooks: HookEntry[] = [];

	for (const layer of settings.layers) {
		if (!layer.content || !layer.exists) continue;

		const hooksConfig = layer.content.hooks as RawHooksMap | undefined;
		if (!hooksConfig) continue;

		for (const event of HOOK_EVENTS) {
			const eventHooks = hooksConfig[event];
			if (!eventHooks) continue;

			const hookArray = Array.isArray(eventHooks) ? eventHooks : [eventHooks];
			for (const hook of hookArray) {
				if (typeof hook === "object" && hook.command) {
					hooks.push({
						event,
						command: hook.command,
						matcher: hook.matcher,
						timeout: hook.timeout,
						source: layer.source,
						sourcePath: layer.path ?? "",
					});
				}
			}
		}
	}

	return { hooks, totalHooks: hooks.length };
}
