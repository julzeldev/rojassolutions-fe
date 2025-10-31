import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useAuth } from '../../../auth/useAuth';

export function SuperAdminPage() {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [clearExisting, setClearExisting] = useState(false);

  const apiBase = (import.meta as any)?.env?.VITE_API_BASE as string | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any
  const apiUrl = apiBase || 'http://localhost:5001';

  const handleDump = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch(`${apiUrl}/employees/superadmin/dump`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Create a downloadable JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `employees-dump-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: `${data.length} empleados exportados exitosamente` });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error al exportar empleados' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (clearExisting && !window.confirm('⚠️ ADVERTENCIA: Esto eliminará TODOS los empleados existentes y creará datos de demostración. ¿Estás seguro?')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${apiUrl}/employees/superadmin/seed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clearExisting }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      const result = await response.json();
      setMessage({ type: 'success', text: result.message });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error al sembrar datos de demostración' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        SuperAdmin - Gestión de Datos
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Herramientas de administración para exportar y sembrar datos de empleados.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Stack spacing={3}>
        {message && (
          <Alert severity={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Exportar Empleados
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Descarga todos los empleados actuales en formato JSON.
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
              onClick={handleDump}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Exportando...' : 'Exportar Todos los Empleados'}
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Sembrar Datos de Demostración
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Crea 14 empleados de demostración con información completa.
              </Typography>
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={clearExisting}
                  onChange={(e) => setClearExisting(e.target.checked)}
                  color="error"
                />
              }
              label={
                <Typography variant="body2">
                  Eliminar todos los empleados existentes antes de sembrar
                  <Typography component="span" color="error" fontWeight={600} sx={{ ml: 1 }}>
                    (⚠️ PELIGROSO)
                  </Typography>
                </Typography>
              }
            />
            
            <Button
              variant="contained"
              color={clearExisting ? 'error' : 'success'}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : clearExisting ? <DeleteSweepIcon /> : <UploadIcon />}
              onClick={handleSeed}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Sembrando...' : clearExisting ? 'Eliminar Todo y Sembrar' : 'Sembrar Datos Demo'}
            </Button>

            {clearExisting && (
              <Alert severity="warning">
                <strong>ADVERTENCIA:</strong> Esta acción eliminará permanentemente todos los empleados existentes en la base de datos.
              </Alert>
            )}
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            Información de los Datos Demo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • 14 empleados con datos completos<br />
            • Información personal, contacto, emergencia completa<br />
            • Direcciones en diferentes provincias de Costa Rica<br />
            • Diversos puestos y estados (13 activos, 1 inactivo)<br />
            • Fechas de contratación entre 2017-2023<br />
            • Todos los campos poblados (educación, tallas, cuentas bancarias, notas)
          </Typography>
        </Paper>
      </Stack>
    </Container>
  );
}
