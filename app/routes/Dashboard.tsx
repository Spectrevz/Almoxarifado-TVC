import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Package, Boxes, ArrowRightLeft, AlertTriangle, Camera, Battery, Mic, Lightbulb, ArrowUpRight, ArrowDownLeft, Clock, Zap, ChevronRight } from "lucide-react";
import StatCard from "../components/StatCard";
import { useNavigate } from "react-router";

const recentMovements = [
  { id: 1, type: "saída", item: "Kit Reportagem Externa", user: "João Silva", time: "14:30", timeAgo: "Há 15 min", color: "#f97316" },
  { id: 2, type: "entrada", item: "Bateria V-Mount 150Wh", user: "Maria Santos", time: "13:15", timeAgo: "Há 32 min", color: "#22c55e" },
  { id: 3, type: "saída", item: "Kit Iluminação LED", user: "Pedro Costa", time: "11:00", timeAgo: "Há 1 hora", color: "#f97316" },
  { id: 4, type: "entrada", item: "Microfone Rode NTG3", user: "Ana Paula", time: "10:45", timeAgo: "Há 2 horas", color: "#22c55e" },
  { id: 5, type: "alerta", item: "Sony A7 III — Devolução Pendente", user: "Carlos Mendes", time: "09:20", timeAgo: "Há 3 horas", color: "#ef4444" },
];

const equipmentUsage = [
  { name: "Câmeras Sony", usage: 85, icon: Camera, color: "#f97316", count: 12 },
  { name: "Baterias V-Mount", usage: 72, icon: Battery, color: "#3b82f6", count: 24 },
  { name: "Microfones", usage: 68, icon: Mic, color: "#a855f7", count: 16 },
  { name: "Iluminação LED", usage: 42, icon: Lightbulb, color: "#f59e0b", count: 8 },
];

function RingProgress({ size = 52, strokeWidth = 5, percentage, color }: { size?: number; strokeWidth?: number; percentage: number; color: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(percentage), 300);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        stroke="rgba(255,255,255,0.06)"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        stroke={color}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - (progress / 100) * circumference}
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)" }}
      />
    </svg>
  );
}

function GreetingText() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

const quickActions = [
  { label: "Nova Saída", icon: ArrowUpRight, color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.2)", path: "/movimentacoes" },
  { label: "Nova Entrada", icon: ArrowDownLeft, color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)", path: "/movimentacoes" },
  { label: "Criar Kit", icon: Boxes, color: "#a855f7", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.2)", path: "/kits" },
  { label: "Relatório", icon: Zap, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", path: "/relatorios" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    { title: "Total de Itens", value: "1234", icon: Package, color: "blue" as const, trend: { value: "+12% este mês", isPositive: true } },
    { title: "Kits Ativos", value: "48", icon: Boxes, color: "purple" as const, trend: { value: "3 novos esta semana", isPositive: true } },
    { title: "Movimentações Hoje", value: "23", icon: ArrowRightLeft, color: "green" as const },
    { title: "Itens em Alerta", value: "8", icon: AlertTriangle, color: "amber" as const, trend: { value: "Atenção necessária", isPositive: false } },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Greeting header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="px-2.5 py-0.5 rounded-full flex items-center gap-1.5"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse-live" style={{ background: "#22c55e" }} />
              <span style={{ color: "#22c55e", fontSize: "0.7rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Sistema Ativo
              </span>
            </div>
          </div>
          <h1 style={{ color: "#e8edf5", fontSize: "1.6rem", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.025em" }}>
            {GreetingText()}, Almoxarife 👋
          </h1>
          <p style={{ color: "#4a5d78", fontSize: "0.85rem", fontFamily: "'Space Grotesk', sans-serif", marginTop: 2 }}>
            Aqui está o panorama do almoxarifado hoje — Sexta, 3 de Abril
          </p>
        </div>

        {/* Mini status indicators */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:flex gap-3"
        >
          {[
            { label: "Câmeras", ok: 9, total: 12, color: "#f97316" },
            { label: "Kits", ok: 3, total: 4, color: "#a855f7" },
            { label: "Baterias", ok: 18, total: 24, color: "#3b82f6" },
          ].map((s) => (
            <div
              key={s.label}
              className="px-4 py-3 rounded-xl"
              style={{ background: "#0d1221", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p style={{ color: "#4a5d78", fontSize: "0.68rem", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>
                {s.label}
              </p>
              <div className="flex items-baseline gap-1">
                <span style={{ color: "#e8edf5", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "1.2rem" }}>
                  {s.ok}
                </span>
                <span style={{ color: "#4a5d78", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem" }}>
                  /{s.total}
                </span>
              </div>
              <div className="mt-2 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(s.ok / s.total) * 100}%` }}
                  transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: s.color }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={0.1 + index * 0.08} />
        ))}
      </div>

      {/* Main content row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Activity timeline — takes 3 cols */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45 }}
          className="lg:col-span-3 rounded-2xl p-5"
          style={{ background: "#0d1221", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 style={{ color: "#e8edf5", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.95rem" }}>
                Atividade Recente
              </h3>
              <p style={{ color: "#4a5d78", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.75rem" }}>
                Movimentações das últimas horas
              </p>
            </div>
            <button
              onClick={() => navigate("/movimentacoes")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: "#f97316", fontSize: "0.75rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}
            >
              Ver todas
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-[22px] top-3 bottom-3 w-px"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)" }}
            />

            <div className="space-y-1">
              {recentMovements.map((mv, index) => (
                <motion.div
                  key={mv.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.08, type: "spring", stiffness: 300, damping: 28 }}
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-4 p-3 rounded-xl cursor-default transition-all"
                  style={{ "--hover-bg": "rgba(255,255,255,0.03)" } as React.CSSProperties}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Timeline dot */}
                  <div className="relative flex-shrink-0 mt-0.5">
                    <div
                      className="w-[11px] h-[11px] rounded-full border-2 relative z-10"
                      style={{
                        background: mv.color,
                        borderColor: "#0d1221",
                        boxShadow: `0 0 8px ${mv.color}60`,
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {mv.type === "saída" ? (
                            <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#f97316" }} />
                          ) : mv.type === "entrada" ? (
                            <ArrowDownLeft className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#22c55e" }} />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#ef4444" }} />
                          )}
                          <span
                            className="truncate"
                            style={{ color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: "0.85rem" }}
                          >
                            {mv.item}
                          </span>
                        </div>
                        <p style={{ color: "#4a5d78", fontSize: "0.75rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                          {mv.user}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Clock className="w-3 h-3" style={{ color: "#4a5d78" }} />
                        <span style={{ color: "#4a5d78", fontSize: "0.72rem", fontFamily: "'JetBrains Mono', monospace" }}>
                          {mv.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Equipment usage — takes 2 cols */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: "#0d1221", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="mb-5">
            <h3 style={{ color: "#e8edf5", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.95rem" }}>
              Taxa de Utilização
            </h3>
            <p style={{ color: "#4a5d78", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.75rem" }}>
              Por categoria de equipamento
            </p>
          </div>

          <div className="space-y-4">
            {equipmentUsage.map((eq, index) => (
              <motion.div
                key={eq.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="relative flex-shrink-0">
                  <RingProgress percentage={eq.usage} color={eq.color} size={52} strokeWidth={5} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <eq.icon className="w-4 h-4" style={{ color: eq.color }} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{ color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: "0.83rem" }}>
                      {eq.name}
                    </span>
                    <span style={{ color: eq.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "0.85rem" }}>
                      {eq.usage}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${eq.usage}%` }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${eq.color}80, ${eq.color})` }}
                    />
                  </div>
                  <p style={{ color: "#4a5d78", fontSize: "0.7rem", fontFamily: "'Space Grotesk', sans-serif", marginTop: 3 }}>
                    {eq.count} unidades no estoque
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div className="my-5 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

          {/* System health */}
          <div>
            <p style={{ color: "#4a5d78", fontSize: "0.7rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
              Status do Sistema
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Disponíveis", value: "76%", color: "#22c55e" },
                { label: "Em Uso", value: "18%", color: "#f97316" },
                { label: "Manutenção", value: "4%", color: "#f59e0b" },
                { label: "Extraviados", value: "2%", color: "#ef4444" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="px-3 py-2.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <p style={{ color: "#4a5d78", fontSize: "0.65rem", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.04em" }}>
                    {s.label}
                  </p>
                  <p style={{ color: s.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "1.05rem" }}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
      >
        <p style={{ color: "#4a5d78", fontSize: "0.72rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
          Ações Rápidas
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.07, type: "spring", stiffness: 280 }}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(action.path)}
              className="relative flex items-center gap-3 px-5 py-4 rounded-2xl text-left overflow-hidden group"
              style={{
                background: action.bg,
                border: `1px solid ${action.border}`,
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at 30% 50%, ${action.bg} 0%, transparent 70%)` }}
              />
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10"
                style={{ background: `${action.color}20`, border: `1px solid ${action.color}30` }}
              >
                <action.icon className="w-4 h-4" style={{ color: action.color }} />
              </div>
              <span
                className="relative z-10"
                style={{ color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.85rem" }}
              >
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
