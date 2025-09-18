import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import type { EmployeeStatus, CreateEmployeePayload } from '../../../employees/useEmployee';
import { useEmployee } from '../../../employees/useEmployee';
import { EmployeeToolbar } from './EmployeeToolbar';
import { EmployeeTable } from './EmployeeTable';
import { EmployeeFormDialog } from './EmployeeFormDialog';
import { ConfirmDialog } from '../../../components/ConfirmDialog';

export function EmployeesPage() {
  const navigate = useNavigate();
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
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
    setFormMode('create');
    setSelectedEmployeeId(null);
    setIsFormOpen(true);
  }, []);

  const handleEditRequest = useCallback((id: string) => {
    setFormMode('edit');
    setSelectedEmployeeId(id);
    setIsFormOpen(true);
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

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
  }, []);

  const handleFormSubmit = useCallback(
    async (payload: CreateEmployeePayload) => {
      try {
        if (formMode === 'create') {
          await createEmployee(payload);
        } else if (selectedEmployeeId) {
          await updateEmployee(selectedEmployeeId, payload);
        }
        setIsFormOpen(false);
        setSelectedEmployeeId(null);
        setIsSnackbarOpen(true);
      } catch {
        setIsSnackbarOpen(true);
      }
    },
    [createEmployee, formMode, selectedEmployeeId, updateEmployee],
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
      <EmployeeFormDialog
        open={isFormOpen}
        isSaving={isSaving}
        mode={formMode}
        employee={selectedEmployee}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
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
