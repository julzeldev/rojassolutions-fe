import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Alert,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import { useAuth } from '../../../auth/useAuth';
import { subsidiaryService, type Subsidiary, type CreateSubsidiaryDto } from '../../../api/subsidiaryService';

interface SubsidiaryFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subsidiary?: Subsidiary | null;
}

// Helper function to extract coordinates from Google Maps URL
function extractCoordinatesFromUrl(url: string): { lat?: number; lng?: number } {
  try {
    // Pattern 1: https://www.google.com/maps/place/.../@LAT,LNG,ZOOM
    const pattern1 = /@(-?\d+\.\d+),(-?\d+\.\d+),(\d+)/;
    const match1 = url.match(pattern1);
    if (match1) {
      return {
        lat: parseFloat(match1[1]),
        lng: parseFloat(match1[2]),
      };
    }

    // Pattern 2: ?q=LAT,LNG or ll=LAT,LNG
    const pattern2 = /[?&](q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match2 = url.match(pattern2);
    if (match2) {
      return {
        lat: parseFloat(match2[2]),
        lng: parseFloat(match2[3]),
      };
    }

    return {};
  } catch (error) {
    console.error('Error extracting coordinates:', error);
    return {};
  }
}

export default function SubsidiaryFormDialog({
  open,
  onClose,
  onSuccess,
  subsidiary,
}: SubsidiaryFormDialogProps) {
  const { accessToken } = useAuth();
  const [formData, setFormData] = useState<CreateSubsidiaryDto>({
    name: '',
    address: { province: '', canton: '' },
    contact: {},
    googleMapsUrl: '',
    notes: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInfo, setUrlInfo] = useState<string | null>(null);

  useEffect(() => {
    if (subsidiary) {
      setFormData({
        name: subsidiary.name,
        address: subsidiary.address,
        contact: subsidiary.contact || {},
        googleMapsUrl: subsidiary.googleMapsUrl,
        latitude: subsidiary.latitude,
        longitude: subsidiary.longitude,
        notes: subsidiary.notes || '',
        status: subsidiary.status,
      });
    } else {
      setFormData({ 
        name: '', 
        address: { province: '', canton: '' }, 
        contact: {}, 
        googleMapsUrl: '', 
        notes: '', 
        status: 'active' 
      });
    }
    setError(null);
    setUrlInfo(null);
  }, [subsidiary, open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: 'address' | 'contact', field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  const handleGoogleMapsUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, googleMapsUrl: url }));
    setUrlInfo(null);

    if (url.trim()) {
      const coords = extractCoordinatesFromUrl(url);
      if (coords.lat && coords.lng) {
        setFormData((prev) => ({
          ...prev,
          latitude: coords.lat,
          longitude: coords.lng,
        }));
        setUrlInfo(`✓ Coordenadas extraídas: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
      } else if (url.includes('goo.gl')) {
        setUrlInfo('ℹ️ URL acortada detectada. Por favor, use la URL completa de Google Maps para extracción automática de coordenadas.');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.address.province.trim()) {
      setError('La provincia es requerida');
      return;
    }

    if (!formData.googleMapsUrl.trim()) {
      setError('La URL de Google Maps es requerida');
      return;
    }

    if (!accessToken) {
      setError('No autorizado');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (subsidiary) {
        await subsidiaryService.updateSubsidiary(subsidiary.id, formData, accessToken);
      } else {
        await subsidiaryService.createSubsidiary(formData, accessToken);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar sucursal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{subsidiary ? 'Editar Sucursal' : 'Nueva Sucursal'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Subsidiary Information Section */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Información de la Sucursal
            </Typography>
            <Stack spacing={2}>
              <TextField 
                fullWidth 
                label="Nombre *" 
                value={formData.name} 
                onChange={(e) => handleChange('name', e.target.value)} 
                disabled={loading}
                required
              />
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField 
                  fullWidth 
                  label="Provincia *" 
                  value={formData.address.province} 
                  onChange={(e) => handleNestedChange('address', 'province', e.target.value)} 
                  disabled={loading}
                  required
                />
                <TextField 
                  fullWidth 
                  label="Cantón" 
                  value={formData.address.canton || ''} 
                  onChange={(e) => handleNestedChange('address', 'canton', e.target.value)} 
                  disabled={loading} 
                />
              </Stack>
              
              <TextField 
                fullWidth 
                label="Google Maps URL *" 
                value={formData.googleMapsUrl} 
                onChange={(e) => handleGoogleMapsUrlChange(e.target.value)} 
                disabled={loading} 
                placeholder="https://www.google.com/maps/place/..."
                helperText={urlInfo || "Pegue el enlace de Google Maps (las coordenadas se extraerán automáticamente)"}
                required
              />
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField 
                  fullWidth 
                  label="Latitud" 
                  type="number" 
                  value={formData.latitude ?? ''} 
                  onChange={(e) => handleChange('latitude', e.target.value ? parseFloat(e.target.value) : undefined)} 
                  disabled={loading}
                  placeholder="9.9525625"
                  inputProps={{ step: 'any', min: -90, max: 90 }}
                  helperText="Se extrae automáticamente del URL"
                />
                <TextField 
                  fullWidth 
                  label="Longitud" 
                  type="number" 
                  value={formData.longitude ?? ''} 
                  onChange={(e) => handleChange('longitude', e.target.value ? parseFloat(e.target.value) : undefined)} 
                  disabled={loading}
                  placeholder="-84.1107624"
                  inputProps={{ step: 'any', min: -180, max: 180 }}
                  helperText="Se extrae automáticamente del URL"
                />
              </Stack>
              
              <TextField 
                fullWidth 
                label="Notas" 
                value={formData.notes || ''} 
                onChange={(e) => handleChange('notes', e.target.value)} 
                disabled={loading} 
                multiline 
                rows={3}
              />
              
              <TextField 
                select 
                fullWidth 
                label="Estado" 
                value={formData.status} 
                onChange={(e) => handleChange('status', e.target.value)} 
                disabled={loading}
              >
                <MenuItem value="active">Activa</MenuItem>
                <MenuItem value="inactive">Inactiva</MenuItem>
              </TextField>
            </Stack>
          </Box>

          <Divider />

          {/* Contact Information Section */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Información de Contacto
            </Typography>
            <Stack spacing={2}>
              <TextField 
                fullWidth 
                label="Nombre de Contacto" 
                value={formData.contact?.name || ''} 
                onChange={(e) => handleNestedChange('contact', 'name', e.target.value)} 
                disabled={loading} 
              />
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField 
                  fullWidth 
                  label="Teléfono" 
                  value={formData.contact?.phone || ''} 
                  onChange={(e) => handleNestedChange('contact', 'phone', e.target.value)} 
                  disabled={loading} 
                  placeholder="88888888"
                  inputProps={{ maxLength: 8 }}
                />
                <TextField 
                  fullWidth 
                  label="Email" 
                  type="email" 
                  value={formData.contact?.email || ''} 
                  onChange={(e) => handleNestedChange('contact', 'email', e.target.value)} 
                  disabled={loading} 
                />
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
