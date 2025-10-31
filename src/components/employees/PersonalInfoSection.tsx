import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import type { ChangeEvent } from 'react';

interface PersonalInfoSectionProps {
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
}

export function PersonalInfoSection({ values, onChange }: PersonalInfoSectionProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" fontWeight={600} color="primary">
        Información Personal
      </Typography>
      <Divider />
      
      <TextField
        name="documentId"
        label="Identificación *"
        value={values.documentId}
        onChange={onChange}
        required
        inputProps={{ maxLength: 9 }}
        fullWidth
        helperText="9 dígitos"
      />

      <TextField
        name="firstName"
        label="Nombre *"
        value={values.firstName}
        onChange={onChange}
        required
        fullWidth
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          name="firstLastName"
          label="Primer Apellido *"
          value={values.firstLastName}
          onChange={onChange}
          required
          fullWidth
        />
        <TextField
          name="secondLastName"
          label="Segundo Apellido"
          value={values.secondLastName}
          onChange={onChange}
          fullWidth
        />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          name="nationality"
          label="Nacionalidad"
          value={values.nationality}
          onChange={onChange}
          fullWidth
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
        />
      </Stack>
    </Stack>
  );
}
