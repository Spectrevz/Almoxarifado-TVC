import { motion } from "motion/react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Package,
  Users,
  Trophy,
  Medal,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const monthlyData = [
  { month: "Out", saídas: 45, entradas: 42 },
  { month: "Nov", saídas: 52, entradas: 48 },
  { month: "Dez", saídas: 38, entradas: 40 },
  { month: "Jan", saídas: 65, entradas: 60 },
  { month: "Fev", saídas: 58, entradas: 55 },
  { month: "Mar", saídas: 72, entradas: 68 },
];

const categoryData = [
  { category: "Câmeras", movimentações: 85, utilização: 78 },
  { category: "Baterias", movimentações: 120, utilização: 92 },
  { category: "Microfones", movimentações: 65, utilização: 58 },
  { category: "Iluminação", movimentações: 45, utilização: 42 },
  { category: "Acessórios", movimentações: 95, utilização: 68 },
];

const topUsers = [
  { name: "João Silva", movimentações: 45, dept: "Jornalismo", avatar: "JS", color: "#f97316" },
  { name: "Maria Santos", movimentações: 38, dept: "Documentário", avatar: "MS", color: "#3b82f6" },
  { name: "Pedro Costa", movimentações: 32, dept: "Esportes", avatar: "PC", color: "#a855f7" },
  { name: "Ana Paula", movimentações: 28, dept: "Jornalismo", avatar: "AP", color: "#22c55e" },
  { name: "Carlos Mendes", movimentações: 25, dept: "Variedades", avatar: "CM", color: "#f59e0b" },
];

const medalColors = ["#f59e0b", "#9ca3af", "#b45309"];
const medalLabels = ["🥇", "🥈", "🥉"];

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
  const summaryStats = [
    { title: "Total Movimentações", value: "653", icon: Package, color: "#f97316", trend: "+12%" },
    { title: "Média Diária", value: "23", icon: TrendingUp, color: "#3b82f6", trend: "+8%" },
    { title: "Usuários Ativos", value: "42", icon: Users, color: "#a855f7", trend: "+5%" },
    { title: "Taxa de Ocupação", value: "68%", icon: BarChart3, color: "#22c55e", trend: "+3%" },
  ];

  const quickReports = [
    { label: "Itens em Falta", icon: Package, color: "#ef4444" },
    { label: "Equipamentos em Manutenção", icon: FileText, color: "#f59e0b" },
    { label: "Histórico Completo", icon: BarChart3, color: "#3b82f6" },
    { label: "Usuários Ativos", icon: Users, color: "#a855f7" },
    { label: "Kits Mais Utilizados", icon: Trophy, color: "#f97316" },
    { label: "Devoluções Pendentes", icon: ArrowUpRight, color: "#22c55e" },
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
            <div className="w-2 h-2 rounded-full" style={{ background: "#f59e0b" }} />
            <span style={{ color: "#f59e0b", fontSize: "0.7rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Relatórios
            </span>
          </div>
          <h1 style={{ color: "#e8edf5", fontSize: "1.6rem", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.025em" }}>
            Análises & Estatísticas
          </h1>
          <p style={{ color: "#4a5d78", fontSize: "0.82rem", fontFamily: "'Space Grotesk', sans-serif" }}>
            Dados dos últimos 6 meses de operação
          </p>
        </div>
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

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.08, type: "spring" }}
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl overflow-hidden relative"
            style={{
              background: "#0d1221",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: stat.color, opacity: 0.6 }}
            />
            <div className="flex items-start justify-between mb-4">
              <p style={{ color: "#4a5d78", fontSize: "0.7rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {stat.title}
              </p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
            <p style={{ color: "#e8edf5", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "1.7rem", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 8 }}>
              {stat.value}
            </p>
            <div
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
            >
              <TrendingUp className="w-3 h-3" style={{ color: "#22c55e" }} />
              <span style={{ color: "#22c55e", fontSize: "0.7rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                {stat.trend} vs mês ant.
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Area chart - Monthly */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="p-5 rounded-2xl"
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

        {/* Bar chart - Category */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-5 rounded-2xl"
          style={{ background: "#0d1221", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 style={{ color: "#e8edf5", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.95rem" }}>
                Por Categoria
              </h3>
              <p style={{ color: "#4a5d78", fontSize: "0.75rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                Movimentações vs Utilização
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoryData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fill: "#4a5d78", fontSize: 10, fontFamily: "'Space Grotesk', sans-serif" }}
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
              <Bar dataKey="movimentações" fill="#3b82f6" radius={[6, 6, 0, 0]} opacity={0.9} />
              <Bar dataKey="utilização" fill="#a855f7" radius={[6, 6, 0, 0]} opacity={0.9} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Top Users — Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="lg:col-span-3 p-5 rounded-2xl"
          style={{ background: "#0d1221", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.15)" }}>
              <Trophy className="w-4 h-4" style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <h3 style={{ color: "#e8edf5", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.95rem" }}>
                Colaboradores Mais Ativos
              </h3>
              <p style={{ color: "#4a5d78", fontSize: "0.75rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                Ranking por movimentações no mês
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {topUsers.map((user, index) => (
              <motion.div
                key={user.name}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.08 }}
                className="flex items-center gap-4 p-3 rounded-xl group"
                style={{
                  background: index < 3 ? `${user.color}06` : "rgba(255,255,255,0.02)",
                  border: index < 3 ? `1px solid ${user.color}15` : "1px solid rgba(255,255,255,0.04)",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = index < 3 ? `${user.color}06` : "rgba(255,255,255,0.02)")}
              >
                {/* Rank */}
                <div className="w-8 text-center flex-shrink-0">
                  {index < 3 ? (
                    <span style={{ fontSize: "1rem" }}>{medalLabels[index]}</span>
                  ) : (
                    <span style={{ color: "#4a5d78", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", fontWeight: 700 }}>
                      #{index + 1}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${user.color}20`, border: `1px solid ${user.color}35` }}
                >
                  <span style={{ color: user.color, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "0.72rem" }}>
                    {user.avatar}
                  </span>
                </div>

                {/* Name + dept */}
                <div className="flex-1 min-w-0">
                  <p style={{ color: "#c8d6e8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.87rem" }}>
                    {user.name}
                  </p>
                  <p style={{ color: "#4a5d78", fontSize: "0.72rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {user.dept}
                  </p>
                </div>

                {/* Count + bar */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-20 hidden sm:block">
                    <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(user.movimentações / 50) * 100}%` }}
                        transition={{ delay: 0.7 + index * 0.08, duration: 0.7, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: user.color }}
                      />
                    </div>
                  </div>
                  <span style={{ color: user.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "0.9rem", minWidth: 30, textAlign: "right" }}>
                    {user.movimentações}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 p-5 rounded-2xl"
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
