import { type FormEvent, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Package,
  CheckCircle2,
  Filter,
} from "lucide-react";

type MovementType = "saída" | "entrada";
type MovementStatus = "ativa" | "concluída";

type Movement = {
  id: number;
  type: MovementType;
  item: string;
  user: string;
  userInitials: string;
  userColor: string;
  date: string;
  time: string;
  status: MovementStatus;
  returnDate: string | null;
  note: string | null;
};

type KitTemplateItem = {
  id: string;
  name: string;
  defaultQuantity: number;
};

type KitTemplate = {
  id: string;
  name: string;
  items: KitTemplateItem[];
};

type MovementEquipmentRow = {
  equipmentId: string;
  equipmentName: string;
  quantityInput: string;
  units: Array<{
    patrimonio: string;
    note: string;
  }>;
};

type MovementFormData = {
  selectedKitId: string;
  viatura: string;
  operadorAudio: string;
  auxUpe: string;
  opCamera: string;
  responsavelExpedicao: string;
  note: string;
};

const initialMovements: Movement[] = [
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
    status: "ativa",
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

const kitTemplates: KitTemplate[] = [
  {
    id: "kit-reportagem",
    name: "Kit Reportagem Externa",
    items: [
      { id: "cam-a7", name: "Câmera Sony A7 III", defaultQuantity: 1 },
      { id: "bat-vmount", name: "Bateria V-Mount 150Wh", defaultQuantity: 2 },
      { id: "mic-shotgun", name: "Microfone Shotgun", defaultQuantity: 1 },
    ],
  },
  {
    id: "kit-iluminacao",
    name: "Kit Iluminação LED Arri",
    items: [
      { id: "led-arri", name: "Painel LED Arri", defaultQuantity: 2 },
      { id: "tripes-luz", name: "Tripé de iluminação", defaultQuantity: 2 },
      { id: "cabos-xlr", name: "Cabos XLR", defaultQuantity: 4 },
    ],
  },
  {
    id: "kit-documentario",
    name: "Kit Documentário Completo",
    items: [
      { id: "cam-c300", name: "Canon C300 Mark III", defaultQuantity: 1 },
      { id: "bat-npf", name: "Bateria NP-F970", defaultQuantity: 4 },
      { id: "lentes-kit", name: "Kit de lentes", defaultQuantity: 1 },
    ],
  },
];

const userPalette = ["#f97316", "#3b82f6", "#a855f7", "#22c55e", "#ef4444", "#f59e0b", "#06b6d4"];

function getUserInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "??";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getDefaultFormData(): MovementFormData {
  return {
    selectedKitId: "",
    viatura: "",
    operadorAudio: "",
    auxUpe: "",
    opCamera: "",
    responsavelExpedicao: "",
    note: "",
  };
}

function createUnits(quantity: number) {
  return Array.from({ length: quantity }, () => ({ patrimonio: "", note: "" }));
}

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
};

const TABS = [
  { value: "historico", label: "Histórico Completo" },
  { value: "saidas", label: "Todas Saídas" },
  { value: "devolucao", label: "Todas Devoluções" },
  { value: "fora", label: "Kits Fora" },

];

export default function Movements() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("historico");
  const [movementRecords, setMovementRecords] = useState<Movement[]>(initialMovements);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<MovementFormData>(getDefaultFormData);
  const [equipmentRows, setEquipmentRows] = useState<MovementEquipmentRow[]>([]);

  const handleCreateDialogChange = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      setFormData(getDefaultFormData());
      setEquipmentRows([]);
    }
  };

  const handleFormChange = <K extends keyof MovementFormData>(field: K, value: MovementFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleKitChange = (kitId: string) => {
    handleFormChange("selectedKitId", kitId);

    const selectedKit = kitTemplates.find((kit) => kit.id === kitId);
    if (!selectedKit) {
      setEquipmentRows([]);
      return;
    }

    setEquipmentRows(
      selectedKit.items.map((item) => ({
        equipmentId: item.id,
        equipmentName: item.name,
        quantityInput: String(item.defaultQuantity),
        units: createUnits(item.defaultQuantity),
      })),
    );
  };

  const handleEquipmentQuantityChange = (equipmentId: string, value: string) => {
    const sanitized = value.replace(/[^0-9]/g, "");

    setEquipmentRows((prev) =>
      prev.map((row) => {
        if (row.equipmentId !== equipmentId) {
          return row;
        }

        const quantity = sanitized === "" ? 0 : Number(sanitized);
        const currentUnits = row.units;
        const nextUnits = quantity <= currentUnits.length
          ? currentUnits.slice(0, quantity)
          : [...currentUnits, ...createUnits(quantity - currentUnits.length)];

        return {
          ...row,
          quantityInput: sanitized,
          units: nextUnits,
        };
      }),
    );
  };

  const handleEquipmentUnitChange = (
    equipmentId: string,
    unitIndex: number,
    field: "patrimonio" | "note",
    value: string,
  ) => {
    setEquipmentRows((prev) =>
      prev.map((row) =>
        row.equipmentId === equipmentId
          ? {
              ...row,
              units: row.units.map((unit, index) =>
                index === unitIndex ? { ...unit, [field]: value } : unit,
              ),
            }
          : row,
      ),
    );
  };

  const handleCreateMovement = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const now = new Date();
    const createdDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const createdTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const nextId = movementRecords.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
    const selectedKit = kitTemplates.find((kit) => kit.id === formData.selectedKitId);
    const normalizedNote = formData.note.trim();
    const equipmentDetails = equipmentRows
      .map((row) => {
        const quantity = row.quantityInput === "" ? 0 : Number(row.quantityInput);
        if (quantity <= 0) {
          return "";
        }

        const unitDetails = row.units
          .map((unit, index) => {
            const unitParts = [`#${index + 1}`];
            if (unit.patrimonio.trim()) {
              unitParts.push(`PAT: ${unit.patrimonio.trim()}`);
            }
            if (unit.note.trim()) {
              unitParts.push(`Obs: ${unit.note.trim()}`);
            }

            return unitParts.join(" | ");
          })
          .join(" ; ");

        const parts = [`${row.equipmentName} x${quantity}`];
        if (unitDetails) {
          parts.push(unitDetails);
        }

        return parts.join(" | ");
      })
      .filter(Boolean)
      .join(" || ");

    const notes = [
      formData.viatura.trim() ? `Viatura: ${formData.viatura.trim()}` : "",
      formData.operadorAudio.trim() ? `Operador de audio: ${formData.operadorAudio.trim()}` : "",
      formData.auxUpe.trim() ? `Aux. U.P.E: ${formData.auxUpe.trim()}` : "",
      formData.opCamera.trim() ? `Op. camera: ${formData.opCamera.trim()}` : "",
      equipmentDetails ? `Itens: ${equipmentDetails}` : "",
      normalizedNote,
    ]
      .filter(Boolean)
      .join(" • ");

    const newMovement: Movement = {
      id: nextId,
      type: "saída",
      item: selectedKit?.name ?? "Movimentação sem kit",
      user: formData.responsavelExpedicao.trim(),
      userInitials: getUserInitials(formData.responsavelExpedicao),
      userColor: userPalette[nextId % userPalette.length],
      date: createdDate,
      time: createdTime,
      status: "ativa",
      returnDate: null,
      note: notes || null,
    };

    setMovementRecords((prev) => [newMovement, ...prev]);
    setIsCreateDialogOpen(false);
    setFormData(getDefaultFormData());
    setEquipmentRows([]);
    setActiveTab("historico");
  };

  const handleReturnMovement = (movementId: number) => {
    const now = new Date();
    const returnDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

    setMovementRecords((prev) =>
      prev.map((movement) =>
        movement.id === movementId
          ? {
              ...movement,
              status: "concluída",
              returnDate,
            }
          : movement,
      ),
    );
  };

  const filteredMovements = movementRecords.filter((m) => {
    const matchesSearch =
      m.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "historico" ||
      (activeTab === "saidas" && m.type === "saída" && m.status === "concluída") ||
      (activeTab === "devolucao" && m.type === "entrada") ||
      (activeTab === "fora" && m.type === "saída" && m.status !== "concluída");
    return matchesSearch && matchesTab;
  });

  const tabCounts: Record<string, number> = {
    historico: movementRecords.length,
    saidas: movementRecords.filter((m) => m.type === "saída" && m.status === "concluída").length,
    devolucao: movementRecords.filter((m) => m.type === "entrada").length,
    fora: movementRecords.filter((m) => m.type === "saída" && m.status !== "concluída").length,
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
          style={{ background: "#22c55e", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.85rem" }}
        >
          <Plus className="w-4 h-4" />
          Nova Movimentação
        </motion.button>
      </motion.div>

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
              placeholder="Buscar por kit ou colaborador..."
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
              const showOperationalDetails = activeTab !== "historico";

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
                        {showOperationalDetails && mv.returnDate && (
                          <div className="text-right hidden sm:block">
                            <p style={{ color: "#4a5d78", fontSize: "0.65rem", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                              Devolução
                            </p>
                            <p style={{ color: "#7a8fa8", fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                              {new Date(mv.returnDate).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        )}

                        {showOperationalDetails && (
                          <div
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                            style={{ background: sc.bg, border: `1px solid ${sc.border}` }}
                          >
                            {sc.pulse && (
                              <span
                                className="w-1.5 h-1.5 rounded-full"
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
                        )}

                        {showOperationalDetails && mv.status === "ativa" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleReturnMovement(mv.id)}
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
              Criar Movimentação
            </DialogTitle>
            <DialogDescription style={{ color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif" }}>
              Preencha os dados da folha de saída/entrada. A integração com backend você conecta depois.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateMovement} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="space-y-1.5">
                <span style={{ fontSize: "0.75rem", color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif" }}>Viatura</span>
                <input
                  value={formData.viatura}
                  onChange={(event) => handleFormChange("viatura", event.target.value)}
                  placeholder="Ex: 210"
                  className="w-full rounded-xl px-3 py-2.5 outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#c8d6e8" }}
                />
              </label>

              <label className="space-y-1.5 md:col-span-2">
                <span style={{ fontSize: "0.75rem", color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif" }}>Kit</span>
                <select
                  required
                  value={formData.selectedKitId}
                  onChange={(event) => handleKitChange(event.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#c8d6e8" }}
                >
                  <option value="">Selecione um kit</option>
                  {kitTemplates.map((kit) => (
                    <option key={kit.id} value={kit.id}>
                      {kit.name}
                    </option>
                  ))}
                </select>
              </label>

              {equipmentRows.length > 0 && (
                <div className="md:col-span-2 space-y-2 rounded-xl p-3" style={{ border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.02)" }}>
                  <p style={{ color: "#7a8fa8", fontSize: "0.75rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                    Equipamentos do kit (campos editáveis)
                  </p>

                  {equipmentRows.map((row) => (
                    <div key={row.equipmentId} className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                        <div className="md:col-span-7 rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#c8d6e8", fontSize: "0.83rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                          {row.equipmentName}
                        </div>

                        <input
                          value={row.quantityInput}
                          inputMode="numeric"
                          onChange={(event) => handleEquipmentQuantityChange(row.equipmentId, event.target.value)}
                          placeholder="Qtd"
                          className="md:col-span-5 rounded-lg px-3 py-2.5 outline-none"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#c8d6e8" }}
                        />
                      </div>

                      {row.units.length > 0 && (
                        <div className="space-y-2 pl-2 border-l" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                          {row.units.map((unit, index) => (
                            <div key={`${row.equipmentId}-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-2">
                              <div className="md:col-span-2 rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#7a8fa8", fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace" }}>
                                Unidade {index + 1}
                              </div>

                              <input
                                value={unit.patrimonio}
                                onChange={(event) => handleEquipmentUnitChange(row.equipmentId, index, "patrimonio", event.target.value)}
                                placeholder="Patrimônio"
                                className="md:col-span-4 rounded-lg px-3 py-2.5 outline-none"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#c8d6e8" }}
                              />

                              <input
                                value={unit.note}
                                onChange={(event) => handleEquipmentUnitChange(row.equipmentId, index, "note", event.target.value)}
                                placeholder="Observação do item"
                                className="md:col-span-6 rounded-lg px-3 py-2.5 outline-none"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#c8d6e8" }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <label className="space-y-1.5">
                <span style={{ fontSize: "0.75rem", color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif" }}>Operador de audio</span>
                <input
                  value={formData.operadorAudio}
                  onChange={(event) => handleFormChange("operadorAudio", event.target.value)}
                  placeholder="Nome do operador de audio"
                  className="w-full rounded-xl px-3 py-2.5 outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#c8d6e8" }}
                />
              </label>

              <label className="space-y-1.5">
                <span style={{ fontSize: "0.75rem", color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif" }}>Aux. U.P.E</span>
                <input
                  value={formData.auxUpe}
                  onChange={(event) => handleFormChange("auxUpe", event.target.value)}
                  placeholder="Nome do auxiliar"
                  className="w-full rounded-xl px-3 py-2.5 outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#c8d6e8" }}
                />
              </label>

              <label className="space-y-1.5">
                <span style={{ fontSize: "0.75rem", color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif" }}>Op. camera</span>
                <input
                  value={formData.opCamera}
                  onChange={(event) => handleFormChange("opCamera", event.target.value)}
                  placeholder="Nome do operador de camera"
                  className="w-full rounded-xl px-3 py-2.5 outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#c8d6e8" }}
                />
              </label>

              <label className="space-y-1.5">
                <span style={{ fontSize: "0.75rem", color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif" }}>Responsavel de expedicao</span>
                <input
                  required
                  value={formData.responsavelExpedicao}
                  onChange={(event) => handleFormChange("responsavelExpedicao", event.target.value)}
                  placeholder="Nome do responsavel"
                  className="w-full rounded-xl px-3 py-2.5 outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#c8d6e8" }}
                />
              </label>

              <label className="space-y-1.5 md:col-span-2">
                <span style={{ fontSize: "0.75rem", color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif" }}>Observação</span>
                <textarea
                  rows={3}
                  value={formData.note}
                  onChange={(event) => handleFormChange("note", event.target.value)}
                  placeholder="Ex: Cobertura jornal ao vivo"
                  className="w-full rounded-xl px-3 py-2.5 outline-none resize-y"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#c8d6e8" }}
                />
              </label>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsCreateDialogOpen(false)}
                className="px-4 py-2.5 rounded-xl"
                style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.85rem" }}
              >
                Cancelar e fechar
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl"
                style={{ background: "#22c55e", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.85rem" }}
              >
                Salvar movimentação
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
