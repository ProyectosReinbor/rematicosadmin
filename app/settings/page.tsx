"use client";

import { useEffect, useState } from "react";
import { fetchSettings, updateSettings } from "./lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings().then(setSettings).catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Configuración</h1>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border p-6">
            <h2 className="font-semibold mb-4">Empresa</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de la empresa</label>
                <input
                  type="text"
                  value={(settings.companyName as string) || "Adornos Remático Villavicencio"}
                  onChange={(e) => updateSetting("companyName", e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border p-6">
            <h2 className="font-semibold mb-4">Voz</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mensaje de voz</label>
                <textarea
                  value={(settings.voiceMessage as string) || "{{nombre}}, tu pago ha sido recibido. Gracias por comprar aquí. Que tengas un excelente día."}
                  onChange={(e) => updateSetting("voiceMessage", e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Velocidad</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={(settings.voiceSpeed as number) || 1.0}
                    onChange={(e) => updateSetting("voiceSpeed", parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-500">{(settings.voiceSpeed as number) || 1.0}x</span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Volumen</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={(settings.voiceVolume as number) || 1.0}
                    onChange={(e) => updateSetting("voiceVolume", parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-500">{((settings.voiceVolume as number) || 1.0) * 100}%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Idioma</label>
                <select
                  value={(settings.voiceLanguage as string) || "es-CO"}
                  onChange={(e) => updateSetting("voiceLanguage", e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-800"
                >
                  <option value="es-CO">Español (Colombia)</option>
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border p-6">
            <h2 className="font-semibold mb-4">Apariencia</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Modo oscuro</span>
                <button
                  onClick={() => updateSetting("darkMode", !settings.darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.darkMode ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.darkMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors"
          >
            {saving ? "Guardando..." : saved ? "Guardado ✓" : "Guardar configuración"}
          </button>
        </div>
      </div>
    </div>
  );
}