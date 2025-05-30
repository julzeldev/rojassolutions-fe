import React, { useState } from 'react';
import { Box, Typography, TextField, List, ListItem, ListItemText, Divider } from '@mui/material';
import { format } from 'date-fns';
import type { AttendanceLogEntry } from './Logger';

interface LogProps {
  logs: AttendanceLogEntry[];
}

const Log: React.FC<LogProps> = ({ logs }) => {
  const [search, setSearch] = useState('');

  // Filter logs by date (YYYY-MM-DD)
  const filteredLogs = search
    ? logs.filter((log) => log.timestamp.startsWith(search))
    : logs;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Historial</Typography>
      <TextField
        label="Buscar por fecha"
        type="date"
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ mb: 2 }}
      />
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
                secondary={`Usuario: ${log.firstName} ${log.lastName} | Lat: ${log.latitude?.toFixed(5) ?? 'N/A'}, Lng: ${log.longitude?.toFixed(5) ?? 'N/A'}`}
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
