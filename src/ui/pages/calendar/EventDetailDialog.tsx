import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CakeIcon from '@mui/icons-material/Cake';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { Event, EventType } from '../../../api/eventService';
import { ConfirmDialog } from '../../../components/ConfirmDialog';

interface EventDetailDialogProps {
  open: boolean;
  onClose: () => void;
  event: Event | null;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
}

export default function EventDetailDialog({
  open,
  onClose,
  event,
  onEdit,
  onDelete,
}: EventDetailDialogProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!event) return null;

  const isBirthdayEvent = event.type === EventType.BIRTHDAY;

  const handleDeleteClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    if (onDelete) {
      await onDelete();
      onClose();
    }
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isBirthdayEvent && <CakeIcon color="primary" />}
            <Typography variant="h6">{event.title}</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          {/* Type Badge */}
          <Box>
            <Chip
              label={
                isBirthdayEvent
                  ? 'Cumpleaños'
                  : event.type === EventType.PREDEFINED
                  ? event.predefinedType?.replace('_', ' ').toUpperCase()
                  : 'Evento personalizado'
              }
              color={isBirthdayEvent ? 'primary' : 'default'}
              size="small"
            />
            <Chip
              label={event.status.toUpperCase()}
              color={
                event.status === 'active'
                  ? 'success'
                  : event.status === 'cancelled'
                  ? 'error'
                  : 'default'
              }
              size="small"
              sx={{ ml: 1 }}
            />
          </Box>

          {/* Description */}
          {event.description && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Descripción
              </Typography>
              <Typography variant="body2">{event.description}</Typography>
            </Box>
          )}

          <Divider />

          {/* Date and Time */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Fecha y hora
            </Typography>
            <Typography variant="body2">{formatDate(event.eventDate)}</Typography>
            {event.allDay ? (
              <Typography variant="body2" color="text.secondary">
                Todo el día
              </Typography>
            ) : (
              event.startTime &&
              event.endTime && (
                <Typography variant="body2" color="text.secondary">
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </Typography>
              )
            )}
          </Box>

          {/* Employee Link (for birthdays) */}
          {isBirthdayEvent && event.employeeId && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Empleado
              </Typography>
              <Typography variant="body2">
                {event.employeeId.firstName} {event.employeeId.lastName}
              </Typography>
            </Box>
          )}

          <Divider />

          {/* Created By */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Creado por
            </Typography>
            <Typography variant="body2">
              {event.createdBy.firstName} {event.createdBy.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {format(new Date(event.createdAt), "d 'de' MMMM, yyyy 'a las' HH:mm", {
                locale: es,
              })}
            </Typography>
          </Box>

          {/* Last Modified By */}
          {event.lastModifiedBy && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Última modificación
              </Typography>
              <Typography variant="body2">
                {event.lastModifiedBy.firstName} {event.lastModifiedBy.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {format(new Date(event.updatedAt), "d 'de' MMMM, yyyy 'a las' HH:mm", {
                  locale: es,
                })}
              </Typography>
            </Box>
          )}

          {/* Color */}
          {event.color && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Color
              </Typography>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  backgroundColor: event.color,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        {!isBirthdayEvent && onEdit && (
          <Button onClick={onEdit} startIcon={<EditIcon />} variant="outlined">
            Editar
          </Button>
        )}
        {!isBirthdayEvent && onDelete && (
          <Button onClick={handleDeleteClick} startIcon={<DeleteIcon />} color="error">
            Eliminar
          </Button>
        )}
      </DialogActions>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar evento"
        content={`¿Estás seguro de que deseas eliminar el evento "${event.title}"?`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Dialog>
  );
}
