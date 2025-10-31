import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import type { ChangeEvent } from 'react';

interface WorkInfoSectionProps {
  values: {
    dateOfHire: string;
    position: string;
    status: string;
    shirtSize: string;
    shoeSize: string;
  };
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function WorkInfoSection({ values, onChange }: WorkInfoSectionProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" fontWeight={600} color="primary">
        Información Laboral
      </Typography>
      <Divider />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          name="dateOfHire"
          label="Fecha de Ingreso *"
          type="date"
          value={values.dateOfHire}
          onChange={onChange}
          InputLabelProps={{ shrink: true }}
          required
          fullWidth
        />
        <TextField
          name="position"
          label="Puesto"
          value={values.position}
          onChange={onChange}
          fullWidth
          placeholder="Ej: Desarrollador, Gerente"
        />
      </Stack>

      <TextField
        select
        name="status"
        label="Estado *"
        value={values.status}
        onChange={onChange}
        required
        fullWidth
      >
        <MenuItem value="active">Activo</MenuItem>
        <MenuItem value="inactive">Inactivo</MenuItem>
      </TextField>

      <Typography variant="body2" fontWeight={500} color="text.secondary" sx={{ mt: 1 }}>
        Uniformes
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          name="shirtSize"
          label="Talla de Camisa"
          value={values.shirtSize}
          onChange={onChange}
          fullWidth
          placeholder="Ej: S, M, L, XL"
        />
        <TextField
          name="shoeSize"
          label="Número de Calzado"
          value={values.shoeSize}
          onChange={onChange}
          fullWidth
          placeholder="Ej: 38, 40, 42"
        />
      </Stack>
    </Stack>
  );
}
