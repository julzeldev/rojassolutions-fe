import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';
import MuiLink from '@mui/material/Link';
import RoomIcon from '@mui/icons-material/Room';
import type { Subsidiary } from '../../types/subsidiary';

interface Props {
  subsidiaries: Subsidiary[];
  openInGoogleMaps: (address: string, plusCode?: string, mapsUrl?: string) => () => void;
}

const SubsidiaryTable: React.FC<Props> = ({ subsidiaries, openInGoogleMaps }) => (
  <TableContainer component={Paper}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Nombre</TableCell>
          <TableCell>Dirección</TableCell>
          <TableCell>Contancto</TableCell>
          <TableCell>Teléfono</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {subsidiaries.map((subsidiary, idx) => (
          <TableRow key={idx}>
            <TableCell>{subsidiary.name}</TableCell>
            <TableCell>
              <MuiLink
                component="button"
                color="primary"
                underline="hover"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  justifyContent: 'flex-start',
                  maxWidth: 260 // adjust as needed for your table cell
                }}
                onClick={openInGoogleMaps(subsidiary.address, subsidiary.plusCode, subsidiary.mapsUrl)}
              >
                <RoomIcon fontSize="small" sx={{ mr: 0.5, flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', minWidth: 0 }}>
                  {subsidiary.address}
                </span>
              </MuiLink>
            </TableCell>
            <TableCell>{subsidiary.contact}</TableCell>
            <TableCell>{subsidiary.phone}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default SubsidiaryTable;