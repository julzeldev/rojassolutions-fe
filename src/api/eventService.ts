// Enums matching backend
export enum EventType {
  CUSTOM = 'custom',
  BIRTHDAY = 'birthday',
  PREDEFINED = 'predefined',
}

export enum PredefinedEventType {
  INCAPACIDAD = 'incapacidad',
  PERMISO = 'permiso',
  COMPRA_INVENTARIO = 'compra_inventario',
  VISITA_SUCURSAL = 'visita_sucursal',
  CUSTOM = 'custom',
}

export enum EventStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

// User reference type
export interface UserReference {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Employee reference type
export interface EmployeeReference {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

// Event interface matching backend schema
export interface Event {
  _id: string;
  title: string;
  description?: string;
  type: EventType;
  eventDate: string; // ISO date string
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  allDay: boolean;
  employeeId?: EmployeeReference;
  predefinedType?: PredefinedEventType;
  color?: string; // Hex color
  status: EventStatus;
  createdBy: UserReference;
  lastModifiedBy?: UserReference;
  createdAt: string;
  updatedAt: string;
}

// DTOs for create/update operations
export interface CreateEventDto {
  title: string;
  description?: string;
  type: EventType;
  eventDate: string; // ISO date string
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  allDay?: boolean;
  employeeId?: string;
  predefinedType?: PredefinedEventType;
  color?: string; // Hex color
  status?: EventStatus;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  type?: EventType;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  employeeId?: string;
  predefinedType?: PredefinedEventType;
  color?: string;
  status?: EventStatus;
}

// Query params for filtering events
export interface EventQueryParams {
  startDate?: string;
  endDate?: string;
  type?: EventType;
  predefinedType?: PredefinedEventType;
  employeeId?: string;
}

// Statistics response
export interface EventStatistics {
  total: number;
  byType: Array<{ _id: EventType; count: number }>;
  byPredefinedType: Array<{ _id: PredefinedEventType; count: number }>;
  upcoming: number;
  thisMonth: number;
}

// Helper to get API base URL
function getApiBaseUrl(): string {
  // Using any to bypass TypeScript env typing issue (similar to employeeService.ts)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const base = (import.meta as any).env?.VITE_API_URL;
  return base || 'http://localhost:5001';
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: {
    method: string;
    token: string;
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined>;
  }
): Promise<T> {
  const { method, token, body, query } = options;
  const url = new URL(endpoint, getApiBaseUrl());

  // Add query parameters
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  const init: RequestInit = { method, headers };

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

// Event service
export const eventService = {
  /**
   * Get all events with optional filtering
   */
  async getEvents(params: EventQueryParams | undefined, token: string): Promise<Event[]> {
    return apiRequest<Event[]>('/events', {
      method: 'GET',
      token,
      query: params as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Get a single event by ID
   */
  async getEvent(id: string, token: string): Promise<Event> {
    return apiRequest<Event>(`/events/${id}`, {
      method: 'GET',
      token,
    });
  },

  /**
   * Create a new event
   */
  async createEvent(data: CreateEventDto, token: string): Promise<Event> {
    return apiRequest<Event>('/events', {
      method: 'POST',
      token,
      body: data,
    });
  },

  /**
   * Update an existing event
   */
  async updateEvent(id: string, data: UpdateEventDto, token: string): Promise<Event> {
    return apiRequest<Event>(`/events/${id}`, {
      method: 'PATCH',
      token,
      body: data,
    });
  },

  /**
   * Delete an event
   */
  async deleteEvent(id: string, token: string): Promise<void> {
    return apiRequest<void>(`/events/${id}`, {
      method: 'DELETE',
      token,
    });
  },

  /**
   * Get upcoming birthday events
   */
  async getUpcomingBirthdays(days: number = 30, token: string): Promise<Event[]> {
    return apiRequest<Event[]>('/events/birthdays/upcoming', {
      method: 'GET',
      token,
      query: { days },
    });
  },

  /**
   * Get event statistics
   */
  async getEventStatistics(token: string): Promise<EventStatistics> {
    return apiRequest<EventStatistics>('/events/statistics', {
      method: 'GET',
      token,
    });
  },
};

export default eventService;
