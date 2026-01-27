import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  className?: string;
  formatter?: (value: number) => string;
}

export function CountUp({
  to,
  from = 0,
  duration = 1,
  className = "",
  formatter,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionValue = useMotionValue(from);
  const spring = useSpring(motionValue, {
    damping: 30 + duration * 10,
    stiffness: 100 / duration,
  });
  const [display, setDisplay] = useState(formatter ? formatter(from) : String(from));

  useEffect(() => {
    if (inView) {
      motionValue.set(to);
    }
  }, [inView, to, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      const rounded = Math.round(latest);
      setDisplay(formatter ? formatter(rounded) : String(rounded));
    });
    return unsubscribe;
  }, [spring, formatter]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
