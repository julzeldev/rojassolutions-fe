export type EmployeeStatus = 'active' | 'inactive';
export type SalarySchedule = 'monthly' | 'biweekly' | 'weekly' | 'hourly';

type MaybeDate = string | Date | null | undefined;

interface SalaryEntryResponse {
  amountCents: number;
  currency?: 'CRC';
  schedule?: SalarySchedule;
  effectiveFrom: string | Date;
  effectiveTo?: string | Date | null;
  note?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface SalaryEntry {
  amountCents: number;
  currency: 'CRC';
  schedule?: SalarySchedule;
  effectiveFrom: string;
  effectiveTo: string | null;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EmployeeResponse {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  dob: string | Date;
  dateOfHire: string | Date;
  documentId: string;
  status: EmployeeStatus;
  userId?: string;
  salaryHistory?: SalaryEntryResponse[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Employee extends Omit<
  EmployeeResponse,
  '_id' | 'salaryHistory' | 'dob' | 'dateOfHire' | 'createdAt' | 'updatedAt'
> {
  id: string;
  salaryHistory: SalaryEntry[];
  dob: string;
  dateOfHire: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EmployeeListResponse {
  items: EmployeeResponse[];
  total: number;
}

export interface EmployeeList {
  items: Employee[];
  total: number;
}

export interface EmployeeQueryParams {
  q?: string;
  status?: EmployeeStatus;
  limit?: number;
  offset?: number;
}

export interface CreateEmployeePayload {
  firstName: string;
  lastName: string;
  dob: string;
  dateOfHire: string;
  documentId: string;
  status?: EmployeeStatus;
}

export type UpdateEmployeePayload = Partial<CreateEmployeePayload>;

interface SalaryHistoryResponse {
  items: SalaryEntryResponse[];
  total: number;
}

export interface SalaryHistory {
  items: SalaryEntry[];
  total: number;
}

export interface AddSalaryPayload {
  amountCents: number;
  currency?: 'CRC';
  schedule?: SalarySchedule;
  effectiveFrom: string;
  note?: string;
}

function getApiBase(): string {
  const base = (import.meta as any)?.env?.VITE_API_BASE as string | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any
  return base || 'http://localhost:5001';
}

function normalizeDate(value: MaybeDate): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  return value;
}

function normalizeSalary(entry: SalaryEntryResponse): SalaryEntry {
  return {
    amountCents: entry.amountCents,
    currency: entry.currency ?? 'CRC',
    schedule: entry.schedule,
    effectiveFrom: normalizeDate(entry.effectiveFrom) ?? '',
    effectiveTo: normalizeDate(entry.effectiveTo),
    note: entry.note,
    createdAt: normalizeDate(entry.createdAt) ?? undefined,
    updatedAt: normalizeDate(entry.updatedAt) ?? undefined,
  };
}

function normalizeEmployee(raw: EmployeeResponse): Employee {
  const id = raw._id ?? raw.id;
  if (!id) throw new Error('Employee record missing identifier');
  return {
    id,
    firstName: raw.firstName,
    lastName: raw.lastName,
    dob: normalizeDate(raw.dob) ?? '',
    dateOfHire: normalizeDate(raw.dateOfHire) ?? '',
    documentId: raw.documentId,
    status: raw.status,
    userId: raw.userId,
    salaryHistory: (raw.salaryHistory ?? []).map(normalizeSalary),
    createdAt: normalizeDate(raw.createdAt) ?? undefined,
    updatedAt: normalizeDate(raw.updatedAt) ?? undefined,
  };
}

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  token: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined> | EmployeeQueryParams;
}

async function apiRequest<T>(
  path: string,
  { method, token, body, query }: ApiRequestOptions,
): Promise<T> {
  const base = getApiBase();
  const url = new URL(path, base);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.set(key, String(value));
    });
  }

  const finalMethod = method ?? (body !== undefined ? 'POST' : 'GET');
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  const init: RequestInit = {
    method: finalMethod,
    headers,
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), init);
  if (!response.ok) {
    let detail = '';
    try {
      const json = await response.clone().json();
      if (json && typeof json === 'object' && 'message' in json) {
        const { message } = json as { message: string | string[] };
        detail = Array.isArray(message) ? message.join(', ') : String(message);
      } else {
        detail = JSON.stringify(json);
      }
    } catch {
      try {
        detail = await response.text();
      } catch {
        detail = '';
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

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return {} as T;
}

export const employeeService = {
  async listEmployees(
    params: EmployeeQueryParams | undefined,
    token: string,
  ): Promise<EmployeeList> {
    const data = await apiRequest<EmployeeListResponse>('/employees', {
      method: 'GET',
      token,
      query: params,
    });
    return {
      items: data.items.map(normalizeEmployee),
      total: data.total,
    };
  },

  async getEmployee(id: string, token: string): Promise<Employee> {
    const data = await apiRequest<EmployeeResponse>(`/employees/${id}`, {
      method: 'GET',
      token,
    });
    return normalizeEmployee(data);
  },

  async createEmployee(
    payload: CreateEmployeePayload,
    token: string,
  ): Promise<Employee> {
    const data = await apiRequest<EmployeeResponse>('/employees', {
      method: 'POST',
      token,
      body: payload,
    });
    return normalizeEmployee(data);
  },

  async updateEmployee(
    id: string,
    payload: UpdateEmployeePayload,
    token: string,
  ): Promise<Employee> {
    const data = await apiRequest<EmployeeResponse>(`/employees/${id}`, {
      method: 'PATCH',
      token,
      body: payload,
    });
    return normalizeEmployee(data);
  },

  async deleteEmployee(id: string, token: string): Promise<void> {
    await apiRequest<void>(`/employees/${id}`, {
      method: 'DELETE',
      token,
    });
  },

  async getCurrentSalary(id: string, token: string): Promise<SalaryEntry | null> {
    const data = await apiRequest<SalaryEntryResponse | null>(
      `/employees/${id}/salary`,
      {
        method: 'GET',
        token,
      },
    );
    return data ? normalizeSalary(data) : null;
  },

  async getSalaryHistory(
    id: string,
    token: string,
    params?: { limit?: number; offset?: number },
  ): Promise<SalaryHistory> {
    const data = await apiRequest<SalaryHistoryResponse>(
      `/employees/${id}/salaries`,
      {
        method: 'GET',
        token,
        query: params,
      },
    );
    return {
      items: data.items.map(normalizeSalary),
      total: data.total,
    };
  },

  async addSalary(
    id: string,
    payload: AddSalaryPayload,
    token: string,
  ): Promise<SalaryEntry> {
    const data = await apiRequest<SalaryEntryResponse>(
      `/employees/${id}/salaries`,
      {
        method: 'POST',
        token,
        body: payload,
      },
    );
    return normalizeSalary(data);
  },
} as const;

export type EmployeeService = typeof employeeService;
