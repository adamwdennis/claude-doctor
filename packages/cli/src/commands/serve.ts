import { type ChildProcess, exec, spawn } from "node:child_process";
import { resolve } from "node:path";
import { Command } from "commander";
import type { GlobalOptions } from "../cli.js";
import { broadcastUpdate } from "../server/handlers/events.handler.js";
import { createServer } from "../server/server.js";
import { createFileWatcher } from "../server/watcher.js";

interface ServeOptions extends GlobalOptions {
	port: number;
	open: boolean;
	watch: boolean;
}

export function serveCommand(): Command {
	return new Command("serve")
		.description("Start interactive dashboard")
		.option("--port <number>", "Port number", "3000")
		.option("--no-open", "Don't auto-open browser")
		.option("--watch", "Watch src/ and rebuild on changes")
		.action(async (options, cmd) => {
			const globalOpts = cmd.optsWithGlobals() as ServeOptions;
			const port = Number.parseInt(String(options.port), 10);
			await runServe({
				...globalOpts,
				port,
				open: options.open !== false,
				watch: options.watch === true,
			});
		});
}

export async function runServe(options: ServeOptions): Promise<void> {
	const projectPath = resolve(options.project);
	const port = options.port || 3000;

	let buildWatcher: ChildProcess | null = null;

	// Start build watcher if --watch is enabled
	if (options.watch) {
		console.log("Starting build watcher (tsdown --watch)...");
		buildWatcher = spawn("npm", ["run", "dev"], {
			stdio: ["ignore", "pipe", "pipe"],
			shell: true,
		});

		buildWatcher.stdout?.on("data", (data: Buffer) => {
			const msg = data.toString().trim();
			if (msg) console.log(`[build] ${msg}`);
		});

		buildWatcher.stderr?.on("data", (data: Buffer) => {
			const msg = data.toString().trim();
			if (msg) console.error(`[build] ${msg}`);
		});
	}

	const server = createServer(projectPath);

	// Watch config files for changes
	const watcher = createFileWatcher(projectPath, (_event, filePath) => {
		console.log(`File changed: ${filePath}`);
		broadcastUpdate(filePath);
	});

	server.listen(port, () => {
		const url = `http://localhost:${port}`;
		console.log(`Dashboard running at ${url}`);
		console.log("Watching for config file changes...");
		if (options.watch) {
			console.log("Watching src/ for rebuilds...");
		}
		console.log("Press Ctrl+C to stop\n");

		if (options.open) {
			openBrowser(url);
		}
	});

	// Cleanup on exit
	process.on("SIGINT", () => {
		watcher.close();
		server.close();
		if (buildWatcher) {
			buildWatcher.kill();
		}
		process.exit(0);
	});
}

function openBrowser(url: string): void {
	const platform = process.platform;
	let cmd: string;

	if (platform === "darwin") {
		cmd = `open "${url}"`;
	} else if (platform === "win32") {
		cmd = `start "${url}"`;
	} else {
		cmd = `xdg-open "${url}"`;
	}

	exec(cmd, (error) => {
		if (error) {
			console.log(`Open ${url} in your browser`);
		}
	});
}
