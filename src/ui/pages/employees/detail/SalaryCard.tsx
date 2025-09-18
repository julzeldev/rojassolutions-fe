import { useCallback, useMemo } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Avatar from '@mui/material/Avatar';
import type { SalaryEntry } from '../../../../employees/useEmployee';

interface SalaryCardProps {
  salary: SalaryEntry | null;
  isLoading: boolean;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onRefresh: () => void;
}

function formatAmount(amountCents: number, visible: boolean): string {
  if (!visible) return '₡••••••••';
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

export function SalaryCard({ salary, isLoading, isVisible, onToggleVisibility, onRefresh }: SalaryCardProps) {
  const formattedAmount = useMemo(() => {
    if (!salary) return isVisible ? 'Sin registro' : '₡••••••••';
    return formatAmount(salary.amountCents, isVisible);
  }, [salary, isVisible]);

  const scheduleLabel = useMemo(() => {
    if (!salary?.schedule) return 'Periodicidad no registrada';
    const map: Record<string, string> = {
      monthly: 'Mensual',
      biweekly: 'Quincenal',
      weekly: 'Semanal',
      hourly: 'Por hora',
    };
    return map[salary.schedule] ?? salary.schedule;
  }, [salary?.schedule]);

  const effectiveLabel = salary
    ? new Date(salary.effectiveFrom).toLocaleDateString()
    : 'Fecha no disponible';

  const handleRefresh = useCallback(() => {
    onRefresh();
  }, [onRefresh]);

  const handleToggle = useCallback(() => {
    onToggleVisibility();
  }, [onToggleVisibility]);

  return (
    <Card>
      <CardHeader
        avatar={(
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            <MonetizationOnIcon />
          </Avatar>
        )}
        title="Salario"
        subheader="Información confidencial"
        action={(
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title={isVisible ? 'Ocultar salario' : 'Mostrar salario'}>
              <IconButton onClick={handleToggle} size="small">
                {isVisible ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Actualizar">
              <span>
                <IconButton onClick={handleRefresh} size="small" disabled={isLoading}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        )}
      />
      <CardContent>
        {isLoading ? (
          <Stack direction="row" alignItems="center" justifyContent="center" paddingY={3}>
            <CircularProgress size={32} />
          </Stack>
        ) : salary ? (
          <Stack spacing={1.5}>
            <Typography variant="h5">{formattedAmount}</Typography>
            <Typography variant="body2" color="text.secondary">
              Vigente desde {effectiveLabel} · {scheduleLabel}
            </Typography>
            {salary.note && (
              <Typography variant="body2" color="text.secondary">
                Nota: {salary.note}
              </Typography>
            )}
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              No se ha registrado un salario para este colaborador.
            </Typography>
            <Button variant="outlined" onClick={handleRefresh} startIcon={<RefreshIcon />}>
              Buscar salario
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
