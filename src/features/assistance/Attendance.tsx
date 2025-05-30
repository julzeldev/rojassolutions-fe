import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import type { AttendanceLogEntry } from './Logger';
import Logger from './Logger';
import Log from './Log';

const Attendance: React.FC = () => {
  const [logs, setLogs] = useState<AttendanceLogEntry[]>([]);

  const handleAddLog = (entry: AttendanceLogEntry) => {
    setLogs((prev) => [entry, ...prev]);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Registro de Asistencia</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Logger onAddLog={handleAddLog} />
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Log logs={logs} />
      </Paper>
    </Box>
  );
};

export default Attendance;
