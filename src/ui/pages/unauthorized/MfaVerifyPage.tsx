import React, { useCallback, useEffect, useMemo, useState, FormEvent } from 'react'
import { useNavigate } from 'react-router'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Link,
  Paper,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import { FormTextField } from '../../../components/form'
import { useAuth } from '../../../auth/useAuth'

export function MfaVerifyPage() {
  const {
    pendingMfa,
    completeTotpLogin,
    cancelMfaChallenge,
  } = useAuth()
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const emailLabel = useMemo(() => pendingMfa?.email ?? '', [pendingMfa])

  useEffect(() => {
    if (!pendingMfa) {
      navigate('/login', { replace: true })
    }
  }, [pendingMfa, navigate])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!pendingMfa || submitting) return
      setError(null)
      setSubmitting(true)
      try {
        await completeTotpLogin(code.trim())
        navigate('/', { replace: true })
      } catch (err: unknown) {
        setAttempts((prev) => prev + 1)
        const message = err instanceof Error ? err.message : 'El código no es válido'
        setError(message)
      } finally {
        setSubmitting(false)
      }
    },
    [code, completeTotpLogin, navigate, pendingMfa, submitting],
  )

  const handleUseRecovery = useCallback(() => {
    navigate('/mfa/recovery', { replace: true })
  }, [navigate])

  const handleBackToLogin = useCallback(() => {
    cancelMfaChallenge()
    navigate('/login', { replace: true })
  }, [cancelMfaChallenge, navigate])

  if (!pendingMfa) return null

  const disableSubmit = submitting || code.trim().length !== 6

  return (
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', minHeight: '100dvh' }}>
      <Paper elevation={3} sx={{ width: '100%', p: { xs: 3, sm: 4 } }}>
        <Stack spacing={2} component="form" noValidate onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <VerifiedUserIcon />
            </Avatar>
            <Typography component="h1" variant="h5" textAlign="center">
              Verificación multifactor
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Ingresa el código de 6 dígitos generado por tu app de autenticación
              {emailLabel ? ` para ${emailLabel}` : ''}.
            </Typography>
          </Box>

          {error && (
            <Alert role="alert" severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {attempts >= 3 && !error && (
            <Alert role="status" severity="info">
              Revisa que la hora de tu dispositivo coincida con la del sistema para evitar errores.
            </Alert>
          )}

          <FormTextField
            label="Código TOTP"
            name="totp"
            type="text"
            value={code}
            onChange={setCode}
            required
            autoFocus
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
              maxLength: 6,
              autoComplete: 'one-time-code',
              'data-testid': 'totp-input',
            }}
            disabled={submitting}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={disableSubmit}
            startIcon={submitting ? <CircularProgress size={18} /> : null}
          >
            Verificar código
          </Button>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Link component="button" type="button" onClick={handleUseRecovery} disabled={submitting}>
              Usar código de recuperación
            </Link>
            <Button variant="text" size="small" onClick={handleBackToLogin} disabled={submitting}>
              Cambiar de cuenta
            </Button>
          </Stack>

          <Divider />
          <Typography variant="caption" color="text.secondary" textAlign="center">
            Si tienes problemas recurrentes, solicita nuevos códigos o contacta a soporte.
          </Typography>
        </Stack>
      </Paper>
    </Container>
  )
}

export default MfaVerifyPage
