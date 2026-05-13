import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Camera, Battery, Mic, Package, CheckCircle2, Clock, ChevronRight, Wrench } from "lucide-react";
import {
  createKitItem,
  createKit,
  deleteKitItem,
  listInventario,
  listKits,
  listMovimentacoes,
  updateKit,
  updateKitItem,
  type ApiInventario,
  type ApiKit,
  type ApiMovimentacao,
} from "~/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

type KitStatus = "disponivel" | "fora" | "manutencao";

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

type InventoryUnitOption = {
  id: number;
  inventarioId: number;
  name: string;
  patrimonio: string;
  category: string;
  status: string;
  inMaintenance: boolean;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function filterInventoryUnits(units: InventoryUnitOption[], query: string) {
  const normalizedSearch = normalizeText(query.trim());
  if (!normalizedSearch) return units;

  return units.filter((unit) => {
    const matchesName = normalizeText(unit.name).includes(normalizedSearch);
    const matchesPatrimonio = normalizeText(unit.patrimonio).includes(normalizedSearch);
    return matchesName || matchesPatrimonio;
  });
}

function groupInventoryUnits(units: InventoryUnitOption[]) {
  const groups = new Map<number, { inventarioId: number; name: string; category: string; units: InventoryUnitOption[] }>();

  units.forEach((unit) => {
    const existing = groups.get(unit.inventarioId);
    if (existing) {
      existing.units.push(unit);
      return;
    }
    groups.set(unit.inventarioId, {
      inventarioId: unit.inventarioId,
      name: unit.name,
      category: unit.category,
      units: [unit],
    });
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      units: group.units.slice().sort((a, b) => a.patrimonio.localeCompare(b.patrimonio)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function buildSelectedCounts(selectedIds: number[], lookup: Map<number, InventoryUnitOption>) {
  const counts = new Map<number, number>();
  selectedIds.forEach((unitId) => {
    const unit = lookup.get(unitId);
    if (!unit) return;
    counts.set(unit.inventarioId, (counts.get(unit.inventarioId) ?? 0) + 1);
  });
  return counts;
}

function buildSelectionFromKit(kit: ApiKit, units: InventoryUnitOption[]) {
  const selected: number[] = [];
  let missingCount = 0;
  const unitsByInventario = new Map<number, InventoryUnitOption[]>();

  units.forEach((unit) => {
    const existing = unitsByInventario.get(unit.inventarioId);
    if (existing) {
      existing.push(unit);
      return;
    }
    unitsByInventario.set(unit.inventarioId, [unit]);
  });

  kit.itens.forEach((item) => {
    const availableUnits = (unitsByInventario.get(item.inventarioId) ?? [])
      .filter((unit) => !unit.inMaintenance)
      .sort((a, b) => a.patrimonio.localeCompare(b.patrimonio));
    const limit = Math.min(item.quantidade, availableUnits.length);
    for (let index = 0; index < limit; index += 1) {
      selected.push(availableUnits[index].id);
    }
    if (item.quantidade > availableUnits.length) {
      missingCount += item.quantidade - availableUnits.length;
    }
  });

  return { selected, missingCount };
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

function resolveKitStatus(kit: ApiKit, movimentacoes: ApiMovimentacao[]): KitStatus {
  const activeMovement = movimentacoes.some(
    (movimentacao) => movimentacao.kitId === kit.id && !movimentacao.dataDevolucao,
  );

  if (kit.usando || activeMovement) {
    return "fora";
  }

  const allMaintenance =
    kit.itens.length > 0 &&
    kit.itens.every((item) =>
      item.inventario?.unidades?.length
        ? item.inventario.unidades.every((unit) => normalizeText(unit.status).includes("manut"))
        : false,
    );

  if (allMaintenance) {
    return "manutencao";
  }

  return "disponivel";
}

function buildKitCards(kits: ApiKit[], movimentacoes: ApiMovimentacao[]): KitCardView[] {
  return kits.map((kit) => {
    const status = resolveKitStatus(kit, movimentacoes);
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
      status === "fora"
        ? "#f97316"
        : status === "manutencao"
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
  "disponivel": { label: "Disponivel", color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", dot: true },
  "fora": { label: "Fora", color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)", dot: true },
  "manutencao": { label: "Manutencao", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", dot: false },
};

export default function Kits() {
  const [kits, setKits] = useState<KitCardView[]>([]);
  const [kitData, setKitData] = useState<ApiKit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [detailsKit, setDetailsKit] = useState<ApiKit | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<ApiKit | null>(null);
  const [inventoryUnits, setInventoryUnits] = useState<InventoryUnitOption[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [inventorySearch, setInventorySearch] = useState("");
  const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([]);
  const [kitName, setKitName] = useState("");
  const [kitDescription, setKitDescription] = useState("");
  const [isSavingKit, setIsSavingKit] = useState(false);
  const [editInventorySearch, setEditInventorySearch] = useState("");
  const [editSelectedUnitIds, setEditSelectedUnitIds] = useState<number[]>([]);
  const [editKitName, setEditKitName] = useState("");
  const [editKitDescription, setEditKitDescription] = useState("");
  const [isSavingEditKit, setIsSavingEditKit] = useState(false);
  const [editSelectionWarning, setEditSelectionWarning] = useState<string | null>(null);

  const inventoryUnitLookup = useMemo(() => {
    return new Map(inventoryUnits.map((unit) => [unit.id, unit]));
  }, [inventoryUnits]);

  const filteredInventoryUnits = useMemo(() => {
    return filterInventoryUnits(inventoryUnits, inventorySearch);
  }, [inventorySearch, inventoryUnits]);

  const groupedInventoryUnits = useMemo(() => {
    return groupInventoryUnits(filteredInventoryUnits);
  }, [filteredInventoryUnits]);

  const filteredEditInventoryUnits = useMemo(() => {
    return filterInventoryUnits(inventoryUnits, editInventorySearch);
  }, [editInventorySearch, inventoryUnits]);

  const groupedEditInventoryUnits = useMemo(() => {
    return groupInventoryUnits(filteredEditInventoryUnits);
  }, [filteredEditInventoryUnits]);

  const selectedUnitsCount = selectedUnitIds.length;
  const selectedInventoryCounts = useMemo(() => {
    return buildSelectedCounts(selectedUnitIds, inventoryUnitLookup);
  }, [inventoryUnitLookup, selectedUnitIds]);

  const editSelectedInventoryCounts = useMemo(() => {
    return buildSelectedCounts(editSelectedUnitIds, inventoryUnitLookup);
  }, [editSelectedUnitIds, inventoryUnitLookup]);

  const canSaveKit = kitName.trim().length > 0 && selectedUnitsCount > 0 && !isSavingKit;
  const editingKitIsOut = editingKit ? kits.find((kit) => kit.id === editingKit.id)?.status === "fora" : false;
  const detailsKitIsOut = detailsKit ? kits.find((kit) => kit.id === detailsKit.id)?.status === "fora" : false;
  const canSaveEditKit = editKitName.trim().length > 0 && editSelectedUnitIds.length > 0 && !isSavingEditKit && !editingKitIsOut;

  const loadKits = async () => {
    setIsLoading(true);

    try {
      setErrorMessage(null);
      const [kitData, movementData] = await Promise.all([
        listKits(),
        listMovimentacoes(),
      ]);
      setKitData(kitData);
      setKits(buildKitCards(kitData, movementData));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Falha ao carregar kits.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadInventoryUnits = async () => {
    setInventoryLoading(true);

    try {
      setInventoryError(null);
      const data = await listInventario();
      const mappedUnits = data.flatMap((item: ApiInventario) =>
        (item.unidades ?? []).map((unit) => ({
          id: unit.id,
          inventarioId: item.id,
          name: item.nome,
          patrimonio: unit.patrimonio,
          category: item.categoria,
          status: unit.status ?? "disponivel",
          inMaintenance: normalizeText(unit.status ?? "").includes("manut"),
        })),
      );
      setInventoryUnits(mappedUnits);
    } catch (error) {
      setInventoryError(error instanceof Error ? error.message : "Falha ao carregar inventário.");
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    void loadKits();
  }, []);

  useEffect(() => {
    if (!isCreateDialogOpen && !isEditDialogOpen) return;
    if (inventoryUnits.length > 0) return;
    void loadInventoryUnits();
  }, [isCreateDialogOpen, isEditDialogOpen, inventoryUnits.length]);

  useEffect(() => {
    if (!isCreateDialogOpen) return;
    setInventorySearch("");
  }, [isCreateDialogOpen]);

  useEffect(() => {
    if (!isEditDialogOpen || !editingKit) return;
    if (inventoryUnits.length === 0) return;
    const { selected, missingCount } = buildSelectionFromKit(editingKit, inventoryUnits);
    setEditSelectedUnitIds(selected);
    if (missingCount > 0) {
      setEditSelectionWarning(
        `Alguns itens nao puderam ser selecionados (${missingCount}) por estarem em manutencao.`,
      );
    } else {
      setEditSelectionWarning(null);
    }
  }, [editingKit, inventoryUnits, isEditDialogOpen]);

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
    { label: "Disponíveis", value: kits.filter(k => k.status === "disponivel").length, color: "#22c55e", icon: CheckCircle2 },
    { label: "Fora", value: kits.filter(k => k.status === "fora").length, color: "#f97316", icon: Clock },
    { label: "Manutenção", value: kits.filter(k => k.status === "manutencao").length, color: "#f59e0b", icon: Wrench },
  ];

  const handleToggleUnit = (unitId: number) => {
    setSelectedUnitIds((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId],
    );
  };

  const handleClearSelection = () => {
    setSelectedUnitIds([]);
  };

  const handleDialogChange = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      setKitName("");
      setKitDescription("");
      setSelectedUnitIds([]);
      setInventorySearch("");
    }
  };

  const handleEditDialogChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setEditingKit(null);
      setEditKitName("");
      setEditKitDescription("");
      setEditSelectedUnitIds([]);
      setEditInventorySearch("");
      setEditSelectionWarning(null);
    }
  };

  const handleDetailsDialogChange = (open: boolean) => {
    setIsDetailsDialogOpen(open);
    if (!open) {
      setDetailsKit(null);
    }
  };

  const handleOpenDetails = (kitId: number) => {
    const kit = kitData.find((item) => item.id === kitId) ?? null;
    setDetailsKit(kit);
    setIsDetailsDialogOpen(true);
  };

  const handleOpenEdit = (kitId: number) => {
    const kitView = kits.find((item) => item.id === kitId);
    if (kitView?.status === "fora") {
      setErrorMessage("Este kit esta fora e nao pode ser editado ate ser devolvido.");
      return;
    }

    const kit = kitData.find((item) => item.id === kitId) ?? null;
    setEditingKit(kit);
    setEditKitName(kit?.nome ?? "");
    setEditKitDescription(kit?.descricao ?? "");
    setEditInventorySearch("");
    setEditSelectedUnitIds([]);
    setIsDetailsDialogOpen(false);
    setIsEditDialogOpen(true);
  };

  const handleSaveKit = async () => {
    if (!canSaveKit) return;

    const itens = Array.from(selectedInventoryCounts.entries()).map(([inventarioId, quantidade]) => ({
      inventarioId,
      quantidade,
    }));

    setIsSavingKit(true);
    try {
      setErrorMessage(null);
      await createKit({
        nome: kitName.trim(),
        descricao: kitDescription.trim() ? kitDescription.trim() : undefined,
        itens,
      });
      setIsCreateDialogOpen(false);
      setKitName("");
      setKitDescription("");
      setSelectedUnitIds([]);
      await loadKits();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Falha ao salvar kit.");
    } finally {
      setIsSavingKit(false);
    }
  };

  const handleToggleEditUnit = (unitId: number) => {
    setEditSelectedUnitIds((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId],
    );
  };

  const handleClearEditSelection = () => {
    setEditSelectedUnitIds([]);
  };

  const handleSaveEditKit = async () => {
    if (!editingKit || !canSaveEditKit) return;

    const desiredCounts = new Map(editSelectedInventoryCounts);
    const removedItems = editingKit.itens.filter((item) => !desiredCounts.has(item.inventarioId));
    const decreasedItems = editingKit.itens.filter((item) => {
      const desiredQty = desiredCounts.get(item.inventarioId);
      return desiredQty !== undefined && desiredQty < item.quantidade;
    });

    if (removedItems.length > 0 || decreasedItems.length > 0) {
      const confirmed = window.confirm(
        "Voce esta removendo itens do kit. Deseja continuar?",
      );
      if (!confirmed) {
        return;
      }
    }

    setIsSavingEditKit(true);
    try {
      setErrorMessage(null);
      await updateKit(editingKit.id, {
        nome: editKitName.trim(),
        descricao: editKitDescription.trim() ? editKitDescription.trim() : undefined,
      });

      const mutations: Array<Promise<unknown>> = [];

      editingKit.itens.forEach((item) => {
        const desiredQty = desiredCounts.get(item.inventarioId) ?? 0;
        if (desiredQty === 0) {
          mutations.push(deleteKitItem(item.id));
          return;
        }

        if (desiredQty !== item.quantidade) {
          mutations.push(updateKitItem(item.id, { quantidade: desiredQty }));
        }
        desiredCounts.delete(item.inventarioId);
      });

      desiredCounts.forEach((quantidade, inventarioId) => {
        mutations.push(createKitItem({ kitId: editingKit.id, inventarioId, quantidade }));
      });

      if (mutations.length > 0) {
        await Promise.all(mutations);
      }

      handleEditDialogChange(false);
      await loadKits();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Falha ao salvar kit.");
    } finally {
      setIsSavingEditKit(false);
    }
  };

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
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ background: "#a855f7", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.85rem" }}
        >
          <Plus className="w-4 h-4" />
          Criar Kit
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
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
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
            { value: "disponivel", label: "Disponiveis" },
            { value: "fora", label: "Fora" },
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
            const sc = statusConfig[kit.status as keyof typeof statusConfig] ?? statusConfig["disponivel"];
            const isOut = kit.status === "fora";

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
                              className={`w-1.5 h-1.5 rounded-full ${isOut ? "animate-pulse-live" : ""}`}
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenDetails(kit.id)}
                      className="flex items-center gap-2 flex-1 justify-center py-2.5 rounded-xl transition-colors hover:bg-white/5"
                      style={{ color: "#4a5d78", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: "0.82rem", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      Ver Detalhes
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={isOut}
                      onClick={() => handleOpenEdit(kit.id)}
                      title={isOut ? "Kit fora. Devolva o kit antes de editar." : undefined}
                      className="flex-1 py-2.5 rounded-xl transition-all"
                      style={{
                        background: isOut ? "rgba(255,255,255,0.04)" : "rgba(168,85,247,0.15)",
                        border: `1px solid ${isOut ? "rgba(255,255,255,0.07)" : "rgba(168,85,247,0.3)"}`,
                        color: isOut ? "#4a5d78" : "#a855f7",
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                        cursor: isOut ? "not-allowed" : "pointer",
                      }}
                    >
                      {isOut ? "Kit fora" : "Editar Kit"}
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

      <Dialog open={isCreateDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent
          className="border-none"
          style={{ background: "#0d1221", color: "#c8d6e8", borderRadius: 16 }}
        >
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Criar novo kit</DialogTitle>
            <DialogDescription style={{ color: "#4a5d78", fontFamily: "'Space Grotesk', sans-serif" }}>
              Selecione os itens do inventario e informe o nome e descricao do kit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3">
              <div>
                <label style={{ color: "#7a8fa8", fontSize: "0.75rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Nome do kit
                </label>
                <input
                  value={kitName}
                  onChange={(e) => setKitName(e.target.value)}
                  placeholder="Ex: Kit Jornalismo"
                  className="w-full rounded-xl px-3 py-2 mt-1 outline-none"
                  style={{ background: "#0b1020", border: "1px solid rgba(255,255,255,0.08)", color: "#e8edf5" }}
                />
              </div>
              <div>
                <label style={{ color: "#7a8fa8", fontSize: "0.75rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Descricao
                </label>
                <textarea
                  value={kitDescription}
                  onChange={(e) => setKitDescription(e.target.value)}
                  placeholder="Descreva o objetivo do kit"
                  className="w-full rounded-xl px-3 py-2 mt-1 outline-none min-h-[88px]"
                  style={{ background: "#0b1020", border: "1px solid rgba(255,255,255,0.08)", color: "#e8edf5" }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {editSelectionWarning && (
                <div
                  className="rounded-xl px-3 py-2"
                  style={{
                    background: "rgba(245,158,11,0.12)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    color: "#f5c26b",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.78rem",
                  }}
                >
                  {editSelectionWarning}
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <p style={{ color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.78rem" }}>
                  Itens do inventario ({selectedUnitsCount} selecionado{selectedUnitsCount === 1 ? "" : "s"})
                </p>
                <button
                  onClick={handleClearSelection}
                  disabled={selectedUnitsCount === 0}
                  className="px-3 py-1 rounded-lg"
                  style={{
                    color: selectedUnitsCount === 0 ? "#4a5d78" : "#a855f7",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.72rem",
                  }}
                >
                  Limpar selecao
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#4a5d78" }} />
                <input
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Buscar por nome ou patrimonio"
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 outline-none"
                  style={{ background: "#0b1020", border: "1px solid rgba(255,255,255,0.08)", color: "#c8d6e8" }}
                />
              </div>

              <div
                className="rounded-2xl border max-h-[260px] overflow-y-auto"
                style={{ borderColor: "rgba(255,255,255,0.07)", background: "#0b1020" }}
              >
                {inventoryLoading && (
                  <div className="p-4" style={{ color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.8rem" }}>
                    Carregando itens do inventario...
                  </div>
                )}

                {!inventoryLoading && inventoryError && (
                  <div className="p-4" style={{ color: "#fca5a5", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.8rem" }}>
                    {inventoryError}
                  </div>
                )}

                {!inventoryLoading && !inventoryError && filteredInventoryUnits.length === 0 && (
                  <div className="p-4" style={{ color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.8rem" }}>
                    Nenhum item encontrado.
                  </div>
                )}

                {!inventoryLoading && !inventoryError && groupedInventoryUnits.map((group) => (
                  <div key={group.inventarioId} className="border-b last:border-b-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <div className="px-4 py-2" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <p style={{ color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.82rem" }}>
                        {group.name}
                      </p>
                      <p style={{ color: "#4a5d78", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.7rem" }}>
                        {group.category}
                      </p>
                    </div>
                    {group.units.map((unit) => {
                      const isSelected = selectedUnitIds.includes(unit.id);
                      const maintenanceHint = "Item em manutencao, nao pode ser selecionado.";

                      return (
                        <label
                          key={unit.id}
                          title={unit.inMaintenance ? maintenanceHint : undefined}
                          className="flex items-center gap-3 px-4 py-3 border-t"
                          style={{
                            borderColor: "rgba(255,255,255,0.05)",
                            cursor: unit.inMaintenance ? "not-allowed" : "pointer",
                            opacity: unit.inMaintenance ? 0.55 : 1,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleUnit(unit.id)}
                            className="h-4 w-4"
                            disabled={unit.inMaintenance}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className="truncate"
                              style={{ color: "#e8edf5", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.85rem" }}
                            >
                              {unit.name} - {unit.patrimonio}
                            </p>
                            <p style={{ color: "#4a5d78", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.72rem" }}>
                              Patrimonio: {unit.patrimonio}
                            </p>
                          </div>
                          {unit.inMaintenance && (
                            <span
                              title={maintenanceHint}
                              className="px-2 py-0.5 rounded-md"
                              style={{
                                color: "#f59e0b",
                                border: "1px solid rgba(245,158,11,0.35)",
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: "0.68rem",
                              }}
                            >
                              Manutencao
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                ))}
              </div>

              {selectedInventoryCounts.size > 0 && (
                <div
                  className="rounded-2xl border p-3"
                  style={{ borderColor: "rgba(255,255,255,0.07)", background: "#0b1020" }}
                >
                  <p style={{ color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.72rem" }}>
                    Resumo do kit
                  </p>
                  <div className="mt-2 space-y-1">
                    {Array.from(selectedInventoryCounts.entries()).map(([inventarioId, quantidade]) => {
                      const unit = inventoryUnits.find((item) => item.inventarioId === inventarioId);
                      if (!unit) return null;
                      return (
                        <div key={inventarioId} className="flex items-center justify-between">
                          <span
                            className="truncate"
                            style={{ color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.78rem" }}
                          >
                            {unit.name}
                          </span>
                          <span style={{ color: "#7a8fa8", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.74rem" }}>
                            x{quantidade}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setIsCreateDialogOpen(false)}
              className="px-4 py-2 rounded-xl"
              style={{ color: "#7a8fa8", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveKit}
              disabled={!canSaveKit}
              className="px-4 py-2 rounded-xl"
              style={{
                background: canSaveKit ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.04)",
                color: canSaveKit ? "#a855f7" : "#4a5d78",
                border: `1px solid ${canSaveKit ? "rgba(168,85,247,0.35)" : "rgba(255,255,255,0.08)"}`,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
              }}
            >
              {isSavingKit ? "Salvando..." : "Salvar kit"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={handleDetailsDialogChange}>
        <DialogContent
          className="border-none"
          style={{ background: "#0d1221", color: "#c8d6e8", borderRadius: 16 }}
        >
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {detailsKit?.nome ?? "Detalhes do kit"}
            </DialogTitle>
            <DialogDescription style={{ color: "#4a5d78", fontFamily: "'Space Grotesk', sans-serif" }}>
              {detailsKit?.descricao?.trim() || "Sem descricao cadastrada."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(255,255,255,0.07)", background: "#0b1020" }}>
              <p style={{ color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.72rem" }}>
                Itens do kit
              </p>
              <div className="mt-2 space-y-2">
                {(detailsKit?.itens ?? []).length === 0 && (
                  <p style={{ color: "#4a5d78", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.78rem" }}>
                    Nenhum item cadastrado.
                  </p>
                )}
                {(detailsKit?.itens ?? []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span
                      className="truncate"
                      style={{ color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.82rem" }}
                    >
                      {item.inventario?.nome ?? `Inventario ${item.inventarioId}`}
                    </span>
                    <span style={{ color: "#7a8fa8", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem" }}>
                      x{item.quantidade}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => handleDetailsDialogChange(false)}
              className="px-4 py-2 rounded-xl"
              style={{ color: "#7a8fa8", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Fechar
            </button>
            <button
              onClick={() => detailsKit && handleOpenEdit(detailsKit.id)}
              disabled={detailsKitIsOut}
              title={detailsKitIsOut ? "Kit fora. Devolva o kit antes de editar." : undefined}
              className="px-4 py-2 rounded-xl"
              style={{
                background: detailsKitIsOut ? "rgba(255,255,255,0.04)" : "rgba(168,85,247,0.2)",
                color: detailsKitIsOut ? "#4a5d78" : "#a855f7",
                border: `1px solid ${detailsKitIsOut ? "rgba(255,255,255,0.07)" : "rgba(168,85,247,0.35)"}`,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                cursor: detailsKitIsOut ? "not-allowed" : "pointer",
              }}
            >
              {detailsKitIsOut ? "Kit fora" : "Editar kit"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogChange}>
        <DialogContent
          className="border-none"
          style={{ background: "#0d1221", color: "#c8d6e8", borderRadius: 16 }}
        >
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Editar kit</DialogTitle>
            <DialogDescription style={{ color: "#4a5d78", fontFamily: "'Space Grotesk', sans-serif" }}>
              Ajuste o nome, descricao e os itens do kit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3">
              <div>
                <label style={{ color: "#7a8fa8", fontSize: "0.75rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Nome do kit
                </label>
                <input
                  value={editKitName}
                  onChange={(e) => setEditKitName(e.target.value)}
                  placeholder="Ex: Kit Jornalismo"
                  className="w-full rounded-xl px-3 py-2 mt-1 outline-none"
                  style={{ background: "#0b1020", border: "1px solid rgba(255,255,255,0.08)", color: "#e8edf5" }}
                />
              </div>
              <div>
                <label style={{ color: "#7a8fa8", fontSize: "0.75rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Descricao
                </label>
                <textarea
                  value={editKitDescription}
                  onChange={(e) => setEditKitDescription(e.target.value)}
                  placeholder="Descreva o objetivo do kit"
                  className="w-full rounded-xl px-3 py-2 mt-1 outline-none min-h-[88px]"
                  style={{ background: "#0b1020", border: "1px solid rgba(255,255,255,0.08)", color: "#e8edf5" }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p style={{ color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.78rem" }}>
                  Itens do inventario ({editSelectedUnitIds.length} selecionado{editSelectedUnitIds.length === 1 ? "" : "s"})
                </p>
                <button
                  onClick={handleClearEditSelection}
                  disabled={editSelectedUnitIds.length === 0}
                  className="px-3 py-1 rounded-lg"
                  style={{
                    color: editSelectedUnitIds.length === 0 ? "#4a5d78" : "#a855f7",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.72rem",
                  }}
                >
                  Limpar selecao
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#4a5d78" }} />
                <input
                  value={editInventorySearch}
                  onChange={(e) => setEditInventorySearch(e.target.value)}
                  placeholder="Buscar por nome ou patrimonio"
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 outline-none"
                  style={{ background: "#0b1020", border: "1px solid rgba(255,255,255,0.08)", color: "#c8d6e8" }}
                />
              </div>

              <div
                className="rounded-2xl border max-h-[260px] overflow-y-auto"
                style={{ borderColor: "rgba(255,255,255,0.07)", background: "#0b1020" }}
              >
                {inventoryLoading && (
                  <div className="p-4" style={{ color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.8rem" }}>
                    Carregando itens do inventario...
                  </div>
                )}

                {!inventoryLoading && inventoryError && (
                  <div className="p-4" style={{ color: "#fca5a5", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.8rem" }}>
                    {inventoryError}
                  </div>
                )}

                {!inventoryLoading && !inventoryError && groupedEditInventoryUnits.length === 0 && (
                  <div className="p-4" style={{ color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.8rem" }}>
                    Nenhum item encontrado.
                  </div>
                )}

                {!inventoryLoading && !inventoryError && groupedEditInventoryUnits.map((group) => (
                  <div key={group.inventarioId} className="border-b last:border-b-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <div className="px-4 py-2" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <p style={{ color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.82rem" }}>
                        {group.name}
                      </p>
                      <p style={{ color: "#4a5d78", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.7rem" }}>
                        {group.category}
                      </p>
                    </div>
                    {group.units.map((unit) => {
                      const isSelected = editSelectedUnitIds.includes(unit.id);
                      const maintenanceHint = "Item em manutencao, nao pode ser selecionado.";

                      return (
                        <label
                          key={unit.id}
                          title={unit.inMaintenance ? maintenanceHint : undefined}
                          className="flex items-center gap-3 px-4 py-3 border-t"
                          style={{
                            borderColor: "rgba(255,255,255,0.05)",
                            cursor: unit.inMaintenance ? "not-allowed" : "pointer",
                            opacity: unit.inMaintenance ? 0.55 : 1,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleEditUnit(unit.id)}
                            className="h-4 w-4"
                            disabled={unit.inMaintenance}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className="truncate"
                              style={{ color: "#e8edf5", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.85rem" }}
                            >
                              {unit.name} - {unit.patrimonio}
                            </p>
                            <p style={{ color: "#4a5d78", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.72rem" }}>
                              Patrimonio: {unit.patrimonio}
                            </p>
                          </div>
                          {unit.inMaintenance && (
                            <span
                              title={maintenanceHint}
                              className="px-2 py-0.5 rounded-md"
                              style={{
                                color: "#f59e0b",
                                border: "1px solid rgba(245,158,11,0.35)",
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: "0.68rem",
                              }}
                            >
                              Manutencao
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                ))}
              </div>

              {editSelectedInventoryCounts.size > 0 && (
                <div
                  className="rounded-2xl border p-3"
                  style={{ borderColor: "rgba(255,255,255,0.07)", background: "#0b1020" }}
                >
                  <p style={{ color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.72rem" }}>
                    Resumo do kit
                  </p>
                  <div className="mt-2 space-y-1">
                    {Array.from(editSelectedInventoryCounts.entries()).map(([inventarioId, quantidade]) => {
                      const unit = inventoryUnits.find((item) => item.inventarioId === inventarioId);
                      if (!unit) return null;
                      return (
                        <div key={inventarioId} className="flex items-center justify-between">
                          <span
                            className="truncate"
                            style={{ color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.78rem" }}
                          >
                            {unit.name}
                          </span>
                          <span style={{ color: "#7a8fa8", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.74rem" }}>
                            x{quantidade}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => handleEditDialogChange(false)}
              className="px-4 py-2 rounded-xl"
              style={{ color: "#7a8fa8", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveEditKit}
              disabled={!canSaveEditKit}
              className="px-4 py-2 rounded-xl"
              style={{
                background: canSaveEditKit ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.04)",
                color: canSaveEditKit ? "#a855f7" : "#4a5d78",
                border: `1px solid ${canSaveEditKit ? "rgba(168,85,247,0.35)" : "rgba(255,255,255,0.08)"}`,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
              }}
            >
              {isSavingEditKit ? "Salvando..." : "Salvar alteracoes"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
