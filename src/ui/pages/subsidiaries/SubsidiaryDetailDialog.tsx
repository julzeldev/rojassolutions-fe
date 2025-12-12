import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
  Link,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, LocationOn as LocationOnIcon } from '@mui/icons-material';
import { type Subsidiary } from '../../../api/subsidiaryService';

interface SubsidiaryDetailDialogProps {
  open: boolean;
  onClose: () => void;
  subsidiary: Subsidiary | null;
  onEdit: (subsidiary: Subsidiary) => void;
  onDelete: (subsidiary: Subsidiary) => void;
}

export default function SubsidiaryDetailDialog({
  open,
  onClose,
  subsidiary,
  onEdit,
  onDelete,
}: SubsidiaryDetailDialogProps) {
  if (!subsidiary) return null;

  const InfoRow = ({ label, value }: { label: string; value: string | undefined }) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2">{value || '-'}</Typography>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{subsidiary.name}</Typography>
          <Chip
            label={subsidiary.status === 'active' ? 'Activa' : 'Inactiva'}
            color={subsidiary.status === 'active' ? 'success' : 'default'}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Dirección</Typography>
            <InfoRow label="Provincia" value={subsidiary.address.province} />
            <InfoRow label="Cantón" value={subsidiary.address.canton} />
            
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Ubicación
              </Typography>
              <Link
                href={subsidiary.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
              >
                <LocationOnIcon fontSize="small" />
                Ver en Google Maps
              </Link>
            </Box>
            
            {(subsidiary.latitude !== undefined || subsidiary.longitude !== undefined) && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Coordenadas
                </Typography>
                <Typography variant="body2">
                  {subsidiary.latitude !== undefined && `Lat: ${subsidiary.latitude}`}
                  {subsidiary.latitude !== undefined && subsidiary.longitude !== undefined && ' | '}
                  {subsidiary.longitude !== undefined && `Lng: ${subsidiary.longitude}`}
                </Typography>
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Contacto</Typography>
            <InfoRow label="Nombre" value={subsidiary.contact?.name} />
            <InfoRow label="Teléfono" value={subsidiary.contact?.phone} />
            <InfoRow label="Email" value={subsidiary.contact?.email} />
            
            {subsidiary.notes && (
              <>
                <Divider sx={{ my: 2 }} />
                <InfoRow label="Notas" value={subsidiary.notes} />
              </>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button
          startIcon={<DeleteIcon />}
          onClick={() => {
            onDelete(subsidiary);
            onClose();
          }}
          color="error"
        >
          Eliminar
        </Button>
        <Button
          startIcon={<EditIcon />}
          onClick={() => {
            onEdit(subsidiary);
            onClose();
          }}
          variant="contained"
        >
          Editar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
