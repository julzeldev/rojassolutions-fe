import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import type { ChangeEvent } from 'react';

interface ContactInfoEditCardProps {
  values: {
    phone: string;
    email: string;
    province: string;
    canton: string;
    district: string;
    exactAddress: string;
  };
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isReadOnly?: boolean;
}

export function ContactInfoEditCard({ values, onChange, isReadOnly = false }: ContactInfoEditCardProps) {
  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            <ContactPhoneIcon />
          </Avatar>
        }
        title="Información de Contacto"
        titleTypographyProps={{ variant: 'h6' }}
      />
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              name="phone"
              label="Teléfono *"
              value={values.phone}
              onChange={onChange}
              required
              inputProps={{ maxLength: 8, inputMode: 'numeric', pattern: '\\d*', readOnly: isReadOnly }}
              fullWidth
              helperText="8 dígitos"
              disabled={isReadOnly}
            />
            <TextField
              name="email"
              label="Correo Electrónico"
              value={values.email}
              onChange={onChange}
              type="email"
              fullWidth
              inputProps={{ readOnly: isReadOnly }}
              disabled={isReadOnly}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              name="province"
              label="Provincia"
              value={values.province}
              onChange={onChange}
              fullWidth
              inputProps={{ readOnly: isReadOnly }}
              disabled={isReadOnly}
            />
            <TextField
              name="canton"
              label="Cantón"
              value={values.canton}
              onChange={onChange}
              fullWidth
              inputProps={{ readOnly: isReadOnly }}
              disabled={isReadOnly}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              name="district"
              label="Distrito"
              value={values.district}
              onChange={onChange}
              fullWidth
              inputProps={{ readOnly: isReadOnly }}
              disabled={isReadOnly}
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
            inputProps={{ readOnly: isReadOnly }}
            disabled={isReadOnly}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
