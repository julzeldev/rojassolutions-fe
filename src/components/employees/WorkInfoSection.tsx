import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import type { ChangeEvent } from 'react';
import { useAuth } from '../../auth/useAuth';
import { getSubsidiaries, type Subsidiary } from '../../api/subsidiaryService';

interface WorkInfoSectionProps {
  values: {
    dateOfHire: string;
    position: string;
    status: string;
    shirtSize: string;
    shoeSize: string;
    subsidiaryId: string;
  };
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function WorkInfoSection({ values, onChange }: WorkInfoSectionProps) {
  const { accessToken } = useAuth();
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [loadingSubsidiaries, setLoadingSubsidiaries] = useState(true);

  useEffect(() => {
    const fetchSubsidiaries = async () => {
      if (!accessToken) {
        setLoadingSubsidiaries(false);
        return;
      }

      try {
        const data = await getSubsidiaries({ status: 'active' }, accessToken);
        setSubsidiaries(data.items);
      } catch (error) {
        console.error('Error loading subsidiaries:', error);
      } finally {
        setLoadingSubsidiaries(false);
      }
    };

    fetchSubsidiaries();
  }, [accessToken]);

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

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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

        <TextField
          select
          name="subsidiaryId"
          label="Sucursal"
          value={values.subsidiaryId}
          onChange={onChange}
          fullWidth
          disabled={loadingSubsidiaries}
          InputProps={{
            endAdornment: loadingSubsidiaries ? <CircularProgress size={20} /> : null,
          }}
        >
          <MenuItem value="">Sin asignar</MenuItem>
          {subsidiaries.map((subsidiary) => (
            <MenuItem key={subsidiary.id} value={subsidiary.id}>
              {subsidiary.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

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
