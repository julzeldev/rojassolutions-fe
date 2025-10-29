import React, { useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import QrCodeIcon from '@mui/icons-material/QrCode'
import { useAuth } from '../../../auth/useAuth'

export function MfaSetupIntroPage() {
  const { preAuthToken, pendingSetup, clearPreAuthToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!preAuthToken) {
      navigate('/login', { replace: true })
    }
  }, [preAuthToken, navigate])

  if (!preAuthToken) return null

  const email = pendingSetup?.email

  const handleContinue = () => {
    navigate('/mfa/setup/totp', { state: { preAuthToken }, replace: true })
  }

  const handleCancel = () => {
    clearPreAuthToken()
    navigate('/login', { replace: true })
  }

  return (
    <Container component="main" maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', minHeight: '100dvh' }}>
      <Paper elevation={3} sx={{ width: '100%', p: { xs: 3, md: 5 } }}>
        <Stack spacing={3} alignItems="center">
          <Box sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', p: 2, borderRadius: '50%' }}>
            <QrCodeIcon fontSize="large" />
          </Box>
          <Typography component="h1" variant="h4" textAlign="center">
            Configura la autenticación multifactor
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary">
            {email ? `Hola ${email}, ` : ''}
            necesitamos que completes la configuración de MFA para proteger tu cuenta. Tendrás que escanear un código QR y confirmar el código generado por tu app de autenticación.
          </Typography>
          <Alert severity="info" sx={{ width: '100%' }}>
            Prepara tu aplicación de autenticación (Google Authenticator, Authy, 1Password, etc.). El token pre-autenticado expira en cuestión de minutos.
          </Alert>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width="100%">
            <Button variant="contained" color="primary" onClick={handleContinue} fullWidth>
              Configurar ahora
            </Button>
            <Button variant="outlined" color="inherit" onClick={handleCancel} fullWidth>
              Cancelar
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  )
}

export default MfaSetupIntroPage
