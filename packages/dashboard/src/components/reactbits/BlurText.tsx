import { motion } from "framer-motion";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
}

export function BlurText({
  text,
  className = "",
  delay = 0,
  as: Tag = "span",
}: BlurTextProps) {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: delay * i },
    }),
  };

  const child = {
    hidden: {
      opacity: 0,
      filter: "blur(10px)",
      y: 8,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.span
      className={`inline-flex flex-wrap gap-x-[0.25em] ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
      role="heading"
      aria-label={text}
    >
      {words.map((word, i) => (
        <motion.span key={`${word}-${i}`} variants={child}>
          <Tag className={className}>{word}</Tag>
        </motion.span>
      ))}
    </motion.span>
  );
}
