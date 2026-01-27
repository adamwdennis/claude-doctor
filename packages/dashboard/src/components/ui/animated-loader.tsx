import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
const CHAR_INTERVAL = 80;
const MESSAGE_HOLD_TIME = 4000;
const CHAR_REVEAL_DELAY = 100;

export function AnimatedLoader() {
	const [charIndex, setCharIndex] = useState(0);
	const [messageIndex, setMessageIndex] = useState(0);
	const [revealIndex, setRevealIndex] = useState(0);

	// Cycle spinner characters
	useEffect(() => {
		const timer = setInterval(() => {
			setCharIndex((i) => (i + 1) % SPINNER_CHARS.length);
		}, CHAR_INTERVAL);
		return () => clearInterval(timer);
	}, []);

	// Character reveal animation
	useEffect(() => {
		const message = MESSAGES[messageIndex];
		if (revealIndex < message.length) {
			const timer = setTimeout(() => {
				setRevealIndex((i) => i + 1);
			}, CHAR_REVEAL_DELAY);
			return () => clearTimeout(timer);
		}
		// Hold then cycle to next message
		const timer = setTimeout(() => {
			setMessageIndex((i) => (i + 1) % MESSAGES.length);
			setRevealIndex(0);
		}, MESSAGE_HOLD_TIME);
		return () => clearTimeout(timer);
	}, [messageIndex, revealIndex]);

	const message = MESSAGES[messageIndex];
	const revealed = message.slice(0, revealIndex);
	const cursor = revealIndex < message.length ? message[revealIndex] : "";
	const rest = message.slice(revealIndex + 1);

	return (
		<div className="flex items-center justify-center rounded-lg bg-black p-8">
			<div className="flex items-center gap-2 font-mono text-lg">
				<motion.span
					key={charIndex}
					initial={{ opacity: 0.5, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					className="text-orange-500"
				>
					{SPINNER_CHARS[charIndex]}
				</motion.span>
				<span className="text-orange-500/80">
					{revealed}
					<AnimatePresence mode="wait">
						{cursor && (
							<motion.span
								key={`${messageIndex}-${revealIndex}`}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="text-orange-500"
							>
								{cursor}
							</motion.span>
						)}
					</AnimatePresence>
					<span className="text-orange-500/40">{rest}</span>
				</span>
			</div>
		</div>
	);
}
