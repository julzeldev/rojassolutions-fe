import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stack,
  Box,
  Alert,
} from '@mui/material';
import { format } from 'date-fns';
import {
  EventType,
  PredefinedEventType,
  CreateEventDto,
  UpdateEventDto,
  Event,
  EventStatus,
} from '../../../api/eventService';
import { EVENT_TEMPLATES, getEventTemplate } from './eventTemplates';

interface EventFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEventDto | UpdateEventDto) => Promise<void>;
  event?: Event | null;
  selectedDate?: Date;
}

export default function EventFormDialog({
  open,
  onClose,
  onSubmit,
  event,
  selectedDate,
}: EventFormDialogProps) {
  const isEditMode = !!event;
  const isBirthdayEvent = event?.type === EventType.BIRTHDAY;

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [predefinedType, setPredefinedType] = useState<PredefinedEventType>(
    PredefinedEventType.CUSTOM
  );
  const [color, setColor] = useState('#757575');
  const [status, setStatus] = useState<EventStatus>(EventStatus.ACTIVE);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize form with event data or selected date
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setEventDate(event.eventDate.split('T')[0]); // Extract YYYY-MM-DD
      setStartTime(event.startTime || '');
      setEndTime(event.endTime || '');
      setAllDay(event.allDay);
      setPredefinedType(event.predefinedType || PredefinedEventType.CUSTOM);
      setColor(event.color || '#757575');
      setStatus(event.status);
    } else if (selectedDate) {
      setEventDate(format(selectedDate, 'yyyy-MM-dd'));
      setAllDay(false);
      setPredefinedType(PredefinedEventType.CUSTOM);
      setColor('#757575');
      setStatus(EventStatus.ACTIVE);
      setTitle('');
      setDescription('');
      setStartTime('');
      setEndTime('');
    }
  }, [event, selectedDate]);

  // Handle predefined type change
  const handlePredefinedTypeChange = (newType: PredefinedEventType) => {
    setPredefinedType(newType);
    const template = getEventTemplate(newType);
    if (template) {
      if (template.predefinedType !== PredefinedEventType.CUSTOM) {
        setTitle(template.title);
        setDescription(template.description || '');
      }
      setColor(template.color);
      
      // Set default duration if times are empty
      if (!startTime && !endTime && !allDay) {
        const defaultStart = '09:00';
        const defaultEndHour = 9 + template.defaultDurationHours;
        const defaultEnd = `${defaultEndHour.toString().padStart(2, '0')}:00`;
        setStartTime(defaultStart);
        setEndTime(defaultEnd);
      }
    }
  };

  const handleSubmit = async () => {
    setError(null);
    
    // Validation
    if (!title.trim()) {
      setError('El título es requerido');
      return;
    }
    if (!eventDate) {
      setError('La fecha es requerida');
      return;
    }
    if (!allDay && startTime && endTime && startTime >= endTime) {
      setError('La hora de inicio debe ser anterior a la hora de fin');
      return;
    }

    try {
      setLoading(true);

      const eventData: CreateEventDto | UpdateEventDto = {
        title: title.trim(),
        description: description.trim() || undefined,
        type: predefinedType === PredefinedEventType.CUSTOM 
          ? EventType.CUSTOM 
          : EventType.PREDEFINED,
        eventDate,
        startTime: allDay ? undefined : (startTime || undefined),
        endTime: allDay ? undefined : (endTime || undefined),
        allDay,
        predefinedType: predefinedType !== PredefinedEventType.CUSTOM 
          ? predefinedType 
          : undefined,
        color,
        status,
      };

      await onSubmit(eventData);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setEventDate('');
    setStartTime('');
    setEndTime('');
    setAllDay(false);
    setPredefinedType(PredefinedEventType.CUSTOM);
    setColor('#757575');
    setStatus(EventStatus.ACTIVE);
    setError(null);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isBirthdayEvent
          ? 'Ver Cumpleaños'
          : isEditMode
          ? 'Editar Evento'
          : 'Nuevo Evento'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isBirthdayEvent && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Los eventos de cumpleaños no se pueden editar
          </Alert>
        )}

        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Predefined Type */}
          <FormControl fullWidth disabled={isBirthdayEvent}>
            <InputLabel>Tipo de evento</InputLabel>
            <Select
              value={predefinedType}
              onChange={(e) => handlePredefinedTypeChange(e.target.value as PredefinedEventType)}
              label="Tipo de evento"
            >
              {EVENT_TEMPLATES.map((template) => (
                <MenuItem key={template.predefinedType} value={template.predefinedType}>
                  {template.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Title */}
          <TextField
            fullWidth
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isBirthdayEvent}
            required
          />

          {/* Description */}
          <TextField
            fullWidth
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isBirthdayEvent}
            multiline
            rows={3}
          />

          {/* Event Date */}
          <TextField
            fullWidth
            label="Fecha"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            disabled={isBirthdayEvent}
            InputLabelProps={{ shrink: true }}
            required
          />

          {/* All Day Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                disabled={isBirthdayEvent}
              />
            }
            label="Todo el día"
          />

          {/* Start Time and End Time */}
          {!allDay && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Hora de inicio"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={isBirthdayEvent}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Hora de fin"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={isBirthdayEvent}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          )}

          {/* Color and Status */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              disabled={isBirthdayEvent}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth disabled={isBirthdayEvent}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                label="Estado"
              >
                <MenuItem value={EventStatus.ACTIVE}>Activo</MenuItem>
                <MenuItem value={EventStatus.CANCELLED}>Cancelado</MenuItem>
                <MenuItem value={EventStatus.COMPLETED}>Completado</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        {!isBirthdayEvent && (
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
