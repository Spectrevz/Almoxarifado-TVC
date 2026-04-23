import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Package,
  Users,
  Trophy,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  Clock,
  ChevronRight,
  Boxes,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { listKits, listMovements, type ApiKit, type ApiMovementEvent } from "~/lib/api";

type RecentMovement = {
  id: number;
  type: "saída" | "entrada" | "alerta";
  item: string;
  user: string;
  time: string;
  color: string;
};

function getMonthLabel(date: Date) {
  return date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
}

function composeDateTime(event: ApiMovementEvent) {
  return `${event.date} ${event.time ?? "00:00:00"}`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{
        background: "#0d1221",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <p style={{ color: "#4a5d78", fontSize: "0.72rem", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: "#c8d6e8", fontSize: "0.8rem", fontFamily: "'Space Grotesk', sans-serif" }}>
            {p.name}: <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.value}</strong>
          </span>
        </div>
      ))}
    </div>
  );
};

export default function Reports() {
  const navigate = useNavigate();
  const [movementEvents, setMovementEvents] = useState<ApiMovementEvent[]>([]);
  const [kits, setKits] = useState<ApiKit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      try {
        setErrorMessage(null);
        const [movementData, kitsData] = await Promise.all([
          listMovements(),
          listKits(),
        ]);
        setMovementEvents(movementData);
        setKits(kitsData);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Falha ao carregar relatórios.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, []);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const lastSixMonths = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        month: getMonthLabel(date),
        saídas: 0,
        entradas: 0,
      };
    });

    const monthlyMap = new Map(lastSixMonths.map((entry) => [entry.key, entry]));

    for (const event of movementEvents) {
      const date = new Date(event.date);
      if (Number.isNaN(date.getTime())) {
        continue;
      }

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const target = monthlyMap.get(key);
      if (!target) {
        continue;
      }

      if (event.type === "saída") {
        target.saídas += 1;
      } else {
        target.entradas += 1;
      }
    }

    return Array.from(monthlyMap.values());
  }, [movementEvents]);

  const recentMovements = useMemo<RecentMovement[]>(() => {
    return movementEvents
      .slice()
      .sort((left, right) => composeDateTime(right).localeCompare(composeDateTime(left)))
      .slice(0, 5)
      .map((event) => {
        const isAlert = event.type === "saída" && event.status === "ativa";
        const mappedType: RecentMovement["type"] = isAlert ? "alerta" : event.type;
        const color =
          mappedType === "entrada"
            ? "#22c55e"
            : mappedType === "alerta"
              ? "#ef4444"
              : "#f97316";

        return {
          id: event.id,
          type: mappedType,
          item: event.item,
          user: event.user,
          time: event.time ?? "--:--",
          color,
        };
      });
  }, [movementEvents]);

  const quickActions = [
    { label: "Nova Saída", icon: ArrowUpRight, color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.2)", path: "/movimentacoes", onClick: () => navigate("/movimentacoes") },
    { label: "Nova Entrada", icon: ArrowDownLeft, color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)", path: "/movimentacoes", onClick: () => navigate("/movimentacoes") },
    { label: "Criar Kit", icon: Boxes, color: "#a855f7", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.2)", path: "/kits", onClick: () => navigate("/kits") },
    { label: "Relatório", icon: Zap, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", path: "/", onClick: () => navigate("/") },
  ];

  const quickReports = [
    { label: "Itens em Falta", icon: Package, color: "#ef4444" },
    { label: "Equipamentos em Manutenção", icon: FileText, color: "#f59e0b" },
    { label: "Histórico Completo", icon: BarChart3, color: "#3b82f6" },
    { label: "Usuários Ativos", icon: Users, color: "#a855f7" },
    { label: "Kits Mais Utilizados", icon: Trophy, color: "#f97316" },
    { label: "Devoluções Pendentes", icon: ArrowUpRight, color: "#22c55e" },
  ];

  const activeOut = movementEvents.filter((event) => event.type === "saída" && event.status === "ativa").length;
  const availableKits = kits.length > 0
    ? Math.max(0, kits.length - activeOut)
    : movementEvents.filter((event) => event.type === "entrada").length;

  const statusStats = [
    {
      label: "Kits disponíveis",
      value: availableKits,
      color: "#22c55e",
      icon: ArrowDownLeft,
    },
    {
      label: "Kits fora",
      value: activeOut,
      color: "#f97316",
      icon: ArrowUpRight,
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl">
      {/* Header 
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ background: "#f59e0b", color: "#000", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.85rem" }}
        >
          <Download className="w-4 h-4" />
          Exportar
        </motion.button>
      </motion.div>
*/}
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

      {isLoading && !errorMessage && (
        <div
          className="rounded-xl px-4 py-3"
          style={{
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.22)",
            color: "#93c5fd",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "0.82rem",
          }}
        >
          Carregando dados do relatório...
        </div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="w-full rounded-2xl p-4 sm:p-5"
        style={{ background: "#0d1221", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p style={{ color: "#4a5d78", fontSize: "0.72rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
          Ações Rápidas
        </p>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.06, type: "spring", stiffness: 280 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.onClick}
              className="relative flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-left overflow-hidden group"
              style={{
                background: action.bg,
                border: `1px solid ${action.border}`,
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at 30% 50%, ${action.color}14 0%, transparent 70%)` }}
              />
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 relative z-10"
                style={{ background: `${action.color}20`, border: `1px solid ${action.color}30` }}
              >
                <action.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: action.color }} />
              </div>
              <span
                className="relative z-10 text-[0.78rem] sm:text-[0.85rem] leading-tight"
                style={{ color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
              >
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Area chart - Monthly */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="p-4 sm:p-5 rounded-2xl"
          style={{ background: "#0d1221", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 style={{ color: "#e8edf5", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.95rem" }}>
                Movimentações Mensais
              </h3>
              <p style={{ color: "#4a5d78", fontSize: "0.75rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                Saídas vs Entradas · Últimos 6 meses
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gradSaidas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#4a5d78", fontSize: 11, fontFamily: "'Space Grotesk', sans-serif" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#4a5d78", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.78rem", color: "#4a5d78" }}
              />
              <Area
                type="monotone"
                dataKey="saídas"
                stroke="#f97316"
                strokeWidth={2.5}
                fill="url(#gradSaidas)"
                dot={{ fill: "#f97316", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#f97316" }}
              />
              <Area
                type="monotone"
                dataKey="entradas"
                stroke="#22c55e"
                strokeWidth={2.5}
                fill="url(#gradEntradas)"
                dot={{ fill: "#22c55e", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#22c55e" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status blocks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 sm:p-5 rounded-2xl"
          style={{ background: "#0d1221", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 style={{ color: "#e8edf5", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.95rem" }}>
                Status dos Kits
              </h3>
              <p style={{ color: "#4a5d78", fontSize: "0.75rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                Disponibilidade atual
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
            {statusStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.08 + index * 0.07, type: "spring" }}
                whileHover={{ y: -3 }}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl min-h-[90px] sm:min-h-[104px]"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <p className="text-[0.62rem] sm:text-[0.7rem] leading-tight" style={{ color: "#4a5d78", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    {stat.label}
                  </p>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                    <stat.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-[1.25rem] sm:text-[1.6rem]" style={{ color: "#e8edf5", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, lineHeight: 1 }}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
        {/* Top Users — Leaderboard */}
                {/* Activity timeline — takes 3 cols */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45 }}
          className="lg:col-span-3 rounded-2xl p-4 sm:p-5"
          style={{ background: "#0d1221", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
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


        {/* Quick Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 p-4 sm:p-5 rounded-2xl"
          style={{ background: "#0d1221", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)" }}>
              <FileText className="w-4 h-4" style={{ color: "#3b82f6" }} />
            </div>
            <div>
              <h3 style={{ color: "#e8edf5", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.95rem" }}>
                Relatórios Rápidos
              </h3>
              <p style={{ color: "#4a5d78", fontSize: "0.75rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                Gerar exportações
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {quickReports.map((report, index) => (
              <motion.button
                key={report.label}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.65 + index * 0.07 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = `${report.color}08`;
                  (e.currentTarget as HTMLElement).style.borderColor = `${report.color}25`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)";
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${report.color}15` }}
                >
                  <report.icon className="w-3.5 h-3.5" style={{ color: report.color }} />
                </div>
                <span
                  className="flex-1"
                  style={{ color: "#7a8fa8", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.82rem", fontWeight: 500 }}
                >
                  {report.label}
                </span>
                <Download className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#4a5d78" }} />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
