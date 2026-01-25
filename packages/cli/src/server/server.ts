import { createServer as createHttpServer, type Server, type ServerResponse } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { handleApiRequest } from "./routes/api.js";
import { renderDashboard } from "../renderers/dashboard.renderer.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Dashboard build output - located in dist/dashboard/ after Vite build
const DASHBOARD_DIR = join(__dirname, "dashboard");

const MIME_TYPES: Record<string, string> = {
	".html": "text/html",
	".js": "application/javascript",
	".css": "text/css",
	".json": "application/json",
	".png": "image/png",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
};

export function createServer(projectPath: string): Server {
	// Check if built dashboard exists
	const dashboardIndexPath = join(DASHBOARD_DIR, "index.html");
	const useSpaMode = existsSync(dashboardIndexPath);

	return createHttpServer((req, res) => {
		// CORS headers
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type");

		if (req.method === "OPTIONS") {
			res.writeHead(204);
			res.end();
			return;
		}

		const url = req.url ?? "/";

		if (url.startsWith("/api/")) {
			handleApiRequest(req, res, projectPath);
		} else if (useSpaMode) {
			serveSpaAsset(res, url);
		} else {
			// Fallback to inline dashboard
			if (url === "/" || url === "/index.html") {
				serveDashboard(res, projectPath);
			} else {
				res.writeHead(404, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ error: "Not found" }));
			}
		}
	});
}

function serveSpaAsset(res: ServerResponse, url: string): void {
	let filePath = join(DASHBOARD_DIR, url === "/" ? "index.html" : url);

	// If file doesn't exist and no extension, serve index.html (SPA routing)
	if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
		filePath = join(DASHBOARD_DIR, "index.html");
	}

	if (!existsSync(filePath)) {
		res.writeHead(404, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ error: "Not found" }));
		return;
	}

	const ext = extname(filePath);
	const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

	try {
		const content = readFileSync(filePath);
		res.writeHead(200, { "Content-Type": contentType });
		res.end(content);
	} catch {
		res.writeHead(500, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ error: "Internal server error" }));
	}
}

function serveDashboard(res: ServerResponse, projectPath: string): void {
	const html = renderDashboard(projectPath);
	res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
	res.end(html);
}
