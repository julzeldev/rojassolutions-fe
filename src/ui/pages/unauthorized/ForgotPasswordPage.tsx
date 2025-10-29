import React, { useState, useCallback, FormEvent } from 'react'
import { useNavigate } from 'react-router'
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
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { FormTextField } from '../../../components/form'
import { useAuth } from '../../../auth/useAuth'

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (submitting) return
      setError(null)
      setSubmitting(true)
      try {
        await forgotPassword(email.trim())
        setSuccess(true)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'No se pudo enviar el correo de recuperación'
        setError(message)
      } finally {
        setSubmitting(false)
      }
    },
    [email, forgotPassword, submitting],
  )

  const handleBackToLogin = useCallback(() => {
    navigate('/login', { replace: true })
  }, [navigate])

  const isFormValid = email.trim().length > 0 && email.includes('@')

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
              Correo enviado
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center">
              Si existe una cuenta asociada con <strong>{email}</strong>, recibirás un correo con instrucciones para restablecer tu contraseña.
            </Typography>
            <Alert severity="info" sx={{ width: '100%' }}>
              El enlace de recuperación expirará en 60 minutos. Si no lo recibes, revisa tu carpeta de spam.
            </Alert>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleBackToLogin}
            >
              Volver al inicio de sesión
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
              <EmailOutlinedIcon fontSize="large" />
            </Box>
            <Typography component="h1" variant="h5" textAlign="center">
              Recuperar contraseña
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
            </Typography>
          </Box>

          {error && (
            <Alert role="alert" severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <FormTextField
            label="Correo electrónico"
            name="email"
            type="email"
            required
            autoComplete="email"
            autoFocus
            value={email}
            onChange={setEmail}
            disabled={submitting}
            inputProps={{ 'data-testid': 'email-input' }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={submitting || !isFormValid}
            startIcon={submitting ? <CircularProgress size={18} /> : null}
          >
            Enviar instrucciones
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={handleBackToLogin}
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

export default ForgotPasswordPage
