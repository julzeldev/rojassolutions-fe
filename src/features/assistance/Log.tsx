import React, { useState } from 'react';
import { Box, Typography, TextField, List, ListItem, ListItemText, Divider } from '@mui/material';
import { format } from 'date-fns';
import type { AttendanceLogEntry } from './Logger';

interface LogProps {
  logs: AttendanceLogEntry[];
}

const Log: React.FC<LogProps> = ({ logs }) => {
  // Default to today
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const defaultDate = `${yyyy}-${mm}-${dd}`;

  const [from, setFrom] = useState(defaultDate);
  const [to, setTo] = useState(defaultDate);

  // Filter logs by date range (inclusive)
  const filteredLogs = logs.filter((log) => {
    const logDate = log.timestamp.slice(0, 10); // YYYY-MM-DD
    return logDate >= from && logDate <= to;
  });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Historial</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Desde"
          type="date"
          size="small"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Hasta"
          type="date"
          size="small"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Box>
      <List>
        {filteredLogs.length === 0 && (
          <ListItem>
            <ListItemText primary="No hay registros" />
          </ListItem>
        )}
        {filteredLogs.map((log) => (
          <React.Fragment key={log.id}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={`${log.type === 'check-in' ? 'Entrada' : 'Salida'} - ${format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm')}`}
                secondary={`Usuario: ${log.firstName} ${log.lastName}`}
              />
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default Log;
