import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import type { CreateEmployeePayload, Employee } from '../../../employees/useEmployee';
import type { MaritalStatus } from '../../../api/employeeService';
import { PersonalInfoSection } from '../../../components/employees/PersonalInfoSection';
import { ContactInfoSection } from '../../../components/employees/ContactInfoSection';
import { EmergencyContactSection } from '../../../components/employees/EmergencyContactSection';
import { WorkInfoSection } from '../../../components/employees/WorkInfoSection';
import { AdditionalInfoSection } from '../../../components/employees/AdditionalInfoSection';

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
  // Financial
  bankAccount: string;
  // Additional
  notes: string;
}

interface EmployeeFormDialogProps {
  open: boolean;
  isSaving: boolean;
  mode: 'create' | 'edit';
  employee: Employee | null;
  onClose: () => void;
  onSubmit: (payload: CreateEmployeePayload) => void;
}

function toDateInputValue(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.replace(/\//g, '-');
  return date.toISOString().slice(0, 10);
}

function toApiDate(value: string): string {
  return value;
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
  bankAccount: '',
  notes: '',
};

export function EmployeeFormDialog({
  open,
  isSaving,
  mode,
  employee,
  onClose,
  onSubmit,
}: EmployeeFormDialogProps) {
  const [values, setValues] = useState<EmployeeFormValues>(EMPTY_VALUES);
  const [error, setError] = useState<string>('');

  // Initialize form when dialog opens or employee changes
  useEffect(() => {
    if (open) {
      if (employee && mode === 'edit') {
        setValues({
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
          bankAccount: employee.bankAccount || '',
          notes: employee.notes || '',
        });
      } else {
        setValues(EMPTY_VALUES);
      }
      setError('');
    }
  }, [open, employee, mode]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setError('');
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();

      // Validation
      if (!values.firstName.trim()) {
        setError('El nombre es requerido');
        return;
      }
      if (!values.firstLastName.trim()) {
        setError('El primer apellido es requerido');
        return;
      }
      if (!values.documentId.trim()) {
        setError('La identificación es requerida');
        return;
      }
      if (values.documentId.length !== 9) {
        setError('La identificación debe tener 9 dígitos');
        return;
      }
      if (!values.phone.trim()) {
        setError('El teléfono es requerido');
        return;
      }
      if (values.phone.length !== 8) {
        setError('El teléfono debe tener 8 dígitos');
        return;
      }
      if (!values.dob) {
        setError('La fecha de nacimiento es requerida');
        return;
      }
      if (!values.dateOfHire) {
        setError('La fecha de ingreso es requerida');
        return;
      }

      const payload: CreateEmployeePayload = {
        firstName: values.firstName.trim(),
        firstLastName: values.firstLastName.trim(),
        secondLastName: values.secondLastName.trim() || undefined,
        documentId: values.documentId.trim(),
        nationality: values.nationality.trim() || undefined,
        dob: toApiDate(values.dob),
        maritalStatus: (values.maritalStatus as MaritalStatus) || undefined,
        education: values.education.trim() || undefined,
        phone: values.phone.trim(),
        email: values.email.trim() || undefined,
        address:
          values.province || values.canton || values.district || values.exactAddress
            ? {
                province: values.province.trim() || undefined,
                canton: values.canton.trim() || undefined,
                district: values.district.trim() || undefined,
                exactAddress: values.exactAddress.trim() || undefined,
              }
            : undefined,
        emergencyContact:
          values.emergencyContactName || values.emergencyContactPhone || values.emergencyContactRelationship
            ? {
                name: values.emergencyContactName.trim() || undefined,
                phone: values.emergencyContactPhone.trim() || undefined,
                relationship: values.emergencyContactRelationship.trim() || undefined,
              }
            : undefined,
        dateOfHire: toApiDate(values.dateOfHire),
        position: values.position.trim() || undefined,
        status: values.status,
        shirtSize: values.shirtSize.trim() || undefined,
        shoeSize: values.shoeSize.trim() || undefined,
        bankAccount: values.bankAccount.trim() || undefined,
        notes: values.notes.trim() || undefined,
      };

      onSubmit(payload);
    },
    [values, onSubmit]
  );

  const title = useMemo(() => (mode === 'create' ? 'Agregar Empleado' : 'Editar Empleado'), [mode]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Stack spacing={4}>
            <PersonalInfoSection values={values} onChange={handleChange} />
            <ContactInfoSection values={values} onChange={handleChange} />
            <EmergencyContactSection values={values} onChange={handleChange} />
            <WorkInfoSection values={values} onChange={handleChange} />
            <AdditionalInfoSection values={values} onChange={handleChange} />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={isSaving}>
          {isSaving ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
