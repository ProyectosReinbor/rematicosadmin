const API_URL = "";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        const retryRes = await fetch(`${API_URL}${url}`, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.accessToken}`,
            ...options?.headers,
          },
        });

        if (!retryRes.ok) {
          const error = await retryRes.json().catch(() => ({ error: { message: "Error" } }));
          throw new Error(error.error?.message || `HTTP ${retryRes.status}`);
        }

        if (retryRes.status === 204) return undefined as T;
        return retryRes.json();
      }
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
    throw new Error("Sesión expirada");
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `HTTP ${res.status}`);
  }
  return data;
}

export interface Payment {
  id: string;
  payerName: string;
  amount: string;
  bank: string;
  reference: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStats {
  totalToday: number;
  countToday: number;
  average: number;
  max: number;
  min: number;
  lastPayment: Payment | null;
}

export interface PaymentVerification {
  id: string;
  orderNumber: string;
  customerName: string;
  expectedAmount: string;
  expectedDate: string | null;
  receivedAmount: string | null;
  receivedDate: string | null;
  transactionRef: string | null;
  notes: string | null;
  status: "PENDIENTE" | "VERIFICADA" | "DISCREPANCIA" | "RECHAZADA";
  verificationMethod: "MANUAL";
  comparisonNotes: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationStats {
  total: number;
  pendientes: number;
  verificadas: number;
  discrepancias: number;
  rechazadas: number;
  montoTotalEsperado: number;
  montoTotalRecibido: number;
}

export interface PaymentReceivedData {
  id: string;
  payerName: string;
  amount: number;
  bank: string;
  reference: string;
  status: string;
  paymentMethod: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchPayments(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ payments: Payment[]; total: number; page: number; pageSize: number }> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
  return apiRequest(`/api/payments?${searchParams}`);
}

export async function fetchStats(): Promise<PaymentStats> {
  return apiRequest("/api/payments/stats");
}

export async function fetchRecentPayments(limit = 10): Promise<Payment[]> {
  return apiRequest(`/api/payments/recent?limit=${limit}`);
}

export async function simulatePayment(data: {
  payerName: string;
  amount: number;
  bank: string;
  reference: string;
  status?: string;
}): Promise<{ success: boolean; payment: Payment }> {
  return apiRequest("/api/simulator/payment", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function simulateRandomPayment(): Promise<{ success: boolean; payment: Payment }> {
  return apiRequest("/api/simulator/random", { method: "POST" });
}

export async function fetchVerifications(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}): Promise<PaginatedResponse<PaymentVerification>> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom);
  if (params?.dateTo) searchParams.set("dateTo", params.dateTo);
  return apiRequest(`/api/verifications?${searchParams}`);
}

export async function fetchVerification(id: string): Promise<PaymentVerification> {
  return apiRequest(`/api/verifications/${id}`);
}

export async function createVerification(data: {
  orderNumber: string;
  customerName: string;
  expectedAmount: number;
  expectedDate?: string;
  receivedAmount?: number;
  receivedDate?: string;
  transactionRef?: string;
  notes?: string;
}): Promise<PaymentVerification> {
  return apiRequest("/api/verifications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateVerification(id: string, data: {
  orderNumber?: string;
  customerName?: string;
  expectedAmount?: number;
  expectedDate?: string;
  receivedAmount?: number;
  receivedDate?: string;
  transactionRef?: string;
  notes?: string;
  status?: string;
  comparisonNotes?: string;
}): Promise<PaymentVerification> {
  return apiRequest(`/api/verifications/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteVerification(id: string): Promise<void> {
  return apiRequest(`/api/verifications/${id}`, { method: "DELETE" });
}

export async function fetchVerificationStats(): Promise<VerificationStats> {
  return apiRequest("/api/verifications/stats");
}

export type ProductStatus = "DRAFT" | "PUBLISHED" | "UNAVAILABLE" | "ARCHIVED";
export interface CatalogCategory { id: string; name: string; slug: string; }
export interface OptionValueImage { id: string; value: string; imageUrl: string | null; }
export interface CatalogOption { id: string; name: string; values: OptionValueImage[]; }
export interface CatalogProduct { id: string; name: string; slug: string; description: string; details: string | null; unit: string; status: ProductStatus; isFeatured: boolean; category: CatalogCategory; images: { id: string; url: string; altText: string | null; sortOrder: number; isPrimary: boolean }[]; options: CatalogOption[]; variants: { id: string; reference: string | null; attributes: Record<string, string>; imageUrl: string | null; isAvailable: boolean }[]; }
export interface ProductInput { name: string; description: string; details?: string; unit?: string; categoryId: string; status: ProductStatus; isFeatured?: boolean; images?: { url: string; altText?: string }[]; options?: { name: string; values: { value: string; imageUrl?: string }[] }[]; }

export async function fetchCatalogCategories(): Promise<CatalogCategory[]> { return apiRequest("/api/products/categories"); }
export async function createCatalogCategory(name: string): Promise<CatalogCategory> { return apiRequest("/api/products/categories", { method: "POST", body: JSON.stringify({ name }) }); }
export async function fetchAdminProducts(): Promise<{ data: CatalogProduct[] }> { return apiRequest("/api/products/admin/list"); }
export async function createCatalogProduct(data: ProductInput): Promise<CatalogProduct> { return apiRequest("/api/products", { method: "POST", body: JSON.stringify(data) }); }
export async function updateCatalogProduct(id: string, data: Partial<ProductInput>): Promise<CatalogProduct> { return apiRequest(`/api/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }); }
export async function fullUpdateProduct(id: string, data: { name?: string; description?: string; details?: string | null; unit?: string; categoryId?: string; status?: ProductStatus; isFeatured?: boolean }): Promise<CatalogProduct> { return apiRequest(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(data) }); }
export async function deleteProduct(id: string): Promise<void> { return apiRequest(`/api/products/${id}`, { method: "DELETE" }); }
export async function addProductImages(id: string, images: { url: string; altText?: string }[]): Promise<CatalogProduct> { return apiRequest(`/api/products/${id}/images`, { method: "POST", body: JSON.stringify({ images }) }); }
export async function reorderProductImages(id: string, imageIds: string[]): Promise<CatalogProduct> { return apiRequest(`/api/products/${id}/images/reorder`, { method: "PUT", body: JSON.stringify({ imageIds }) }); }
export async function deleteProductImage(id: string, imageId: string): Promise<void> { return apiRequest(`/api/products/${id}/images/${imageId}`, { method: "DELETE" }); }
export async function addProductOption(id: string, option: { name: string; values: { value: string; imageUrl?: string }[] }): Promise<CatalogProduct> { return apiRequest(`/api/products/${id}/options`, { method: "POST", body: JSON.stringify(option) }); }
export async function updateProductOption(productId: string, optionId: string, data: { name?: string }): Promise<CatalogProduct> { return apiRequest(`/api/products/${productId}/options/${optionId}`, { method: "PUT", body: JSON.stringify(data) }); }
export async function deleteProductOption(productId: string, optionId: string): Promise<void> { return apiRequest(`/api/products/${productId}/options/${optionId}`, { method: "DELETE" }); }
export async function addOptionValue(productId: string, optionId: string, data: { value: string; imageUrl?: string }): Promise<CatalogProduct> { return apiRequest(`/api/products/${productId}/options/${optionId}/values`, { method: "POST", body: JSON.stringify(data) }); }
export async function updateOptionValue(productId: string, optionId: string, valueId: string, data: { value?: string; imageUrl?: string | null }): Promise<CatalogProduct> { return apiRequest(`/api/products/${productId}/options/${optionId}/values/${valueId}`, { method: "PUT", body: JSON.stringify(data) }); }
export async function deleteOptionValue(productId: string, optionId: string, valueId: string): Promise<void> { return apiRequest(`/api/products/${productId}/options/${optionId}/values/${valueId}`, { method: "DELETE" }); }
export async function addProductVariant(id: string, variant: { reference?: string; attributes: Record<string, string>; imageUrl?: string; isAvailable?: boolean }) { return apiRequest(`/api/products/${id}/variants`, { method: "POST", body: JSON.stringify(variant) }); }
export async function deleteProductVariant(productId: string, variantId: string): Promise<void> { return apiRequest(`/api/products/${productId}/variants/${variantId}`, { method: "DELETE" }); }

export async function uploadImages(files: File[], altText?: string): Promise<{ url: string; altText: string }[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  if (altText) formData.append("altText", altText);
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: { message: "Error al subir imágenes" } }));
    throw new Error(data.error?.message || `HTTP ${res.status}`);
  }
  return res.json();
}
