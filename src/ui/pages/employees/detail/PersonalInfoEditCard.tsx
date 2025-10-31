import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import type { ChangeEvent } from 'react';

interface PersonalInfoEditCardProps {
  values: {
    firstName: string;
    firstLastName: string;
    secondLastName: string;
    documentId: string;
    nationality: string;
    dob: string;
    maritalStatus: string;
    education: string;
  };
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isReadOnly?: boolean;
}

export function PersonalInfoEditCard({ values, onChange, isReadOnly = false }: PersonalInfoEditCardProps) {
  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <PersonIcon />
          </Avatar>
        }
        title="Información Personal"
        titleTypographyProps={{ variant: 'h6' }}
      />
      <CardContent>
        <Stack spacing={2}>
          <TextField
            name="documentId"
            label="Identificación *"
            value={values.documentId}
            onChange={onChange}
            required
            inputProps={{ maxLength: 9, readOnly: isReadOnly }}
            fullWidth
            helperText="9 dígitos"
            disabled={isReadOnly}
          />

          <TextField
            name="firstName"
            label="Nombre *"
            value={values.firstName}
            onChange={onChange}
            required
            fullWidth
            inputProps={{ readOnly: isReadOnly }}
            disabled={isReadOnly}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              name="firstLastName"
              label="Primer Apellido *"
              value={values.firstLastName}
              onChange={onChange}
              required
              fullWidth
              inputProps={{ readOnly: isReadOnly }}
              disabled={isReadOnly}
            />
            <TextField
              name="secondLastName"
              label="Segundo Apellido"
              value={values.secondLastName}
              onChange={onChange}
              fullWidth
              inputProps={{ readOnly: isReadOnly }}
              disabled={isReadOnly}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              name="nationality"
              label="Nacionalidad"
              value={values.nationality}
              onChange={onChange}
              fullWidth
              inputProps={{ readOnly: isReadOnly }}
              disabled={isReadOnly}
            />
            <TextField
              name="dob"
              label="Fecha de Nacimiento *"
              type="date"
              value={values.dob}
              onChange={onChange}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
              inputProps={{ readOnly: isReadOnly }}
              disabled={isReadOnly}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              name="maritalStatus"
              label="Estado Civil"
              value={values.maritalStatus}
              onChange={onChange}
              fullWidth
              inputProps={{ readOnly: isReadOnly }}
              disabled={isReadOnly}
            >
              <MenuItem value="">Seleccionar...</MenuItem>
              <MenuItem value="single">Soltero/a</MenuItem>
              <MenuItem value="married">Casado/a</MenuItem>
              <MenuItem value="divorced">Divorciado/a</MenuItem>
              <MenuItem value="widowed">Viudo/a</MenuItem>
              <MenuItem value="free_union">Unión Libre</MenuItem>
            </TextField>

            <TextField
              name="education"
              label="Escolaridad"
              value={values.education}
              onChange={onChange}
              fullWidth
              placeholder="Ej: Universitaria, Bachillerato"
              inputProps={{ readOnly: isReadOnly }}
              disabled={isReadOnly}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
