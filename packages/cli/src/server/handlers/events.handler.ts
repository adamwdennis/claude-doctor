import type { ServerResponse } from "node:http";

const clients = new Set<ServerResponse>();

export function addSseClient(res: ServerResponse): void {
	res.writeHead(200, {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		Connection: "keep-alive",
		"Access-Control-Allow-Origin": "*",
	});

	res.write("event: connected\ndata: {}\n\n");

	clients.add(res);

	res.on("close", () => {
		clients.delete(res);
	});
}

export function broadcastUpdate(filePath: string): void {
	// Determine event type based on file path
	let eventType = "update";
	if (filePath.includes("settings") || filePath.endsWith(".claude.json")) {
		eventType = "settings-changed";
	} else if (filePath.includes(".mcp.json") || filePath.includes("mcp")) {
		eventType = "mcp-changed";
	} else if (filePath.includes("CLAUDE.md")) {
		eventType = "issues-changed";
	}

	const data = JSON.stringify({ type: eventType, filePath, timestamp: Date.now() });
	const message = `data: ${data}\n\n`;

	for (const client of clients) {
		client.write(message);
	}
}

export function getClientCount(): number {
	return clients.size;
}
