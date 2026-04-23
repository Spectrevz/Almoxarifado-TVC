import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Camera, Battery, Mic, Package, CheckCircle2, Clock, ChevronRight, Wrench } from "lucide-react";
import { listKits, listMovimentacoes, type ApiKit, type ApiMovimentacao } from "~/lib/api";

type KitStatus = "disponível" | "em uso" | "manutenção";

type KitItemView = {
  name: string;
  quantity: number;
  icon: typeof Package;
  color: string;
};

type KitCardView = {
  id: number;
  name: string;
  description: string;
  items: KitItemView[];
  status: KitStatus;
  usageCount: number;
  lastUsed: string;
  tag: string;
  tagColor: string;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatLastUsed(date?: string | null) {
  if (!date) {
    return "Sem uso";
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return "Sem uso";
  }

  const now = new Date();
  const diffMs = now.getTime() - parsed.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays <= 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `Há ${diffDays} dias`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `Há ${diffWeeks} semana${diffWeeks > 1 ? "s" : ""}`;

  return parsed.toLocaleDateString("pt-BR");
}

function getItemVisual(category: string) {
  const normalized = normalizeText(category);

  if (normalized.includes("camera")) {
    return { icon: Camera, color: "#f97316" };
  }

  if (normalized.includes("bateria")) {
    return { icon: Battery, color: "#3b82f6" };
  }

  if (normalized.includes("micro")) {
    return { icon: Mic, color: "#a855f7" };
  }

  return { icon: Package, color: "#22c55e" };
}

function resolveKitStatus(kit: ApiKit): KitStatus {
  if (kit.usando) {
    return "em uso";
  }

  const allMaintenance =
    kit.itens.length > 0 &&
    kit.itens.every((item) =>
      item.inventario?.unidades?.length
        ? item.inventario.unidades.every((unit) => normalizeText(unit.status).includes("manut"))
        : false,
    );

  if (allMaintenance) {
    return "manutenção";
  }

  return "disponível";
}

function buildKitCards(kits: ApiKit[], movimentacoes: ApiMovimentacao[]): KitCardView[] {
  return kits.map((kit) => {
    const status = resolveKitStatus(kit);
    const usage = movimentacoes.filter((mov) => mov.kitId === kit.id);
    const latestUsage = usage
      .slice()
      .sort((left, right) => {
        const leftDate = `${left.dataSaida} ${left.horaSaida ?? "00:00:00"}`;
        const rightDate = `${right.dataSaida} ${right.horaSaida ?? "00:00:00"}`;
        return rightDate.localeCompare(leftDate);
      })[0];

    const items = kit.itens.map((item) => {
      const visual = getItemVisual(item.inventario?.categoria ?? "");

      return {
        name: item.inventario?.nome ?? `Inventário ${item.inventarioId}`,
        quantity: item.quantidade,
        icon: visual.icon,
        color: visual.color,
      };
    });

    const tagColor =
      status === "em uso"
        ? "#f97316"
        : status === "manutenção"
          ? "#f59e0b"
          : "#22c55e";

    return {
      id: kit.id,
      name: kit.nome,
      description: kit.descricao?.trim() || "Sem descrição cadastrada.",
      items,
      status,
      usageCount: usage.length,
      lastUsed: formatLastUsed(latestUsage?.dataSaida),
      tag: `Kit ${kit.id}`,
      tagColor,
    };
  });
}

const statusConfig = {
  "disponível": { label: "Disponível", color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", dot: true },
  "em uso": { label: "Em Uso", color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)", dot: true },
  "manutenção": { label: "Manutenção", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", dot: false },
};

export default function Kits() {
  const [kits, setKits] = useState<KitCardView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      try {
        setErrorMessage(null);
        const [kitData, movementData] = await Promise.all([
          listKits(),
          listMovimentacoes(),
        ]);
        setKits(buildKitCards(kitData, movementData));
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Falha ao carregar kits.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, []);

  const filteredKits = useMemo(() => kits.filter((kit) => {
    const normalizedSearch = searchQuery.toLowerCase();
    const matchesSearch =
      kit.name.toLowerCase().includes(normalizedSearch) ||
      kit.description.toLowerCase().includes(normalizedSearch);
    const matchesStatus = selectedStatus === "todos" || kit.status === selectedStatus;
    return matchesSearch && matchesStatus;
  }), [kits, searchQuery, selectedStatus]);

  const summaryStats = [
    { label: "Total de Kits", value: kits.length, color: "#3b82f6", icon: Package },
    { label: "Disponíveis", value: kits.filter(k => k.status === "disponível").length, color: "#22c55e", icon: CheckCircle2 },
    { label: "Em Uso", value: kits.filter(k => k.status === "em uso").length, color: "#f97316", icon: Clock },
    { label: "Manutenção", value: kits.filter(k => k.status === "manutenção").length, color: "#f59e0b", icon: Wrench },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          disabled
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-xl"
          style={{ background: "#a855f7", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.85rem", opacity: 0.65 }}
        >
          <Plus className="w-4 h-4" />
          Criar Kit (em breve)
        </motion.button>
      </motion.div>

      {errorMessage && (
        <div
          className="rounded-xl px-4 py-3"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.22)",
            color: "#fca5a5",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "0.82rem",
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
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
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
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
                  <div className="flex items-center justify-between gap-3 mt-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" style={{ color: "#4a5d78" }} />
                      <span style={{ color: "#4a5d78", fontSize: "0.72rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                        Último uso: {kit.lastUsed}
                      </span>
                    </div>
                    <span style={{ color: "#7a8fa8", fontSize: "0.72rem", fontFamily: "'JetBrains Mono', monospace" }}>
                      {kit.usageCount} uso(s)
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="mx-5 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                <div className="px-5 pt-4 space-y-2">
                  {kit.items.slice(0, 3).map((item) => (
                    <div key={`${kit.id}-${item.name}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <item.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: item.color }} />
                        <span className="truncate" style={{ color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.78rem" }}>
                          {item.name}
                        </span>
                      </div>
                      <span style={{ color: "#7a8fa8", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem" }}>
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row gap-2">
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

      {isLoading && (
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
            Carregando kits...
          </h3>
        </motion.div>
      )}

      {/* Empty state */}
      {!isLoading && filteredKits.length === 0 && (
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
