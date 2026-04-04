import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Camera, Battery, Mic, Package, CheckCircle2, Clock, Zap, ChevronRight } from "lucide-react";

const kits = [
  {
    id: 1,
    name: "Kit Reportagem Externa",
    description: "Kit completo para gravações externas em campo",
    items: [
      { name: "Sony A7 III", quantity: 1, icon: Camera, color: "#f97316" },
      { name: "Bateria V-Mount 150Wh", quantity: 2, icon: Battery, color: "#3b82f6" },
      { name: "Microfone Shotgun", quantity: 1, icon: Mic, color: "#a855f7" },
    ],
    status: "disponível",
    usageCount: 45,
    lastUsed: "Há 2 dias",
    tag: "Externo",
    tagColor: "#f97316",
  },
  {
    id: 2,
    name: "Kit Entrevista Studio",
    description: "Equipamento para entrevistas em estúdio controlado",
    items: [
      { name: "Canon C300 Mark III", quantity: 1, icon: Camera, color: "#f97316" },
      { name: "Bateria NP-F970", quantity: 4, icon: Battery, color: "#3b82f6" },
      { name: "Lapela Wireless", quantity: 2, icon: Mic, color: "#a855f7" },
    ],
    status: "em uso",
    usageCount: 28,
    lastUsed: "Agora",
    tag: "Estúdio",
    tagColor: "#22c55e",
  },
  {
    id: 3,
    name: "Kit Documentário",
    description: "Kit para produções documentais de longa duração",
    items: [
      { name: "Sony A7S III", quantity: 2, icon: Camera, color: "#f97316" },
      { name: "Bateria V-Mount 200Wh", quantity: 4, icon: Battery, color: "#3b82f6" },
      { name: "Rode NTG3", quantity: 2, icon: Mic, color: "#a855f7" },
    ],
    status: "disponível",
    usageCount: 32,
    lastUsed: "Há 1 semana",
    tag: "Documentário",
    tagColor: "#a855f7",
  },
  {
    id: 4,
    name: "Kit Jornalismo Rápido",
    description: "Kit leve para coberturas rápidas e jornalismo ágil",
    items: [
      { name: "Câmera Compacta 4K", quantity: 1, icon: Camera, color: "#f97316" },
      { name: "Bateria Reserva", quantity: 2, icon: Battery, color: "#3b82f6" },
      { name: "Microfone Portátil", quantity: 1, icon: Mic, color: "#a855f7" },
    ],
    status: "disponível",
    usageCount: 67,
    lastUsed: "Ontem",
    tag: "Jornalismo",
    tagColor: "#f59e0b",
  },
];

const statusConfig = {
  "disponível": { label: "Disponível", color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", dot: true },
  "em uso": { label: "Em Uso", color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)", dot: true },
  "manutenção": { label: "Manutenção", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", dot: false },
};

export default function Kits() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");

  const filteredKits = kits.filter((kit) => {
    const matchesSearch = kit.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "todos" || kit.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const summaryStats = [
    { label: "Total de Kits", value: kits.length, color: "#3b82f6", icon: Package },
    { label: "Disponíveis", value: kits.filter(k => k.status === "disponível").length, color: "#22c55e", icon: CheckCircle2 },
    { label: "Em Uso", value: kits.filter(k => k.status === "em uso").length, color: "#f97316", icon: Clock },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ background: "#a855f7", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.85rem" }}
        >
          <Plus className="w-4 h-4" />
          Criar Kit
        </motion.button>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {summaryStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + index * 0.07 }}
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl"
            style={{
              background: "#0d1221",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p style={{ color: "#4a5d78", fontSize: "0.72rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {stat.label}
              </p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
            <p style={{ color: "#e8edf5", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "1.6rem", letterSpacing: "-0.02em" }}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Search + Filter */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-3 flex-wrap"
      >
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#4a5d78" }} />
          <input
            placeholder="Buscar kits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all"
            style={{
              background: "#0d1221",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#c8d6e8",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.85rem",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
          />
        </div>

        {/* Status filters */}
        <div className="flex gap-2">
          {[
            { value: "todos", label: "Todos" },
            { value: "disponível", label: "Disponíveis" },
            { value: "em uso", label: "Em Uso" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedStatus(filter.value)}
              className="px-4 py-2.5 rounded-xl transition-all"
              style={{
                background: selectedStatus === filter.value ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${selectedStatus === filter.value ? "rgba(168,85,247,0.35)" : "rgba(255,255,255,0.07)"}`,
                color: selectedStatus === filter.value ? "#a855f7" : "#4a5d78",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: selectedStatus === filter.value ? 600 : 400,
                fontSize: "0.82rem",
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Kits Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnimatePresence>
          {filteredKits.map((kit, index) => {
            const sc = statusConfig[kit.status as keyof typeof statusConfig] ?? statusConfig["disponível"];
            const isInUse = kit.status === "em uso";

            return (
              <motion.div
                key={kit.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ delay: index * 0.07, type: "spring", stiffness: 260, damping: 26 }}
                whileHover={{ y: -5 }}
                className="rounded-2xl overflow-hidden group cursor-pointer"
                style={{
                  background: "#0d1221",
                  border: "1px solid rgba(255,255,255,0.06)",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(168,85,247,0.25)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 28px rgba(168,85,247,0.1)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                {/* Kit header */}
                <div className="p-5" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.06) 0%, transparent 50%)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <div
                          className="px-2.5 py-0.5 rounded-lg"
                          style={{ background: `${kit.tagColor}15`, border: `1px solid ${kit.tagColor}30` }}
                        >
                          <span style={{ color: kit.tagColor, fontSize: "0.65rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                            {kit.tag}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg"
                          style={{ background: sc.bg, border: `1px solid ${sc.border}` }}
                        >
                          {sc.dot && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${isInUse ? "animate-pulse-live" : ""}`}
                              style={{ background: sc.color }}
                            />
                          )}
                          <span style={{ color: sc.color, fontSize: "0.65rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                            {sc.label}
                          </span>
                        </div>
                      </div>
                      <h3 style={{ color: "#e8edf5", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>
                        {kit.name}
                      </h3>
                      <p style={{ color: "#4a5d78", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.78rem" }}>
                        {kit.description}
                      </p>
                    </div>
                  </div>

                  {/* Last used */}
                  <div className="flex items-center gap-1.5 mt-3">
                    <Clock className="w-3 h-3" style={{ color: "#4a5d78" }} />
                    <span style={{ color: "#4a5d78", fontSize: "0.72rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                      Último uso: {kit.lastUsed}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="mx-5 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                {/* Actions */}
                <div className="p-5">
                  <div className="flex gap-2">
                    <button
                      className="flex items-center gap-2 flex-1 justify-center py-2.5 rounded-xl transition-colors hover:bg-white/5"
                      style={{ color: "#4a5d78", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: "0.82rem", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      Ver Detalhes
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={isInUse}
                      className="flex-1 py-2.5 rounded-xl transition-all"
                      style={{
                        background: isInUse ? "rgba(255,255,255,0.04)" : "rgba(168,85,247,0.15)",
                        border: `1px solid ${isInUse ? "rgba(255,255,255,0.07)" : "rgba(168,85,247,0.3)"}`,
                        color: isInUse ? "#4a5d78" : "#a855f7",
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                        cursor: isInUse ? "not-allowed" : "pointer",
                      }}
                    >
                      {isInUse ? "Em Uso" : "Editar Kit"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {filteredKits.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ background: "#0d1221", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(168,85,247,0.08)" }}>
            <Package className="w-7 h-7" style={{ color: "#a855f7" }} />
          </div>
          <h3 style={{ color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "1rem", marginBottom: 6 }}>
            Nenhum kit encontrado
          </h3>
          <p style={{ color: "#4a5d78", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.82rem" }}>
            Tente ajustar sua busca
          </p>
        </motion.div>
      )}
    </div>
  );
}
