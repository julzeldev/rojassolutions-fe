import React, { useState } from 'react';
import { Button, Stack, Typography, CircularProgress } from '@mui/material';
import RoomIcon from '@mui/icons-material/Room';
import { useAuth } from '../../hooks/useAuth';

// AttendanceLogEntry type for attendance logs
export interface AttendanceLogEntry {
  id: string;
  type: 'check-in' | 'check-out';
  timestamp: string; // ISO string
  latitude: number | null;
  longitude: number | null;
  userId: string;
  firstName: string;
  lastName: string;
}

interface LoggerProps {
  onAddLog: (entry: AttendanceLogEntry) => void;
  lastEntryType?: 'check-in' | 'check-out' | null;
}

const Logger: React.FC<LoggerProps> = ({ onAddLog, lastEntryType }) => {
  const { user } = useAuth();
  // Only allow the next logical type
  const nextType: 'check-in' | 'check-out' = lastEntryType === 'check-in' ? 'check-out' : 'check-in';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    if (!user) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const entry: AttendanceLogEntry = {
          id: `${Date.now()}`,
          type: nextType,
          timestamp: new Date().toISOString(),
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          userId: user.nationalId,
          firstName: user.firstName,
          lastName: user.lastName,
        };
        onAddLog(entry);
        setLoading(false);
      },
      () => {
        setError('No se pudo obtener la ubicación');
        setLoading(false);
      }
    );
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Registrar asistencia</Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<RoomIcon />}
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? <CircularProgress size={20} /> : `Registrar ${nextType === 'check-in' ? 'Entrada' : 'Salida'}`}
      </Button>
      {error && <Typography color="error">{error}</Typography>}
    </Stack>
  );
};

export default Logger;
