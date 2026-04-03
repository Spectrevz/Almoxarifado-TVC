import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: "orange" | "blue" | "purple" | "green" | "amber";
  delay?: number;
  suffix?: string;
}

const colorMap = {
  orange: {
    accent: "#f97316",
    bg: "rgba(249,115,22,0.08)",
    iconBg: "rgba(249,115,22,0.15)",
    border: "rgba(249,115,22,0.2)",
    glow: "0 0 24px rgba(249,115,22,0.12)",
    hoverGlow: "0 0 32px rgba(249,115,22,0.22)",
  },
  blue: {
    accent: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    iconBg: "rgba(59,130,246,0.15)",
    border: "rgba(59,130,246,0.2)",
    glow: "0 0 24px rgba(59,130,246,0.12)",
    hoverGlow: "0 0 32px rgba(59,130,246,0.22)",
  },
  purple: {
    accent: "#a855f7",
    bg: "rgba(168,85,247,0.08)",
    iconBg: "rgba(168,85,247,0.15)",
    border: "rgba(168,85,247,0.2)",
    glow: "0 0 24px rgba(168,85,247,0.12)",
    hoverGlow: "0 0 32px rgba(168,85,247,0.22)",
  },
  green: {
    accent: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    iconBg: "rgba(34,197,94,0.15)",
    border: "rgba(34,197,94,0.2)",
    glow: "0 0 24px rgba(34,197,94,0.12)",
    hoverGlow: "0 0 32px rgba(34,197,94,0.22)",
  },
  amber: {
    accent: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    iconBg: "rgba(245,158,11,0.15)",
    border: "rgba(245,158,11,0.2)",
    glow: "0 0 24px rgba(245,158,11,0.12)",
    hoverGlow: "0 0 32px rgba(245,158,11,0.22)",
  },
};

function useCountUp(target: number, delay: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [target, delay, duration]);
  return count;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "orange",
  delay = 0,
  suffix,
}: StatCardProps) {
  const [hovered, setHovered] = useState(false);
  const c = colorMap[color];

  const numericValue = typeof value === "string" ? parseFloat(value.replace(/[^0-9.]/g, "")) : value;
  const isNumeric = !isNaN(numericValue);
  const countedValue = useCountUp(isNumeric ? numericValue : 0, delay);

  const displayValue = isNumeric
    ? typeof value === "string" && value.includes(",")
      ? countedValue.toLocaleString("pt-BR")
      : countedValue.toString() + (suffix || "")
    : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 24 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4 }}
      className="relative rounded-2xl p-5 cursor-default overflow-hidden"
      style={{
        background: "#0d1221",
        border: `1px solid ${hovered ? c.border : "rgba(255,255,255,0.06)"}`,
        boxShadow: hovered ? c.hoverGlow : c.glow,
        transition: "border-color 0.25s, box-shadow 0.25s",
      }}
    >
      {/* Top accent bar */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: c.accent, opacity: hovered ? 1 : 0.5 }}
        animate={{ scaleX: hovered ? 1 : 0.6, originX: 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${c.bg} 0%, transparent 70%)`,
          transform: "translate(30%, -30%)",
          opacity: hovered ? 1 : 0.6,
          transition: "opacity 0.3s",
        }}
      />

      <div className="relative z-10">
        {/* Icon + title row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p style={{ color: "#4a5d78", fontSize: "0.78rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {title}
            </p>
          </div>
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: c.iconBg, border: `1px solid ${c.border}` }}
          >
            <Icon className="w-5 h-5" style={{ color: c.accent }} />
          </motion.div>
        </div>

        {/* Value */}
        <div className="flex items-end gap-2 mb-3">
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              fontSize: "2rem",
              color: "#e8edf5",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {displayValue}
          </span>
        </div>

        {/* Trend */}
        {trend && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.3 }}
            className="flex items-center gap-1.5"
          >
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-md"
              style={{
                background: trend.isPositive ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${trend.isPositive ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
              }}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" style={{ color: "#22c55e" }} />
              ) : (
                <TrendingDown className="w-3 h-3" style={{ color: "#ef4444" }} />
              )}
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  color: trend.isPositive ? "#22c55e" : "#ef4444",
                }}
              >
                {trend.value}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
