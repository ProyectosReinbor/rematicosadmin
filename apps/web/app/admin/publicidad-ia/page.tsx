"use client";

import { useState, useCallback } from "react";
import { ProductUploader } from "../../../components/publicidad/ProductUploader";
import { BackgroundRemovalPreview } from "../../../components/publicidad/BackgroundRemovalPreview";
import { AdvertisementEditor, FormatSelector } from "../../../components/publicidad/AdvertisementEditor";
import { StyleSelector } from "../../../components/publicidad/StyleSelector";
import { GeneratedAdsGallery } from "../../../components/publicidad/GeneratedAdsGallery";

type Step = "upload" | "configure" | "generating" | "result";

export default function PublicidadIAPage() {
  const [step, setStep] = useState<Step>("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [noBgPreview, setNoBgPreview] = useState<string | null>(null);
  const [noBgBase64, setNoBgBase64] = useState<string>("");

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [offer, setOffer] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("moderno");
  const [selectedFormat, setSelectedFormat] = useState("instagram");
  const [removeBg, setRemoveBg] = useState(true);

  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [isProcessingBg, setIsProcessingBg] = useState(false);

  const handleImageSelect = useCallback(async (file: File, preview: string, base64: string) => {
    setImageFile(file);
    setImagePreview(preview);
    setImageBase64(base64);
    setMimeType(file.type);
    setNoBgPreview(null);
    setNoBgBase64("");
    setError("");

    // Auto remove background
    if (removeBg) {
      try {
        setIsProcessingBg(true);
        setStatusMessage("Eliminando fondo...");
        const res = await fetch("/api/publicidad/remover-fondo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
        });

        if (res.ok) {
          const data = await res.json();
          setNoBgPreview(`data:image/png;base64,${data.imageBase64}`);
          setNoBgBase64(data.imageBase64);
        }
      } catch (err) {
        console.warn("Background removal failed:", err);
      } finally {
        setIsProcessingBg(false);
        setStatusMessage("");
      }
    }

    setStep("configure");
  }, [removeBg]);

  const handleGenerate = useCallback(async () => {
    if (!imageBase64) return;
    if (!productName.trim()) {
      setError("Ingresa el nombre del producto");
      return;
    }

    setStep("generating");
    setProgress(0);
    setError("");

    try {
      setStatusMessage("Preparando imagen...");
      setProgress(20);

      await new Promise((r) => setTimeout(r, 300));

      setStatusMessage("Generando publicidad con IA local...");
      setProgress(40);

      const res = await fetch("/api/publicidad/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: noBgBase64 || imageBase64,
          mimeType: "image/png",
          textLines: [
            { text: productName, fontSize: 56, fontWeight: "bold", color: "#FFFFFF" },
          ],
          style: selectedStyle,
          template: selectedFormat,
          removeBackground: false,
        }),
      });

      setProgress(80);
      setStatusMessage("Componiendo imagen final...");

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error generando" }));
        throw new Error(err.error || "Error generando publicidad");
      }

      const data = await res.json();
      setProgress(100);
      setStatusMessage("¡Listo!");

      const finalUrl = data.finalUrl || data.url || `data:image/png;base64,${data.image || data.imageBase64}`;
      setResultUrl(finalUrl);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar");
      setStep("configure");
    }
  }, [imageBase64, noBgBase64, productName, selectedStyle, selectedFormat]);

  const handleDownload = (format: string) => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `publicidad-rematicos.${format}`;
    link.click();
  };

  const reset = () => {
    setStep("upload");
    setImageFile(null);
    setImagePreview("");
    setImageBase64("");
    setNoBgPreview(null);
    setNoBgBase64("");
    setResultUrl("");
    setError("");
    setProductName("");
    setPrice("");
    setOffer("");
    setIsProcessingBg(false);
  };

  if (showHistory) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="bg-white dark:bg-gray-900 border-b">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Historial de publicidades
              </h1>
              <button
                onClick={() => { setShowHistory(false); reset(); }}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Crear nueva
              </button>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <GeneratedAdsGallery onBack={() => { setShowHistory(false); reset(); }} />
        </div>
      </div>
    );
  }

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
                Crea anuncios profesionales con IA open source - Sin APIs pagas
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={reset}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Crear publicidad
              </button>
              <button
                onClick={() => setShowHistory(true)}
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
            <ProductUploader onImageSelect={handleImageSelect} />
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg text-red-700 dark:text-red-400 text-sm">
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
              {/* Preview + BG Removal */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Imagen del producto
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-2">Original</div>
                    <img src={imagePreview} alt="Original" className="w-full rounded-lg shadow" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-2">Sin fondo</div>
                    {noBgPreview ? (
                      <img src={noBgPreview} alt="Sin fondo" className="w-full rounded-lg shadow" />
                    ) : (
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                        {isProcessingBg ? (
                          <div className="text-center">
                            <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-2"></div>
                            Procesando imagen...
                          </div>
                        ) : removeBg ? "Sin procesar" : "Sin procesar"}
                      </div>
                    )}
                  </div>
                </div>
                <label className="flex items-center gap-3 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={removeBg}
                    onChange={(e) => setRemoveBg(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Eliminar fondo automáticamente
                  </span>
                </label>
              </div>

              {/* Text Editor */}
              <AdvertisementEditor
                productName={productName}
                price={price}
                offer={offer}
                onProductNameChange={setProductName}
                onPriceChange={setPrice}
                onOfferChange={setOffer}
              />

              {/* Style */}
              <StyleSelector
                selectedStyle={selectedStyle}
                onStyleSelect={setSelectedStyle}
              />

              {/* Format */}
              <FormatSelector
                selectedFormat={selectedFormat}
                onFormatSelect={setSelectedFormat}
              />

              {/* Generate */}
              <button
                onClick={handleGenerate}
                disabled={!imageBase64 || !productName.trim() || isProcessingBg}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingBg ? "Procesando imagen..." : "Generar publicidad"}
              </button>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Right: Live Preview */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm sticky top-24">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Vista previa
                </h3>
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
                  {noBgPreview || imagePreview ? (
                    <img
                      src={noBgPreview || imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Sin imagen
                    </div>
                  )}
                  {productName && (
                    <div className="absolute top-4 left-4 right-4 text-center">
                      <div className="inline-block bg-black/60 text-white px-3 py-1 rounded text-sm font-bold">
                        {productName}
                      </div>
                    </div>
                  )}
                  {price && (
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                      <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-lg font-bold">
                        {price}
                      </div>
                    </div>
                  )}
                  {offer && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {offer}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step: Generating */}
        {step === "generating" && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="text-6xl mb-6 animate-pulse">🎨</div>
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
                Publicidad generada
              </h2>
              <p className="mt-2 text-gray-500">
                Tu anuncio está listo para usar - 100% open source
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Result */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
                <img src={resultUrl} alt="Generated ad" className="w-full rounded-lg shadow-lg" />
              </div>

              {/* Download */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Descargar
                  </h3>
                  <div className="space-y-3">
                    {[
                      { format: "png", label: "PNG (Sin pérdida)" },
                      { format: "jpg", label: "JPG (Calidad alta)" },
                      { format: "webp", label: "WebP (Comprimido)" },
                    ].map((opt) => (
                      <button
                        key={opt.format}
                        onClick={() => handleDownload(opt.format)}
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

                <div className="flex gap-3">
                  <button
                    onClick={reset}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Crear otra
                  </button>
                  <button
                    onClick={() => setShowHistory(true)}
                    className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Ver historial
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
