import { type CSSProperties, type FormEvent, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Package,
  CheckCircle2,
  Filter,
  X,
  Clock,
  ChevronRight,
} from "lucide-react";
import {
  createMovimentacao,
  finalizeMovimentacao,
  listKits,
  listMovements,
  type ApiMovementEvent,
  type ApiKit,
} from "~/lib/api";

type MovementType = "saída" | "entrada";
type MovementStatus = "ativa" | "concluída";

type Movement = {
  id: number;
  type: MovementType;
  item: string;
  user: string;
  userColor: string;
  date: string;
  time: string;
  status: MovementStatus;
  returnDate: string | null;
  note: string | null;
};

type KitTemplateItem = {
  id: number;
  name: string;
  defaultQuantity: number;
  unitCatalog: Array<{
    id: number;
    patrimonio: string;
  }>;
};

type KitTemplate = {
  id: number;
  name: string;
  items: KitTemplateItem[];
};

type MovementEquipmentRow = {
  equipmentId: number;
  equipmentName: string;
  quantityInput: string;
  unitCatalog: Array<{
    id: number;
    patrimonio: string;
  }>;
  units: Array<{
    patrimonio: string;
    unidadeInventarioId?: number;
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

type ReturnFormData = {
  responsavelRetorno: string;
};

const userPalette = ["#f97316", "#3b82f6", "#a855f7", "#22c55e", "#ef4444", "#f59e0b", "#06b6d4"];

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

function getDefaultReturnFormData(): ReturnFormData {
  return {
    responsavelRetorno: "",
  };
}

function createUnits(
  quantity: number,
  prefills: Array<{ id: number; patrimonio: string }> = [],
) {
  return Array.from({ length: quantity }, (_, index) => ({
    patrimonio: prefills[index]?.patrimonio ?? "",
    unidadeInventarioId: prefills[index]?.id,
    note: "",
  }));
}

function truncateTo255(value: string) {
  if (value.length <= 255) {
    return value;
  }

  return value.slice(0, 255);
}

function mapKitsToTemplates(kits: ApiKit[]): KitTemplate[] {
  return kits.map((kit) => ({
    id: kit.id,
    name: kit.nome,
    items: kit.itens.map((item) => ({
      id: item.id,
      name: item.inventario?.nome ?? `Item ${item.id}`,
      defaultQuantity: Math.max(1, item.quantidade ?? 1),
      unitCatalog:
        item.inventario?.unidades?.map((unit) => ({
          id: unit.id,
          patrimonio: unit.patrimonio,
        })) ?? [],
    })),
  }));
}

function getMovementQuery(tab: string) {
  if (tab === "saidas") {
    return { type: "saída" as const, status: "concluída" as const };
  }

  if (tab === "devolucao") {
    return { type: "entrada" as const };
  }

  if (tab === "fora") {
    return { type: "saída" as const, status: "ativa" as const };
  }

  return undefined;
}

function mapMovements(data: ApiMovementEvent[]): Movement[] {
  return data.map((movement) => ({
    id: movement.id,
    type: movement.type,
    item: movement.item,
    user: movement.user,
    userColor: userPalette[movement.id % userPalette.length],
    date: movement.date,
    time: movement.time ?? "--:--",
    status: movement.status,
    returnDate: movement.returnDate,
    note: movement.note,
  }));
}

async function fetchMovements(tab: string): Promise<Movement[]> {
  const data = await listMovements(getMovementQuery(tab));
  return mapMovements(data);
}

const typeConfig = {
  saída: {
    label: "Saída",
    icon: ArrowUpRight,
    color: "#fb923c",
    dimColor: "#f9731620",
    border: "rgba(249,115,22,0.2)",
    glow: "rgba(249,115,22,0.15)",
    tag: "rgba(249,115,22,0.12)",
  },
  entrada: {
    label: "Entrada",
    icon: ArrowDownLeft,
    color: "#4ade80",
    dimColor: "#22c55e20",
    border: "rgba(34,197,94,0.2)",
    glow: "rgba(34,197,94,0.12)",
    tag: "rgba(34,197,94,0.12)",
  },
};

const statusConfig = {
  ativa: { label: "Ativa", color: "#60a5fa", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.22)", pulse: true },
  concluída: { label: "Concluída", color: "#4ade80", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", pulse: false },
};

const TABS = [
  { value: "historico", label: "Histórico" },
  { value: "saidas", label: "Saídas" },
  { value: "devolucao", label: "Devoluções" },
  { value: "fora", label: "Kits Fora" },

];

const inputStyle: CSSProperties = {
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#d4e0f0",
  fontFamily: "'DM Mono', 'JetBrains Mono', monospace",
  fontSize: "0.84rem",
  borderRadius: "10px",
  padding: "10px 14px",
  width: "100%",
  outline: "none",
  transition: "border-color 0.18s",
};

const labelStyle: CSSProperties = {
  fontSize: "0.68rem",
  color: "#4a6080",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: 6,
  display: "block",
};

function Avatar({ name, id }: { name: string; id: number }) {
  const color = userPalette[id % userPalette.length];
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: `${color}22`,
        border: `1.5px solid ${color}44`,
        color,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 700,
        fontSize: "0.8rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function Movements() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [dateFilterStart, setDateFilterStart] = useState("");
  const [dateFilterEnd, setDateFilterEnd] = useState("");
  const [activeTab, setActiveTab] = useState("historico");
  const [kitTemplates, setKitTemplates] = useState<KitTemplate[]>([]);
  const [movementRecords, setMovementRecords] = useState<Movement[]>([]);
  const [allMovementRecords, setAllMovementRecords] = useState<Movement[]>([]);
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({
    historico: 0,
    saidas: 0,
    devolucao: 0,
    fora: 0,
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [formData, setFormData] = useState<MovementFormData>(getDefaultFormData);
  const [returnFormData, setReturnFormData] = useState<ReturnFormData>(getDefaultReturnFormData);
  const [equipmentRows, setEquipmentRows] = useState<MovementEquipmentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [returnMovementId, setReturnMovementId] = useState<number | null>(null);

  const loadMovementsForTab = async (tab: string) => {
    setLoading(true);

    try {
      setErrorMessage(null);
      const data = await fetchMovements(tab);
      setMovementRecords(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao buscar movimentos.");
      setMovementRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshTabCounts = async () => {
    try {
      const [historico, saidas, devolucao, fora] = await Promise.all([
        listMovements(),
        listMovements(getMovementQuery("saidas")),
        listMovements(getMovementQuery("devolucao")),
        listMovements(getMovementQuery("fora")),
      ]);

      setAllMovementRecords(mapMovements(historico));
      setTabCounts({
        historico: historico.length,
        saidas: saidas.length,
        devolucao: devolucao.length,
        fora: fora.length,
      });
    } catch {
      setTabCounts({
        historico: 0,
        saidas: 0,
        devolucao: 0,
        fora: 0,
      });
    }
  };

  useEffect(() => {
    const loadKits = async () => {
      try {
        const kits = await listKits();
        setKitTemplates(mapKitsToTemplates(kits));
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Erro ao buscar kits.");
      }
    };

    void loadKits();
    void refreshTabCounts();
  }, []);

  useEffect(() => {
    void loadMovementsForTab(activeTab);
  }, [activeTab]);

  const runMovementMutation = async (operation: () => Promise<void>) => {
    setIsSaving(true);

    try {
      setErrorMessage(null);
      await operation();
      await Promise.all([loadMovementsForTab(activeTab), refreshTabCounts()]);
      return true;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Falha ao atualizar movimentação.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateDialogChange = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      setFormData(getDefaultFormData());
      setEquipmentRows([]);
    }
  };

  const handleReturnDialogChange = (open: boolean) => {
    setIsReturnDialogOpen(open);
    if (!open) {
      setReturnFormData(getDefaultReturnFormData());
      setReturnMovementId(null);
    }
  };

  const handleFormChange = <K extends keyof MovementFormData>(field: K, value: MovementFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleKitChange = (kitId: string) => {
    handleFormChange("selectedKitId", kitId);

    const selectedKit = kitTemplates.find((kit) => kit.id === Number(kitId));
    if (!selectedKit) {
      setEquipmentRows([]);
      return;
    }

    setEquipmentRows(
      selectedKit.items.map((item) => ({
        equipmentId: item.id,
        equipmentName: item.name,
        quantityInput: String(item.defaultQuantity),
        unitCatalog: item.unitCatalog,
        units: createUnits(item.defaultQuantity, item.unitCatalog),
      })),
    );
  };

  const handleEquipmentUnitChange = (
    equipmentId: number,
    unitIndex: number,
    field: "patrimonio" | "note",
    value: string,
  ) => {
    setEquipmentRows((prev) =>
      prev.map((row) =>
        row.equipmentId === equipmentId
          ? {
              ...row,
              units: row.units.map((unit, index) => {
                if (index !== unitIndex) {
                  return unit;
                }

                if (field === "patrimonio") {
                  const trimmed = value.trim();
                  const matched = row.unitCatalog.find(
                    (catalogUnit) => catalogUnit.patrimonio === trimmed,
                  );

                  return {
                    ...unit,
                    patrimonio: value,
                    unidadeInventarioId: matched?.id,
                  };
                }

                return { ...unit, note: value };
              }),
            }
          : row,
      ),
    );
  };

  const handleCreateMovement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const kitId = Number(formData.selectedKitId);
    if (!Number.isFinite(kitId) || kitId < 1) {
      return;
    }

    const now = new Date();
    const createdDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const createdTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const normalizedNote = formData.note.trim();
    const notes = [
      formData.viatura.trim() ? `Viatura: ${formData.viatura.trim()}` : "",
      formData.operadorAudio.trim() ? `Operador de audio: ${formData.operadorAudio.trim()}` : "",
      formData.auxUpe.trim() ? `Aux. U.P.E: ${formData.auxUpe.trim()}` : "",
      formData.opCamera.trim() ? `Op. camera: ${formData.opCamera.trim()}` : "",
      normalizedNote,
    ]
      .filter(Boolean)
      .join(" • ");

    const itens = equipmentRows.flatMap((row) =>
      row.units
        .filter((unit) => Number.isFinite(unit.unidadeInventarioId))
        .map((unit) => ({
          kitItemId: row.equipmentId,
          unidadeInventarioId: unit.unidadeInventarioId as number,
        })),
    );

    const created = await runMovementMutation(async () => {
      await createMovimentacao({
        kitId,
        dataSaida: createdDate,
        horaSaida: createdTime,
        responsavelSaida: formData.responsavelExpedicao.trim() || undefined,
        observacao: notes ? truncateTo255(notes) : undefined,
        itens: itens.length > 0 ? itens : undefined,
      });
    });

    if (created) {
      setIsCreateDialogOpen(false);
      setFormData(getDefaultFormData());
      setEquipmentRows([]);

      if (activeTab !== "historico") {
        setActiveTab("historico");
      }
    }
  };

  const openMovementDetails = (movement: Movement) => {
    setSelectedMovement(movement);
    setIsDetailsDialogOpen(true);
  };

  const closeMovementDetails = () => {
    setIsDetailsDialogOpen(false);
    setSelectedMovement(null);
  };

  const openReturnDialog = (movementId: number) => {
    setReturnMovementId(movementId);
    setIsReturnDialogOpen(true);
  };

  const handleConfirmReturn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!returnMovementId) {
      return;
    }

    const movimentacaoId = Math.floor(returnMovementId / 10);
    if (!Number.isFinite(movimentacaoId) || movimentacaoId < 1) {
      return;
    }

    const saved = await runMovementMutation(async () => {
      await finalizeMovimentacao(movimentacaoId, {
        responsavelRetorno: returnFormData.responsavelRetorno.trim(),
      });
    });

    if (saved) {
      setIsReturnDialogOpen(false);
      setReturnFormData(getDefaultReturnFormData());
      setReturnMovementId(null);
    }
  };

  const filteredMovements = movementRecords.filter((m) => {
    const matchesSearch =
      m.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) {
      return false;
    }

    if (!dateFilterStart && !dateFilterEnd) {
      return true;
    }

    const movementDate = new Date(`${m.date}T00:00:00`);
    const startDate = dateFilterStart ? new Date(`${dateFilterStart}T00:00:00`) : null;
    const endDate = dateFilterEnd ? new Date(`${dateFilterEnd}T23:59:59`) : null;

    if (Number.isNaN(movementDate.getTime())) {
      return false;
    }

    if (startDate && movementDate < startDate) {
      return false;
    }

    if (endDate && movementDate > endDate) {
      return false;
    }

    return true;
  });

  const getPairedEvent = (movement: Movement, type: MovementType) => {
    const movimentacaoId = Math.floor(movement.id / 10);
    const dataset = allMovementRecords.length > 0 ? allMovementRecords : movementRecords;
    return dataset.find(
      (record) => Math.floor(record.id / 10) === movimentacaoId && record.type === type,
    );
  };

  const showOperationalDetails = activeTab !== "historico";

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >


        <motion.button
          whileHover={{ scale: 1.03, boxShadow: "0 0 22px rgba(34,197,94,0.28)" }}
          whileTap={{ scale: 0.96 }}
          disabled={isSaving}
          onClick={() => setIsCreateDialogOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 18px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "#fff",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: "0.83rem",
            border: "none",
            cursor: "pointer",
            opacity: isSaving ? 0.6 : 1,
            boxShadow: "0 2px 12px rgba(34,197,94,0.2)",
          }}
        >
          <Plus size={15} strokeWidth={2.5} />
          Nova Movimentação
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: "rgba(239,68,68,0.07)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 10,
              padding: "10px 14px",
              color: "#fca5a5",
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.78rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ flex: 1 }}>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              style={{ background: "none", border: "none", color: "#fca5a5", cursor: "pointer" }}
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: "#080f1d",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#2e4560",
                pointerEvents: "none",
              }}
            />
            <input
              placeholder="Buscar kit ou colaborador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                ...inputStyle,
                paddingLeft: 36,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(34,197,94,0.35)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
            />
          </div>
          <button
            onClick={() => setDateFilterOpen((prev) => !prev)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 14px",
              borderRadius: 10,
              background: dateFilterStart || dateFilterEnd ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.03)",
              border: dateFilterStart || dateFilterEnd ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.07)",
              color: dateFilterStart || dateFilterEnd ? "#7ff0a2" : "#3d5470",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.78rem",
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <Filter size={13} />
            <Calendar size={13} />
            Filtrar por data
          </button>
        </div>
        {dateFilterOpen && (
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "end",
            }}
          >
            <label style={{ minWidth: 160, flex: "0 1 180px" }}>
              <span style={labelStyle}>Data inicial</span>
              <input
                type="date"
                value={dateFilterStart}
                onChange={(event) => setDateFilterStart(event.target.value)}
                style={inputStyle}
              />
            </label>
            <label style={{ minWidth: 160, flex: "0 1 180px" }}>
              <span style={labelStyle}>Data final</span>
              <input
                type="date"
                value={dateFilterEnd}
                onChange={(event) => setDateFilterEnd(event.target.value)}
                style={inputStyle}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setDateFilterStart("");
                setDateFilterEnd("");
              }}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#6b7f99",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                height: 38,
              }}
            >
              Limpar
            </button>
          </div>
        )}

        <div style={{ display: "flex", overflowX: "auto", scrollbarWidth: "none", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "12px 18px",
                  whiteSpace: "nowrap",
                  background: "transparent",
                  border: "none",
                  borderBottom: active ? "2px solid #22c55e" : "2px solid transparent",
                  color: active ? "#d4e0f0" : "#2e4560",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: active ? 700 : 400,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  transition: "color 0.15s, border-color 0.15s",
                }}
              >
                {tab.label}
                <span
                  style={{
                    padding: "1px 7px",
                    borderRadius: 6,
                    background: active ? "rgba(34,197,94,0.13)" : "rgba(255,255,255,0.04)",
                    color: active ? "#4ade80" : "#2e4560",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.63rem",
                    fontWeight: 700,
                  }}
                >
                  {tabCounts[tab.value]}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ padding: "12px" }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 0",
                gap: 12,
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "2.5px solid rgba(34,197,94,0.15)",
                  borderTopColor: "#22c55e",
                }}
              />
              <span style={{ color: "#2e4560", fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem" }}>
                Carregando...
              </span>
            </div>
          ) : filteredMovements.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "64px 0",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.03)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 4,
                }}
              >
                <Package size={20} style={{ color: "#1e3050" }} />
              </div>
              <p
                style={{
                  color: "#c8d6e8",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  margin: 0,
                }}
              >
                Nenhuma movimentação
              </p>
              <p
                style={{
                  color: "#2e4560",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.78rem",
                  margin: 0,
                }}
              >
                Ajuste os filtros ou crie uma nova
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredMovements.map((mv, index) => {
                const tc = typeConfig[mv.type];
                const sc = statusConfig[mv.status];
                const TypeIcon = tc.icon;
                return (
                  <motion.div
                    key={mv.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: index * 0.04, type: "spring", stiffness: 280, damping: 26 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "11px 13px",
                      borderRadius: 13,
                      marginBottom: 6,
                      background: "rgba(255,255,255,0.018)",
                      border: "1px solid rgba(255,255,255,0.045)",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                      transition: "background 0.13s, border-color 0.13s",
                    }}
                    onClick={() => openMovementDetails(mv)}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.035)";
                      (e.currentTarget as HTMLElement).style.borderColor = tc.border;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.018)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.045)";
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "20%",
                        bottom: "20%",
                        width: 3,
                        borderRadius: "0 3px 3px 0",
                        background: tc.color,
                        opacity: 0.7,
                      }}
                    />

                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        flexShrink: 0,
                        background: tc.dimColor,
                        border: `1px solid ${tc.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <TypeIcon size={16} style={{ color: tc.color }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          color: "#dce8f5",
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 700,
                          fontSize: "0.87rem",
                          margin: 0,
                          marginBottom: 3,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {mv.item}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ color: "#5a7898", fontFamily: "'DM Sans', sans-serif", fontSize: "0.76rem" }}>
                            {mv.user}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={11} style={{ color: "#243550" }} />
                          <span style={{ color: "#243550", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem" }}>
                            {new Date(mv.date).toLocaleDateString("pt-BR")} · {mv.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      {showOperationalDetails && mv.returnDate && (
                        <div className="hidden sm:block" style={{ textAlign: "right" }}>
                          <p
                            style={{
                              color: "#243550",
                              fontSize: "0.6rem",
                              fontFamily: "'DM Sans', sans-serif",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              margin: 0,
                            }}
                          >
                            Devolução
                          </p>
                          <p
                            style={{
                              color: "#5a7898",
                              fontFamily: "'DM Mono', monospace",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              margin: 0,
                            }}
                          >
                            {new Date(mv.returnDate).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      )}

                      {showOperationalDetails && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "4px 10px",
                            borderRadius: 8,
                            background: sc.bg,
                            border: `1px solid ${sc.border}`,
                          }}
                        >
                          {sc.pulse && (
                            <span
                              style={{ width: 6, height: 6, borderRadius: "50%", background: sc.color, display: "inline-block" }}
                            />
                          )}
                          {mv.status === "concluída" && <CheckCircle2 size={11} style={{ color: sc.color }} />}
                          <span
                            style={{
                              color: sc.color,
                              fontSize: "0.7rem",
                              fontFamily: "'DM Sans', sans-serif",
                              fontWeight: 700,
                            }}
                          >
                            {sc.label}
                          </span>
                        </div>
                      )}

                      {showOperationalDetails && mv.status === "ativa" && (
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          disabled={isSaving}
                          onClick={(event) => {
                            event.stopPropagation();
                            openReturnDialog(mv.id);
                          }}
                          style={{
                            padding: "5px 12px",
                            borderRadius: 8,
                            cursor: "pointer",
                            background: "rgba(34,197,94,0.09)",
                            border: "1px solid rgba(34,197,94,0.22)",
                            color: "#4ade80",
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            opacity: isSaving ? 0.6 : 1,
                          }}
                        >
                          Devolver
                        </motion.button>
                      )}

                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          openMovementDetails(mv);
                        }}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 9,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          color: "#3d5470",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                          transition: "color 0.13s, background 0.13s",
                        }}
                        onMouseEnter={(event) => {
                          (event.currentTarget as HTMLElement).style.color = "#c8d6e8";
                          (event.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                        }}
                        onMouseLeave={(event) => {
                          (event.currentTarget as HTMLElement).style.color = "#3d5470";
                          (event.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                        }}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogChange}>
        <DialogContent
          className="sm:max-w-2xl max-h-[90vh] overflow-y-auto overscroll-contain"
          onInteractOutside={(event) => event.preventDefault()}
          style={{ background: "#060d1b", border: "1px solid rgba(255,255,255,0.08)", color: "#c8d6e8", padding: 0 }}
        >
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "rgba(34,197,94,0.12)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={15} style={{ color: "#4ade80" }} />
              </div>
              <div>
                <h2
                  style={{
                    color: "#e2ecf8",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "1rem",
                    margin: 0,
                  }}
                >
                  Criar Movimentação
                </h2>
                <p style={{ color: "#3d5470", fontFamily: "'DM Sans', sans-serif", fontSize: "0.76rem", margin: "2px 0 0" }}>
                  Preencha os dados da folha de saída
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateMovement}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ padding: "20px 24px" }}>
              <label className="md:col-span-2">
                <span style={labelStyle}>Kit *</span>
                <select
                  required
                  value={formData.selectedKitId}
                  onChange={(event) => handleKitChange(event.target.value)}
                  style={{ ...inputStyle, appearance: "none" }}
                  onFocus={(event) => (event.currentTarget.style.borderColor = "rgba(34,197,94,0.4)")}
                  onBlur={(event) => (event.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                >
                  <option value="" style={{ background: "#060d1b" }}>
                    Selecione um kit
                  </option>
                  {kitTemplates.map((kit) => (
                    <option key={kit.id} value={kit.id} style={{ background: "#060d1b" }}>
                      {kit.name}
                    </option>
                  ))}
                </select>
              </label>

              {equipmentRows.length > 0 && (
                <div
                  className="md:col-span-2"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <p style={{ ...labelStyle, marginBottom: 12 }}>Equipamentos do kit</p>
                  {equipmentRows.map((row) => (
                    <div key={row.equipmentId} style={{ marginBottom: 12 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, marginBottom: 8 }}>
                        <div style={{ ...inputStyle, color: "#8aa0bc", background: "rgba(255,255,255,0.02)" }}>
                          {row.equipmentName}
                        </div>
                        <input value={row.quantityInput} readOnly style={{ ...inputStyle, width: 64, textAlign: "center" }} />
                      </div>
                      {row.units.length > 0 && (
                        <div style={{ paddingLeft: 12, borderLeft: "2px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: 6 }}>
                          {row.units.map((unit, index) => (
                            <div
                              key={`${row.equipmentId}-${index}`}
                              style={{ display: "grid", gridTemplateColumns: "auto 1fr 2fr", gap: 6, alignItems: "center" }}
                            >
                              <span
                                style={{ color: "#243550", fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", whiteSpace: "nowrap" }}
                              >
                                #{index + 1}
                              </span>
                              <input
                                value={unit.patrimonio}
                                readOnly
                                placeholder="Patrimônio"
                                style={{ ...inputStyle, background: "rgba(255,255,255,0.02)", color: "#8aa0bc" }}
                              />
                              <input
                                value={unit.note}
                                onChange={(event) => handleEquipmentUnitChange(row.equipmentId, index, "note", event.target.value)}
                                placeholder="Observação"
                                style={inputStyle}
                                onFocus={(event) => (event.currentTarget.style.borderColor = "rgba(34,197,94,0.35)")}
                                onBlur={(event) => (event.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <label>
                <span style={labelStyle}>Viatura</span>
                <input
                  value={formData.viatura}
                  onChange={(event) => handleFormChange("viatura", event.target.value)}
                  placeholder="Ex: 210"
                  style={inputStyle}
                  onFocus={(event) => (event.currentTarget.style.borderColor = "rgba(34,197,94,0.35)")}
                  onBlur={(event) => (event.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </label>

              <label>
                <span style={labelStyle}>Responsável expedição *</span>
                <input
                  required
                  value={formData.responsavelExpedicao}
                  onChange={(event) => handleFormChange("responsavelExpedicao", event.target.value)}
                  placeholder="Nome"
                  style={inputStyle}
                  onFocus={(event) => (event.currentTarget.style.borderColor = "rgba(34,197,94,0.35)")}
                  onBlur={(event) => (event.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </label>

              <label>
                <span style={labelStyle}>Operador de áudio</span>
                <input
                  value={formData.operadorAudio}
                  onChange={(event) => handleFormChange("operadorAudio", event.target.value)}
                  placeholder="Nome"
                  style={inputStyle}
                  onFocus={(event) => (event.currentTarget.style.borderColor = "rgba(34,197,94,0.35)")}
                  onBlur={(event) => (event.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </label>

              <label>
                <span style={labelStyle}>Aux. U.P.E</span>
                <input
                  value={formData.auxUpe}
                  onChange={(event) => handleFormChange("auxUpe", event.target.value)}
                  placeholder="Nome"
                  style={inputStyle}
                  onFocus={(event) => (event.currentTarget.style.borderColor = "rgba(34,197,94,0.35)")}
                  onBlur={(event) => (event.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </label>

              <label>
                <span style={labelStyle}>Op. câmera</span>
                <input
                  value={formData.opCamera}
                  onChange={(event) => handleFormChange("opCamera", event.target.value)}
                  placeholder="Nome"
                  style={inputStyle}
                  onFocus={(event) => (event.currentTarget.style.borderColor = "rgba(34,197,94,0.35)")}
                  onBlur={(event) => (event.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </label>

              <label className="md:col-span-2">
                <span style={labelStyle}>Observação</span>
                <textarea
                  rows={3}
                  value={formData.note}
                  onChange={(event) => handleFormChange("note", event.target.value)}
                  placeholder="Ex: Cobertura jornal ao vivo"
                  style={{ ...inputStyle, resize: "vertical" }}
                  onFocus={(event) => (event.currentTarget.style.borderColor = "rgba(34,197,94,0.35)")}
                  onBlur={(event) => (event.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </label>
            </div>

            <div
              style={{
                padding: "14px 24px 20px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isSaving}
                style={{
                  padding: "9px 18px",
                  borderRadius: 10,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#5a7898",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.83rem",
                  cursor: "pointer",
                  opacity: isSaving ? 0.6 : 1,
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  padding: "9px 20px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  color: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.83rem",
                  border: "none",
                  cursor: "pointer",
                  opacity: isSaving ? 0.6 : 1,
                  boxShadow: "0 2px 12px rgba(34,197,94,0.22)",
                }}
              >
                {isSaving ? "Salvando..." : "Salvar movimentação"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={closeMovementDetails}>
        <DialogContent
          className="sm:max-w-md max-h-[88vh] overflow-y-auto overscroll-contain"
          hideClose
          style={{ background: "#060d1b", border: "1px solid rgba(255,255,255,0.08)", color: "#c8d6e8", padding: 0 }}
        >
          {selectedMovement && (() => {
            const tc = typeConfig[selectedMovement.type];
            const sc = statusConfig[selectedMovement.status];
            const TypeIcon = tc.icon;
            return (
              <>
                <div
                  style={{
                    padding: "20px 20px 18px",
                    background: `linear-gradient(135deg, ${tc.color}10 0%, transparent 55%)`,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: `linear-gradient(90deg, ${tc.color}, transparent)`,
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          background: tc.dimColor,
                          border: `1px solid ${tc.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <TypeIcon size={18} style={{ color: tc.color }} />
                      </div>
                      <div>
                        <p
                          style={{
                            color: "#e2ecf8",
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 700,
                            fontSize: "0.97rem",
                            margin: 0,
                          }}
                        >
                          {selectedMovement.item}
                        </p>
                        <p style={{ color: "#243550", fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", margin: "3px 0 0" }}>
                          ID #{selectedMovement.id}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 7,
                          background: tc.tag,
                          border: `1px solid ${tc.border}`,
                          color: tc.color,
                          fontSize: "0.67rem",
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                        }}
                      >
                        {tc.label}
                      </span>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 7,
                          background: sc.bg,
                          border: `1px solid ${sc.border}`,
                          color: sc.color,
                          fontSize: "0.67rem",
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        {sc.pulse && <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.color }} />}
                        {selectedMovement.status === "concluída" && <CheckCircle2 size={10} style={{ color: sc.color }} />}
                        {sc.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      {
                        label: "Data de saída",
                        event: selectedMovement.type === "entrada"
                          ? getPairedEvent(selectedMovement, "saída")
                          : selectedMovement,
                        color: "#dce8f5",
                        bg: "rgba(255,255,255,0.03)",
                        border: "rgba(255,255,255,0.06)",
                      },
                      selectedMovement.returnDate
                        ? {
                            label: "Devolução",
                            event: selectedMovement.type === "entrada"
                              ? selectedMovement
                              : getPairedEvent(selectedMovement, "entrada"),
                            color: "#4ade80",
                            bg: "rgba(34,197,94,0.04)",
                            border: "rgba(34,197,94,0.12)",
                          }
                        : null,
                    ].map((item, index) =>
                      item ? (
                        <div
                          key={`date-${item.label}`}
                          style={{ borderRadius: 12, padding: "12px 14px", background: item.bg, border: `1px solid ${item.border}` }}
                        >
                          <p style={{ ...labelStyle, marginBottom: 6 }}>{item.label}</p>
                          <p
                            style={{
                              color: item.color,
                              fontFamily: "'DM Mono', monospace",
                              fontWeight: 700,
                              fontSize: "0.9rem",
                              margin: 0,
                            }}
                          >
                            {item.event ? new Date(item.event.date).toLocaleDateString("pt-BR") : "--/--/----"}
                          </p>
                          <p style={{ color: "#3d5470", fontFamily: "'DM Mono', monospace", fontSize: "0.73rem", margin: "3px 0 0" }}>
                            {item.event?.time ?? "--:--"}
                          </p>
                        </div>
                      ) : (
                        <div
                          key={`date-${index}`}
                          style={{ borderRadius: 12, padding: "12px 14px", background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}
                        >
                          <p style={{ ...labelStyle, marginBottom: 6 }}>Devolução</p>
                          <p style={{ color: "#60a5fa", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.85rem", margin: 0 }}>
                            Pendente
                          </p>
                          <p style={{ color: "#243550", fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", margin: "3px 0 0" }}>
                            em aberto
                          </p>
                        </div>
                      ),
                    )}
                  </div>

                  <div
                    style={{
                      borderRadius: 12,
                      padding: "12px 14px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Avatar name={selectedMovement.user} id={selectedMovement.id} />
                    <div>
                      <p style={{ ...labelStyle, marginBottom: 2 }}>Responsável pela expedição</p>
                      <p
                        style={{
                          color: "#dce8f5",
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 600,
                          fontSize: "0.87rem",
                          margin: 0,
                        }}
                      >
                        {selectedMovement.user}
                      </p>
                    </div>
                  </div>

                  {selectedMovement.note && (() => {
                    const parts = selectedMovement.note.split(" • ");
                    const knownPrefixes = ["Viatura:", "Operador de audio:", "Aux. U.P.E:", "Op. camera:"];
                    const structured: { label: string; value: string }[] = [];
                    let freeNote = "";

                    for (const part of parts) {
                      const matched = knownPrefixes.find((prefix) => part.startsWith(prefix));
                      if (matched) {
                        structured.push({ label: matched.replace(":", ""), value: part.slice(matched.length).trim() });
                      } else {
                        freeNote = part.trim();
                      }
                    }

                    return (
                      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ padding: "9px 14px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <p style={labelStyle}>Observação</p>
                        </div>
                        {structured.map((item, index) => (
                          <div
                            key={item.label}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "9px 14px",
                              borderBottom: index < structured.length - 1 || freeNote ? "1px solid rgba(255,255,255,0.04)" : "none",
                              background: "rgba(255,255,255,0.015)",
                            }}
                          >
                            <span style={{ color: "#3d5470", fontSize: "0.76rem", fontFamily: "'DM Sans', sans-serif" }}>
                              {item.label}
                            </span>
                            <span style={{ color: "#c8d6e8", fontSize: "0.82rem", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
                              {item.value}
                            </span>
                          </div>
                        ))}
                        {freeNote && (
                          <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.01)" }}>
                            <p style={{ ...labelStyle, marginBottom: 6 }}>Nota livre</p>
                            <p
                              style={{
                                color: "#c8d6e8",
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: "0.83rem",
                                lineHeight: 1.65,
                                margin: 0,
                              }}
                            >
                              {freeNote}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div style={{ padding: "12px 20px 18px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={closeMovementDetails}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 10,
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.09)",
                      color: "#5a7898",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: "0.83rem",
                      cursor: "pointer",
                    }}
                  >
                    Fechar
                  </button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={isReturnDialogOpen} onOpenChange={handleReturnDialogChange}>
        <DialogContent
          className="sm:max-w-sm"
          onInteractOutside={(event) => event.preventDefault()}
          style={{ background: "#060d1b", border: "1px solid rgba(255,255,255,0.08)", color: "#c8d6e8", padding: 0 }}
        >
          <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ArrowDownLeft size={15} style={{ color: "#4ade80" }} />
              </div>
              <div>
                <h2
                  style={{
                    color: "#e2ecf8",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.97rem",
                    margin: 0,
                  }}
                >
                  Confirmar devolução
                </h2>
                <p style={{ color: "#3d5470", fontFamily: "'DM Sans', sans-serif", fontSize: "0.74rem", margin: "2px 0 0" }}>
                  Informe quem recebeu o equipamento
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleConfirmReturn}>
            <div style={{ padding: "18px 22px" }}>
              <label>
                <span style={labelStyle}>Responsável pelo recebimento *</span>
                <input
                  required
                  value={returnFormData.responsavelRetorno}
                  onChange={(event) => setReturnFormData({ responsavelRetorno: event.target.value })}
                  placeholder="Nome do responsável"
                  style={inputStyle}
                  onFocus={(event) => (event.currentTarget.style.borderColor = "rgba(34,197,94,0.4)")}
                  onBlur={(event) => (event.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </label>
            </div>
            <div style={{ padding: "12px 22px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsReturnDialogOpen(false)}
                disabled={isSaving}
                style={{
                  padding: "9px 16px",
                  borderRadius: 10,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "#5a7898",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.83rem",
                  cursor: "pointer",
                  opacity: isSaving ? 0.6 : 1,
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  padding: "9px 18px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  color: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.83rem",
                  border: "none",
                  cursor: "pointer",
                  opacity: isSaving ? 0.6 : 1,
                  boxShadow: "0 2px 10px rgba(34,197,94,0.2)",
                }}
              >
                {isSaving ? "Salvando..." : "Confirmar devolução"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
