// API Client for Golang Backend

const API_BASE = "/api/v1";

export interface Wallet {
  id: string;
  family_id: string;
  wallet_name: string;
  initial_balance: number;
  current_balance: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  family_id: string;
  segment: string;
  category_name: string;
  budget_target: number;
  total_target_cumulative: number;
  target_frequency: string;
  keywords: string[];
  icon?: string;
}

export interface Transaction {
  id: string;
  family_id: string;
  tx_date: string;
  type: string;
  category_id?: string;
  category_name?: string;
  amount: number;
  wallet_source_id?: string;
  wallet_source_name?: string;
  wallet_dest_id?: string;
  wallet_dest_name?: string;
  source_device: string;
  notes: string;
  status: string;
  created_by: string;
  legacy_id?: string;
  created_at: string;
}

export interface DashboardSummary {
  net_worth: number;
  total_income: number;
  total_expense: number;
  total_savings: number;
  savings_ratio: number;
  savings_status: string;
  month_label: string;
  wallets: Wallet[];
  recent_transactions: Transaction[];
  category_spend: Record<string, number>;
}

const clientCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 20000; // 20 detik cache segar

export function clearApiCache(prefix?: string) {
  if (!prefix) {
    clientCache.clear();
    return;
  }
  clientCache.forEach((_, key) => {
    if (key.startsWith(prefix)) {
      clientCache.delete(key);
    }
  });
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const isGet = !options?.method || options.method.toUpperCase() === "GET";
  const cacheKey = endpoint;

  if (isGet) {
    const cached = clientCache.get(cacheKey);
    const now = Date.now();
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as T;
    }
  }

  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || json.message || "Request failed");
  }

  if (isGet) {
    clientCache.set(cacheKey, { data: json.data, timestamp: Date.now() });
  } else {
    // Invalidate cache on mutations
    clearApiCache();
  }

  return json.data;
}

export interface Debt {
  id: string;
  family_id: string;
  legacy_id?: string;
  debt_date: string;
  type: string; // Utang / Piutang
  person: string;
  amount: number;
  notes: string;
  attachment_url?: string;
  status: string;
  is_installment: boolean;
  installment_due_date?: string;
  installment_duration?: string;
  installment_total: number;
  installment_paid: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  family_id: string;
  legacy_id?: string;
  name: string;
  target_amount: number;
  priority: string;
  saved_amount: number;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  family_id: string;
  action_type: string;
  actor_name: string;
  title: string;
  details: string;
  amount: number;
  source_device: string;
  created_at: string;
}

export const api = {
  getDashboard: () => request<DashboardSummary>("/dashboard"),
  
  getWallets: () => request<Wallet[]>("/wallets"),
  createWallet: (data: { wallet_name: string; initial_balance: number }) =>
    request<{ id: string }>("/wallets", { method: "POST", body: JSON.stringify(data) }),
  deleteWallet: (id: string) => request(`/wallets/${id}`, { method: "DELETE" }),

  getCategories: () => request<Record<string, Category[]>>("/categories"),
  createCategory: (data: Partial<Category>) =>
    request<{ id: string }>("/categories", { method: "POST", body: JSON.stringify(data) }),

  getTransactions: (params?: { type?: string; wallet_id?: string; month?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append("type", params.type);
    if (params?.wallet_id) searchParams.append("wallet_id", params.wallet_id);
    if (params?.month) searchParams.append("month", params.month);
    if (params?.search) searchParams.append("search", params.search);
    const qs = searchParams.toString();
    return request<Transaction[]>(`/transactions${qs ? `?${qs}` : ""}`);
  },
  
  createTransaction: (data: {
    tx_date?: string;
    type: string;
    category_id?: string;
    amount: number;
    wallet_source_id?: string;
    notes?: string;
    created_by?: string;
  }) => request<{ id: string }>("/transactions", { method: "POST", body: JSON.stringify(data) }),

  createTransfer: (data: {
    tx_date?: string;
    amount: number;
    wallet_source_id: string;
    wallet_dest_id: string;
    notes?: string;
    created_by?: string;
  }) => request<{ id: string }>("/transactions/transfer", { method: "POST", body: JSON.stringify(data) }),

  deleteTransaction: (id: string) => request(`/transactions/${id}`, { method: "DELETE" }),

  getDebts: () => request<Debt[]>("/debts"),
  createDebt: (data: Partial<Debt>) =>
    request<{ id: string }>("/debts", { method: "POST", body: JSON.stringify(data) }),
  deleteDebt: (id: string) => request(`/debts/${id}`, { method: "DELETE" }),

  getGoals: () => request<Goal[]>("/goals"),
  createGoal: (data: Partial<Goal>) =>
    request<{ id: string }>("/goals", { method: "POST", body: JSON.stringify(data) }),
  deleteGoal: (id: string) => request(`/goals/${id}`, { method: "DELETE" }),

  getActivityLogs: (actionType?: string) => {
    const qs = actionType && actionType !== "Semua" ? `?action_type=${actionType}` : "";
    return request<ActivityLog[]>(`/activity-logs${qs}`);
  },

  login: (name: string, pin: string) =>
    request<{ id: string; display_name: string; role: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ name, pin }),
    }),
  clearCache: clearApiCache,
};
