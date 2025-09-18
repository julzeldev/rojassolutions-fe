import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CelebrationIcon from '@mui/icons-material/Celebration';
import type { Employee } from '../../employees/useEmployee';
import { employeeService } from '../../api/employeeService';
import { useAuth } from '../../auth/useAuth';

interface BirthdayNotification {
  id: string;
  name: string;
  avatarInitials: string;
  dateLabel: string;
  isToday: boolean;
  daysUntil: number;
  ageTurning: number | null;
  statusLabel: string;
}

function getInitials(name: string, fallback: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0).toUpperCase() ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : '';
  const initials = `${first}${last}`.trim();
  if (initials) return initials;
  return fallback.slice(0, 2).toUpperCase() || '?';
}

function computeBirthdayNotifications(employees: Employee[]): BirthdayNotification[] {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const candidates = employees
    .map((employee) => {
      if (!employee.dob) return null;
      const dob = new Date(employee.dob);
      if (Number.isNaN(dob.getTime())) return null;

      const month = dob.getUTCMonth();
      const day = dob.getUTCDate();

      let targetYear = today.getFullYear();
      let upcoming = new Date(targetYear, month, day);
      if (upcoming < todayStart) {
        targetYear += 1;
        upcoming = new Date(targetYear, month, day);
      }

      const diffMs = upcoming.getTime() - todayStart.getTime();
      const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));
      const isToday = daysUntil === 0;

      if (!isToday && daysUntil > 7) return null;

      const ageTurning = Number.isFinite(dob.getUTCFullYear()) ? targetYear - dob.getUTCFullYear() : null;

      let dateLabel: string;
      if (isToday) dateLabel = 'Hoy';
      else if (daysUntil === 1) dateLabel = 'Mañana';
      else if (daysUntil < 7) dateLabel = `En ${daysUntil} días`;
      else dateLabel = upcoming.toLocaleDateString();

      const fullName = `${employee.firstName} ${employee.lastName}`.trim();

      return {
        id: employee.id,
        name: fullName,
        avatarInitials: getInitials(fullName, employee.documentId),
        dateLabel,
        isToday,
        daysUntil,
        ageTurning,
        statusLabel: employee.status === 'active' ? 'Empleado activo' : 'Empleado inactivo',
      } satisfies BirthdayNotification;
    })
    .filter((item): item is BirthdayNotification => Boolean(item));

  return candidates.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 6);
}

export function HomePage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<BirthdayNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      if (!accessToken) {
        if (isMounted) {
          setNotifications([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const { items } = await employeeService.listEmployees({ limit: 200 }, accessToken);
        if (!isMounted) return;
        const computed = computeBirthdayNotifications(items);
        setNotifications(computed);
      } catch (err) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : 'No se pudieron cargar las notificaciones.';
        setError(message);
        setNotifications([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  const todaysBirthdays = useMemo(
    () => notifications.filter((item) => item.isToday),
    [notifications],
  );

  const handleCongratulate = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const { name } = event.currentTarget.dataset;
    if (!name) return;
    const subject = encodeURIComponent(`¡Feliz cumpleaños, ${name}!`);
    const firstName = name.split(' ')[0];
    const body = encodeURIComponent(
      `Hola ${firstName},\n\n¡Todo el equipo de Rojas Solutions te desea un excelente cumpleaños! 🎉`,
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  }, []);

  const handleViewEmployees = useCallback(() => {
    navigate('/empleados');
  }, [navigate]);

  return (
    <Stack spacing={4}>
      <Typography variant="h4" component="h1">
        Inicio
      </Typography>
      <Grid container spacing={3}>
        <Grid xs={12} md={6} lg={5}>
          <Card elevation={2}>
            <CardHeader
              avatar={
                <Badge color="secondary" badgeContent={todaysBirthdays.length} invisible={todaysBirthdays.length === 0}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <CelebrationIcon />
                  </Avatar>
                </Badge>
              }
              title="Notificaciones"
              subheader="Celebra a tu equipo"
            />
            <Divider />
            <CardContent>
              {isLoading ? (
                <Stack alignItems="center" paddingY={4}>
                  <CircularProgress size={32} />
                </Stack>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : notifications.length === 0 ? (
                <Typography color="text.secondary">No hay cumpleaños próximos. 🎉</Typography>
              ) : (
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    {todaysBirthdays.length > 0
                      ? `Hoy ${todaysBirthdays.length === 1 ? 'celebra' : 'celebran'} cumpleaños ${todaysBirthdays.length} persona${todaysBirthdays.length === 1 ? '' : 's'}.`
                      : 'No tienes cumpleaños hoy, pero ya puedes prepararte para los próximos.'}
                  </Typography>
                  {notifications.map((birthday) => (
                    <Stack
                      key={birthday.id}
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{
                        paddingY: 1,
                        paddingX: 1.5,
                        borderRadius: 2,
                        backgroundColor: birthday.isToday ? 'primary.main' : 'transparent',
                        color: birthday.isToday ? 'primary.contrastText' : 'inherit',
                      }}
                    >
                      <Avatar sx={{ bgcolor: birthday.isToday ? 'secondary.main' : 'primary.main' }}>
                        {birthday.avatarInitials}
                      </Avatar>
                      <Stack spacing={0.5} flexGrow={1}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {birthday.name}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Chip
                            size="small"
                            icon={<CalendarMonthIcon fontSize="small" />}
                            label={birthday.dateLabel}
                            sx={{
                              backgroundColor: birthday.isToday ? 'secondary.main' : 'action.selected',
                              color: birthday.isToday ? 'secondary.contrastText' : 'text.secondary',
                            }}
                          />
                          <Typography variant="body2" color={birthday.isToday ? 'inherit' : 'text.secondary'}>
                            {birthday.ageTurning ? `Cumple ${birthday.ageTurning} años · ${birthday.statusLabel}` : birthday.statusLabel}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Tooltip title="Enviar felicitación">
                        <Button
                          size="small"
                          variant={birthday.isToday ? 'contained' : 'outlined'}
                          color={birthday.isToday ? 'secondary' : 'primary'}
                          sx={{ whiteSpace: 'nowrap' }}
                          onClick={handleCongratulate}
                          data-name={birthday.name}
                        >
                          Felicitar
                        </Button>
                      </Tooltip>
                    </Stack>
                  ))}
                  <Button variant="text" onClick={handleViewEmployees} sx={{ alignSelf: 'flex-start' }}>
                    Ver directorio de empleados
                  </Button>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={6} lg={7}>
          <Card elevation={1} sx={{ height: '100%' }}>
            <CardHeader title="Resumen" subheader="Próximas mejoras del portal" />
            <CardContent>
              <Typography variant="body1" color="text.secondary">
                Muy pronto podrás gestionar inventario, subsidiarias y calendarios compartidos desde este portal. ¡Gracias por tu paciencia!
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
