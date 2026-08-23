const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImage(base64Data: string, mimeType?: string): ImageValidationResult {
  if (!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Tipo de imagen no permitido. Use: ${ALLOWED_MIME_TYPES.join(", ")}`,
    };
  }

  const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
  if (sizeInBytes > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `La imagen excede el tamaño máximo de ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`,
    };
  }

  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  const dataWithoutPrefix = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
  if (!base64Regex.test(dataWithoutPrefix)) {
    return {
      valid: false,
      error: "Los datos de la imagen no son base64 válido",
    };
  }

  return { valid: true };
}
