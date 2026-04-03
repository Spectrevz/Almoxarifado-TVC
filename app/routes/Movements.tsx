import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  User,
  Calendar,
  Package,
  Clock,
  CheckCircle2,
  Filter,
} from "lucide-react";

const movements = [
  {
    id: 1,
    type: "saída",
    item: "Kit Reportagem Externa",
    user: "João Silva",
    userInitials: "JS",
    userColor: "#f97316",
    date: "2026-04-03",
    time: "14:30",
    status: "ativa",
    returnDate: "2026-04-05",
    note: "Cobertura Eleições SP",
  },
  {
    id: 2,
    type: "entrada",
    item: "Bateria V-Mount 150Wh (×3)",
    user: "Maria Santos",
    userInitials: "MS",
    userColor: "#3b82f6",
    date: "2026-04-03",
    time: "13:15",
    status: "concluída",
    returnDate: null,
    note: null,
  },
  {
    id: 3,
    type: "saída",
    item: "Kit Iluminação LED Arri",
    user: "Pedro Costa",
    userInitials: "PC",
    userColor: "#a855f7",
    date: "2026-04-03",
    time: "11:00",
    status: "ativa",
    returnDate: "2026-04-04",
    note: "Entrevista estúdio 2",
  },
  {
    id: 4,
    type: "entrada",
    item: "Microfone Shotgun Rode NTG3",
    user: "Ana Paula",
    userInitials: "AP",
    userColor: "#22c55e",
    date: "2026-04-03",
    time: "10:45",
    status: "concluída",
    returnDate: null,
    note: null,
  },
  {
    id: 5,
    type: "saída",
    item: "Sony A7 III + 3 Lentes",
    user: "Carlos Mendes",
    userInitials: "CM",
    userColor: "#ef4444",
    date: "2026-04-02",
    time: "16:20",
    status: "atrasada",
    returnDate: "2026-04-02",
    note: "Documental Parque Estadual",
  },
  {
    id: 6,
    type: "entrada",
    item: "Kit Documentário Completo",
    user: "Beatriz Lima",
    userInitials: "BL",
    userColor: "#f59e0b",
    date: "2026-04-02",
    time: "15:00",
    status: "concluída",
    returnDate: null,
    note: null,
  },
  {
    id: 7,
    type: "saída",
    item: "Canon C300 Mark III",
    user: "Rafael Oliveira",
    userInitials: "RO",
    userColor: "#06b6d4",
    date: "2026-04-01",
    time: "09:00",
    status: "concluída",
    returnDate: "2026-04-01",
    note: "Jornal da manhã",
  },
];

const typeConfig = {
  saída: {
    label: "Saída",
    icon: ArrowUpRight,
    color: "#f97316",
    bg: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.25)",
    stripe: "#f97316",
  },
  entrada: {
    label: "Entrada",
    icon: ArrowDownLeft,
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.25)",
    stripe: "#22c55e",
  },
};

const statusConfig = {
  ativa: { label: "Ativa", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)", pulse: true },
  concluída: { label: "Concluída", color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)", pulse: false },
  atrasada: { label: "Atrasada", color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", pulse: true },
};

const TABS = [
  { value: "todas", label: "Todas" },
  { value: "saídas", label: "Saídas" },
  { value: "entradas", label: "Entradas" },
  { value: "ativas", label: "Ativas" },
  { value: "atrasadas", label: "Atrasadas" },
];

export default function Movements() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("todas");

  const filteredMovements = movements.filter((m) => {
    const matchesSearch =
      m.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "todas" ||
      (activeTab === "saídas" && m.type === "saída") ||
      (activeTab === "entradas" && m.type === "entrada") ||
      (activeTab === "ativas" && m.status === "ativa") ||
      (activeTab === "atrasadas" && m.status === "atrasada");
    return matchesSearch && matchesTab;
  });

  const tabCounts: Record<string, number> = {
    todas: movements.length,
    saídas: movements.filter(m => m.type === "saída").length,
    entradas: movements.filter(m => m.type === "entrada").length,
    ativas: movements.filter(m => m.status === "ativa").length,
    atrasadas: movements.filter(m => m.status === "atrasada").length,
  };

  const todayStats = [
    { label: "Saídas Hoje", value: movements.filter(m => m.type === "saída" && m.date === "2026-04-03").length, color: "#f97316", icon: ArrowUpRight },
    { label: "Entradas Hoje", value: movements.filter(m => m.type === "entrada" && m.date === "2026-04-03").length, color: "#22c55e", icon: ArrowDownLeft },
    { label: "Em Andamento", value: movements.filter(m => m.status === "ativa").length, color: "#3b82f6", icon: Clock },
    { label: "Atrasadas", value: movements.filter(m => m.status === "atrasada").length, color: "#ef4444", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
            <span style={{ color: "#22c55e", fontSize: "0.7rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Movimentações
            </span>
          </div>
          <h1 style={{ color: "#e8edf5", fontSize: "1.6rem", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.025em" }}>
            Entradas & Saídas
          </h1>
          <p style={{ color: "#4a5d78", fontSize: "0.82rem", fontFamily: "'Space Grotesk', sans-serif" }}>
            Registro completo de movimentações de equipamentos
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ background: "#22c55e", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.85rem" }}
        >
          <Plus className="w-4 h-4" />
          Nova Movimentação
        </motion.button>
      </motion.div>

      {/* Today Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {todayStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.08 + index * 0.07, type: "spring" }}
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl"
            style={{
              background: "#0d1221",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p style={{ color: "#4a5d78", fontSize: "0.7rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {stat.label}
              </p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
              </div>
            </div>
            <p style={{ color: "#e8edf5", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "1.6rem", lineHeight: 1 }}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Search + Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: "#0d1221", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Search row */}
        <div className="flex gap-3 p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#4a5d78" }} />
            <input
              placeholder="Buscar por item ou colaborador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#c8d6e8",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.85rem",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(34,197,94,0.4)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
            />
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors hover:bg-white/5"
            style={{ color: "#4a5d78", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: "0.82rem", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Filter className="w-3.5 h-3.5" />
            <Calendar className="w-3.5 h-3.5" />
            Filtrar por Data
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", scrollbarWidth: "none" }}>
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className="flex items-center gap-2 px-5 py-3.5 whitespace-nowrap transition-all relative"
              style={{
                color: activeTab === tab.value ? "#e8edf5" : "#4a5d78",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: activeTab === tab.value ? 600 : 400,
                fontSize: "0.85rem",
                borderBottom: activeTab === tab.value ? "2px solid #22c55e" : "2px solid transparent",
                background: "transparent",
              }}
            >
              {tab.label}
              <span
                className="px-1.5 py-0.5 rounded"
                style={{
                  background: activeTab === tab.value ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
                  color: activeTab === tab.value ? "#22c55e" : "#4a5d78",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                }}
              >
                {tabCounts[tab.value]}
              </span>
            </button>
          ))}
        </div>

        {/* Movements list */}
        <div className="p-4 space-y-2.5">
          <AnimatePresence>
            {filteredMovements.map((mv, index) => {
              const tc = typeConfig[mv.type as keyof typeof typeConfig];
              const sc = statusConfig[mv.status as keyof typeof statusConfig];
              const TypeIcon = tc.icon;

              return (
                <motion.div
                  key={mv.id}
                  layout
                  initial={{ opacity: 0, x: -20, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 28 }}
                  whileHover={{ x: 4 }}
                  className="relative flex items-start gap-4 p-4 rounded-xl overflow-hidden group cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                    (e.currentTarget as HTMLElement).style.borderColor = `${tc.color}25`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)";
                  }}
                >
                  {/* Left type stripe */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
                    style={{ background: tc.stripe }}
                  />

                  {/* Type indicator */}
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: tc.bg, border: `1px solid ${tc.border}` }}
                  >
                    <TypeIcon className="w-4.5 h-4.5" style={{ color: tc.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="min-w-0">
                        <p className="truncate" style={{ color: "#e8edf5", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.9rem", marginBottom: 3 }}>
                          {mv.item}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: `${mv.userColor}20`, border: `1px solid ${mv.userColor}40` }}
                            >
                              <span style={{ color: mv.userColor, fontSize: "0.5rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                                {mv.userInitials}
                              </span>
                            </div>
                            <span style={{ color: "#7a8fa8", fontSize: "0.78rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                              {mv.user}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" style={{ color: "#4a5d78" }} />
                            <span style={{ color: "#4a5d78", fontSize: "0.72rem", fontFamily: "'JetBrains Mono', monospace" }}>
                              {new Date(mv.date).toLocaleDateString("pt-BR")} · {mv.time}
                            </span>
                          </div>
                          {mv.note && (
                            <span
                              className="px-2 py-0.5 rounded-lg"
                              style={{ background: "rgba(255,255,255,0.04)", color: "#4a5d78", fontSize: "0.7rem", fontFamily: "'Space Grotesk', sans-serif", border: "1px solid rgba(255,255,255,0.06)" }}
                            >
                              {mv.note}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {mv.returnDate && (
                          <div className="text-right hidden sm:block">
                            <p style={{ color: "#4a5d78", fontSize: "0.65rem", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                              Devolução
                            </p>
                            <p style={{ color: mv.status === "atrasada" ? "#ef4444" : "#7a8fa8", fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                              {new Date(mv.returnDate).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        )}

                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                          style={{ background: sc.bg, border: `1px solid ${sc.border}` }}
                        >
                          {sc.pulse && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${mv.status === "atrasada" ? "animate-pulse-live" : ""}`}
                              style={{ background: sc.color }}
                            />
                          )}
                          {mv.status === "concluída" && (
                            <CheckCircle2 className="w-3 h-3" style={{ color: sc.color }} />
                          )}
                          <span style={{ color: sc.color, fontSize: "0.72rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                            {sc.label}
                          </span>
                        </div>

                        {mv.status === "ativa" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1.5 rounded-lg transition-all"
                            style={{
                              background: "rgba(34,197,94,0.1)",
                              border: "1px solid rgba(34,197,94,0.25)",
                              color: "#22c55e",
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontWeight: 600,
                              fontSize: "0.78rem",
                            }}
                          >
                            Devolver
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredMovements.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.04)" }}>
                <Package className="w-6 h-6" style={{ color: "#4a5d78" }} />
              </div>
              <h3 style={{ color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.95rem", marginBottom: 5 }}>
                Nenhuma movimentação encontrada
              </h3>
              <p style={{ color: "#4a5d78", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.8rem" }}>
                Ajuste os filtros ou a busca
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
