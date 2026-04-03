import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Camera, Battery, Mic, Lightbulb, Package, SlidersHorizontal, Grid3X3, List, ChevronRight, AlertCircle } from "lucide-react";

const categoryConfig = {
  "Todos": { icon: Package, color: "#c8d6e8", bg: "rgba(200,214,232,0.1)" },
  "Câmeras": { icon: Camera, color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  "Baterias": { icon: Battery, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  "Microfones": { icon: Mic, color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
  "Iluminação": { icon: Lightbulb, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  "Acessórios": { icon: SlidersHorizontal, color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
};

const inventoryItems = [
  { id: 1, name: "Sony A7 III", category: "Câmeras", quantity: 12, available: 8, status: "disponível", code: "CAM-001", condition: "Bom" },
  { id: 2, name: "Bateria V-Mount 150Wh", category: "Baterias", quantity: 24, available: 18, status: "disponível", code: "BAT-001", condition: "Bom" },
  { id: 3, name: "Rode NTG3", category: "Microfones", quantity: 8, available: 2, status: "baixo", code: "MIC-001", condition: "Regular" },
  { id: 4, name: "Canon C300 Mark III", category: "Câmeras", quantity: 6, available: 6, status: "disponível", code: "CAM-002", condition: "Excelente" },
  { id: 5, name: "Sennheiser EW 112P", category: "Microfones", quantity: 10, available: 7, status: "disponível", code: "MIC-002", condition: "Bom" },
  { id: 6, name: "Bateria NP-F970", category: "Baterias", quantity: 30, available: 22, status: "disponível", code: "BAT-002", condition: "Bom" },
  { id: 7, name: "Arri SkyPanel S30", category: "Iluminação", quantity: 4, available: 4, status: "disponível", code: "LUZ-001", condition: "Excelente" },
  { id: 8, name: "Tripé Cartoni Delta", category: "Acessórios", quantity: 14, available: 3, status: "baixo", code: "ACE-001", condition: "Regular" },
];

type ViewMode = "grid" | "list";

const conditionColor: Record<string, string> = {
  "Excelente": "#22c55e",
  "Bom": "#3b82f6",
  "Regular": "#f59e0b",
  "Ruim": "#ef4444",
};

export default function Inventory() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const filteredItems = inventoryItems.filter((item) => {
    const matchesCategory = selectedCategory === "Todos" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>;

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
            <div className="w-2 h-2 rounded-full" style={{ background: "#3b82f6" }} />
            <span style={{ color: "#3b82f6", fontSize: "0.7rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Inventário
            </span>
          </div>
          <h1 style={{ color: "#e8edf5", fontSize: "1.6rem", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.025em" }}>
            Equipamentos
          </h1>
          <p style={{ color: "#4a5d78", fontSize: "0.82rem", fontFamily: "'Space Grotesk', sans-serif" }}>
            {inventoryItems.length} itens cadastrados · {inventoryItems.filter(i => i.status === "baixo").length} com estoque baixo
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ background: "#f97316", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.85rem" }}
        >
          <Plus className="w-4 h-4" />
          Adicionar Item
        </motion.button>
      </motion.div>

      {/* Search + View Controls */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#4a5d78" }} />
          <input
            placeholder="Buscar por nome ou código..."
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
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
          />
        </div>

        {/* View toggle */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#0d1221", border: "1px solid rgba(255,255,255,0.07)" }}>
          {(["grid", "list"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="p-2 rounded-lg transition-all"
              style={{
                background: viewMode === mode ? "rgba(255,255,255,0.08)" : "transparent",
                color: viewMode === mode ? "#c8d6e8" : "#4a5d78",
              }}
            >
              {mode === "grid" ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Category Pills */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {categories.map((category, index) => {
          const cfg = categoryConfig[category];
          const isActive = selectedCategory === category;
          return (
            <motion.button
              key={category}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.04 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedCategory(category)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all"
              style={{
                background: isActive ? cfg.bg : "rgba(255,255,255,0.03)",
                border: `1px solid ${isActive ? cfg.color + "40" : "rgba(255,255,255,0.06)"}`,
                color: isActive ? cfg.color : "#4a5d78",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.82rem",
              }}
            >
              <cfg.icon className="w-3.5 h-3.5" />
              {category}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Items */}
      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {filteredItems.map((item, index) => {
              const cfg = categoryConfig[item.category as keyof typeof categoryConfig];
              const availabilityPct = (item.available / item.quantity) * 100;
              const isLow = item.available < item.quantity / 3;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 280, damping: 26 }}
                  whileHover={{ y: -5 }}
                  className="group rounded-2xl overflow-hidden cursor-pointer"
                  style={{
                    background: "#0d1221",
                    border: "1px solid rgba(255,255,255,0.06)",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${cfg.color}30`;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${cfg.color}15`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  {/* Card header */}
                  <div
                    className="p-5 pb-0"
                    style={{ background: `linear-gradient(135deg, ${cfg.color}08 0%, transparent 60%)` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}
                      >
                        <cfg.icon className="w-5 h-5" style={{ color: cfg.color }} />
                      </div>
                      <div className="flex items-center gap-2">
                        {isLow && (
                          <div
                            className="flex items-center gap-1 px-2 py-0.5 rounded-lg"
                            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
                          >
                            <AlertCircle className="w-3 h-3" style={{ color: "#ef4444" }} />
                            <span style={{ color: "#ef4444", fontSize: "0.65rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                              Baixo
                            </span>
                          </div>
                        )}
                        <div
                          className="px-2.5 py-0.5 rounded-lg"
                          style={{
                            background: `${conditionColor[item.condition]}15`,
                            border: `1px solid ${conditionColor[item.condition]}30`,
                          }}
                        >
                          <span style={{ color: conditionColor[item.condition], fontSize: "0.65rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                            {item.condition}
                          </span>
                        </div>
                      </div>
                    </div>

                    <h3 style={{ color: "#e8edf5", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.95rem", marginBottom: 2 }}>
                      {item.name}
                    </h3>
                    <p style={{ color: "#4a5d78", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", marginBottom: 16 }}>
                      {item.code}
                    </p>

                    {/* Availability bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span style={{ color: "#4a5d78", fontSize: "0.72rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                          Disponibilidade
                        </span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: isLow ? "#ef4444" : "#22c55e", fontWeight: 600 }}>
                          {item.available}/{item.quantity}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${availabilityPct}%` }}
                          transition={{ delay: 0.3 + index * 0.05, duration: 0.7, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{
                            background: isLow
                              ? "linear-gradient(90deg, #ef444480, #ef4444)"
                              : `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div
                    className="flex gap-2 px-5 py-4"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <button
                      className="flex-1 py-2 rounded-lg text-center transition-colors hover:bg-white/5"
                      style={{ color: "#4a5d78", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: "0.8rem", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      Detalhes
                    </button>
                    <button
                      className="flex-1 py-2 rounded-lg text-center transition-all hover:opacity-90"
                      style={{ background: cfg.bg, color: cfg.color, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.8rem", border: `1px solid ${cfg.color}30` }}
                    >
                      Movimentar
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: "#0d1221", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* Table header */}
            <div
              className="grid gap-4 px-5 py-3"
              style={{ gridTemplateColumns: "1fr 120px 100px 100px 120px 120px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              {["Equipamento", "Código", "Total", "Disponível", "Estado", "Ações"].map((h) => (
                <span key={h} style={{ color: "#4a5d78", fontSize: "0.7rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {h}
                </span>
              ))}
            </div>
            {filteredItems.map((item, index) => {
              const cfg = categoryConfig[item.category as keyof typeof categoryConfig];
              const isLow = item.available < item.quantity / 3;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="grid gap-4 px-5 py-3.5 items-center transition-colors"
                  style={{
                    gridTemplateColumns: "1fr 120px 100px 100px 120px 120px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
                      <cfg.icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate" style={{ color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: "0.85rem" }}>{item.name}</p>
                      <p style={{ color: "#4a5d78", fontSize: "0.7rem", fontFamily: "'Space Grotesk', sans-serif" }}>{item.category}</p>
                    </div>
                  </div>
                  <span style={{ color: "#4a5d78", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem" }}>{item.code}</span>
                  <span style={{ color: "#c8d6e8", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", fontWeight: 600 }}>{item.quantity}</span>
                  <span style={{ color: isLow ? "#ef4444" : "#22c55e", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", fontWeight: 700 }}>{item.available}</span>
                  <span style={{ color: conditionColor[item.condition], fontSize: "0.78rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}>{item.condition}</span>
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
                    style={{ background: cfg.bg, color: cfg.color, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.75rem", border: `1px solid ${cfg.color}30` }}
                  >
                    Movimentar
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ background: "#0d1221", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.04)" }}>
            <Package className="w-7 h-7" style={{ color: "#4a5d78" }} />
          </div>
          <h3 style={{ color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "1rem", marginBottom: 6 }}>
            Nenhum item encontrado
          </h3>
          <p style={{ color: "#4a5d78", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.82rem" }}>
            Ajuste os filtros ou a busca
          </p>
        </motion.div>
      )}
    </div>
  );
}