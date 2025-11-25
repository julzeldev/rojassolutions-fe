import { PredefinedEventType, EventType } from '../../../api/eventService';

export interface EventTemplate {
  predefinedType: PredefinedEventType;
  label: string;
  title: string;
  color: string;
  defaultDurationHours: number;
  description?: string;
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    predefinedType: PredefinedEventType.INCAPACIDAD,
    label: 'Incapacidad',
    title: 'Incapacidad',
    color: '#f44336', // Red
    defaultDurationHours: 8,
    description: 'Incapacidad médica',
  },
  {
    predefinedType: PredefinedEventType.PERMISO,
    label: 'Permiso de ausencia',
    title: 'Permiso de ausencia',
    color: '#ff9800', // Orange
    defaultDurationHours: 4,
    description: 'Permiso de ausencia',
  },
  {
    predefinedType: PredefinedEventType.COMPRA_INVENTARIO,
    label: 'Compra de inventario',
    title: 'Compra de inventario',
    color: '#4caf50', // Green
    defaultDurationHours: 2,
    description: 'Compra de inventario',
  },
  {
    predefinedType: PredefinedEventType.VISITA_SUCURSAL,
    label: 'Visita a Sucursal',
    title: 'Visita a Sucursal',
    color: '#9c27b0', // Purple
    defaultDurationHours: 3,
    description: 'Visita a sucursal',
  },
  {
    predefinedType: PredefinedEventType.CUSTOM,
    label: 'Evento personalizado',
    title: '',
    color: '#757575', // Grey
    defaultDurationHours: 1,
    description: '',
  },
];

// Helper to get template by predefined type
export const getEventTemplate = (
  predefinedType: PredefinedEventType
): EventTemplate | undefined => {
  return EVENT_TEMPLATES.find((t) => t.predefinedType === predefinedType);
};

// Color mapping for event types
export const EVENT_TYPE_COLORS = {
  [EventType.BIRTHDAY]: '#2196f3', // Blue
  [EventType.PREDEFINED]: '#757575', // Grey (will be overridden by specific predefined type)
  [EventType.CUSTOM]: '#757575', // Grey
};

export const PREDEFINED_TYPE_COLORS = {
  [PredefinedEventType.INCAPACIDAD]: '#f44336', // Red
  [PredefinedEventType.PERMISO]: '#ff9800', // Orange
  [PredefinedEventType.COMPRA_INVENTARIO]: '#4caf50', // Green
  [PredefinedEventType.VISITA_SUCURSAL]: '#9c27b0', // Purple
  [PredefinedEventType.CUSTOM]: '#757575', // Grey
};
