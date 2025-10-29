import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'

export interface RecoveryCodesDialogProps {
  open: boolean
  recoveryCodes: string[]
  onClose: () => void
}

export function RecoveryCodesDialog({ open, recoveryCodes, onClose }: RecoveryCodesDialogProps) {
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (!open) {
      setCopyState('idle')
    }
  }, [open])

  const formattedCodes = useMemo(() => recoveryCodes.join('\n'), [recoveryCodes])

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(formattedCodes)
        setCopyState('success')
      } else {
        throw new Error('Clipboard API not available')
      }
    } catch {
      setCopyState('error')
    }
  }

  const handleDownload = () => {
    try {
      const blob = new Blob([formattedCodes], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'recovery-codes.txt'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch {
      setCopyState('error')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Guarda tus códigos de recuperación</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Estos códigos se muestran una sola vez. Guarda una copia en un lugar seguro. Cada código sólo puede utilizarse una vez.
        </Typography>
        <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, p: 2, backgroundColor: 'background.default' }}>
          <List dense disablePadding>
            {recoveryCodes.map((code) => (
              <ListItem key={code} disablePadding>
                <ListItemText primaryTypographyProps={{ fontFamily: 'monospace', fontWeight: 600 }} primary={code} />
              </ListItem>
            ))}
          </List>
        </Box>
        {copyState === 'success' && (
          <Alert sx={{ mt: 2 }} severity="success">
            Códigos copiados al portapapeles.
          </Alert>
        )}
        {copyState === 'error' && (
          <Alert sx={{ mt: 2 }} severity="warning">
            No pudimos copiar o descargar automáticamente. Copia los códigos manualmente.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width="100%">
          <Button onClick={handleCopy} variant="outlined" fullWidth>
            Copiar
          </Button>
          <Button onClick={handleDownload} variant="outlined" fullWidth>
            Descargar
          </Button>
          <Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', sm: 'block' } }} />
          <Button onClick={onClose} variant="contained" fullWidth>
            Cerrar y continuar
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  )
}

export default RecoveryCodesDialog
