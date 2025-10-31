import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import WorkIcon from '@mui/icons-material/Work';
import type { ChangeEvent } from 'react';

interface WorkInfoEditCardProps {
  values: {
    dateOfHire: string;
    position: string;
    status: string;
    shirtSize: string;
    shoeSize: string;
  };
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isReadOnly?: boolean;
}

export function WorkInfoEditCard({ values, onChange, isReadOnly = false }: WorkInfoEditCardProps) {
  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'info.main' }}>
            <WorkIcon />
          </Avatar>
        }
        title="Información Laboral"
        titleTypographyProps={{ variant: 'h6' }}
      />
      <CardContent>
        <Stack spacing={2}>
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
              inputProps={{ readOnly: isReadOnly }}
              disabled={isReadOnly}
            />
            <TextField
              name="position"
              label="Puesto"
              value={values.position}
              onChange={onChange}
              fullWidth
              placeholder="Ej: Desarrollador, Gerente"
              inputProps={{ readOnly: isReadOnly }}
              disabled={isReadOnly}
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
            inputProps={{ readOnly: isReadOnly }}
            disabled={isReadOnly}
          >
            <MenuItem value="active">Activo</MenuItem>
            <MenuItem value="inactive">Inactivo</MenuItem>
          </TextField>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              name="shirtSize"
              label="Talla de Camisa"
              value={values.shirtSize}
              onChange={onChange}
              fullWidth
              placeholder="Ej: S, M, L, XL"
              inputProps={{ readOnly: isReadOnly }}
              disabled={isReadOnly}
            />
            <TextField
              name="shoeSize"
              label="Número de Calzado"
              value={values.shoeSize}
              onChange={onChange}
              fullWidth
              placeholder="Ej: 38, 40, 42"
              inputProps={{ readOnly: isReadOnly }}
              disabled={isReadOnly}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
