import { motion, AnimatePresence } from "framer-motion";
import { type ReactNode } from "react";

interface AnimatedListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export function AnimatedList({
  children,
  className = "",
  staggerDelay = 0.05,
}: AnimatedListProps) {
  return (
    <div className={className}>
      <AnimatePresence initial>
        {children.map((child, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              duration: 0.3,
              delay: i * staggerDelay,
              ease: "easeOut",
            }}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
