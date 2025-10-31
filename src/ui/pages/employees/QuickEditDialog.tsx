import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import type { Employee } from '../../../employees/useEmployee';

interface QuickEditFormValues {
  firstName: string;
  firstLastName: string;
  secondLastName: string;
  phone: string;
  email: string;
}

interface QuickEditDialogProps {
  open: boolean;
  isSaving: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSubmit: (payload: QuickEditFormValues) => void;
}

const EMPTY_VALUES: QuickEditFormValues = {
  firstName: '',
  firstLastName: '',
  secondLastName: '',
  phone: '',
  email: '',
};

export function QuickEditDialog({
  open,
  isSaving,
  employee,
  onClose,
  onSubmit,
}: QuickEditDialogProps) {
  const [values, setValues] = useState<QuickEditFormValues>(EMPTY_VALUES);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open && employee) {
      setValues({
        firstName: employee.firstName || '',
        firstLastName: employee.firstLastName || '',
        secondLastName: employee.secondLastName || '',
        phone: employee.phone || '',
        email: employee.email || '',
      });
      setError('');
    } else if (!open) {
      setValues(EMPTY_VALUES);
      setError('');
    }
  }, [open, employee]);

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
      if (!values.phone.trim()) {
        setError('El teléfono es requerido');
        return;
      }
      if (values.phone.trim().length !== 8) {
        setError('El teléfono debe tener 8 dígitos');
        return;
      }

      onSubmit({
        firstName: values.firstName.trim(),
        firstLastName: values.firstLastName.trim(),
        secondLastName: values.secondLastName.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
      });
    },
    [values, onSubmit]
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>Edición Rápida</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error">{error}</Alert>
          )}

          <TextField
            name="firstName"
            label="Nombre *"
            value={values.firstName}
            onChange={handleChange}
            required
            fullWidth
            autoFocus
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              name="firstLastName"
              label="Primer Apellido *"
              value={values.firstLastName}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="secondLastName"
              label="Segundo Apellido"
              value={values.secondLastName}
              onChange={handleChange}
              fullWidth
            />
          </Stack>

          <TextField
            name="phone"
            label="Teléfono *"
            value={values.phone}
            onChange={handleChange}
            required
            inputProps={{ maxLength: 8, inputMode: 'numeric', pattern: '\\d*' }}
            fullWidth
            helperText="8 dígitos"
          />

          <TextField
            name="email"
            label="Correo Electrónico"
            value={values.email}
            onChange={handleChange}
            type="email"
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
