import { useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  content: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  content,
  confirmLabel,
  cancelLabel,
  confirmDisabled,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const handleConfirm = useCallback(() => {
    if (confirmDisabled) return;
    onConfirm();
  }, [confirmDisabled, onConfirm]);

  const handleClose = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="inherit">
          {cancelLabel}
        </Button>
        <Button onClick={handleConfirm} color="error" variant="contained" disabled={confirmDisabled}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
