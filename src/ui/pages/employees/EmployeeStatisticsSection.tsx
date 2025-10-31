import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CakeIcon from '@mui/icons-material/Cake';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { statisticsService } from '../../../api/statisticsService';
import { useAuth } from '../../../auth/useAuth';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack spacing={0.5} flex={1}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} color={color}>
              {value}
            </Typography>
          </Stack>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${color}15`,
              color: color,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function EmployeeStatisticsSection() {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!accessToken) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await statisticsService.getEmployeeStatistics(accessToken);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [accessToken]);

  if (loading) {
    return (
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={600}>
          Estadísticas de Empleados
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!stats) return null;

  const activityData = [
    { name: 'Activos', value: stats.active, color: '#00C49F' },
    { name: 'Inactivos', value: stats.inactive, color: '#FF8042' },
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={600}>
        Estadísticas de Empleados
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Empleados"
            value={stats.total}
            icon={<PeopleIcon sx={{ fontSize: 32 }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Empleados Activos"
            value={stats.active}
            icon={<PersonIcon sx={{ fontSize: 32 }} />}
            color="#00C49F"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Edad Promedio"
            value={`${stats.averageAge} años`}
            icon={<CakeIcon sx={{ fontSize: 32 }} />}
            color="#FF8042"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Antigüedad Promedio"
            value={`${stats.averageTenure} años`}
            icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
            color="#8884d8"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Age Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CakeIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Distribución por Edad
                  </Typography>
                </Stack>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.byAgeRange}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1976d2" radius={[8, 8, 0, 0]}>
                      {stats.byAgeRange.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Active/Inactive */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PersonOffIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Estado de Empleados
                  </Typography>
                </Stack>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={activityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) =>
                        `${entry.name}: ${entry.value} (${((entry.percent || 0) * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {activityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Positions */}
        {stats.byPosition && stats.byPosition.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={2}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <WorkIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Empleado por puesto
                    </Typography>
                  </Stack>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.byPosition.slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="position" type="category" width={120} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#00C49F" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Province Distribution */}
        {stats.byProvince && stats.byProvince.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={2}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <LocationOnIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Empleados por Provincia
                    </Typography>
                  </Stack>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.byProvince}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.province}: ${entry.count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {stats.byProvince.map((_entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Stack>
  );
}
