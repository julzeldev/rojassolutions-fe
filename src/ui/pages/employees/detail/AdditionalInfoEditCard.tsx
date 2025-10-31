import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import NotesIcon from '@mui/icons-material/Notes';
import type { ChangeEvent } from 'react';

interface AdditionalInfoEditCardProps {
  values: {
    notes: string;
  };
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isReadOnly?: boolean;
}

export function AdditionalInfoEditCard({ values, onChange, isReadOnly = false }: AdditionalInfoEditCardProps) {
  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'text.secondary' }}>
            <NotesIcon />
          </Avatar>
        }
        title="Información Adicional"
        titleTypographyProps={{ variant: 'h6' }}
      />
      <CardContent>
        <TextField
          name="notes"
          label="Observaciones"
          value={values.notes}
          onChange={onChange}
          multiline
          rows={4}
          fullWidth
          placeholder="Notas, comentarios o información adicional relevante"
          inputProps={{ readOnly: isReadOnly }}
          disabled={isReadOnly}
        />
      </CardContent>
    </Card>
  );
}
