import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Fab,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../../auth/useAuth';
import { eventService, Event, EventType, CreateEventDto, UpdateEventDto } from '../../../api/eventService';
import EventFormDialog from './EventFormDialog';
import EventDetailDialog from './EventDetailDialog';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configure date-fns localizer for Spanish
const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Calendar event format for react-big-calendar
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Event; // Store the full event data
}

// Helper to get event color
const getEventColor = (event: Event): string => {
  if (event.color) return event.color;
  
  // Default colors by type
  switch (event.type) {
    case EventType.BIRTHDAY:
      return '#2196f3'; // Blue
    case EventType.PREDEFINED:
      switch (event.predefinedType) {
        case 'incapacidad':
          return '#f44336'; // Red
        case 'permiso':
          return '#ff9800'; // Orange
        case 'compra_inventario':
          return '#4caf50'; // Green
        case 'visita_sucursal':
          return '#9c27b0'; // Purple
        default:
          return '#757575'; // Grey
      }
    default:
      return '#757575'; // Grey for custom
  }
};

// Transform backend events to calendar format
const transformToCalendarEvents = (events: Event[]): CalendarEvent[] => {
  return events.map((event) => {
    const eventDate = new Date(event.eventDate);
    let start: Date;
    let end: Date;

    if (event.allDay) {
      start = eventDate;
      end = eventDate;
    } else {
      // Parse time if provided
      if (event.startTime) {
        const [hours, minutes] = event.startTime.split(':');
        start = new Date(eventDate);
        start.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      } else {
        start = eventDate;
      }

      if (event.endTime) {
        const [hours, minutes] = event.endTime.split(':');
        end = new Date(eventDate);
        end.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      } else {
        // Default to 1 hour duration if no end time
        end = addDays(start, 0);
        end.setHours(start.getHours() + 1);
      }
    }

    return {
      id: event._id,
      title: event.title,
      start,
      end,
      resource: event,
    };
  });
};

export default function CalendarPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { accessToken } = useAuth();
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>(isMobile ? 'agenda' : 'month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // Snackbar for success messages
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Fetch events based on current view and date
  const fetchEvents = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);

      // Calculate date range based on view
      let startDate: Date;
      let endDate: Date;

      switch (currentView) {
        case 'month':
          startDate = startOfMonth(currentDate);
          endDate = endOfMonth(currentDate);
          break;
        case 'week':
          startDate = startOfWeek(currentDate, { locale: es });
          endDate = addDays(startDate, 6);
          break;
        case 'day':
          startDate = currentDate;
          endDate = currentDate;
          break;
        case 'agenda':
          startDate = currentDate;
          endDate = addDays(currentDate, 30); // Next 30 days for agenda
          break;
        default:
          startDate = startOfMonth(currentDate);
          endDate = endOfMonth(currentDate);
      }

      // Fetch events from API
      const fetchedEvents = await eventService.getEvents(
        {
          startDate: format(subDays(startDate, 7), 'yyyy-MM-dd'), // Fetch a bit before for overlap
          endDate: format(addDays(endDate, 7), 'yyyy-MM-dd'), // Fetch a bit after
        },
        accessToken
      );

      // Transform to calendar format
      const calendarEvents = transformToCalendarEvents(fetchedEvents);
      setEvents(calendarEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Error cargando eventos');
    } finally {
      setLoading(false);
    }
  }, [accessToken, currentView, currentDate]);

  // Fetch events on mount and when dependencies change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle view change
  const handleViewChange = (newView: View) => {
    setCurrentView(newView);
  };

  // Handle date navigation
  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  // Custom event style
  const eventStyleGetter = (event: CalendarEvent) => {
    const backgroundColor = getEventColor(event.resource);
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  // Handle event click
  const handleSelectEvent = (calendarEvent: CalendarEvent) => {
    setSelectedEvent(calendarEvent.resource);
    setDetailDialogOpen(true);
  };

  // Handle slot select (click on empty slot)
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSelectedEvent(null);
    setSelectedDate(slotInfo.start);
    setFormDialogOpen(true);
  };

  // Handle create event
  const handleCreateEvent = async (data: CreateEventDto) => {
    if (!accessToken) return;
    
    try {
      await eventService.createEvent(data, accessToken);
      setSnackbarMessage('Evento creado exitosamente');
      setSnackbarOpen(true);
      await fetchEvents(); // Refresh events
    } catch (err) {
      throw err; // Let the form dialog handle the error
    }
  };

  // Handle update event
  const handleUpdateEvent = async (data: UpdateEventDto) => {
    if (!accessToken || !selectedEvent) return;
    
    try {
      await eventService.updateEvent(selectedEvent._id, data, accessToken);
      setSnackbarMessage('Evento actualizado exitosamente');
      setSnackbarOpen(true);
      await fetchEvents(); // Refresh events
    } catch (err) {
      throw err; // Let the form dialog handle the error
    }
  };

  // Handle delete event
  const handleDeleteEvent = async () => {
    if (!accessToken || !selectedEvent) return;
    
    try {
      await eventService.deleteEvent(selectedEvent._id, accessToken);
      setSnackbarMessage('Evento eliminado exitosamente');
      setSnackbarOpen(true);
      await fetchEvents(); // Refresh events
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(err instanceof Error ? err.message : 'Error eliminando evento');
    }
  };

  // Handle edit from detail dialog
  const handleEditEvent = () => {
    setDetailDialogOpen(false);
    setFormDialogOpen(true);
  };

  // Handle create/update event
  const handleSubmitEvent = async (data: CreateEventDto | UpdateEventDto) => {
    if (selectedEvent) {
      await handleUpdateEvent(data as UpdateEventDto);
    } else {
      await handleCreateEvent(data as CreateEventDto);
    }
  };

  if (loading && events.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Calendario de Eventos
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, height: 'calc(100vh - 200px)', minHeight: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={currentView}
          onView={handleViewChange}
          date={currentDate}
          onNavigate={handleNavigate}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          culture="es"
          messages={{
            next: 'Siguiente',
            previous: 'Anterior',
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            agenda: 'Agenda',
            date: 'Fecha',
            time: 'Hora',
            event: 'Evento',
            noEventsInRange: 'No hay eventos en este rango',
            showMore: (total) => `+ Ver más (${total})`,
          }}
        />
      </Paper>

      {/* Floating Action Button for adding events */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => {
          setSelectedEvent(null);
          setSelectedDate(new Date());
          setFormDialogOpen(true);
        }}
      >
        <AddIcon />
      </Fab>

      {/* Event Form Dialog */}
      <EventFormDialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setSelectedEvent(null);
          setSelectedDate(undefined);
        }}
        onSubmit={handleSubmitEvent}
        event={selectedEvent}
        selectedDate={selectedDate}
      />

      {/* Event Detail Dialog */}
      <EventDetailDialog
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
}
