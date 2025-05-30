import { Stack, Card, CardContent, Typography, Divider, CardActions, Button } from '@mui/material';
import Link from '@mui/material/Link';
import RoomIcon from '@mui/icons-material/Room';
import type { Subsidiary } from '../../types/subsidiary';

interface Props {
  subsidiaries: Subsidiary[];
  openInGoogleMaps: (address: string, plusCode?: string, mapsUrl?: string) => () => void;
}
const SubsidiaryCardList: React.FC<Props> = ({ subsidiaries, openInGoogleMaps }) => (
  <Stack spacing={2}>
    {subsidiaries.map((sucursal, idx) => (
      <Card key={idx} variant="outlined">
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {sucursal.name}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <b>Contacto:</b>{' '}
            {sucursal.contact ? (
              <Link href={`mailto:${sucursal.email}`} color="primary">
                {sucursal.contact}
              </Link>
            ) : (
              <span>{sucursal.email || 'No disponible'}</span>
            )}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <b>Teléfono:</b> {sucursal.phone}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2">
            <b>Horario:</b>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {Object.entries(sucursal.hours).map(([k, v]) => (
                <li key={k}>
                  <span style={{ fontWeight: 500 }}>
                    {k.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}:
                  </span>{' '}
                  {v}
                </li>
              ))}
            </ul>
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            color="primary"
            onClick={openInGoogleMaps(sucursal.address, sucursal.plusCode, sucursal.mapsUrl)}
            startIcon={<RoomIcon />}
          >
            Ver en Google Maps
          </Button>
        </CardActions>
      </Card>
    ))}
  </Stack>
);

export default SubsidiaryCardList;
