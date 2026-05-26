import { type FormEvent, useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  createInventario,
  createUnidadeInventario,
  deleteInventario,
  deleteUnidadeInventario,
  listInventario,
  type ApiInventario,
  updateUnidadeInventario,
} from "~/lib/api";
import { Search, Plus, Package } from "lucide-react";

const categoryConfig = {
  "Todos": { color: "#c8d6e8", bg: "rgba(200,214,232,0.1)" },
  "Câmeras": { color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  "Baterias": { color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  "Microfones": { color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
  "Iluminação": { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  "Acessórios": { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
};

type InventoryCategory = keyof typeof categoryConfig;

type InventoryItem = {
  id: number;
  name: string;
  patrimonio: string;
  category: Exclude<InventoryCategory, "Todos">;
  quantity: number;
  available: number;
  status: "disponível" | "baixo";
  code: string;
  condition: string;
  note: string | null;
  units: Array<{
    id: number;
    order: number;
    patrimonio: string;
    note: string;
    inMaintenance: boolean;
    backendStatus: string;
  }>;
};

type InventoryFormData = {
  name: string;
  category: Exclude<InventoryCategory, "Todos">;
  quantity: string;
  note: string;
  units: Array<{
    patrimonio: string;
    note: string;
  }>;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function mapCategory(rawCategory: string): Exclude<InventoryCategory, "Todos"> {
  const normalized = normalizeText(rawCategory);

  if (normalized.includes("camera")) return "Câmeras";
  if (normalized.includes("bateria")) return "Baterias";
  if (normalized.includes("micro")) return "Microfones";
  if (normalized.includes("ilumin")) return "Iluminação";
  if (normalized.includes("acessor")) return "Acessórios";

  return "Acessórios";
}

function isMaintenanceStatus(status: string) {
  return normalizeText(status).includes("manut");
}

function buildInventoryCode(category: Exclude<InventoryCategory, "Todos">, id: number) {
  const categoryPrefix = category
    .split(" ")
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);

  return `${categoryPrefix || "EQP"}-${String(id).padStart(3, "0")}`;
}

function mapApiItem(item: ApiInventario): InventoryItem {
  const category = mapCategory(item.categoria);
  const units = (item.unidades ?? []).map((unit, index) => {
    const maintenance = isMaintenanceStatus(unit.status ?? "");

    return {
      id: unit.id,
      order: index + 1,
      patrimonio: unit.patrimonio,
      note: unit.observacao ?? "",
      inMaintenance: maintenance,
      backendStatus: unit.status ?? "disponivel",
    };
  });

  const quantity = units.length;
  const maintenanceCount = units.filter((unit) => unit.inMaintenance).length;
  const available = Math.max(0, quantity - maintenanceCount);

  return {
    id: item.id,
    name: item.nome,
    patrimonio: units[0]?.patrimonio ?? "",
    category,
    quantity,
    available,
    status: available < Math.max(1, quantity / 3) ? "baixo" : "disponível",
    code: buildInventoryCode(category, item.id),
    condition: maintenanceCount > 0 ? "Manutenção" : "Bom",
    note: item.observacao ?? null,
    units,
  };
}

function getDefaultInventoryFormData(): InventoryFormData {
  return {
    name: "",
    category: "Câmeras",
    quantity: "1",
    note: "",
    units: [
      {
        patrimonio: "",
        note: "",
      },
    ],
  };
}

function sanitizeIntegerInput(value: string) {
  return value.replace(/[^0-9]/g, "");
}

export default function Inventory() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [isMutatingInventory, setIsMutatingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [unitSelectionMode, setUnitSelectionMode] = useState<"none" | "maintenance" | "remove">("none");
  const [selectedUnitOrders, setSelectedUnitOrders] = useState<number[]>([]);
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [newUnitPatrimonio, setNewUnitPatrimonio] = useState("");
  const [newUnitNote, setNewUnitNote] = useState("");
  const [formData, setFormData] = useState<InventoryFormData>(getDefaultInventoryFormData);

  const filteredItems = inventoryItems.filter((item) => {
    const matchesCategory = selectedCategory === "Todos" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.patrimonio.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>;
  const selectedItem = selectedItemId === null
    ? null
    : inventoryItems.find((item) => item.id === selectedItemId) ?? null;

  const loadInventory = async (withSpinner = true) => {
    if (withSpinner) {
      setIsLoadingInventory(true);
    }

    try {
      setInventoryError(null);
      const data = await listInventario();
      setInventoryItems(data.map(mapApiItem));
    } catch (error) {
      setInventoryError(error instanceof Error ? error.message : "Falha ao carregar inventário.");
    } finally {
      if (withSpinner) {
        setIsLoadingInventory(false);
      }
    }
  };

  useEffect(() => {
    void loadInventory(true);
  }, []);

  const runInventoryMutation = async (operation: () => Promise<void>) => {
    setIsMutatingInventory(true);

    try {
      setInventoryError(null);
      await operation();
      await loadInventory(false);
      return true;
    } catch (error) {
      setInventoryError(error instanceof Error ? error.message : "Falha ao atualizar inventário.");
      return false;
    } finally {
      setIsMutatingInventory(false);
    }
  };

  const handleCreateDialogChange = (open: boolean) => {
    setIsCreateDialogOpen(open);

    if (!open) {
      setFormData(getDefaultInventoryFormData());
    }
  };

  const handleFormChange = <K extends keyof InventoryFormData>(field: K, value: InventoryFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuantityChange = (value: string) => {
    const sanitized = sanitizeIntegerInput(value);
    const quantity = sanitized === "" ? "" : String(Math.max(1, Number(sanitized)));

    setFormData((prev) => {
      const nextFormData = { ...prev, quantity };

      const unitCount = Math.max(1, Number(quantity || 1));
      const nextUnits = Array.from({ length: unitCount }, (_, index) =>
        prev.units[index] ?? { patrimonio: "", note: "" },
      );

      nextFormData.units = nextUnits;

      return nextFormData;
    });
  };

  const handleUnitChange = (index: number, field: "patrimonio" | "note", value: string) => {
    setFormData((prev) => ({
      ...prev,
      units: prev.units.map((unit, unitIndex) =>
        unitIndex === index ? { ...unit, [field]: value } : unit,
      ),
    }));
  };

  const handleCreateEquipment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const quantity = Math.max(1, Number(formData.quantity || 1));
    const unitDetails = formData.units.slice(0, Math.max(1, quantity)).map((unit) => ({
      patrimonio: unit.patrimonio.trim(),
      note: unit.note.trim(),
    }));

    const primaryPatrimonio = unitDetails[0]?.patrimonio ?? "";

    if (!primaryPatrimonio) {
      return;
    }

    if (quantity > 1 && unitDetails.some((unit) => !unit.patrimonio || !unit.note)) {
      return;
    }

    const created = await runInventoryMutation(async () => {
      await createInventario({
        nome: formData.name.trim(),
        categoria: formData.category,
        observacao: formData.note.trim() || undefined,
        unidades: unitDetails.map((unit) => ({
          patrimonio: unit.patrimonio,
          status: "disponivel",
          observacao: unit.note || undefined,
        })),
      });
    });

    if (created) {
      setIsCreateDialogOpen(false);
      setFormData(getDefaultInventoryFormData());
      setSelectedCategory(formData.category);
    }
  };

  const handleRemoveEquipment = async (itemId: number) => {
    const removed = await runInventoryMutation(async () => {
      await deleteInventario(itemId);
    });

    if (removed) {
      setSelectedItemId(null);
      setSelectedUnitOrders([]);
      setUnitSelectionMode("none");
    }
  };

  const handleOpenItemDetails = (itemId: number) => {
    setSelectedItemId(itemId);
    setSelectedUnitOrders([]);
    setUnitSelectionMode("none");
    setIsAddingUnit(false);
    setNewUnitPatrimonio("");
    setNewUnitNote("");
  };

  const handleToggleUnitSelection = (unitOrder: number) => {
    setSelectedUnitOrders((prev) =>
      prev.includes(unitOrder)
        ? prev.filter((order) => order !== unitOrder)
        : [...prev, unitOrder],
    );
  };

  const handleStartUnitSelection = (mode: "maintenance" | "remove") => {
    setIsAddingUnit(false);
    setUnitSelectionMode(mode);
    setSelectedUnitOrders([]);
  };

  const handleCancelUnitSelection = () => {
    setUnitSelectionMode("none");
    setSelectedUnitOrders([]);
  };

  const handleApplyMaintenanceSelection = async (itemId: number) => {
    if (selectedUnitOrders.length === 0) {
      return;
    }

    const item = inventoryItems.find((inventoryItem) => inventoryItem.id === itemId);
    if (!item) {
      return;
    }

    const selectedUnits = item.units.filter((unit) => selectedUnitOrders.includes(unit.order));
    if (selectedUnits.length === 0) {
      return;
    }

    const updated = await runInventoryMutation(async () => {
      await Promise.all(
        selectedUnits.map((unit) =>
          updateUnidadeInventario(unit.id, {
            status: unit.inMaintenance ? "disponivel" : "manutencao",
          }),
        ),
      );
    });

    if (updated) {
      setUnitSelectionMode("none");
      setSelectedUnitOrders([]);
    }
  };

  const handleApplyRemoveSelection = async (itemId: number) => {
    if (selectedUnitOrders.length === 0) {
      return;
    }

    const item = inventoryItems.find((inventoryItem) => inventoryItem.id === itemId);
    if (!item) {
      return;
    }

    const selectedUnits = item.units.filter((unit) => selectedUnitOrders.includes(unit.order));
    if (selectedUnits.length === 0) {
      return;
    }

    const removed = await runInventoryMutation(async () => {
      if (selectedUnits.length >= item.units.length) {
        await deleteInventario(itemId);
        return;
      }

      await Promise.all(selectedUnits.map((unit) => deleteUnidadeInventario(unit.id)));
    });

    if (removed) {
      if (selectedUnits.length >= item.units.length) {
        setSelectedItemId(null);
      }

      setUnitSelectionMode("none");
      setSelectedUnitOrders([]);
    }
  };

  const handleStartAddUnit = () => {
    setUnitSelectionMode("none");
    setSelectedUnitOrders([]);
    setIsAddingUnit(true);
    setNewUnitPatrimonio("");
    setNewUnitNote("");
  };

  const handleCancelAddUnit = () => {
    setIsAddingUnit(false);
    setNewUnitPatrimonio("");
    setNewUnitNote("");
  };

  const handleConfirmAddUnit = async (itemId: number) => {
    if (!newUnitPatrimonio.trim() || !newUnitNote.trim()) {
      return;
    }

    const created = await runInventoryMutation(async () => {
      await createUnidadeInventario({
        inventarioId: itemId,
        patrimonio: newUnitPatrimonio.trim(),
        observacao: newUnitNote.trim(),
        status: "disponivel",
      });
    });

    if (created) {
      handleCancelAddUnit();
    }
  };

  const unitCount = Math.max(1, Number(formData.quantity || 0));
  const showUnitDetails = unitCount > 0;
  const requireUnitNote = unitCount > 1;

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
          disabled={isMutatingInventory}
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-xl"
          style={{ background: "#3b82f6", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.85rem", opacity: isMutatingInventory ? 0.65 : 1 }}
        >
          <Plus className="w-4 h-4" />
          {isMutatingInventory ? "Sincronizando..." : "Registrar Equipamento"}
        </motion.button>
      </motion.div>

      {inventoryError && (
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
          {inventoryError}
        </div>
      )}

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#4a5d78" }} />
          <input
            placeholder="Buscar por nome ou patrimônio..."
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
              className="flex items-center px-4 py-2 rounded-xl whitespace-nowrap transition-all"
              style={{
                background: isActive ? cfg.bg : "rgba(255,255,255,0.03)",
                border: `1px solid ${isActive ? cfg.color + "40" : "rgba(255,255,255,0.06)"}`,
                color: isActive ? cfg.color : "#4a5d78",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.82rem",
              }}
            >
              {category}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Items */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: "#0d1221", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {isLoadingInventory ? (
          <div className="px-5 py-10" style={{ color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.85rem" }}>
            Carregando inventário...
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {filteredItems.map((item, index) => {
                const isLow = item.available < item.quantity / 3;
                const maintenanceCount = item.units.filter((unit) => unit.inMaintenance).length;
                const outsideCount = Math.max(0, item.quantity - item.available - maintenanceCount);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="p-4 space-y-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0 flex-1">
                        <p className="truncate" style={{ color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: "0.85rem" }}>{item.name}</p>
                        <p style={{ color: "#4a5d78", fontSize: "0.72rem", fontFamily: "'Space Grotesk', sans-serif" }}>{item.category}</p>
                      </div>
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
                        onClick={() => handleOpenItemDetails(item.id)}
                        style={{ background: "rgba(255,255,255,0.04)", color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.75rem", border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        Sobre
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <p style={{ color: "#4a5d78", fontSize: "0.65rem", fontFamily: "'Space Grotesk', sans-serif", textTransform: "uppercase" }}>Patrimônio</p>
                        <p className="truncate" style={{ color: "#c8d6e8", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem" }}>{item.patrimonio}</p>
                      </div>
                      <div className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <p style={{ color: "#4a5d78", fontSize: "0.65rem", fontFamily: "'Space Grotesk', sans-serif", textTransform: "uppercase" }}>Total</p>
                        <p style={{ color: "#c8d6e8", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem", fontWeight: 600 }}>{item.quantity}</p>
                      </div>
                      <div className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <p style={{ color: "#4a5d78", fontSize: "0.65rem", fontFamily: "'Space Grotesk', sans-serif", textTransform: "uppercase" }}>Disponível</p>
                        <p style={{ color: isLow ? "#ef4444" : "#22c55e", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem", fontWeight: 700 }}>{item.available}</p>
                      </div>
                      <div className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <p style={{ color: "#4a5d78", fontSize: "0.65rem", fontFamily: "'Space Grotesk', sans-serif", textTransform: "uppercase" }}>Fora / Manutenção</p>
                        <p style={{ color: "#f59e0b", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem", fontWeight: 700 }}>{outsideCount} / {maintenanceCount}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Table desktop/tablet */}
            <div className="hidden md:block overflow-x-auto">
              <div className="min-w-[980px]">
                <div
                  className="grid gap-4 px-5 py-3"
                  style={{ gridTemplateColumns: "1fr 120px 90px 110px 90px 120px 100px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {["Equipamento", "Patrimônio", "Total", "Disponível", "Fora", "Manutenção", "Ações"].map((h) => (
                    <span key={h} style={{ color: "#4a5d78", fontSize: "0.7rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      {h}
                    </span>
                  ))}
                </div>
                {filteredItems.map((item, index) => {
                  const isLow = item.available < item.quantity / 3;
                  const maintenanceCount = item.units.filter((unit) => unit.inMaintenance).length;
                  const outsideCount = Math.max(0, item.quantity - item.available - maintenanceCount);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="grid gap-4 px-5 py-3.5 items-center transition-colors"
                      style={{
                        gridTemplateColumns: "1fr 120px 90px 110px 90px 120px 100px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="min-w-0">
                          <p className="truncate" style={{ color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: "0.85rem" }}>{item.name}</p>
                          <p style={{ color: "#4a5d78", fontSize: "0.7rem", fontFamily: "'Space Grotesk', sans-serif" }}>{item.category}</p>
                        </div>
                      </div>
                      <span style={{ color: "#4a5d78", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem" }}>{item.patrimonio}</span>
                      <span style={{ color: "#c8d6e8", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", fontWeight: 600 }}>{item.quantity}</span>
                      <span style={{ color: isLow ? "#ef4444" : "#22c55e", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", fontWeight: 700 }}>{item.available}</span>
                      <span style={{ color: item.quantity - item.available > 0 ? "#f59e0b" : "#4a5d78", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", fontWeight: 700 }}>
                        {outsideCount}
                      </span>
                      <span style={{ color: item.available < item.quantity / 3 ? "#f59e0b" : "#4a5d78", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", fontWeight: 700 }}>
                        {maintenanceCount}
                      </span>
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
                        onClick={() => handleOpenItemDetails(item.id)}
                        style={{ background: "rgba(255,255,255,0.04)", color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.75rem", border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        Sobre
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Empty state */}
      {!isLoadingInventory && filteredItems.length === 0 && (
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

      <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogChange}>
        <DialogContent
          className="sm:max-w-2xl max-h-[88vh] overflow-y-auto overscroll-contain touch-pan-y"
          onInteractOutside={(event) => event.preventDefault()}
          style={{
            background: "#0d1221",
            border: "1px solid rgba(255,255,255,0.09)",
            color: "#c8d6e8",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#e8edf5", fontFamily: "'Space Grotesk', sans-serif" }}>
              Criar Equipamento
            </DialogTitle>
            <DialogDescription style={{ color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif" }}>
              Cadastre um novo item no inventário com o mesmo padrão visual do modal de movimentação.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateEquipment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="space-y-1.5 md:col-span-2">
                <span style={{ fontSize: "0.75rem", color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif" }}>Equipamento</span>
                <input
                  required
                  value={formData.name}
                  onChange={(event) => handleFormChange("name", event.target.value)}
                  placeholder="Ex: Sony A7 IV"
                  className="w-full rounded-xl px-3 py-2.5 outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#c8d6e8" }}
                />
              </label>

              <label className="space-y-1.5">
                <span style={{ fontSize: "0.75rem", color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif" }}>Categoria</span>
                <select
                  required
                  value={formData.category}
                  onChange={(event) => handleFormChange("category", event.target.value as InventoryFormData["category"])}
                  className="w-full rounded-xl px-3 py-2.5 outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#c8d6e8" }}
                >
                  {categories
                    .filter((category) => category !== "Todos")
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </label>

              <label className="space-y-1.5">
                <span style={{ fontSize: "0.75rem", color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif" }}>Total</span>
                <input
                  required
                  inputMode="numeric"
                  value={formData.quantity}
                  onChange={(event) => handleQuantityChange(event.target.value)}
                  placeholder="Ex: 12"
                  className="w-full rounded-xl px-3 py-2.5 outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#c8d6e8" }}
                />
              </label>

              {showUnitDetails && (
                <div className="md:col-span-2 space-y-2 rounded-xl p-3" style={{ border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.02)" }}>
                  <p style={{ color: "#7a8fa8", fontSize: "0.75rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                    Unidades do equipamento
                  </p>
                  <p style={{ color: "#4a5d78", fontSize: "0.72rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                    Cada unidade precisa de patrimônio. Quando a quantidade for maior que 1, a observação também vira obrigatória.
                  </p>

                  <div
                    className="space-y-2 max-h-[34vh] overflow-y-auto overscroll-contain pr-1"
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    {formData.units.slice(0, unitCount).map((unit, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2">
                        <div className="md:col-span-2 rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#7a8fa8", fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace" }}>
                          Unidade {index + 1}
                        </div>

                        <input
                          required
                          value={unit.patrimonio}
                          onChange={(event) => handleUnitChange(index, "patrimonio", event.target.value)}
                          placeholder="Patrimônio da unidade"
                          className="md:col-span-4 rounded-lg px-3 py-2.5 outline-none"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#c8d6e8" }}
                        />

                        <input
                          required={requireUnitNote}
                          value={unit.note}
                          onChange={(event) => handleUnitChange(index, "note", event.target.value)}
                          placeholder="Observação da unidade"
                          className="md:col-span-6 rounded-lg px-3 py-2.5 outline-none"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#c8d6e8" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <label className="space-y-1.5 md:col-span-2">
                <span style={{ fontSize: "0.75rem", color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif" }}>Observação</span>
                <textarea
                  rows={3}
                  value={formData.note}
                  onChange={(event) => handleFormChange("note", event.target.value)}
                  placeholder="Ex: Item recém-incluído no estoque"
                  className="w-full rounded-xl px-3 py-2.5 outline-none resize-y"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#c8d6e8" }}
                />
              </label>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => handleCreateDialogChange(false)}
                className="px-4 py-2.5 rounded-xl"
                style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.85rem" }}
              >
                Cancelar e fechar
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl"
                style={{ background: "#f97316", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.85rem" }}
              >
                Salvar equipamento
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={selectedItem !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedItemId(null);
            setUnitSelectionMode("none");
            setSelectedUnitOrders([]);
          }
        }}
      >
        <DialogContent
          className="sm:max-w-xl max-h-[88vh] overflow-y-auto overscroll-contain touch-pan-y"
          onInteractOutside={(event) => event.preventDefault()}
          style={{
            background: "#0d1221",
            border: "1px solid rgba(255,255,255,0.09)",
            color: "#c8d6e8",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#e8edf5", fontFamily: "'Space Grotesk', sans-serif" }}>
              Sobre o equipamento
            </DialogTitle>
            <DialogDescription style={{ color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif" }}>
              Registro único com as unidades vinculadas.
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p style={{ color: "#4a5d78", fontSize: "0.68rem", fontFamily: "'Space Grotesk', sans-serif", textTransform: "uppercase" }}>Equipamento</p>
                  <p style={{ color: "#e8edf5", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>{selectedItem.name}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p style={{ color: "#4a5d78", fontSize: "0.68rem", fontFamily: "'Space Grotesk', sans-serif", textTransform: "uppercase" }}>Total</p>
                  <p style={{ color: "#e8edf5", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{selectedItem.quantity}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p style={{ color: "#7a8fa8", fontSize: "0.75rem", fontFamily: "'Space Grotesk', sans-serif" }}>Unidades</p>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 px-2">
                  <p className="md:col-span-2" style={{ color: "#4a5d78", fontSize: "0.68rem", fontFamily: "'Space Grotesk', sans-serif", textTransform: "uppercase" }}>Unidade</p>
                  <p className="md:col-span-5" style={{ color: "#4a5d78", fontSize: "0.68rem", fontFamily: "'Space Grotesk', sans-serif", textTransform: "uppercase" }}>Patrimônio</p>
                  <p className="md:col-span-5" style={{ color: "#4a5d78", fontSize: "0.68rem", fontFamily: "'Space Grotesk', sans-serif", textTransform: "uppercase" }}>Observação</p>
                </div>
                <div
                  className="space-y-2 max-h-[34vh] overflow-y-auto overscroll-contain pr-1"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {selectedItem.units.map((unit) => (
                    <button
                      key={`${selectedItem.id}-${unit.id}`}
                      type="button"
                      onClick={() => unitSelectionMode !== "none" && handleToggleUnitSelection(unit.order)}
                      className="grid w-full text-left grid-cols-1 md:grid-cols-12 gap-2 rounded-xl p-3"
                      style={{
                        background: selectedUnitOrders.includes(unit.order) ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)",
                        border: selectedUnitOrders.includes(unit.order) ? "1px solid rgba(59,130,246,0.35)" : "1px solid rgba(255,255,255,0.08)",
                        cursor: unitSelectionMode === "none" ? "default" : "pointer",
                      }}
                    >
                      <div className="md:col-span-2" style={{ color: "#7a8fa8", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem" }}>
                        Unidade {unit.order}
                      </div>
                      <div className="md:col-span-5" style={{ color: "#e8edf5", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem" }}>
                        {unit.patrimonio}
                      </div>
                      <div className="md:col-span-5" style={{ color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.78rem" }}>
                        {unit.note || "Sem observação"}
                        {unit.inMaintenance && (
                          <span style={{ marginLeft: 8, color: "#fcd34d", fontWeight: 600 }}>
                            Em manutenção
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2" style={{ paddingTop: 4 }}>
                <button
                  type="button"
                  onClick={handleStartAddUnit}
                  className="px-3 py-2 rounded-xl"
                  style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.78rem", border: "1px solid rgba(59,130,246,0.3)" }}
                >
                  Adicionar nova unidade
                </button>
                <button
                  type="button"
                  onClick={() => handleStartUnitSelection("maintenance")}
                  className="px-3 py-2 rounded-xl"
                  style={{ background: "rgba(245,158,11,0.15)", color: "#fcd34d", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.78rem", border: "1px solid rgba(245,158,11,0.3)" }}
                >
                  Selecionar unidades p/ manutenção
                </button>
                <button
                  type="button"
                  onClick={() => handleStartUnitSelection("remove")}
                  className="px-3 py-2 rounded-xl"
                  style={{ background: "rgba(239,68,68,0.15)", color: "#fca5a5", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.78rem", border: "1px solid rgba(239,68,68,0.3)" }}
                >
                  Selecionar unidades p/ remover
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveEquipment(selectedItem.id)}
                  className="px-3 py-2 rounded-xl"
                  style={{ background: "rgba(239,68,68,0.05)", color: "#fca5a5", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.78rem", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  Remover equipamento inteiro
                </button>
              </div>

              {isAddingUnit && (
                <div className="rounded-xl p-3 space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p style={{ color: "#7a8fa8", fontSize: "0.74rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                    Preencha os dados da nova unidade antes de criar.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                    <input
                      value={newUnitPatrimonio}
                      onChange={(event) => setNewUnitPatrimonio(event.target.value)}
                      placeholder="Patrimônio da nova unidade"
                      className="md:col-span-5 rounded-lg px-3 py-2.5 outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#c8d6e8" }}
                    />
                    <input
                      value={newUnitNote}
                      onChange={(event) => setNewUnitNote(event.target.value)}
                      placeholder="Observação da nova unidade"
                      className="md:col-span-7 rounded-lg px-3 py-2.5 outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#c8d6e8" }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleConfirmAddUnit(selectedItem.id)}
                      className="px-3 py-2 rounded-xl"
                      style={{ background: "rgba(34,197,94,0.15)", color: "#86efac", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.78rem", border: "1px solid rgba(34,197,94,0.3)" }}
                    >
                      Confirmar nova unidade
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelAddUnit}
                      className="px-3 py-2 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)", color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.78rem", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      Cancelar nova unidade
                    </button>
                  </div>
                </div>
              )}

              {unitSelectionMode !== "none" && (
                <div className="rounded-xl p-3 space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p style={{ color: "#7a8fa8", fontSize: "0.74rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {unitSelectionMode === "maintenance"
                      ? "Selecione as unidades para alterar manutenção e clique em aplicar."
                      : "Selecione as unidades que serão removidas e clique em aplicar."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        unitSelectionMode === "maintenance"
                          ? handleApplyMaintenanceSelection(selectedItem.id)
                          : handleApplyRemoveSelection(selectedItem.id)
                      }
                      className="px-3 py-2 rounded-xl"
                      style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.78rem", border: "1px solid rgba(59,130,246,0.3)" }}
                    >
                      Aplicar nas selecionadas ({selectedUnitOrders.length})
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelUnitSelection}
                      className="px-3 py-2 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)", color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.78rem", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      Cancelar seleção
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setSelectedItemId(null);
                setUnitSelectionMode("none");
                setSelectedUnitOrders([]);
                setIsAddingUnit(false);
                setNewUnitPatrimonio("");
                setNewUnitNote("");
              }}
              className="px-4 py-2.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.05)", color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.85rem", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Fechar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}