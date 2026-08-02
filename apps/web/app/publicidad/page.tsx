"use client";

import { useState, useRef, useCallback } from "react";
import {
  generateAd,
  removeBackground,
  fetchTemplates,
  fetchStyles,
  fetchAdHistory,
  deleteAdHistoryItem,
  TextLine,
  AdTemplate,
  AdStyle,
  AdHistoryItem,
} from "../lib/publicidad";

type Step = "upload" | "configure" | "generating" | "result" | "history";

const STYLE_ICONS: Record<string, string> = {
  moderno: "🎨",
  minimalista: "✨",
  premium: "👑",
  tecnologico: "💻",
  elegante: "🌹",
  oscuro: "🌙",
  claro: "☀️",
  colorido: "🌈",
  "black-friday": "🏷️",
  "cyber-monday": "⚡",
  navidad: "🎄",
  "san-valentin": "💝",
  empresarial: "💼",
  infantil: "🎈",
};

export default function PublicidadPage() {
  const [step, setStep] = useState<Step>("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [templates, setTemplates] = useState<AdTemplate[]>([]);
  const [styles, setStyles] = useState<AdStyle[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("instagram-post");
  const [selectedStyle, setSelectedStyle] = useState<string>("moderno");
  const [textLines, setTextLines] = useState<TextLine[]>([
    { text: "", fontSize: 48, fontWeight: "bold" },
  ]);
  const [removeBg, setRemoveBg] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [resultUrl, setResultUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    try {
      const [t, s] = await Promise.all([fetchTemplates(), fetchStyles()]);
      setTemplates(t);
      setStyles(s);
    } catch {
      console.error("Failed to load templates/styles");
    }
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setError("Formato no soportado. Usa JPG, PNG o WEBP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("La imagen no puede superar 10MB.");
      return;
    }

    setError("");
    setImageFile(file);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      const base64 = result.split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const startConfiguration = useCallback(async () => {
    if (!imageBase64) return;
    await loadData();
    setStep("configure");
  }, [imageBase64, loadData]);

  const handleGenerate = useCallback(async () => {
    if (!imageBase64) return;

    setStep("generating");
    setProgress(0);
    setError("");

    try {
      if (removeBg) {
        setStatusMessage("Eliminando fondo...");
        setProgress(20);
        await removeBackground({ imageBase64, mimeType });
      }

      setStatusMessage("Analizando producto...");
      setProgress(40);

      await new Promise((r) => setTimeout(r, 500));

      setStatusMessage("Generando publicidad...");
      setProgress(60);

      const result = await generateAd({
        imageBase64,
        mimeType,
        textLines: textLines.filter((t) => t.text.trim()),
        style: selectedStyle,
        template: selectedTemplate,
        removeBackground: removeBg,
      });

      setProgress(80);
      setStatusMessage("Aplicando efectos...");

      await new Promise((r) => setTimeout(r, 300));

      setProgress(100);
      setStatusMessage("Finalizando...");

      const finalUrl = result.finalUrl || result.noBgUrl || result.originalUrl;
      setResultUrl(finalUrl);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar la publicidad");
      setStep("configure");
    }
  }, [imageBase64, mimeType, textLines, selectedStyle, selectedTemplate, removeBg]);

  const addTextLine = useCallback(() => {
    setTextLines((prev) => [...prev, { text: "", fontSize: 32, fontWeight: "normal" }]);
  }, []);

  const updateTextLine = useCallback((index: number, field: keyof TextLine, value: string | number) => {
    setTextLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, [field]: value } : line))
    );
  }, []);

  const removeTextLine = useCallback((index: number) => {
    setTextLines((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback(() => {
    setStep("upload");
    setImageFile(null);
    setImagePreview("");
    setImageBase64("");
    setResultUrl("");
    setError("");
    setProgress(0);
    setStatusMessage("");
    setTextLines([{ text: "", fontSize: 48, fontWeight: "bold" }]);
  }, []);

  const downloadImage = useCallback(
    (format: string, quality: string) => {
      if (!resultUrl) return;

      const canvas = document.createElement("canvas");
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const mimeType = format === "png" ? "image/png" : format === "webp" ? "image/webp" : "image/jpeg";
          const qualityNum = quality === "low" ? 0.5 : quality === "medium" ? 0.75 : quality === "high" ? 0.92 : 1;
          const dataUrl = canvas.toDataURL(mimeType, qualityNum);
          const link = document.createElement("a");
          link.download = `publicidad-rematicos.${format}`;
          link.href = dataUrl;
          link.click();
        }
      };
      img.src = resultUrl;
    },
    [resultUrl]
  );

  const selectedStyleData = styles.find((s) => s.id === selectedStyle);
  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Publicidad IA
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Crea anuncios profesionales con inteligencia artificial
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setStep("upload"); loadData(); }}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Crear publicidad
              </button>
              <button
                onClick={() => setStep("history")}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Historial
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Step: Upload */}
        {step === "upload" && (
          <div className="max-w-2xl mx-auto">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed rounded-2xl p-12 text-center hover:border-blue-400 transition-colors bg-white dark:bg-gray-900"
            >
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-80 mx-auto rounded-lg shadow-lg"
                  />
                  <p className="text-sm text-gray-500">{imageFile?.name}</p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={startConfiguration}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                    >
                      Continuar
                    </button>
                    <button
                      onClick={reset}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Cambiar imagen
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-6xl">📸</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Sube una foto del producto
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Arrastra una imagen o usa los botones de abajo
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      JPG, PNG o WEBP - Máximo 10MB
                    </p>
                  </div>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                    >
                      Subir imagen
                    </button>
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      📷 Tomar foto
                    </button>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Step: Configure */}
        {step === "configure" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Template Selection */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Plantilla
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`p-3 rounded-lg border-2 text-left text-sm transition-all ${
                        selectedTemplate === t.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{t.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {t.width}x{t.height}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Selection */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Estilo
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {styles.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStyle(s.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedStyle === s.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{STYLE_ICONS[s.id] || "🎨"}</span>
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {s.name}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {Object.values(s.colors).map((c, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Lines */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Texto del anuncio
                  </h3>
                  <button
                    onClick={addTextLine}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Agregar línea
                  </button>
                </div>
                <div className="space-y-3">
                  {textLines.map((line, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={line.text}
                        onChange={(e) => updateTextLine(i, "text", e.target.value)}
                        placeholder={`Línea ${i + 1} - Ej: Oferta del 50%`}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                      <select
                        value={line.fontWeight}
                        onChange={(e) => updateTextLine(i, "fontWeight", e.target.value)}
                        className="px-2 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Negrita</option>
                      </select>
                      <select
                        value={line.fontSize}
                        onChange={(e) => updateTextLine(i, "fontSize", parseInt(e.target.value))}
                        className="px-2 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      >
                        <option value="24">Pequeño</option>
                        <option value="32">Mediano</option>
                        <option value="48">Grande</option>
                        <option value="64">XL</option>
                        <option value="80">XXL</option>
                      </select>
                      {textLines.length > 1 && (
                        <button
                          onClick={() => removeTextLine(i)}
                          className="px-2 py-2 text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Opciones
                </h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={removeBg}
                    onChange={(e) => setRemoveBg(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Eliminar fondo automáticamente
                    </div>
                    <div className="text-sm text-gray-500">
                      La IA removerá el fondo del producto
                    </div>
                  </div>
                </label>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!imageBase64}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generar publicidad
              </button>
            </div>

            {/* Right: Preview */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm sticky top-24">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Vista previa
                </h3>
                {imagePreview && (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Product"
                      className="w-full rounded-lg shadow"
                    />
                    {selectedStyleData && (
                      <div
                        className="p-4 rounded-lg text-center text-sm font-medium"
                        style={{
                          backgroundColor: selectedStyleData.colors.background,
                          color: selectedStyleData.colors.text,
                        }}
                      >
                        {textLines.filter((t) => t.text.trim()).map((t, i) => (
                          <div
                            key={i}
                            style={{
                              fontSize: `${t.fontSize ? t.fontSize / 3 : 16}px`,
                              fontWeight: t.fontWeight,
                              color: i === 0 ? selectedStyleData.colors.primary : selectedStyleData.colors.text,
                            }}
                          >
                            {t.text}
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedTemplateData && (
                      <div className="text-xs text-gray-500 text-center">
                        {selectedTemplateData.name} - {selectedTemplateData.width}x{selectedTemplateData.height}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step: Generating */}
        {step === "generating" && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="text-6xl mb-6">🎨</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {statusMessage}
            </h2>
            <div className="mt-6 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-4 text-sm text-gray-500">{progress}% completado</p>
          </div>
        )}

        {/* Step: Result */}
        {step === "result" && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                ¡Publicidad generada!
              </h2>
              <p className="mt-2 text-gray-500">Tu anuncio está listo para usar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Result Preview */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
                <img
                  src={resultUrl}
                  alt="Generated ad"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>

              {/* Download Options */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Descargar
                  </h3>
                  <div className="space-y-3">
                    {[
                      { format: "png", label: "PNG (Sin pérdida)", quality: "original" },
                      { format: "jpg", label: "JPG (Alta calidad)", quality: "high" },
                      { format: "jpg", label: "JPG (Calidad media)", quality: "medium" },
                      { format: "webp", label: "WebP (Comprimido)", quality: "medium" },
                    ].map((opt) => (
                      <button
                        key={`${opt.format}-${opt.quality}`}
                        onClick={() => downloadImage(opt.format, opt.quality)}
                        className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">
                          {opt.label}
                        </span>
                        <span className="text-blue-600">Descargar</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Información
                  </h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Plantilla:</dt>
                      <dd className="text-gray-900 dark:text-white font-medium">
                        {selectedTemplateData?.name}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Estilo:</dt>
                      <dd className="text-gray-900 dark:text-white font-medium">
                        {selectedStyleData?.name}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Dimensiones:</dt>
                      <dd className="text-gray-900 dark:text-white font-medium">
                        {selectedTemplateData?.width}x{selectedTemplateData?.height}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={reset}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Crear otra publicidad
                  </button>
                  <button
                    onClick={() => setStep("history")}
                    className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Ver historial
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step: History */}
        {step === "history" && (
          <HistoryView onBack={() => setStep("upload")} />
        )}
      </div>
    </div>
  );
}

function HistoryView({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<AdHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
    fetchAdHistory({ pageSize: 50 })
      .then((res) => setItems(res.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Historial de publicidades
        </h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Crear nueva
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Cargando...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-gray-500">No hay publicidades creadas aún</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden"
            >
              {item.finalUrl && (
                <img
                  src={item.finalUrl}
                  alt="Ad"
                  className="w-full aspect-square object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString("es-CO")}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {item.status}
                  </span>
                </div>
                {item.productType && (
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    {item.productType}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  {item.finalUrl && (
                    <a
                      href={item.finalUrl}
                      download
                      className="flex-1 text-center py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      Descargar
                    </a>
                  )}
                  <button
                    onClick={async () => {
                      await deleteAdHistoryItem(item.id);
                      setItems((prev) => prev.filter((i) => i.id !== item.id));
                    }}
                    className="px-3 py-2 text-sm text-red-500 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
