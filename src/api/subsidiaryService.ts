export type SubsidiaryStatus = "active" | "inactive";

export interface SubsidiaryAddress {
  province: string;
  canton?: string;
}

export interface SubsidiaryContact {
  name?: string;
  email?: string;
  phone?: string;
}

interface SubsidiaryResponse {
  _id?: string;
  id?: string;
  name: string;
  address: SubsidiaryAddress;
  contact?: SubsidiaryContact;
  googleMapsUrl: string;
  latitude?: number;
  longitude?: number;
  inventory?: Record<string, any>;
  notes?: string;
  status: SubsidiaryStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Subsidiary {
  id: string;
  name: string;
  address: SubsidiaryAddress;
  contact?: SubsidiaryContact;
  googleMapsUrl: string;
  latitude?: number;
  longitude?: number;
  inventory?: Record<string, any>;
  notes?: string;
  status: SubsidiaryStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubsidiaryDto {
  name: string;
  address: SubsidiaryAddress;
  contact?: SubsidiaryContact;
  googleMapsUrl: string;
  latitude?: number;
  longitude?: number;
  inventory?: Record<string, any>;
  notes?: string;
  status?: SubsidiaryStatus;
}

export interface UpdateSubsidiaryDto extends Partial<CreateSubsidiaryDto> {}

export interface SubsidiaryQueryParams {
  q?: string;
  status?: SubsidiaryStatus;
  limit?: number;
  offset?: number;
}

interface SubsidiariesListResponse {
  items: SubsidiaryResponse[];
  total: number;
}

export interface SubsidiariesList {
  items: Subsidiary[];
  total: number;
}

function getApiBase(): string {
  const base = (import.meta as any)?.env?.VITE_API_BASE as string | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any
  return base || "http://localhost:5001";
}

function normalizeDate(value: string | Date | null | undefined): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return value;
}

function normalizeSubsidiary(raw: SubsidiaryResponse): Subsidiary {
  return {
    id: raw._id ?? raw.id ?? "",
    name: raw.name,
    address: raw.address,
    contact: raw.contact,
    googleMapsUrl: raw.googleMapsUrl,
    latitude: raw.latitude,
    longitude: raw.longitude,
    inventory: raw.inventory,
    notes: raw.notes,
    status: raw.status,
    createdAt: normalizeDate(raw.createdAt),
    updatedAt: normalizeDate(raw.updatedAt),
  };
}

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  token: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined> | SubsidiaryQueryParams;
}

async function apiRequest<T>(
  path: string,
  { method, token, body, query }: ApiRequestOptions
): Promise<T> {
  const base = getApiBase().replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");
  const url = new URL(`${base}/${cleanPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.set(key, String(value));
    });
  }

  const finalMethod = method ?? (body !== undefined ? "POST" : "GET");
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  const init: RequestInit = {
    method: finalMethod,
    headers,
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), init);
  if (!response.ok) {
    let detail = "";
    try {
      const json = await response.clone().json();
      if (json && typeof json === "object" && "message" in json) {
        const { message } = json as { message: string | string[] };
        detail = Array.isArray(message) ? message.join(", ") : String(message);
      } else {
        detail = JSON.stringify(json);
      }
    } catch {
      try {
        detail = await response.text();
      } catch {
        detail = "";
      }
    }
    const errorMessage = detail
      ? `Request failed (${response.status}): ${detail}`
      : `Request failed (${response.status})`;
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return {} as T;
}

export const subsidiaryService = {
  async listSubsidiaries(
    params: SubsidiaryQueryParams | undefined,
    token: string
  ): Promise<SubsidiariesList> {
    const data = await apiRequest<SubsidiariesListResponse>("/subsidiaries", {
      method: "GET",
      token,
      query: params,
    });
    return {
      items: data.items.map(normalizeSubsidiary),
      total: data.total,
    };
  },

  async getSubsidiaries(
    params: SubsidiaryQueryParams | undefined,
    token: string
  ): Promise<SubsidiariesList> {
    return this.listSubsidiaries(params, token);
  },

  async getSubsidiary(id: string, token: string): Promise<Subsidiary> {
    const data = await apiRequest<SubsidiaryResponse>(`/subsidiaries/${id}`, {
      method: "GET",
      token,
    });
    return normalizeSubsidiary(data);
  },

  async createSubsidiary(
    payload: CreateSubsidiaryDto,
    token: string
  ): Promise<Subsidiary> {
    const data = await apiRequest<SubsidiaryResponse>("/subsidiaries", {
      method: "POST",
      token,
      body: payload,
    });
    return normalizeSubsidiary(data);
  },

  async updateSubsidiary(
    id: string,
    payload: UpdateSubsidiaryDto,
    token: string
  ): Promise<Subsidiary> {
    const data = await apiRequest<SubsidiaryResponse>(`/subsidiaries/${id}`, {
      method: "PATCH",
      token,
      body: payload,
    });
    return normalizeSubsidiary(data);
  },

  async deleteSubsidiary(id: string, token: string): Promise<void> {
    await apiRequest<void>(`/subsidiaries/${id}`, {
      method: "DELETE",
      token,
    });
  },

  async getSubsidiaryEmployees(id: string, token: string): Promise<any[]> {
    return apiRequest<any[]>(`/subsidiaries/${id}/employees`, {
      method: "GET",
      token,
    });
  },
};

// Backward compatibility exports
export const getSubsidiaries = subsidiaryService.listSubsidiaries;
export const getSubsidiary = subsidiaryService.getSubsidiary;
export const createSubsidiary = subsidiaryService.createSubsidiary;
export const updateSubsidiary = subsidiaryService.updateSubsidiary;
export const deleteSubsidiary = subsidiaryService.deleteSubsidiary;
export const getSubsidiaryEmployees = subsidiaryService.getSubsidiaryEmployees;
