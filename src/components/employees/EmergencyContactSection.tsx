import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import type { ChangeEvent } from 'react';

interface EmergencyContactSectionProps {
  values: {
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
  };
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function EmergencyContactSection({ values, onChange }: EmergencyContactSectionProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" fontWeight={600} color="primary">
        Contacto de Emergencia
      </Typography>
      <Divider />

      <TextField
        name="emergencyContactName"
        label="Nombre del Contacto"
        value={values.emergencyContactName}
        onChange={onChange}
        fullWidth
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          name="emergencyContactPhone"
          label="Teléfono"
          value={values.emergencyContactPhone}
          onChange={onChange}
          inputProps={{ maxLength: 8, inputMode: 'numeric', pattern: '\\d*' }}
          fullWidth
          helperText="8 dígitos"
        />
        <TextField
          name="emergencyContactRelationship"
          label="Parentesco"
          value={values.emergencyContactRelationship}
          onChange={onChange}
          fullWidth
          placeholder="Ej: Madre, Padre, Hermano/a"
        />
      </Stack>
    </Stack>
  );
}
