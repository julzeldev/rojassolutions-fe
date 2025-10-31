import React, { useState, useCallback, useEffect } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import RefreshIcon from '@mui/icons-material/Refresh'
import SecurityIcon from '@mui/icons-material/Security'
import { useAuth } from '../../../auth/useAuth'
import { authService } from '../../../auth/authService'

interface RecoveryCode {
  code: string
  usedAt: Date | null
}

export function SecuritySettings() {
<<<<<<< HEAD
  const { accessToken, logout } = useAuth()
=======
  const { accessToken } = useAuth()
>>>>>>> develop
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // User MFA status
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Recovery codes
  const [recoveryCodes, setRecoveryCodes] = useState<RecoveryCode[]>([])
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false)
  
  // Regeneration dialog
  const [regenDialogOpen, setRegenDialogOpen] = useState(false)
  const [totpCode, setTotpCode] = useState('')
  const [regenerating, setRegenerating] = useState(false)

  const loadUserInfo = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    setError(null)
    try {
      const me = await authService.me(accessToken)
      setMfaEnabled(me.mfaEnabled)
      setUserId(me.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la información del usuario')
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    void loadUserInfo()
  }, [loadUserInfo])

  const handleViewRecoveryCodes = useCallback(async () => {
    if (!accessToken) return
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const response = await authService.getRecoveryCodes(accessToken)
      setRecoveryCodes(response.recoveryCodes)
      setShowRecoveryCodes(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener códigos de recuperación'
      if (message.includes('already retrieved') || message.includes('Forbidden')) {
        setError('Los códigos de recuperación ya fueron consultados. Puedes regenerarlos si lo necesitas.')
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  const handleOpenRegenDialog = useCallback(() => {
    setTotpCode('')
    setRegenDialogOpen(true)
    setError(null)
    setSuccess(null)
  }, [])

  const handleCloseRegenDialog = useCallback(() => {
    setRegenDialogOpen(false)
    setTotpCode('')
  }, [])

  const handleRegenerateCodes = useCallback(async () => {
    if (!accessToken || !totpCode.trim() || totpCode.length !== 6) return
    setRegenerating(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await authService.regenerateRecoveryCodes(accessToken, totpCode.trim())
      setRecoveryCodes(response.recoveryCodes.map(code => ({ code, usedAt: null })))
      setShowRecoveryCodes(true)
      setRegenDialogOpen(false)
      setSuccess('Códigos de recuperación regenerados exitosamente. Guárdalos en un lugar seguro.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al regenerar códigos'
      setError(message)
    } finally {
      setRegenerating(false)
    }
  }, [accessToken, totpCode])

  const handleCopyCode = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setSuccess('Código copiado al portapapeles')
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError('No se pudo copiar el código')
    }
  }, [])

  const handleCopyAllCodes = useCallback(async () => {
    try {
      const allCodes = recoveryCodes.map(rc => rc.code).join('\n')
      await navigator.clipboard.writeText(allCodes)
      setSuccess('Todos los códigos copiados al portapapeles')
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError('No se pudo copiar los códigos')
    }
  }, [recoveryCodes])

  const handleDownloadCodes = useCallback(() => {
    try {
      const allCodes = recoveryCodes.map(rc => rc.code).join('\n')
      const blob = new Blob([allCodes], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'recovery-codes.txt'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setSuccess('Códigos descargados')
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError('No se pudo descargar los códigos')
    }
  }, [recoveryCodes])

  if (loading && !userId) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon /> Configuración de seguridad
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra la autenticación multifactor y los códigos de recuperación de tu cuenta.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Card>
          <CardHeader
            title="Autenticación multifactor (MFA)"
            subheader={mfaEnabled ? 'Activa' : 'Inactiva'}
            avatar={
              mfaEnabled ? (
                <CheckCircleIcon color="success" fontSize="large" />
              ) : (
                <CancelIcon color="disabled" fontSize="large" />
              )
            }
          />
          <CardContent>
            {mfaEnabled ? (
              <Stack spacing={2}>
                <Alert severity="success">
                  Tu cuenta está protegida con autenticación de dos factores mediante TOTP.
                </Alert>
                <Typography variant="body2" color="text.secondary">
                  La autenticación multifactor añade una capa adicional de seguridad a tu cuenta. 
                  Cada vez que inicies sesión, necesitarás proporcionar un código de verificación desde tu aplicación de autenticación.
                </Typography>
              </Stack>
            ) : (
              <Alert severity="warning">
                MFA no está activado. Contacta al administrador para habilitar la autenticación multifactor en tu cuenta.
              </Alert>
            )}
          </CardContent>
        </Card>

        {mfaEnabled && (
          <Card>
            <CardHeader
              title="Códigos de recuperación"
              subheader="Usa estos códigos si pierdes acceso a tu dispositivo MFA"
            />
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Los códigos de recuperación te permiten acceder a tu cuenta si pierdes tu dispositivo de autenticación. 
                  Cada código solo puede usarse una vez. Guárdalos en un lugar seguro.
                </Typography>

                {!showRecoveryCodes ? (
                  <Box>
                    <Button
                      variant="outlined"
                      onClick={handleViewRecoveryCodes}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={18} /> : null}
                    >
                      Ver códigos de recuperación
                    </Button>
                  </Box>
                ) : (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                          Códigos activos ({recoveryCodes.filter(rc => !rc.usedAt).length} de {recoveryCodes.length})
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Copiar todos">
                            <IconButton size="small" onClick={handleCopyAllCodes}>
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={handleDownloadCodes}
                          >
                            Descargar
                          </Button>
                        </Stack>
                      </Box>
                      <Divider />
                      <List dense>
                        {recoveryCodes.map((rc, idx) => (
                          <ListItem
                            key={idx}
                            secondaryAction={
                              !rc.usedAt ? (
                                <Tooltip title="Copiar">
                                  <IconButton edge="end" size="small" onClick={() => handleCopyCode(rc.code)}>
                                    <ContentCopyIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ) : null
                            }
                            sx={{
                              opacity: rc.usedAt ? 0.5 : 1,
                              textDecoration: rc.usedAt ? 'line-through' : 'none',
                            }}
                          >
                            <ListItemText
                              primary={rc.code}
                              secondary={rc.usedAt ? `Usado el ${new Date(rc.usedAt).toLocaleDateString()}` : 'Disponible'}
                              primaryTypographyProps={{ fontFamily: 'monospace', fontWeight: 600 }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Stack>
                  </Paper>
                )}

                <Box>
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<RefreshIcon />}
                    onClick={handleOpenRegenDialog}
                  >
                    Regenerar códigos de recuperación
                  </Button>
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                    Al regenerar, todos los códigos anteriores dejarán de funcionar.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>

      {/* Regenerate Dialog */}
      <Dialog open={regenDialogOpen} onClose={handleCloseRegenDialog}>
        <DialogTitle>Regenerar códigos de recuperación</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Para regenerar tus códigos de recuperación, ingresa el código actual de tu aplicación de autenticación.
            Los códigos anteriores dejarán de funcionar inmediatamente.
          </DialogContentText>
          <TextField
            autoFocus
            label="Código TOTP"
            type="text"
            fullWidth
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
              maxLength: 6,
            }}
            disabled={regenerating}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRegenDialog} disabled={regenerating}>
            Cancelar
          </Button>
          <Button
            onClick={handleRegenerateCodes}
            variant="contained"
            color="warning"
            disabled={regenerating || totpCode.length !== 6}
            startIcon={regenerating ? <CircularProgress size={18} /> : <RefreshIcon />}
          >
            Regenerar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default SecuritySettings
