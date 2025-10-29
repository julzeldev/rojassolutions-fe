import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import VerifiedIcon from '@mui/icons-material/Verified'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useNavigate } from 'react-router'
import { authService } from '../../../auth/authService'
import { useAuth } from '../../../auth/useAuth'

interface TotpDetails {
  issuer: string
  account: string
  secret: string
}

function parseOtpauth(otpauthUrl: string): TotpDetails {
  try {
    const normalized = otpauthUrl.replace('otpauth://', 'https://')
    const url = new URL(normalized)
    const label = decodeURIComponent(url.pathname.slice(1))
    const [labelIssuer, accountRaw] = label.split(':')
    const account = (accountRaw || labelIssuer || '').trim()
    const issuer = decodeURIComponent(url.searchParams.get('issuer') || labelIssuer || '').trim()
    const secret = (url.searchParams.get('secret') || '').trim()
    return {
      issuer,
      account,
      secret,
    }
  } catch {
    return { issuer: '', account: '', secret: '' }
  }
}

export function MfaSetupTotpPage() {
  const { preAuthToken, pendingSetup, clearPreAuthToken } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [qrSvgDataUrl, setQrSvgDataUrl] = useState<string>('')
  const [otpauthUrl, setOtpauthUrl] = useState<string>('')
  const [copySuccess, setCopySuccess] = useState(false)

  const details = useMemo(() => parseOtpauth(otpauthUrl), [otpauthUrl])

  const loadQr = useCallback(async () => {
    if (!preAuthToken) return
    setLoading(true)
    setError(null)
    try {
      const data = await authService.initTotpSetup(preAuthToken)
      setQrSvgDataUrl(data.qrSvgDataUrl)
      setOtpauthUrl(data.otpauthUrl)
    } catch (err) {
      let message = 'No se pudo generar el código QR'
      if (err instanceof Error) {
        if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          message = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.'
        } else if (err.message.includes('expired')) {
          message = 'El token de configuración ha expirado. Por favor inicia sesión nuevamente.'
        } else if (err.message.includes('Network') || err.message.includes('fetch')) {
          message = 'Error de conexión. Verifica tu internet e intenta nuevamente.'
        } else {
          message = err.message
        }
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [preAuthToken])

  useEffect(() => {
    if (!preAuthToken) {
      navigate('/login', { replace: true })
      return
    }
    void loadQr()
  }, [preAuthToken, loadQr, navigate])

  if (!preAuthToken) return null

  const email = pendingSetup?.email

  const handleCancel = () => {
    clearPreAuthToken()
    navigate('/login', { replace: true })
  }

  const handleVerify = () => {
    navigate('/mfa/setup/verify')
  }

  const handleCopySecret = useCallback(async () => {
    if (!details.secret) return
    try {
      await navigator.clipboard.writeText(details.secret)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch {
      setError('No se pudo copiar el código al portapapeles')
    }
  }, [details.secret])

  const hasManualSecret = Boolean(details.secret)

  return (
    <Container component="main" maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', minHeight: '100dvh' }}>
      <Paper elevation={3} sx={{ width: '100%', p: { xs: 3, md: 5 } }}>
        <Stack spacing={3} alignItems="center">
          <Typography component="h1" variant="h4" textAlign="center">
            Escanea el código QR
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            {email ? `Cuenta: ${email}. ` : ''}
            Usa tu app de autenticación para escanear el código. Si no puedes escanear, ingresa manualmente el código de respaldo.
          </Typography>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && error && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={loadQr}>
                  Reintentar
                </Button>
              }
              sx={{ width: '100%' }}
            >
              {error}
            </Alert>
          )}

          {!loading && !error && (
            <>
              <Box
                component="img"
                src={qrSvgDataUrl}
                alt="Código QR para configurar MFA"
                sx={{
                  maxWidth: 320,
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: 3,
                  backgroundColor: 'white',
                  p: 2,
                }}
              />
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Escanea el código y luego ingresa un código de verificación para completar la configuración.
              </Typography>

              <Divider sx={{ width: '100%' }}>Información manual</Divider>

              <Stack spacing={1} sx={{ width: '100%' }}>
                {details.issuer && (
                  <Typography variant="body2">
                    <strong>Issuer:</strong> {details.issuer}
                  </Typography>
                )}
                {(details.account || email) && (
                  <Typography variant="body2">
                    <strong>Cuenta:</strong> {details.account || email}
                  </Typography>
                )}
                {hasManualSecret ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all', flex: 1 }}>
                        <strong>Código manual:</strong> {details.secret}
                      </Typography>
                      <Tooltip title={copySuccess ? 'Copiado!' : 'Copiar código'}>
                        <IconButton
                          size="small"
                          onClick={handleCopySecret}
                          color={copySuccess ? 'success' : 'default'}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    {copySuccess && (
                      <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                        Código copiado al portapapeles
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    El código manual aparecerá en tu app automáticamente después de escanear el QR.
                  </Typography>
                )}
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width="100%">
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={loadQr}
                  startIcon={<RefreshIcon />}
                  disabled={loading}
                  fullWidth
                >
                  Generar nuevo QR
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<VerifiedIcon />}
                  onClick={handleVerify}
                  fullWidth
                >
                  Ya lo escaneé
                </Button>
              </Stack>
            </>
          )}

          <Button variant="text" color="inherit" onClick={handleCancel}>
            Cancelar configuración
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}

export default MfaSetupTotpPage
