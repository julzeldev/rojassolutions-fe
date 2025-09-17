import { useCallback, type ChangeEvent } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import type { EmployeeStatus } from '../../../employees/useEmployee';

interface EmployeeToolbarProps {
  query: string;
  status: EmployeeStatus | '';
  isRefreshing: boolean;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: EmployeeStatus | '') => void;
  onCreate: () => void;
  onRefresh: () => void;
}

export function EmployeeToolbar({
  query,
  status,
  isRefreshing,
  onQueryChange,
  onStatusChange,
  onCreate,
  onRefresh,
}: EmployeeToolbarProps) {
  const handleQueryChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      onQueryChange(event.target.value);
    },
    [onQueryChange],
  );

  const handleStatusChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      onStatusChange(event.target.value as EmployeeStatus | '');
    },
    [onStatusChange],
  );

  const handleCreateClick = useCallback(() => {
    onCreate();
  }, [onCreate]);

  const handleRefreshClick = useCallback(() => {
    onRefresh();
  }, [onRefresh]);

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end">
      <TextField
        label="Buscar"
        value={query}
        onChange={handleQueryChange}
        variant="outlined"
        size="small"
        sx={{ minWidth: 220 }}
      />
      <TextField
        select
        label="Estado"
        value={status}
        onChange={handleStatusChange}
        variant="outlined"
        size="small"
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="">Todos</MenuItem>
        <MenuItem value="active">Activo</MenuItem>
        <MenuItem value="inactive">Inactivo</MenuItem>
      </TextField>
      <Stack direction="row" spacing={1} marginLeft="auto">
        <Button
          onClick={handleRefreshClick}
          startIcon={<RefreshIcon />}
          variant="outlined"
          disabled={isRefreshing}
        >
          Recargar
        </Button>
        <Button
          onClick={handleCreateClick}
          startIcon={<AddIcon />}
          variant="contained"
        >
          Nuevo empleado
        </Button>
      </Stack>
    </Stack>
  );
}
