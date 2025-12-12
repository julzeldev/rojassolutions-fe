import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
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
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import type {
  AddSalaryPayload,
  AddDocumentPayload,
  Employee,
  SalaryEntry,
  VacationSummary,
  CreateEmployeePayload,
} from '../../../../employees/useEmployee';
import { useEmployee } from '../../../../employees/useEmployee';
import { VacationSummaryCard } from './VacationSummaryCard';
import { SalaryCard } from './SalaryCard';
import { PersonalInfoCard } from './PersonalInfoCard';
import { DocumentsCard } from './DocumentsCard';
import { SalaryDialog, type SalaryDialogFormValues } from './SalaryDialog';
import { PersonalInfoEditCard } from './PersonalInfoEditCard';
import { ContactInfoEditCard } from './ContactInfoEditCard';
import { EmergencyContactEditCard } from './EmergencyContactEditCard';
import { WorkInfoEditCard } from './WorkInfoEditCard';
import { AdditionalInfoEditCard } from './AdditionalInfoEditCard';
import type { MaritalStatus } from '../../../../api/employeeService';

interface EmployeeFormValues {
  // Personal Info
  firstName: string;
  firstLastName: string;
  secondLastName: string;
  documentId: string;
  nationality: string;
  dob: string;
  maritalStatus: string;
  education: string;
  // Contact Info
  phone: string;
  email: string;
  province: string;
  canton: string;
  district: string;
  exactAddress: string;
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  // Work Info
  dateOfHire: string;
  position: string;
  status: 'active' | 'inactive';
  shirtSize: string;
  shoeSize: string;
  subsidiaryId: string;
  // Financial
  bankAccount: string;
  // Additional
  notes: string;
}

function toDateInputValue(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.replace(/\//g, '-');
  return date.toISOString().slice(0, 10);
}

const EMPTY_VALUES: EmployeeFormValues = {
  firstName: '',
  firstLastName: '',
  secondLastName: '',
  documentId: '',
  nationality: '',
  dob: '',
  maritalStatus: '',
  education: '',
  phone: '',
  email: '',
  province: '',
  canton: '',
  district: '',
  exactAddress: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  dateOfHire: '',
  position: '',
  status: 'active',
  shirtSize: '',
  shoeSize: '',
  subsidiaryId: '',
  bankAccount: '',
  notes: '',
};

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewEmployee = id === 'nuevo';
  
  const {
    fetchEmployee,
    employee,
    employeeError,
    isLoadingEmployee,
    createEmployee,
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
    addSalary,
    addDocument,
    removeDocument,
    isMutatingDocuments,
    documentError,
  } = useEmployee();

  const [isEditMode, setIsEditMode] = useState<boolean>(isNewEmployee);
  const [formValues, setFormValues] = useState<EmployeeFormValues>(EMPTY_VALUES);
  const [formError, setFormError] = useState<string>('');
  const [isSalaryVisible, setIsSalaryVisible] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);
  const [isAddingSalary, setIsAddingSalary] = useState(false);
  const [salaryReminderDismissed, setSalaryReminderDismissed] = useState(false);

  useEffect(() => {
    if (!id || isNewEmployee) return;
    fetchEmployee(id).catch(() => undefined);
    fetchCurrentSalary(id).catch(() => undefined);
    fetchVacationSummary(id).catch(() => undefined);
    setSalaryReminderDismissed(false);
  }, [fetchCurrentSalary, fetchEmployee, fetchVacationSummary, id, isNewEmployee]);

  useEffect(() => {
    if (employee && !isNewEmployee) {
      setFormValues({
        firstName: employee.firstName || '',
        firstLastName: employee.firstLastName || '',
        secondLastName: employee.secondLastName || '',
        documentId: employee.documentId || '',
        nationality: employee.nationality || '',
        dob: toDateInputValue(employee.dob || ''),
        maritalStatus: employee.maritalStatus || '',
        education: employee.education || '',
        phone: employee.phone || '',
        email: employee.email || '',
        province: employee.address?.province || '',
        canton: employee.address?.canton || '',
        district: employee.address?.district || '',
        exactAddress: employee.address?.exactAddress || '',
        emergencyContactName: employee.emergencyContact?.name || '',
        emergencyContactPhone: employee.emergencyContact?.phone || '',
        emergencyContactRelationship: employee.emergencyContact?.relationship || '',
        dateOfHire: toDateInputValue(employee.dateOfHire || ''),
        position: employee.position || '',
        status: employee.status || 'active',
        shirtSize: employee.shirtSize || '',
        shoeSize: employee.shoeSize || '',
        subsidiaryId: employee.subsidiaryId || '',
        bankAccount: employee.bankAccount || '',
        notes: employee.notes || '',
      });
    }
  }, [employee, isNewEmployee]);

  useEffect(() => {
    if (currentSalary) {
      setSalaryReminderDismissed(false);
    }
  }, [currentSalary]);

  const handleBack = useCallback(() => {
    navigate('/empleados');
  }, [navigate]);

  const handleFormChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  }, []);

  const handleEnterEditMode = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    if (isNewEmployee) {
      navigate('/empleados');
    } else {
      setIsEditMode(false);
      setFormError('');
      // Reset form values to current employee data
      if (employee) {
        setFormValues({
          firstName: employee.firstName || '',
          firstLastName: employee.firstLastName || '',
          secondLastName: employee.secondLastName || '',
          documentId: employee.documentId || '',
          nationality: employee.nationality || '',
          dob: toDateInputValue(employee.dob || ''),
          maritalStatus: employee.maritalStatus || '',
          education: employee.education || '',
          phone: employee.phone || '',
          email: employee.email || '',
          province: employee.address?.province || '',
          canton: employee.address?.canton || '',
          district: employee.address?.district || '',
          exactAddress: employee.address?.exactAddress || '',
          emergencyContactName: employee.emergencyContact?.name || '',
          emergencyContactPhone: employee.emergencyContact?.phone || '',
          emergencyContactRelationship: employee.emergencyContact?.relationship || '',
          dateOfHire: toDateInputValue(employee.dateOfHire || ''),
          position: employee.position || '',
          status: employee.status || 'active',
          shirtSize: employee.shirtSize || '',
          shoeSize: employee.shoeSize || '',
          subsidiaryId: employee.subsidiaryId || '',
          bankAccount: employee.bankAccount || '',
          notes: employee.notes || '',
        });
      }
    }
  }, [isNewEmployee, navigate, employee]);

  const handleSaveEmployee = useCallback(async () => {
    // Validation
    if (!formValues.firstName.trim()) {
      setFormError('El nombre es requerido');
      return;
    }
    if (!formValues.firstLastName.trim()) {
      setFormError('El primer apellido es requerido');
      return;
    }
    if (!formValues.documentId.trim()) {
      setFormError('La identificación es requerida');
      return;
    }
    if (formValues.documentId.length !== 9) {
      setFormError('La identificación debe tener 9 dígitos');
      return;
    }
    if (!formValues.phone.trim()) {
      setFormError('El teléfono es requerido');
      return;
    }
    if (formValues.phone.length !== 8) {
      setFormError('El teléfono debe tener 8 dígitos');
      return;
    }
    if (!formValues.dob) {
      setFormError('La fecha de nacimiento es requerida');
      return;
    }
    if (!formValues.dateOfHire) {
      setFormError('La fecha de ingreso es requerida');
      return;
    }

    const payload: CreateEmployeePayload = {
      firstName: formValues.firstName.trim(),
      firstLastName: formValues.firstLastName.trim(),
      secondLastName: formValues.secondLastName.trim() || undefined,
      documentId: formValues.documentId.trim(),
      nationality: formValues.nationality.trim() || undefined,
      dob: toApiDate(formValues.dob),
      maritalStatus: (formValues.maritalStatus as MaritalStatus) || undefined,
      education: formValues.education.trim() || undefined,
      phone: formValues.phone.trim(),
      email: formValues.email.trim() || undefined,
      address:
        formValues.province || formValues.canton || formValues.district || formValues.exactAddress
          ? {
              province: formValues.province.trim() || undefined,
              canton: formValues.canton.trim() || undefined,
              district: formValues.district.trim() || undefined,
              exactAddress: formValues.exactAddress.trim() || undefined,
            }
          : undefined,
      emergencyContact:
        formValues.emergencyContactName || formValues.emergencyContactPhone || formValues.emergencyContactRelationship
          ? {
              name: formValues.emergencyContactName.trim() || undefined,
              phone: formValues.emergencyContactPhone.trim() || undefined,
              relationship: formValues.emergencyContactRelationship.trim() || undefined,
            }
          : undefined,
      dateOfHire: toApiDate(formValues.dateOfHire),
      position: formValues.position.trim() || undefined,
      status: formValues.status,
      shirtSize: formValues.shirtSize.trim() || undefined,
      shoeSize: formValues.shoeSize.trim() || undefined,
      subsidiaryId: formValues.subsidiaryId || undefined,
      bankAccount: formValues.bankAccount.trim() || undefined,
      notes: formValues.notes.trim() || undefined,
    };

    try {
      if (isNewEmployee) {
        const newEmployee = await createEmployee(payload);
        setSnackbarSeverity('success');
        setSnackbarMessage('Empleado creado correctamente');
        setSnackbarOpen(true);
        // Navigate to the newly created employee detail page
        setTimeout(() => {
          navigate(`/empleados/${newEmployee.id}`);
        }, 500);
      } else if (id) {
        await updateEmployee(id, payload);
        setSnackbarSeverity('success');
        setSnackbarMessage('Empleado actualizado correctamente');
        setSnackbarOpen(true);
        setIsEditMode(false);
      }
    } catch (err) {
      setSnackbarSeverity('error');
      setSnackbarMessage(
        err instanceof Error ? err.message : 'No se pudo guardar el empleado',
      );
      setSnackbarOpen(true);
    }
  }, [formValues, isNewEmployee, createEmployee, updateEmployee, id, navigate]);

  const handleToggleSalary = useCallback(() => {
    setIsSalaryVisible((prev) => !prev);
  }, []);

  const handleRefreshSalary = useCallback(() => {
    if (id) fetchCurrentSalary(id).catch(() => undefined);
  }, [fetchCurrentSalary, id]);

  const handleRefreshVacation = useCallback(() => {
    if (id) fetchVacationSummary(id).catch(() => undefined);
  }, [fetchVacationSummary, id]);

  const handleOpenSalaryDialog = useCallback(() => {
    setIsSalaryDialogOpen(true);
  }, []);

  const handleCloseSalaryDialog = useCallback(() => {
    if (isAddingSalary) return;
    setIsSalaryDialogOpen(false);
  }, [isAddingSalary]);

  const handleSubmitSalary = useCallback(
    async (formValues: SalaryDialogFormValues) => {
      if (!id) return;
      setIsAddingSalary(true);
      try {
        const amount = Number(formValues.amountColones.replace(/,/g, '.'));
        const payload: AddSalaryPayload = {
          amountCents: Math.round(amount * 100),
          currency: 'CRC',
          schedule: formValues.schedule || undefined,
          effectiveFrom: formValues.effectiveFrom,
          note: formValues.note.trim() || undefined,
        };
        await addSalary(id, payload);
        setSnackbarSeverity('success');
        setSnackbarMessage('Salario registrado correctamente');
        setSnackbarOpen(true);
        setIsSalaryDialogOpen(false);
        setSalaryReminderDismissed(false);
      } catch (err) {
        setSnackbarSeverity('error');
        setSnackbarMessage(
          err instanceof Error ? err.message : 'No se pudo registrar el salario',
        );
        setSnackbarOpen(true);
      } finally {
        setIsAddingSalary(false);
      }
    },
    [addSalary, id],
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

  const effectiveEmployee: Employee | null = useMemo(
    () => employee,
    [employee],
  );
  const effectiveSalary: SalaryEntry | null = useMemo(
    () => currentSalary,
    [currentSalary],
  );
  const effectiveVacation: VacationSummary | null = useMemo(
    () => vacationSummary,
    [vacationSummary],
  );

  const detailError = employeeError ?? mutationError;
  const showSalaryReminder = !isNewEmployee && (
    (effectiveSalary && effectiveSalary.amountCents === 0 && !salaryReminderDismissed) ||
    (!isLoadingCurrentSalary && !effectiveSalary && !salaryReminderDismissed)
  );

  const pageTitle = useMemo(() => {
    if (isNewEmployee) return 'Nuevo Empleado';
    if (effectiveEmployee) {
      return `${effectiveEmployee.firstName} ${effectiveEmployee.firstLastName}${effectiveEmployee.secondLastName ? ' ' + effectiveEmployee.secondLastName : ''}`;
    }
    return 'Detalle del empleado';
  }, [isNewEmployee, effectiveEmployee]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Stack spacing={1}>
            <Breadcrumbs>
              <Link underline="hover" color="inherit" onClick={handleBack} sx={{ cursor: 'pointer' }}>
                Empleados
              </Link>
              <Typography color="text.primary">
                {isNewEmployee ? 'Nuevo' : pageTitle}
              </Typography>
            </Breadcrumbs>
            <Typography variant="h4">
              {pageTitle}
            </Typography>
            {effectiveEmployee && !isNewEmployee && (
              <Typography variant="body2" color="text.secondary">
                Ingreso: {new Date(effectiveEmployee.dateOfHire).toLocaleDateString()}
              </Typography>
            )}
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
            {isEditMode ? (
              <>
                <Button
                  startIcon={<CancelIcon />}
                  onClick={handleCancelEdit}
                  variant="outlined"
                  disabled={isSaving}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Cancelar
                </Button>
                <Button
                  startIcon={<SaveIcon />}
                  onClick={handleSaveEmployee}
                  variant="contained"
                  disabled={isSaving}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  startIcon={<EditIcon />}
                  onClick={handleEnterEditMode}
                  variant="contained"
                  disabled={isLoadingEmployee}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Editar
                </Button>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  variant="outlined"
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Volver
                </Button>
              </>
            )}
          </Stack>
        </Stack>

        {detailError && <Alert severity="error">{detailError}</Alert>}
        {formError && <Alert severity="error">{formError}</Alert>}

        {showSalaryReminder && !isEditMode && (
          <Alert
            severity="warning"
            action={
              <Stack direction="row" spacing={1} alignItems="center">
                <Button color="inherit" size="small" onClick={handleOpenSalaryDialog}>
                  Registrar salario
                </Button>
                <IconButton
                  size="small"
                  aria-label="cerrar recordatorio"
                  onClick={() => setSalaryReminderDismissed(true)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            }
          >
            Este colaborador aún no tiene salario registrado. Regístralo cuanto antes.
          </Alert>
        )}

        {isEditMode ? (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <PersonalInfoEditCard values={formValues} onChange={handleFormChange} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ContactInfoEditCard values={formValues} onChange={handleFormChange} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <EmergencyContactEditCard values={formValues} onChange={handleFormChange} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <WorkInfoEditCard values={formValues} onChange={handleFormChange} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdditionalInfoEditCard values={formValues} onChange={handleFormChange} />
            </Grid>
          </Grid>
        ) : isNewEmployee ? (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <PersonalInfoEditCard values={formValues} onChange={handleFormChange} isReadOnly />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ContactInfoEditCard values={formValues} onChange={handleFormChange} isReadOnly />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <EmergencyContactEditCard values={formValues} onChange={handleFormChange} isReadOnly />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <WorkInfoEditCard values={formValues} onChange={handleFormChange} isReadOnly />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdditionalInfoEditCard values={formValues} onChange={handleFormChange} isReadOnly />
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <PersonalInfoEditCard values={formValues} onChange={handleFormChange} isReadOnly />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ContactInfoEditCard values={formValues} onChange={handleFormChange} isReadOnly />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <EmergencyContactEditCard values={formValues} onChange={handleFormChange} isReadOnly />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <WorkInfoEditCard values={formValues} onChange={handleFormChange} isReadOnly />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdditionalInfoEditCard values={formValues} onChange={handleFormChange} isReadOnly />
            </Grid>
            {!isNewEmployee && (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
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
                    onAddSalary={handleOpenSalaryDialog}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 12 }}>
                  <DocumentsCard
                    documents={effectiveEmployee?.documents ?? []}
                    isMutating={isMutatingDocuments}
                    error={documentError}
                    onAdd={handleAddDocument}
                    onRemove={handleRemoveDocument}
                  />
                </Grid>
              </>
            )}
          </Grid>
        )}
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

      <SalaryDialog
        open={isSalaryDialogOpen}
        isSubmitting={isAddingSalary}
        onClose={handleCloseSalaryDialog}
        onSubmit={handleSubmitSalary}
        initialDate={effectiveSalary ? effectiveSalary.effectiveFrom.slice(0, 10) : undefined}
      />
    </Container>
  );
}
