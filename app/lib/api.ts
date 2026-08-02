const API_URL = "";

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

export interface PaymentReceivedData {
  id: string;
  payerName: string;
  amount: number;
  bank: string;
  reference: string;
  status: string;
  paymentMethod: string;
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

  const res = await fetch(`${API_URL}/api/payments?${searchParams}`);
  if (!res.ok) throw new Error("Failed to fetch payments");
  return res.json();
}

export async function fetchStats(): Promise<PaymentStats> {
  const res = await fetch(`${API_URL}/api/payments/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function fetchRecentPayments(limit = 10): Promise<Payment[]> {
  const res = await fetch(`${API_URL}/api/payments/recent?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch recent payments");
  return res.json();
}

export async function simulatePayment(data: {
  payerName: string;
  amount: number;
  bank: string;
  reference: string;
  status?: string;
}): Promise<{ success: boolean; payment: Payment }> {
  const res = await fetch(`${API_URL}/api/simulator/payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to simulate payment");
  return res.json();
}

export async function simulateRandomPayment(): Promise<{ success: boolean; payment: Payment }> {
  const res = await fetch(`${API_URL}/api/simulator/random`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to simulate random payment");
  return res.json();
}

export async function fetchSettings(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_URL}/api/settings`);
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

export async function updateSettings(settings: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${API_URL}/api/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error("Failed to update settings");
}