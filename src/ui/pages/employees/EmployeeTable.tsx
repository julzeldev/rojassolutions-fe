import { useCallback, type MouseEvent, type KeyboardEvent } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Employee } from '../../../employees/useEmployee';

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

function formatDate(value: string): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString();
}

export function EmployeeTable({ employees, isLoading, onEdit, onDelete, onSelect }: EmployeeTableProps) {
  const theme = useTheme();
  const isCompactLayout = useMediaQuery(theme.breakpoints.down('md'));

  const handleEditClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      const { id } = event.currentTarget.dataset;
      if (id) {
        onEdit(id);
      }
    },
    [onEdit],
  );

  const handleDeleteClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      const { id } = event.currentTarget.dataset;
      if (id) {
        onDelete(id);
      }
    },
    [onDelete],
  );

  const handleRowClick = useCallback(
    (event: MouseEvent<HTMLTableRowElement>) => {
      const { id } = event.currentTarget.dataset;
      if (id) {
        onSelect(id);
      }
    },
    [onSelect],
  );

  const handleCardClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const { id } = event.currentTarget.dataset;
      if (id) {
        onSelect(id);
      }
    },
    [onSelect],
  );

  const handleCardKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      const { id } = event.currentTarget.dataset;
      if (id) {
        onSelect(id);
      }
    },
    [onSelect],
  );

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" paddingY={8}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!isLoading && employees.length === 0) {
    return (
      <Paper elevation={0} sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="subtitle1">No hay empleados para mostrar.</Typography>
      </Paper>
    );
  }

  if (isCompactLayout) {
    return (
      <Stack spacing={2}>
        {employees.map((employee) => (
          <Paper
            key={employee.id}
            variant="outlined"
            data-id={employee.id}
            onClick={handleCardClick}
            onKeyDown={handleCardKeyDown}
            tabIndex={0}
            role="button"
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              cursor: 'pointer',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: '2px',
              },
              '&:hover': {
                borderColor: 'primary.light',
                boxShadow: 2,
              },
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1, minWidth: 0 }}>
                {`${employee.firstName} ${employee.lastName}`}
              </Typography>
              <Chip
                label={employee.status === 'active' ? 'Activo' : 'Inactivo'}
                color={employee.status === 'active' ? 'success' : 'default'}
                size="small"
              />
            </Stack>

            <Stack spacing={1.25}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Documento
                </Typography>
                <Typography variant="body2">{employee.documentId || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Telefono
                </Typography>
                <Typography variant="body2">{employee.phone || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Fecha de ingreso
                </Typography>
                <Typography variant="body2">{formatDate(employee.dateOfHire) || 'N/A'}</Typography>
              </Box>
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="flex-end" spacing={1} flexWrap="wrap">
              <Tooltip title="Editar">
                <IconButton
                  size="small"
                  onClick={handleEditClick}
                  data-id={employee.id}
                  aria-label={`editar ${employee.firstName}`}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton
                  size="small"
                  onClick={handleDeleteClick}
                  data-id={employee.id}
                  aria-label={`eliminar ${employee.firstName}`}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>
        ))}
      </Stack>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 520 }}>
      <Table stickyHeader size="small" aria-label="employees table">
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Documento</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Fecha de ingreso</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map((employee) => (
            <TableRow
              hover
              key={employee.id}
              tabIndex={-1}
              data-id={employee.id}
              onClick={handleRowClick}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>{`${employee.firstName} ${employee.lastName}`}</TableCell>
              <TableCell>{employee.documentId}</TableCell>
              <TableCell>{employee.phone}</TableCell>
              <TableCell>{employee.status === 'active' ? 'Activo' : 'Inactivo'}</TableCell>
              <TableCell>{formatDate(employee.dateOfHire)}</TableCell>
              <TableCell align="right">
                <Tooltip title="Editar">
                  <IconButton
                    size="small"
                    onClick={handleEditClick}
                    data-id={employee.id}
                    aria-label={`editar ${employee.firstName}`}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton
                    size="small"
                    onClick={handleDeleteClick}
                    data-id={employee.id}
                    aria-label={`eliminar ${employee.firstName}`}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
