import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import WorkIcon from '@mui/icons-material/Work';
import type { ChangeEvent } from 'react';
import { useAuth } from '../../../../auth/useAuth';
import { getSubsidiaries, type Subsidiary } from '../../../../api/subsidiaryService';

interface WorkInfoEditCardProps {
  values: {
    dateOfHire: string;
    position: string;
    status: string;
    shirtSize: string;
    shoeSize: string;
    subsidiaryId: string;
  };
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isReadOnly?: boolean;
}

export function WorkInfoEditCard({ values, onChange, isReadOnly = false }: WorkInfoEditCardProps) {
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

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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

            <TextField
              select
              name="subsidiaryId"
              label="Sucursal"
              value={values.subsidiaryId}
              onChange={onChange}
              fullWidth
              disabled={isReadOnly || loadingSubsidiaries}
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
