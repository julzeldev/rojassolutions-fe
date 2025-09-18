import { useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachmentIcon from '@mui/icons-material/Attachment';
import Avatar from '@mui/material/Avatar';
import type {
  AddDocumentPayload,
  EmployeeDocumentAttachment,
} from '../../../../employees/useEmployee';

interface DocumentsCardProps {
  documents: EmployeeDocumentAttachment[];
  isMutating: boolean;
  error: string | null;
  onAdd: (payload: AddDocumentPayload) => Promise<void>;
  onRemove: (documentId: string) => Promise<void>;
}

interface DocumentFormValues {
  name: string;
  url: string;
  category: string;
}

const EMPTY_DOCUMENT: DocumentFormValues = {
  name: '',
  url: '',
  category: '',
};

export function DocumentsCard({ documents, isMutating, error, onAdd, onRemove }: DocumentsCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [values, setValues] = useState<DocumentFormValues>(EMPTY_DOCUMENT);
  const [localError, setLocalError] = useState<string | null>(null);

  const sortedDocuments = useMemo(
    () => [...documents].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')),
    [documents],
  );

  const handleOpenDialog = useCallback(() => {
    setValues(EMPTY_DOCUMENT);
    setLocalError(null);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    if (isMutating) return;
    setIsDialogOpen(false);
  }, [isMutating]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!values.name.trim() || !values.url.trim()) {
        setLocalError('Nombre y URL son obligatorios');
        return;
      }
      try {
        await onAdd({
          name: values.name.trim(),
          url: values.url.trim(),
          category: values.category.trim() || undefined,
        });
        setIsDialogOpen(false);
        setValues(EMPTY_DOCUMENT);
        setLocalError(null);
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'No se pudo adjuntar el documento');
      }
    },
    [onAdd, values],
  );

  const handleRemove = useCallback(
    async (id: string) => {
      try {
        await onRemove(id);
        setLocalError(null);
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'No se pudo eliminar el documento');
      }
    },
    [onRemove],
  );

  return (
    <Card>
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: 'info.main' }}><AttachmentIcon /></Avatar>}
        title="Documentos adjuntos"
        subheader="Historial de archivos asociados al colaborador"
      />
      <CardContent>
        {sortedDocuments.length === 0 ? (
          <Typography color="text.secondary">No hay documentos adjuntos todavía.</Typography>
        ) : (
          <List dense>
            {sortedDocuments.map((doc) => (
              <ListItem
                key={doc.id}
                secondaryAction={
                  <Tooltip title="Eliminar documento">
                    <span>
                      <IconButton
                        edge="end"
                        aria-label={`eliminar ${doc.name}`}
                        onClick={() => { void handleRemove(doc.id); }}
                        disabled={isMutating}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                }
              >
                <ListItemText
                  primary={
                    <Link href={doc.url} target="_blank" rel="noopener noreferrer">
                      {doc.name}
                    </Link>
                  }
                  secondary={
                    doc.category
                      ? `${doc.category} · ${doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}`
                      : doc.createdAt
                      ? new Date(doc.createdAt).toLocaleDateString()
                      : undefined
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
        {(error || localError) && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {error || localError}
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button onClick={handleOpenDialog} variant="outlined">
          Adjuntar documento
        </Button>
      </CardActions>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit} noValidate>
          <DialogTitle>Nuevo documento</DialogTitle>
          <DialogContent>
            <Stack spacing={2} paddingTop={1}>
              <TextField
                name="name"
                label="Nombre"
                value={values.name}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="url"
                label="URL"
                value={values.url}
                onChange={handleChange}
                required
                type="url"
                fullWidth
              />
              <TextField
                name="category"
                label="Categoría"
                value={values.category}
                onChange={handleChange}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="inherit" disabled={isMutating}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={isMutating}>
              Guardar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Card>
  );
}
