import { useState, useCallback, type ChangeEvent } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: Array<{ documentId: string; error: string }>;
  message: string;
}

interface ImportExportDialogProps {
  open: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
  onExport: (format: 'csv' | 'xlsx') => void;
  accessToken: string;
}

type ImportStrategy = 'skip' | 'update' | 'replace';

export function ImportExportDialog({
  open,
  onClose,
  onImportSuccess,
  onExport,
  accessToken,
}: ImportExportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [strategy, setStrategy] = useState<ImportStrategy>('skip');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  const apiBase = (import.meta as any)?.env?.VITE_API_BASE as string | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any
  const apiUrl = apiBase || 'http://localhost:5001';

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(csv|xlsx)$/i)) {
        setError('Por favor selecciona un archivo CSV o Excel válido');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  }, []);

  const handleStrategyChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setStrategy(event.target.value as ImportStrategy);
  }, []);

  const handleImport = useCallback(async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('strategy', strategy);

      const response = await fetch(`${apiUrl}/employees/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      const importResult: ImportResult = await response.json();
      setResult(importResult);

      if (importResult.imported > 0 || importResult.updated > 0) {
        onImportSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al importar empleados');
    } finally {
      setLoading(false);
    }
  }, [file, strategy, accessToken, apiUrl, onImportSuccess]);

  const handleClose = useCallback(() => {
    if (!loading) {
      setFile(null);
      setStrategy('skip');
      setResult(null);
      setError(null);
      onClose();
    }
  }, [loading, onClose]);

  const handleExportMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  }, []);

  const handleExportMenuClose = useCallback(() => {
    setExportMenuAnchor(null);
  }, []);

  const handleExportFormat = useCallback(
    (format: 'csv' | 'xlsx') => {
      onExport(format);
      setExportMenuAnchor(null);
    },
    [onExport],
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Importar / Exportar Empleados</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 2 }}>
          {/* Export Section */}
          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Exportar Datos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Descarga todos los empleados en formato CSV o Excel
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              endIcon={<ArrowDropDownIcon />}
              onClick={handleExportMenuOpen}
              fullWidth
            >
              Descargar Empleados
            </Button>
            <Menu
              anchorEl={exportMenuAnchor}
              open={Boolean(exportMenuAnchor)}
              onClose={handleExportMenuClose}
            >
              <MenuItem onClick={() => handleExportFormat('csv')}>
                Formato CSV (.csv)
              </MenuItem>
              <MenuItem onClick={() => handleExportFormat('xlsx')}>
                Formato Excel (.xlsx)
              </MenuItem>
            </Menu>
          </Box>

          {/* Divider */}
          <Box sx={{ borderTop: 1, borderColor: 'divider', my: 2 }} />

          {/* Import Section */}
          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Importar Datos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Sube un archivo CSV o Excel con empleados
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {result && (
            <Alert
              severity={result.errors.length > 0 ? 'warning' : 'success'}
              icon={result.errors.length > 0 ? <WarningIcon /> : <CheckCircleIcon />}
            >
              <Typography variant="subtitle2" gutterBottom>
                {result.message}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                {result.imported > 0 && (
                  <Chip
                    size="small"
                    label={`${result.imported} nuevos`}
                    color="success"
                    variant="outlined"
                  />
                )}
                {result.updated > 0 && (
                  <Chip
                    size="small"
                    label={`${result.updated} actualizados`}
                    color="info"
                    variant="outlined"
                  />
                )}
                {result.skipped > 0 && (
                  <Chip
                    size="small"
                    label={`${result.skipped} omitidos`}
                    color="default"
                    variant="outlined"
                  />
                )}
                {result.errors.length > 0 && (
                  <Chip
                    size="small"
                    label={`${result.errors.length} errores`}
                    color="error"
                    variant="outlined"
                  />
                )}
              </Stack>

              {result.errors.length > 0 && (
                <Box sx={{ mt: 2, maxHeight: 150, overflow: 'auto' }}>
                  <Typography variant="caption" color="error" component="div">
                    <strong>Errores:</strong>
                  </Typography>
                  {result.errors.map((err, idx) => (
                    <Typography key={idx} variant="caption" color="error" component="div">
                      • {err.documentId}: {err.error}
                    </Typography>
                  ))}
                </Box>
              )}
            </Alert>
          )}

          <Box>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              fullWidth
              disabled={loading}
            >
              {file ? file.name : 'Seleccionar archivo CSV o Excel'}
              <input
                type="file"
                hidden
                accept=".csv,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                onChange={handleFileChange}
              />
            </Button>
            {file && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Archivo seleccionado: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </Typography>
            )}
          </Box>

          <FormControl component="fieldset" disabled={loading}>
            <FormLabel component="legend">Estrategia de Importación</FormLabel>
            <RadioGroup value={strategy} onChange={handleStrategyChange}>
              <FormControlLabel
                value="skip"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      Omitir duplicados
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Solo importar empleados nuevos, mantener los existentes sin cambios
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="update"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      Actualizar existentes
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Importar nuevos y actualizar empleados existentes (por cédula)
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="replace"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={500} color="error">
                      Reemplazar todo
                    </Typography>
                    <Typography variant="caption" color="error">
                      ⚠️ PELIGROSO: Eliminar todos los empleados e importar desde cero
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          {strategy === 'replace' && (
            <Alert severity="error" icon={<ErrorIcon />}>
              <strong>ADVERTENCIA:</strong> Esta acción eliminará TODOS los empleados existentes
              y los reemplazará con los datos del archivo.
            </Alert>
          )}

          {loading && <LinearProgress />}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          {result ? 'Cerrar' : 'Cancelar'}
        </Button>
        {!result && (
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={!file || loading}
            color={strategy === 'replace' ? 'error' : 'primary'}
          >
            {loading ? 'Importando...' : 'Importar'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
