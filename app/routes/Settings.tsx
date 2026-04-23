import { useState } from "react";
import { motion } from "motion/react";
import { Settings as SettingsIcon, Save, X } from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState({
    theme: "dark",
    notifications: true,
    autoSave: true,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    console.log("Configurações salvas:", settings);
  };

  const settingsGroups = [
    {
      title: "Aparência",
      settings: [
        {
          key: "theme",
          label: "Tema",
          type: "select",
          options: [
            { value: "dark", label: "Escuro" },
            { value: "light", label: "Claro" },
            { value: "auto", label: "Automático" },
          ],
        },
      ],
    },
    {
      title: "Notificações",
      settings: [
        {
          key: "notifications",
          label: "Ativar notificações",
          type: "toggle",
        },
      ],
    },
    {
      title: "Comportamento",
      settings: [
        {
          key: "autoSave",
          label: "Salvamento automático",
          type: "toggle",
        },
      ],
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl">
      {/* Settings Groups */}
      <div className="space-y-5">
        {settingsGroups.map((group, groupIndex) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#0d1221",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Group Header */}
            <div
              className="px-6 py-4"
              style={{
                background: "linear-gradient(135deg, rgba(168,85,247,0.06) 0%, transparent 50%)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <h2
                style={{
                  color: "#e8edf5",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                }}
              >
                {group.title}
              </h2>
            </div>

            {/* Settings Items */}
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {group.settings.map((setting, settingIndex) => (
                <div key={setting.key} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <label
                      style={{
                        color: "#c8d6e8",
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 500,
                        fontSize: "0.9rem",
                      }}
                    >
                      {setting.label}
                    </label>
                  </div>

                  {setting.type === "toggle" && (
                    <button
                      onClick={() =>
                        handleSettingChange(setting.key, !settings[setting.key as keyof typeof settings])
                      }
                      className="relative w-12 h-6 rounded-full transition-all"
                      style={{
                        background: settings[setting.key as keyof typeof settings]
                          ? "#a855f7"
                          : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <motion.div
                        layout
                        className="absolute top-1 w-4 h-4 rounded-full"
                        style={{
                          background: "#fff",
                          left: settings[setting.key as keyof typeof settings] ? "calc(100% - 20px)" : "4px",
                        }}
                      />
                    </button>
                  )}

                  {setting.type === "select" && (
                    <select
                      value={settings[setting.key as keyof typeof settings]}
                      onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                      className="rounded-lg px-3 py-2 outline-none"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#c8d6e8",
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: "0.85rem",
                      }}
                    >
                      {setting.options?.map((option) => (
                        <option key={option.value} value={option.value} style={{ background: "#0d1221", color: "#c8d6e8" }}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 pt-4"
      >
        <button
          onClick={handleSave}
          className="flex items-center gap-2 w-full sm:flex-1 px-4 py-3 rounded-xl justify-center transition-all"
          style={{
            background: "rgba(168,85,247,0.15)",
            border: "1px solid rgba(168,85,247,0.3)",
            color: "#a855f7",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: "0.85rem",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(168,85,247,0.25)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(168,85,247,0.15)";
          }}
        >
          <Save className="w-4 h-4" />
          Salvar Alterações
        </button>

        <button
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 rounded-xl transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#4a5d78",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: "0.85rem",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}
