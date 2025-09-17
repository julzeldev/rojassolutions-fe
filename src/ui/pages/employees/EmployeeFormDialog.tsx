import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import type { CreateEmployeePayload, Employee } from '../../../employees/useEmployee';

interface EmployeeFormValues {
  firstName: string;
  lastName: string;
  documentId: string;
  dob: string;
  dateOfHire: string;
  status: 'active' | 'inactive';
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
  return value.replace(/-/g, '/');
}

const EMPTY_VALUES: EmployeeFormValues = {
  firstName: '',
  lastName: '',
  documentId: '',
  dob: '',
  dateOfHire: '',
  status: 'active',
};

export function EmployeeFormDialog({
  open,
  isSaving,
  mode,
  employee,
  onClose,
  onSubmit,
}: EmployeeFormDialogProps) {
  const initialValues = useMemo<EmployeeFormValues>(() => {
    if (mode === 'edit' && employee) {
      return {
        firstName: employee.firstName,
        lastName: employee.lastName,
        documentId: employee.documentId,
        dob: toDateInputValue(employee.dob),
        dateOfHire: toDateInputValue(employee.dateOfHire),
        status: employee.status,
      };
    }
    return EMPTY_VALUES;
  }, [employee, mode]);

  const [values, setValues] = useState<EmployeeFormValues>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const payload: CreateEmployeePayload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        documentId: values.documentId.trim(),
        dob: toApiDate(values.dob),
        dateOfHire: toApiDate(values.dateOfHire),
        status: values.status,
      };
      onSubmit(payload);
    },
    [onSubmit, values],
  );

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>
          {mode === 'create' ? 'Nuevo empleado' : 'Editar empleado'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} paddingTop={1}>
            <TextField
              name="firstName"
              label="Nombre"
              value={values.firstName}
              onChange={handleInputChange}
              required
              fullWidth
            />
            <TextField
              name="lastName"
              label="Apellido"
              value={values.lastName}
              onChange={handleInputChange}
              required
              fullWidth
            />
            <TextField
              name="documentId"
              label="Identificación"
              value={values.documentId}
              onChange={handleInputChange}
              required
              inputProps={{ maxLength: 9 }}
              fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                name="dob"
                label="Fecha de nacimiento"
                type="date"
                value={values.dob}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
              />
              <TextField
                name="dateOfHire"
                label="Fecha de ingreso"
                type="date"
                value={values.dateOfHire}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
              />
            </Stack>
            <TextField
              select
              name="status"
              label="Estado"
              value={values.status}
              onChange={handleInputChange}
              fullWidth
            >
              <MenuItem value="active">Activo</MenuItem>
              <MenuItem value="inactive">Inactivo</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isSaving}>
            {mode === 'create' ? 'Crear' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
