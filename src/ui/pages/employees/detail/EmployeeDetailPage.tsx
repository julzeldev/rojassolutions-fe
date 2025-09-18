import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type {
  AddDocumentPayload,
  Employee,
  SalaryEntry,
  VacationSummary,
  UpdateEmployeePayload,
} from '../../../../employees/useEmployee';
import { useEmployee } from '../../../../employees/useEmployee';
import { VacationSummaryCard } from './VacationSummaryCard';
import { SalaryCard } from './SalaryCard';
import { PersonalInfoCard } from './PersonalInfoCard';
import { DocumentsCard } from './DocumentsCard';

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    fetchEmployee,
    employee,
    employeeError,
    isLoadingEmployee,
    updateEmployee,
    isSaving,
    mutationError,
    fetchCurrentSalary,
    currentSalary,
    isLoadingCurrentSalary,
    fetchVacationSummary,
    vacationSummary,
    isLoadingVacation,
    vacationError,
    addDocument,
    removeDocument,
    isMutatingDocuments,
    documentError,
  } = useEmployee();

  const [isSalaryVisible, setIsSalaryVisible] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (!id) return;
    fetchEmployee(id).catch(() => undefined);
    fetchCurrentSalary(id).catch(() => undefined);
    fetchVacationSummary(id).catch(() => undefined);
  }, [fetchCurrentSalary, fetchEmployee, fetchVacationSummary, id]);

  const handleBack = useCallback(() => {
    navigate('/empleados');
  }, [navigate]);

  const handleToggleSalary = useCallback(() => {
    setIsSalaryVisible((prev) => !prev);
  }, []);

  const handleRefreshSalary = useCallback(() => {
    if (id) fetchCurrentSalary(id).catch(() => undefined);
  }, [fetchCurrentSalary, id]);

  const handleRefreshVacation = useCallback(() => {
    if (id) fetchVacationSummary(id).catch(() => undefined);
  }, [fetchVacationSummary, id]);

  const handlePersonalInfoSubmit = useCallback(
    async (employeeId: string, payload: UpdateEmployeePayload) => {
      try {
        await updateEmployee(employeeId, payload);
        setSnackbarSeverity('success');
        setSnackbarMessage('Información actualizada correctamente');
        setSnackbarOpen(true);
      } catch (err) {
        setSnackbarSeverity('error');
        setSnackbarMessage(
          err instanceof Error ? err.message : 'No se pudo actualizar la información',
        );
        setSnackbarOpen(true);
      }
    },
    [updateEmployee],
  );

  const handleAddDocument = useCallback(
    async (payload: AddDocumentPayload) => {
      if (!id) return;
      try {
        await addDocument(id, payload);
        setSnackbarSeverity('success');
        setSnackbarMessage('Documento adjuntado correctamente');
        setSnackbarOpen(true);
      } catch (err) {
        setSnackbarSeverity('error');
        setSnackbarMessage(
          err instanceof Error ? err.message : 'No se pudo adjuntar el documento',
        );
        setSnackbarOpen(true);
        throw err;
      }
    },
    [addDocument, id],
  );

  const handleRemoveDocument = useCallback(
    async (documentId: string) => {
      if (!id) return;
      try {
        await removeDocument(id, documentId);
        setSnackbarSeverity('success');
        setSnackbarMessage('Documento eliminado');
        setSnackbarOpen(true);
      } catch (err) {
        setSnackbarSeverity('error');
        setSnackbarMessage(
          err instanceof Error ? err.message : 'No se pudo eliminar el documento',
        );
        setSnackbarOpen(true);
        throw err;
      }
    },
    [id, removeDocument],
  );

  const effectiveEmployee: Employee | null = useMemo(() => employee, [employee]);
  const effectiveSalary: SalaryEntry | null = useMemo(() => currentSalary, [currentSalary]);
  const effectiveVacation: VacationSummary | null = useMemo(
    () => vacationSummary,
    [vacationSummary],
  );

  const detailError = employeeError ?? mutationError;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Stack spacing={1}>
            <Breadcrumbs>
              <Link underline="hover" color="inherit" onClick={handleBack} sx={{ cursor: 'pointer' }}>
                Empleados
              </Link>
              <Typography color="text.primary">
                {effectiveEmployee ? `${effectiveEmployee.firstName} ${effectiveEmployee.lastName}` : 'Detalle'}
              </Typography>
            </Breadcrumbs>
            <Typography variant="h4">
              {effectiveEmployee ? `${effectiveEmployee.firstName} ${effectiveEmployee.lastName}` : 'Detalle del empleado'}
            </Typography>
            {effectiveEmployee && (
              <Typography variant="body2" color="text.secondary">
                Ingreso: {new Date(effectiveEmployee.dateOfHire).toLocaleDateString()}
              </Typography>
            )}
          </Stack>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBack} variant="outlined">
            Volver
          </Button>
        </Stack>

        {detailError && (
          <Alert severity="error">{detailError}</Alert>
        )}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <PersonalInfoCard
              employee={effectiveEmployee}
              isLoading={isLoadingEmployee}
              isSaving={isSaving}
              error={mutationError}
              onSubmit={handlePersonalInfoSubmit}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <VacationSummaryCard
              summary={effectiveVacation}
              isLoading={isLoadingVacation}
              error={vacationError}
              onRefresh={handleRefreshVacation}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <SalaryCard
              salary={effectiveSalary}
              isLoading={isLoadingCurrentSalary}
              isVisible={isSalaryVisible}
              onToggleVisibility={handleToggleSalary}
              onRefresh={handleRefreshSalary}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DocumentsCard
              documents={effectiveEmployee?.documents ?? []}
              isMutating={isMutatingDocuments}
              error={documentError}
              onAdd={handleAddDocument}
              onRemove={handleRemoveDocument}
            />
          </Grid>
        </Grid>
      </Stack>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)} variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
