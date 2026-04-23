import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  Boxes,
  ArrowRightLeft,
  BarChart3,
  Menu,
  X,
  Settings,
} from "lucide-react";

const menuItems = [
  { path: "/", icon: BarChart3, label: "Relatórios", color: "#f97316", glow: "rgba(249,115,22,0.2)" },
  { path: "/movimentacoes", icon: ArrowRightLeft, label: "Movimentações", color: "#22c55e", glow: "rgba(34,197,94,0.2)" },
  { path: "/inventario", icon: Package, label: "Inventário", color: "#3b82f6", glow: "rgba(59,130,246,0.2)" },
  { path: "/kits", icon: Boxes, label: "Kits", color: "#a855f7", glow: "rgba(168,85,247,0.2)" },
];

const pageTitles: Record<string, string> = {
  "/": "Relatórios",
  "/inventario": "Inventário",
  "/kits": "Kits",
  "/movimentacoes": "Movimentações",
  "/configuracoes": "Configurações",
};

const pageColors: Record<string, string> = {
  "/": "#f97316",
  "/movimentacoes": "#22c55e",
  "/inventario": "#3b82f6",
  "/kits": "#a855f7",
  "/configuracoes": "#6b7f99",
};

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const formatDate = (d: Date) =>
    d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });

  const currentTitle = pageTitles[location.pathname] ?? "Almoxarifado";
  const currentItem = menuItems.find(
    (m) => m.path === location.pathname || (m.path !== "/" && location.pathname.startsWith(m.path))
  );

  const renderSidebarContent = (isCollapsed: boolean, allowCollapse: boolean, closeMobileMenu: boolean) => (
    <>
      {/* Linha vertical */}
      {currentItem && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ background: currentItem.color }}
        />
      )}

      {/* Logo */}
      <div
        className="flex items-center h-16 px-4 gap-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <button
          type="button"
          onClick={() => {
            if (allowCollapse) {
              setCollapsed((prev) => !prev);
              return;
            }

            setMobileMenuOpen(false);
          }}
          className="relative flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
        >
          <img src="/logo.png" alt="Logo" className="w-9 h-9" />
        </button>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p
                className="leading-none"
                style={{
                  color: "#e8edf5",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                }}
              >
                Almoxarifado
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!allowCollapse && (
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-[#7a8fa8] hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav vertical*/}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.06, type: "spring", stiffness: 300, damping: 28 }}
          >
            <NavLink
              to={item.path}
              end={item.path === "/"}
              className="block"
              onClick={() => {
                if (closeMobileMenu) {
                  setMobileMenuOpen(false);
                }
              }}
            >
              {({ isActive }) => (
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative flex items-center gap-3 rounded-xl transition-all duration-200 overflow-hidden"
                  style={{
                    padding: isCollapsed ? "10px 12px" : "10px 14px",
                    background: isActive ? item.glow : "transparent",
                    borderLeft: isActive ? `3px solid ${item.color}` : "3px solid transparent",
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: `radial-gradient(ellipse at left center, ${item.glow} 0%, transparent 70%)` }}
                    />
                  )}
                  <item.icon
                    className="flex-shrink-0 w-5 h-5 relative z-10 transition-all duration-200"
                    style={{ color: isActive ? item.color : "#4a5d78" }}
                  />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.15 }}
                        className="relative z-10 whitespace-nowrap"
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: isActive ? 600 : 400,
                          fontSize: "0.9rem",
                          color: isActive ? "#e8edf5" : "#4a5d78",
                        }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Divisor inferior*/}
      {!isCollapsed && <div className="mx-3 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />}

      {/* Categoria inferior */}
      <div className="px-3 py-3 space-y-1">
        {/* Configurações */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-1 overflow-hidden"
            >
              <NavLink
                to="/configuracoes"
                onClick={() => {
                  if (closeMobileMenu) {
                    setMobileMenuOpen(false);
                  }
                }}
                className={({ isActive }) =>
                  `flex items-center gap-2 flex-1 rounded-lg px-3 py-2 transition-all duration-150 overflow-hidden ${
                    isActive ? "bg-white/10 text-white" : "hover:bg-white/5"
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive ? "#c8d6e8" : "#4a5d78",
                  fontSize: "0.78rem",
                  fontFamily: "'Space Grotesk', sans-serif",
                  borderLeft: isActive ? "3px solid #6b7f99" : "3px solid transparent",
                })}
              >
                <Settings className="w-3.5 h-3.5" />
                Configurações
              </NavLink>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );

  return (
    <div className="flex h-[100dvh] overflow-hidden" style={{ background: "#07090e" }}>
      {/* Sidebar desktop */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 264 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="relative hidden lg:flex flex-col h-full flex-shrink-0 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #060a12 0%, #08101c 100%)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {renderSidebarContent(collapsed, true, false)}
      </motion.aside>

      {/* Sidebar mobile/tablet */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Fechar menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-40 w-64 flex flex-col overflow-hidden lg:hidden"
              style={{
                background: "linear-gradient(180deg, #060a12 0%, #08101c 100%)",
                borderRight: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {renderSidebarContent(false, false, true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Area principal */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header
          className="flex-shrink-0 h-16 flex items-center px-3 sm:px-4 lg:px-6 gap-2 sm:gap-4"
          style={{
            background: "#07090e",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center border"
            style={{ borderColor: "rgba(255,255,255,0.08)", color: "#c8d6e8", background: "rgba(255,255,255,0.03)" }}
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Nome da pagina atual */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {pageColors[location.pathname] && (
              <div
                className="w-1 h-6 rounded-full flex-shrink-0"
                style={{ background: pageColors[location.pathname] }}
              />
            )}
            <div className="min-w-0">
              <motion.h2
                key={currentTitle}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: "clamp(0.95rem, 1.8vw, 1.05rem)",
                  color: "#e8edf5",
                  lineHeight: 1.2,
                }}
              >
                {currentTitle}
              </motion.h2>
            </div>
          </div>

          {/* Botões da direita*/}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* relogio */}
            <div
              className="hidden sm:flex px-3 py-1.5 rounded-lg items-center gap-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse-live"
                style={{ background: "#22c55e" }}
              />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.9rem",
                  color: "#c8d6e8",
                  letterSpacing: "0.04em",
                }}
              >
                {formatTime(time)}
              </span>
            </div>

            {/* Data */}
            <span className="hidden md:block" style={{ color: "#4a5d78", fontSize: "0.9rem", fontFamily: "'Space Grotesk', sans-serif" }}>
              {formatDate(time)}
            </span>
          </div>
        </header>
        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-5 lg:p-6 flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              className="w-full max-w-7xl"
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
