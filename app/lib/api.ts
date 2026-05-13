const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3001/api").replace(/\/$/, "");

type QueryValue = string | number | boolean | null | undefined;

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === null || value === undefined || value === "") {
        continue;
      }

      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  query?: Record<string, QueryValue>,
): Promise<T> {
  const response = await fetch(buildUrl(path, query), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export type ApiUnidadeInventario = {
  id: number;
  inventarioId: number;
  patrimonio: string;
  status: string;
  observacao?: string | null;
};

export type ApiInventario = {
  id: number;
  nome: string;
  categoria: string;
  observacao?: string | null;
  unidades: ApiUnidadeInventario[];
};

export type ApiKitItem = {
  id: number;
  kitId: number;
  inventarioId: number;
  quantidade: number;
  inventario: ApiInventario;
};

export type ApiKit = {
  id: number;
  nome: string;
  descricao?: string | null;
  usando: boolean;
  itens: ApiKitItem[];
};

export type ApiMovementEvent = {
  id: number;
  type: "saída" | "entrada";
  item: string;
  user: string;
  date: string;
  time: string | null;
  status: "ativa" | "concluída";
  returnDate: string | null;
  note: string | null;
};

export type ApiMovimentacaoItem = {
  id: number;
  movimentacaoId: number;
  kitItemId: number;
  unidadeInventarioId: number;
  kitItem?: ApiKitItem;
  unidadeInventario?: ApiUnidadeInventario;
};

export type ApiMovimentacao = {
  id: number;
  kitId: number;
  dataSaida: string;
  horaSaida?: string | null;
  dataDevolucao?: string | null;
  horaDevolucao?: string | null;
  responsavelSaida?: string | null;
  responsavelRetorno?: string | null;
  observacao?: string | null;
  kit?: ApiKit;
  itens: ApiMovimentacaoItem[];
};

export type CreateInventarioPayload = {
  nome: string;
  categoria: string;
  observacao?: string;
  unidades: Array<{
    patrimonio: string;
    status?: string;
    observacao?: string;
  }>;
};

export type CreateMovimentacaoPayload = {
  kitId: number;
  dataSaida: string;
  horaSaida?: string;
  responsavelSaida?: string;
  observacao?: string;
  itens?: Array<{
    kitItemId: number;
    unidadeInventarioId: number;
  }>;
};

export type CreateKitPayload = {
  nome: string;
  descricao?: string;
  itens?: Array<{
    inventarioId: number;
    quantidade?: number;
  }>;
};

export type UpdateKitPayload = {
  nome?: string;
  descricao?: string;
  usando?: boolean;
  itens?: Array<{
    inventarioId: number;
    quantidade?: number;
  }>;
};

export async function listInventario() {
  return apiRequest<ApiInventario[]>("/inventario", { method: "GET" });
}

export async function createInventario(payload: CreateInventarioPayload) {
  return apiRequest<ApiInventario>("/inventario", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteInventario(id: number) {
  return apiRequest<{ deleted: boolean }>(`/inventario/${id}`, {
    method: "DELETE",
  });
}

export async function createUnidadeInventario(payload: {
  inventarioId: number;
  patrimonio: string;
  status?: string;
  observacao?: string;
}) {
  return apiRequest<ApiUnidadeInventario>("/inventario/unidades", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUnidadeInventario(
  id: number,
  payload: {
    inventarioId?: number;
    patrimonio?: string;
    status?: string;
    observacao?: string;
  },
) {
  return apiRequest<ApiUnidadeInventario>(`/inventario/unidades/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteUnidadeInventario(id: number) {
  return apiRequest<{ deleted: boolean }>(`/inventario/unidades/${id}`, {
    method: "DELETE",
  });
}

export async function listKits() {
  return apiRequest<ApiKit[]>("/kits", { method: "GET" });
}

export async function createKit(payload: CreateKitPayload) {
  return apiRequest<ApiKit>("/kits", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateKit(id: number, payload: UpdateKitPayload) {
  return apiRequest<ApiKit>(`/kits/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function createKitItem(payload: {
  kitId: number;
  inventarioId: number;
  quantidade: number;
}) {
  return apiRequest<ApiKitItem>("/kits/itens", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateKitItem(
  id: number,
  payload: {
    kitId?: number;
    inventarioId?: number;
    quantidade?: number;
  },
) {
  return apiRequest<ApiKitItem>(`/kits/itens/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteKitItem(id: number) {
  return apiRequest<{ deleted: boolean }>(`/kits/itens/${id}`, {
    method: "DELETE",
  });
}

export async function listMovements(query?: {
  type?: "saida" | "saída" | "entrada";
  status?: "ativa" | "concluida" | "concluída";
  search?: string;
}) {
  return apiRequest<ApiMovementEvent[]>("/movements", { method: "GET" }, query);
}

export async function listMovimentacoes() {
  return apiRequest<ApiMovimentacao[]>("/movimentacoes", { method: "GET" });
}

export async function createMovimentacao(payload: CreateMovimentacaoPayload) {
  return apiRequest<ApiMovimentacao>("/movimentacoes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function finalizeMovimentacao(id: number, payload?: {
  dataDevolucao?: string;
  horaDevolucao?: string;
  responsavelRetorno?: string;
}) {
  return apiRequest<ApiMovimentacao>(`/movimentacoes/${id}/devolucao`, {
    method: "PATCH",
    body: JSON.stringify(payload ?? {}),
  });
}
