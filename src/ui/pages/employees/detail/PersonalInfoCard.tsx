import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import CircularProgress from '@mui/material/CircularProgress';
import type { Employee, UpdateEmployeePayload } from '../../../../employees/useEmployee';

interface PersonalInfoCardProps {
  employee: Employee | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  onSubmit: (id: string, payload: UpdateEmployeePayload) => Promise<void>;
}

interface PersonalInfoFormValues {
  firstName: string;
  lastName: string;
  documentId: string;
  phone: string;
  email: string;
  dob: string;
  dateOfHire: string;
  status: 'active' | 'inactive';
}

const EMPTY_VALUES: PersonalInfoFormValues = {
  firstName: '',
  lastName: '',
  documentId: '',
  phone: '',
  email: '',
  dob: '',
  dateOfHire: '',
  status: 'active',
};

function toDateInput(value: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value.replace(/\//g, '-');
  return parsed.toISOString().slice(0, 10);
}

function toApiDate(value: string): string | undefined {
  if (!value) return undefined;
  return value.replace(/-/g, '/');
}

export function PersonalInfoCard({ employee, isLoading, isSaving, error, onSubmit }: PersonalInfoCardProps) {
  const initialValues = useMemo<PersonalInfoFormValues>(() => {
    if (!employee) return EMPTY_VALUES;
    return {
      firstName: employee.firstName,
      lastName: employee.lastName,
      documentId: employee.documentId,
      phone: employee.phone,
      email: employee.email ?? '',
      dob: toDateInput(employee.dob),
      dateOfHire: toDateInput(employee.dateOfHire),
      status: employee.status,
    };
  }, [employee]);

  const [values, setValues] = useState<PersonalInfoFormValues>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!employee) return;
      const payload: UpdateEmployeePayload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        documentId: values.documentId.trim(),
        phone: values.phone.trim(),
        email: values.email.trim() || undefined,
        dob: toApiDate(values.dob),
        dateOfHire: toApiDate(values.dateOfHire),
        status: values.status,
      };
      await onSubmit(employee.id, payload);
    },
    [employee, onSubmit, values],
  );

  const disabled = isSaving || isLoading || !employee;

  return (
    <Card component="form" onSubmit={handleSubmit}>
      <CardHeader
        avatar={(
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <PersonIcon />
          </Avatar>
        )}
        title="Información personal"
        subheader={employee?.documentId ? `Documento ${employee.documentId}` : undefined}
      />
      <CardContent>
        {isLoading && !employee ? (
          <Stack alignItems="center" paddingY={3}>
            <CircularProgress />
          </Stack>
        ) : (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              name="firstName"
              label="Nombre"
              value={values.firstName}
              onChange={handleChange}
              required
              fullWidth
              disabled={disabled}
            />
            <TextField
              name="lastName"
              label="Apellido"
              value={values.lastName}
              onChange={handleChange}
              required
              fullWidth
              disabled={disabled}
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              name="documentId"
              label="Identificación"
              value={values.documentId}
              onChange={handleChange}
              required
              inputProps={{ maxLength: 9 }}
              fullWidth
              disabled={disabled}
            />
            <TextField
              name="phone"
              label="Teléfono"
              value={values.phone}
              onChange={handleChange}
              required
              inputProps={{ maxLength: 8, inputMode: 'numeric', pattern: '\\d*' }}
              fullWidth
              disabled={disabled}
            />
          </Stack>
          <TextField
            name="email"
            label="Correo electrónico"
            value={values.email}
            onChange={handleChange}
            type="email"
            fullWidth
            disabled={disabled}
          />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              name="dob"
              label="Fecha de nacimiento"
              type="date"
              value={values.dob}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
              disabled={disabled}
            />
            <TextField
              name="dateOfHire"
              label="Fecha de ingreso"
              type="date"
              value={values.dateOfHire}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
              disabled={disabled}
            />
          </Stack>
          <TextField
            select
            name="status"
            label="Estado"
            value={values.status}
            onChange={handleChange}
            fullWidth
            disabled={disabled}
          >
            <MenuItem value="active">Activo</MenuItem>
            <MenuItem value="inactive">Inactivo</MenuItem>
          </TextField>
          {employee?.updatedAt && (
            <Typography variant="caption" color="text.secondary">
              Última actualización {new Date(employee.updatedAt).toLocaleString()}
            </Typography>
          )}
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
        </Stack>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" disabled={disabled}>
          Guardar cambios
        </Button>
      </CardActions>
    </Card>
  );
}
