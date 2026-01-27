import chalk from "chalk";

const SPINNER_CHARS = ["·", "✻", "✽", "✶", "✳", "✢"];
const MESSAGES = [
	"Loading",
	"Processing",
	"Working",
	"Fetching",
	"Preparing",
	"Syncing",
	"Computing",
	"Analyzing",
];
const ORANGE = chalk.hex("#f97316");
const CHAR_INTERVAL = 80;
const MESSAGE_HOLD_TIME = 4000;
const CHAR_REVEAL_DELAY = 100;

export interface Spinner {
	start: () => void;
	stop: () => void;
	succeed: (text: string) => void;
	fail: (text: string) => void;
}

export function shouldShowSpinner(format?: string): boolean {
	return process.stdout.isTTY && format !== "json" && format !== "html";
}

export function createSpinner(): Spinner {
	let charIndex = 0;
	let messageIndex = 0;
	let revealIndex = 0;
	let isHolding = false;
	let charTimer: ReturnType<typeof setInterval> | null = null;
	let messageTimer: ReturnType<typeof setTimeout> | null = null;
	let revealTimer: ReturnType<typeof setInterval> | null = null;
	let isRunning = false;

	function getCurrentMessage(): string {
		return MESSAGES[messageIndex];
	}

	function render(): void {
		if (!isRunning) return;

		const spinChar = SPINNER_CHARS[charIndex];
		const message = getCurrentMessage();
		const revealed = message.slice(0, revealIndex);
		const cursor = revealIndex < message.length ? message[revealIndex] : "";
		const rest = message.slice(revealIndex + 1);

		const line = `${ORANGE(spinChar)} ${revealed}${ORANGE(cursor)}${rest}`;
		process.stdout.write(`\r\x1b[K${line}`);
	}

	function cycleChar(): void {
		charIndex = (charIndex + 1) % SPINNER_CHARS.length;
		render();
	}

	function startReveal(): void {
		revealIndex = 0;
		isHolding = false;

		if (revealTimer) clearInterval(revealTimer);
		revealTimer = setInterval(() => {
			if (revealIndex < getCurrentMessage().length) {
				revealIndex++;
				render();
			} else if (!isHolding) {
				isHolding = true;
				if (revealTimer) clearInterval(revealTimer);
				scheduleNextMessage();
			}
		}, CHAR_REVEAL_DELAY);
	}

	function scheduleNextMessage(): void {
		if (messageTimer) clearTimeout(messageTimer);
		messageTimer = setTimeout(() => {
			messageIndex = (messageIndex + 1) % MESSAGES.length;
			startReveal();
		}, MESSAGE_HOLD_TIME);
	}

	function start(): void {
		if (isRunning) return;
		isRunning = true;

		charIndex = 0;
		messageIndex = 0;

		charTimer = setInterval(cycleChar, CHAR_INTERVAL);
		startReveal();
	}

	function stop(): void {
		if (!isRunning) return;
		isRunning = false;

		if (charTimer) clearInterval(charTimer);
		if (messageTimer) clearTimeout(messageTimer);
		if (revealTimer) clearInterval(revealTimer);
		charTimer = null;
		messageTimer = null;
		revealTimer = null;

		process.stdout.write("\r\x1b[K");
	}

	function succeed(text: string): void {
		stop();
		console.log(`${chalk.green("✔")} ${text}`);
	}

	function fail(text: string): void {
		stop();
		console.log(`${chalk.red("✖")} ${text}`);
	}

	return { start, stop, succeed, fail };
}
