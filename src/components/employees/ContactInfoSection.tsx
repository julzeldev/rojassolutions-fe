import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import type { ChangeEvent } from 'react';

interface ContactInfoSectionProps {
  values: {
    phone: string;
    email: string;
    province: string;
    canton: string;
    district: string;
    exactAddress: string;
  };
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function ContactInfoSection({ values, onChange }: ContactInfoSectionProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" fontWeight={600} color="primary">
        Información de Contacto
      </Typography>
      <Divider />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          name="phone"
          label="Teléfono *"
          value={values.phone}
          onChange={onChange}
          required
          inputProps={{ maxLength: 8, inputMode: 'numeric', pattern: '\\d*' }}
          fullWidth
          helperText="8 dígitos"
        />
        <TextField
          name="email"
          label="Correo Electrónico"
          value={values.email}
          onChange={onChange}
          type="email"
          fullWidth
        />
      </Stack>

      <Typography variant="body2" fontWeight={500} color="text.secondary" sx={{ mt: 1 }}>
        Domicilio
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          name="province"
          label="Provincia"
          value={values.province}
          onChange={onChange}
          fullWidth
        />
        <TextField
          name="canton"
          label="Cantón"
          value={values.canton}
          onChange={onChange}
          fullWidth
        />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          name="district"
          label="Distrito"
          value={values.district}
          onChange={onChange}
          fullWidth
        />
      </Stack>

      <TextField
        name="exactAddress"
        label="Dirección Exacta"
        value={values.exactAddress}
        onChange={onChange}
        multiline
        rows={2}
        fullWidth
        placeholder="Detalles de la dirección"
      />
    </Stack>
  );
}
