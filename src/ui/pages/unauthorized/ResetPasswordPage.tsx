import React, { useState, useCallback, useEffect, FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material'
import LockResetIcon from '@mui/icons-material/LockReset'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { PasswordField } from '../../../components/form'
import { useAuth } from '../../../auth/useAuth'

export function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    if (!tokenFromUrl) {
      setError('Token de recuperación no encontrado. Por favor solicita un nuevo enlace.')
    } else {
      setToken(tokenFromUrl)
    }
  }, [searchParams])

  useEffect(() => {
    if (!password || !confirmPassword) {
      setPasswordError('')
      return
    }
    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden')
    } else if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres')
    } else {
      setPasswordError('')
    }
  }, [password, confirmPassword])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (submitting || !token) return

      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden')
        return
      }

      if (password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres')
        return
      }

      setError(null)
      setSubmitting(true)
      try {
        await resetPassword(token, password)
        setSuccess(true)
      } catch (err: unknown) {
        let message = 'No se pudo restablecer la contraseña'
        if (err instanceof Error) {
          if (err.message.includes('expired') || err.message.includes('Invalid token')) {
            message = 'El enlace de recuperación ha expirado o es inválido. Por favor solicita uno nuevo.'
          } else if (err.message.includes('MFA')) {
            message = 'Esta cuenta requiere verificación adicional. Por favor contacta al soporte.'
          } else {
            message = err.message
          }
        }
        setError(message)
      } finally {
        setSubmitting(false)
      }
    },
    [token, password, confirmPassword, resetPassword, submitting],
  )

  const handleGoToLogin = useCallback(() => {
    navigate('/login', { replace: true })
  }, [navigate])

  const handleRequestNew = useCallback(() => {
    navigate('/forgot-password', { replace: true })
  }, [navigate])

  const isFormValid = token && password.length >= 8 && password === confirmPassword && !passwordError

  if (success) {
    return (
      <Container
        component="main"
        maxWidth="xs"
        sx={{ display: 'flex', alignItems: 'center', minHeight: '100dvh' }}
      >
        <Paper elevation={3} sx={{ width: '100%', p: { xs: 3, sm: 4 } }}>
          <Stack spacing={3} alignItems="center">
            <Box sx={{ bgcolor: 'success.light', color: 'success.contrastText', p: 2, borderRadius: '50%' }}>
              <CheckCircleOutlineIcon fontSize="large" />
            </Box>
            <Typography component="h1" variant="h5" textAlign="center">
              Contraseña restablecida
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center">
              Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={handleGoToLogin}
            >
              Ir al inicio de sesión
            </Button>
          </Stack>
        </Paper>
      </Container>
    )
  }

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{ display: 'flex', alignItems: 'center', minHeight: '100dvh' }}
    >
      <Paper elevation={3} sx={{ width: '100%', p: { xs: 3, sm: 4 } }}>
        <Stack spacing={2} component="form" noValidate onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Box sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', p: 2, borderRadius: '50%' }}>
              <LockResetIcon fontSize="large" />
            </Box>
            <Typography component="h1" variant="h5" textAlign="center">
              Restablecer contraseña
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres.
            </Typography>
          </Box>

          {error && (
            <Alert role="alert" severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {!token && (
            <Alert severity="warning">
              Token no válido o faltante.{' '}
              <Link component="button" type="button" onClick={handleRequestNew}>
                Solicita un nuevo enlace
              </Link>
            </Alert>
          )}

          <PasswordField
            label="Nueva contraseña"
            name="password"
            required
            autoFocus
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            disabled={submitting || !token}
            helperText={password.length > 0 && password.length < 8 ? 'Mínimo 8 caracteres' : ' '}
            error={password.length > 0 && password.length < 8}
            inputProps={{ 'data-testid': 'password-input' }}
          />

          <PasswordField
            label="Confirmar contraseña"
            name="confirmPassword"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            disabled={submitting || !token}
            helperText={passwordError || ' '}
            error={Boolean(passwordError)}
            inputProps={{ 'data-testid': 'confirm-password-input' }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={submitting || !isFormValid}
            startIcon={submitting ? <CircularProgress size={18} /> : null}
          >
            Restablecer contraseña
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={handleGoToLogin}
              disabled={submitting}
            >
              Volver al inicio de sesión
            </Link>
          </Box>
        </Stack>
      </Paper>
    </Container>
  )
}

export default ResetPasswordPage
