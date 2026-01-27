import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SPINNER_CHARS = ["·", "✻", "✽", "✶", "✳", "✢"];
const CHAR_INTERVAL = 80;

interface SpinnerProps {
	className?: string;
}

export function Spinner({ className }: SpinnerProps) {
	const [charIndex, setCharIndex] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setCharIndex((i) => (i + 1) % SPINNER_CHARS.length);
		}, CHAR_INTERVAL);
		return () => clearInterval(timer);
	}, []);

	return (
		<span className={cn("inline-block text-orange-500", className)}>
			{SPINNER_CHARS[charIndex]}
		</span>
	);
}
