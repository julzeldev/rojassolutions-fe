import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import type { ChangeEvent } from 'react';

interface EmergencyContactEditCardProps {
  values: {
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
  };
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isReadOnly?: boolean;
}

export function EmergencyContactEditCard({ values, onChange, isReadOnly = false }: EmergencyContactEditCardProps) {
  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'warning.main' }}>
            <ContactEmergencyIcon />
          </Avatar>
        }
        title="Contacto de Emergencia"
        titleTypographyProps={{ variant: 'h6' }}
      />
      <CardContent>
        <Stack spacing={2}>
          <TextField
            name="emergencyContactName"
            label="Nombre del Contacto"
            value={values.emergencyContactName}
            onChange={onChange}
            fullWidth
            inputProps={{ readOnly: isReadOnly }}
            disabled={isReadOnly}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              name="emergencyContactPhone"
              label="Teléfono"
              value={values.emergencyContactPhone}
              onChange={onChange}
              inputProps={{ maxLength: 8, inputMode: 'numeric', pattern: '\\d*', readOnly: isReadOnly }}
              fullWidth
              helperText="8 dígitos"
              disabled={isReadOnly}
            />
            <TextField
              name="emergencyContactRelationship"
              label="Parentesco"
              value={values.emergencyContactRelationship}
              onChange={onChange}
              fullWidth
              placeholder="Ej: Madre, Padre, Hermano/a"
              inputProps={{ readOnly: isReadOnly }}
              disabled={isReadOnly}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
