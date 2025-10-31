import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import type { ChangeEvent } from 'react';

interface AdditionalInfoSectionProps {
  values: {
    notes: string;
  };
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function AdditionalInfoSection({ values, onChange }: AdditionalInfoSectionProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" fontWeight={600} color="primary">
        Información Adicional
      </Typography>
      <Divider />

      <TextField
        name="notes"
        label="Observaciones"
        value={values.notes}
        onChange={onChange}
        multiline
        rows={4}
        fullWidth
        placeholder="Notas, comentarios o información adicional relevante"
      />
    </Stack>
  );
}
