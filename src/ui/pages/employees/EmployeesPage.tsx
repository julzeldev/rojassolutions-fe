import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import type { EmployeeStatus } from '../../../employees/useEmployee';
import { useEmployee } from '../../../employees/useEmployee';
import { EmployeeToolbar } from './EmployeeToolbar';
import { EmployeeTable } from './EmployeeTable';
import { QuickEditDialog } from './QuickEditDialog';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { ImportExportDialog } from './ImportExportDialog';
import { useAuth } from '../../../auth/useAuth';

export function EmployeesPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const {
    employees,
    isLoadingList,
    listError,
    listEmployees,
    mutationError,
    isSaving,
    isDeleting,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployee();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<EmployeeStatus | ''>('');
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  const listParams = useMemo(() => {
    return {
      q: query.trim() ? query.trim() : undefined,
      status: status || undefined,
    };
  }, [query, status]);

  useEffect(() => {
    listEmployees(listParams).catch(() => undefined);
  }, [listEmployees, listParams]);

  useEffect(() => {
    if (listError || mutationError) {
      setIsSnackbarOpen(true);
    }
  }, [listError, mutationError]);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const handleStatusChange = useCallback((value: EmployeeStatus | '') => {
    setStatus(value);
  }, []);

  const handleCreateClick = useCallback(() => {
    navigate('/empleados/nuevo');
  }, [navigate]);

  const handleEditRequest = useCallback((id: string) => {
    setSelectedEmployeeId(id);
    setIsQuickEditOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((id: string) => {
    setDeleteTargetId(id);
  }, []);

  const handleSelectEmployee = useCallback(
    (id: string) => {
      navigate(`/empleados/${id}`);
    },
    [navigate],
  );

  const handleCloseQuickEdit = useCallback(() => {
    setIsQuickEditOpen(false);
    setSelectedEmployeeId(null);
  }, []);

  const handleQuickEditSubmit = useCallback(
    async (payload: { firstName: string; firstLastName: string; secondLastName: string; phone: string; email: string }) => {
      if (!selectedEmployeeId) return;
      try {
        await updateEmployee(selectedEmployeeId, payload);
        setIsQuickEditOpen(false);
        setSelectedEmployeeId(null);
        setIsSnackbarOpen(true);
      } catch {
        setIsSnackbarOpen(true);
      }
    },
    [selectedEmployeeId, updateEmployee],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTargetId) return;
    try {
      await deleteEmployee(deleteTargetId);
      setIsSnackbarOpen(true);
    } catch {
      setIsSnackbarOpen(true);
    } finally {
      setDeleteTargetId(null);
    }
  }, [deleteEmployee, deleteTargetId]);

  const handleCancelDelete = useCallback(() => {
    setDeleteTargetId(null);
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setIsSnackbarOpen(false);
  }, []);

  const handleRefresh = useCallback(() => {
    listEmployees(listParams).catch(() => undefined);
  }, [listEmployees, listParams]);

  const handleExport = useCallback(async (format: 'csv' | 'xlsx' = 'csv') => {
    try {
      const apiBase = (import.meta as any)?.env?.VITE_API_BASE as string | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any
      const apiUrl = apiBase || 'http://localhost:5001';

      const response = await fetch(`${apiUrl}/employees/export?format=${format}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = format === 'xlsx' ? 'xlsx' : 'csv';
      link.download = `empleados_${timestamp}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setIsSnackbarOpen(true);
    } catch (error) {
      console.error('Export error:', error);
      setIsSnackbarOpen(true);
    }
  }, [accessToken]);

  const handleImportClick = useCallback(() => {
    setIsImportExportOpen(true);
  }, []);

  const handleImportClose = useCallback(() => {
    setIsImportExportOpen(false);
  }, []);

  const handleImportSuccess = useCallback(() => {
    listEmployees(listParams).catch(() => undefined);
  }, [listEmployees, listParams]);

  const selectedEmployee = useMemo(() => {
    return employees.find((item) => item.id === selectedEmployeeId) ?? null;
  }, [employees, selectedEmployeeId]);

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          Empleados
        </Typography>
        <EmployeeToolbar
          query={query}
          status={status}
          isRefreshing={isLoadingList}
          onQueryChange={handleQueryChange}
          onStatusChange={handleStatusChange}
          onCreate={handleCreateClick}
          onRefresh={handleRefresh}
          onImport={handleImportClick}
        />
        {listError && (
          <Alert severity="error">{listError}</Alert>
        )}
        {mutationError && !listError && (
          <Alert severity="error">{mutationError}</Alert>
        )}
        <EmployeeTable
          employees={employees}
          isLoading={isLoadingList}
          onEdit={handleEditRequest}
          onDelete={handleDeleteRequest}
          onSelect={handleSelectEmployee}
        />
      </Stack>
      <QuickEditDialog
        open={isQuickEditOpen}
        isSaving={isSaving}
        employee={selectedEmployee}
        onClose={handleCloseQuickEdit}
        onSubmit={handleQuickEditSubmit}
      />
      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="Eliminar empleado"
        content="Esta acción marcará al empleado como inactivo. ¿Deseas continuar?"
        confirmLabel={isDeleting ? 'Eliminando...' : 'Eliminar'}
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmDisabled={isDeleting}
      />
      <ImportExportDialog
        open={isImportExportOpen}
        onClose={handleImportClose}
        onImportSuccess={handleImportSuccess}
        onExport={handleExport}
        accessToken={accessToken || ''}
      />
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {listError || mutationError ? (
          <Alert severity="error" onClose={handleSnackbarClose} variant="filled">
            {listError || mutationError}
          </Alert>
        ) : (
          <Alert severity="success" onClose={handleSnackbarClose} variant="filled">
            Operación completada correctamente
          </Alert>
        )}
      </Snackbar>
    </Container>
  );
}
