"use client";

interface BackgroundRemovalPreviewProps {
  originalPreview: string;
  noBgPreview: string | null;
  isProcessing: boolean;
  progress: number;
}

export function BackgroundRemovalPreview({
  originalPreview,
  noBgPreview,
  isProcessing,
  progress,
}: BackgroundRemovalPreviewProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        Eliminación de fondo
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Original */}
        <div>
          <div className="text-xs font-medium text-gray-500 mb-2">Original</div>
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <img
              src={originalPreview}
              alt="Original"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Sin fondo */}
        <div>
          <div className="text-xs font-medium text-gray-500 mb-2">Sin fondo</div>
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
            {noBgPreview ? (
              <img
                src={noBgPreview}
                alt="Sin fondo"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                {isProcessing ? (
                  <div className="text-center">
                    <div className="animate-spin text-2xl mb-2">⚙️</div>
                    <div>Procesando...</div>
                    <div className="text-xs mt-1">{progress}%</div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-2xl mb-2">✨</div>
                    <div>Sin fondo</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
