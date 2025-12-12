import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Typography,
  CircularProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
  Stack,
  Fab,
  Tooltip,
  Link,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../auth/useAuth';
import { subsidiaryService, type Subsidiary } from '../../../api/subsidiaryService';
import SubsidiaryFormDialog from './SubsidiaryFormDialog';
import SubsidiaryDetailDialog from './SubsidiaryDetailDialog';
import { ConfirmDialog } from '../../../components/ConfirmDialog';

export default function SubsidiariesPage() {
  const { accessToken } = useAuth();
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('');
  
  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<Subsidiary | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [subsidiaryToDelete, setSubsidiaryToDelete] = useState<Subsidiary | null>(null);

  const loadSubsidiaries = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await subsidiaryService.getSubsidiaries({
        q: searchQuery || undefined,
        status: statusFilter || undefined,
      }, accessToken);
      setSubsidiaries(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar sucursales');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, accessToken]);

  useEffect(() => {
    loadSubsidiaries();
  }, [loadSubsidiaries]);

  const handleCreate = () => {
    setSelectedSubsidiary(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (subsidiary: Subsidiary) => {
    setSelectedSubsidiary(subsidiary);
    setFormDialogOpen(true);
  };

  const handleView = (subsidiary: Subsidiary) => {
    setSelectedSubsidiary(subsidiary);
    setDetailDialogOpen(true);
  };

  const handleDeleteClick = (subsidiary: Subsidiary) => {
    setSubsidiaryToDelete(subsidiary);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subsidiaryToDelete || !accessToken) return;

    try {
      await subsidiaryService.deleteSubsidiary(subsidiaryToDelete.id, accessToken);
      setDeleteConfirmOpen(false);
      setSubsidiaryToDelete(null);
      loadSubsidiaries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar sucursal');
      setDeleteConfirmOpen(false);
    }
  };

  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    loadSubsidiaries();
  };

  if (loading && subsidiaries.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Sucursales
        </Typography>
      </Box>

      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant={statusFilter === 'active' ? 'contained' : 'outlined'}
            onClick={() => setStatusFilter(statusFilter === 'active' ? '' : 'active')}
            size="small"
          >
            Activas
          </Button>
          <Button
            variant={statusFilter === 'inactive' ? 'contained' : 'outlined'}
            onClick={() => setStatusFilter(statusFilter === 'inactive' ? '' : 'inactive')}
            size="small"
          >
            Inactivas
          </Button>
        </Stack>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subsidiaries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    {searchQuery || statusFilter
                      ? 'No se encontraron sucursales con los filtros aplicados'
                      : 'No hay sucursales registradas. Haz clic en + para agregar una.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              subsidiaries.map((subsidiary) => (
                <TableRow
                  key={subsidiary.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleView(subsidiary)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {subsidiary.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={subsidiary.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <LocationOnIcon fontSize="small" />
                      Ver en Maps
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {subsidiary.contact?.name || subsidiary.contact?.phone || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={subsidiary.status === 'active' ? 'Activa' : 'Inactiva'}
                      color={subsidiary.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(subsidiary)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(subsidiary)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* FAB */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={handleCreate}
      >
        <AddIcon />
      </Fab>

      {/* Dialogs */}
      <SubsidiaryFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
        subsidiary={selectedSubsidiary}
      />

      <SubsidiaryDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        subsidiary={selectedSubsidiary}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Eliminar Sucursal"
        content={`¿Estás seguro de que deseas eliminar la sucursal "${subsidiaryToDelete?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setSubsidiaryToDelete(null);
        }}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
      />
    </Box>
  );
}
