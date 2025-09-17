import { useCallback, type MouseEvent } from 'react';
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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Employee } from '../../../employees/useEmployee';

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDate(value: string): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString();
}

export function EmployeeTable({ employees, isLoading, onEdit, onDelete }: EmployeeTableProps) {
  const handleEditClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const { id } = event.currentTarget.dataset;
      if (id) {
        onEdit(id);
      }
    },
    [onEdit],
  );

  const handleDeleteClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const { id } = event.currentTarget.dataset;
      if (id) {
        onDelete(id);
      }
    },
    [onDelete],
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

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 520 }}>
      <Table stickyHeader size="small" aria-label="employees table">
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Documento</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Fecha de ingreso</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map((employee) => (
            <TableRow hover key={employee.id} tabIndex={-1}>
              <TableCell>{`${employee.firstName} ${employee.lastName}`}</TableCell>
              <TableCell>{employee.documentId}</TableCell>
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
