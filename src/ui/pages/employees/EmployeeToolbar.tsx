import { useCallback, type ChangeEvent } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import UploadIcon from '@mui/icons-material/Upload';
import { SearchBar } from '../../../components/common/SearchBar';
import type { EmployeeStatus } from '../../../employees/useEmployee';

interface EmployeeToolbarProps {
  query: string;
  status: EmployeeStatus | '';
  isRefreshing: boolean;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: EmployeeStatus | '') => void;
  onCreate: () => void;
  onRefresh: () => void;
  onImport: () => void;
}

export function EmployeeToolbar({
  query,
  status,
  isRefreshing,
  onQueryChange,
  onStatusChange,
  onCreate,
  onRefresh,
  onImport,
}: EmployeeToolbarProps) {
  const theme = useTheme();

  const handleStatusChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onStatusChange(event.target.value as EmployeeStatus | '');
    },
    [onStatusChange],
  );

  return (
    <Stack spacing={2}>
      {/* Desktop: Single row layout */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          gap: 2,
          alignItems: 'center',
        }}
      >
        <SearchBar
          value={query}
          onChange={onQueryChange}
          placeholder="Buscar por nombre, documento o teléfono..."
          fullWidth={false}
          sx={{ minWidth: 300, flex: 1 }}
        />
        
        <TextField
          select
          value={status}
          onChange={handleStatusChange}
          size="small"
          sx={{ minWidth: 140 }}
          InputProps={{
            startAdornment: <FilterListIcon sx={{ mr: 1, ml: 0.5, color: 'action.active' }} />,
          }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="active">Activo</MenuItem>
          <MenuItem value="inactive">Inactivo</MenuItem>
        </TextField>

        <Tooltip title="Recargar">
          <IconButton
            onClick={onRefresh}
            disabled={isRefreshing}
            color="primary"
            size="medium"
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Importar / Exportar">
          <IconButton
            onClick={onImport}
            color="primary"
            size="medium"
          >
            <UploadIcon />
          </IconButton>
        </Tooltip>

        <Button
          onClick={onCreate}
          startIcon={<AddIcon />}
          variant="contained"
          size="medium"
        >
          Nuevo
        </Button>
      </Box>

      {/* Mobile: Stacked layout */}
      <Stack spacing={1.5} sx={{ display: { xs: 'flex', sm: 'none' } }}>
        <SearchBar
          value={query}
          onChange={onQueryChange}
          placeholder="Buscar empleado..."
          fullWidth
        />
        
        <Stack direction="row" spacing={1}>
          <TextField
            select
            value={status}
            onChange={handleStatusChange}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: <FilterListIcon sx={{ mr: 1, ml: 0.5, color: 'action.active' }} />,
            }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="active">Activo</MenuItem>
            <MenuItem value="inactive">Inactivo</MenuItem>
          </TextField>

          <Tooltip title="Recargar">
            <IconButton
              onClick={onRefresh}
              disabled={isRefreshing}
              color="primary"
              sx={{ flexShrink: 0 }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Importar / Exportar">
            <IconButton
              onClick={onImport}
              color="primary"
              sx={{ flexShrink: 0 }}
            >
              <UploadIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <Button
          onClick={onCreate}
          startIcon={<AddIcon />}
          variant="contained"
          fullWidth
          size="medium"
        >
          Nuevo Empleado
        </Button>
      </Stack>
    </Stack>
  );
}
