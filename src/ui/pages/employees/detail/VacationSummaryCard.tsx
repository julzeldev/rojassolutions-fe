import { useCallback } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import type { VacationSummary } from '../../../../employees/useEmployee';

interface VacationSummaryCardProps {
  summary: VacationSummary | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function VacationSummaryCard({ summary, isLoading, error, onRefresh }: VacationSummaryCardProps) {
  const handleRefresh = useCallback(() => {
    onRefresh();
  }, [onRefresh]);

  return (
    <Card>
      <CardHeader
        avatar={(
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <BeachAccessIcon />
          </Avatar>
        )}
        title="Vacaciones acumuladas"
        subheader="Cálculo basado en legislación costarricense"
        action={(
          <Button size="small" onClick={handleRefresh} disabled={isLoading}>
            Actualizar
          </Button>
        )}
      />
      <CardContent>
        {isLoading ? (
          <Stack direction="row" alignItems="center" justifyContent="center" paddingY={3}>
            <CircularProgress size={32} />
          </Stack>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : summary ? (
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Stack spacing={0.5} flex={1}>
                <Typography variant="h6">{summary.accruedDays.toFixed(2)} días</Typography>
                <Typography variant="body2" color="text.secondary">
                  Disponibles al {new Date(summary.lastCalculatedAt).toLocaleDateString()}
                </Typography>
              </Stack>
              <Stack spacing={0.5} flex={1}>
                <Typography variant="h6">{summary.daysWorked} días trabajados</Typography>
                <Tooltip
                  title={`Próximo período de acumulación: ${new Date(summary.nextAccrualDate).toLocaleDateString()}`}
                >
                  <Typography variant="body2" color="text.secondary">
                    Próximo corte {new Date(summary.nextAccrualDate).toLocaleDateString()}
                  </Typography>
                </Tooltip>
              </Stack>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              * Se otorgan 12 días hábiles de vacaciones por cada 50 semanas laboradas (12/350 ≈ 0.034 días por día trabajado).
            </Typography>
          </Stack>
        ) : (
          <Typography color="text.secondary">Aún no hay información de vacaciones disponible.</Typography>
        )}
      </CardContent>
    </Card>
  );
}
