import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SalarySchedule } from '../../../../employees/useEmployee';

interface SalaryDialogProps {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: SalaryDialogFormValues) => Promise<void>;
  initialDate?: string;
}

export interface SalaryDialogFormValues {
  amountColones: string;
  schedule: SalarySchedule | '';
  effectiveFrom: string;
  note: string;
}

const INITIAL_VALUES: SalaryDialogFormValues = {
  amountColones: '',
  schedule: '',
  effectiveFrom: '',
  note: '',
};

export function SalaryDialog({ open, isSubmitting, onClose, onSubmit, initialDate }: SalaryDialogProps) {
  const [values, setValues] = useState<SalaryDialogFormValues>(INITIAL_VALUES);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues((prev) => ({
        ...INITIAL_VALUES,
        effectiveFrom: initialDate ?? prev.effectiveFrom ?? '',
      }));
      setError(null);
    }
  }, [initialDate, open]);

  const amountHelper = useMemo(() => {
    if (!values.amountColones) return 'Monto en colones (ej. 250000)';
    const parsed = Number(values.amountColones.replace(/,/g, '.'));
    if (Number.isNaN(parsed) || parsed <= 0) return 'Ingresa un monto válido mayor a 0';
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(parsed);
  }, [values.amountColones]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const parsed = Number(values.amountColones.replace(/,/g, '.'));
      if (Number.isNaN(parsed) || parsed <= 0) {
        setError('Ingresa un monto válido');
        return;
      }
      if (!values.effectiveFrom) {
        setError('Selecciona la fecha de inicio');
        return;
      }
      try {
        await onSubmit({
          amountColones: values.amountColones,
          schedule: values.schedule,
          effectiveFrom: values.effectiveFrom,
          note: values.note,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo guardar el salario');
      }
    },
    [onSubmit, values.amountColones, values.effectiveFrom, values.note, values.schedule],
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>Registrar salario</DialogTitle>
        <DialogContent>
          <Stack spacing={2} paddingTop={1}>
            <TextField
              name="amountColones"
              label="Monto (CRC)"
              value={values.amountColones}
              onChange={handleChange}
              required
              helperText={amountHelper}
              fullWidth
              inputMode="decimal"
              disabled={isSubmitting}
            />
            <TextField
              select
              name="schedule"
              label="Periodicidad"
              value={values.schedule}
              onChange={handleChange}
              fullWidth
              disabled={isSubmitting}
            >
              <MenuItem value="">Sin definir</MenuItem>
              <MenuItem value="monthly">Mensual</MenuItem>
              <MenuItem value="biweekly">Quincenal</MenuItem>
              <MenuItem value="weekly">Semanal</MenuItem>
              <MenuItem value="hourly">Por hora</MenuItem>
            </TextField>
            <TextField
              name="effectiveFrom"
              label="Vigente desde"
              type="date"
              value={values.effectiveFrom}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
              disabled={isSubmitting}
            />
            <TextField
              name="note"
              label="Nota"
              value={values.note}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={2}
              disabled={isSubmitting}
            />
            {error && (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Guardar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
