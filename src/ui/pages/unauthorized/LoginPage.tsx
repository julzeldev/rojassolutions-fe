import React, { useState, useEffect, useCallback, FormEvent } from 'react'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router'
import { useAuth } from '../../../auth/useAuth'
import {
  Avatar,
  Box,
  Button,
  Container,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Paper,
  Link,
} from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { FormTextField, PasswordField } from '../../../components/form'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as ReturnType<typeof useLocation> & { state?: { from?: string } }

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, location.state, navigate])

  const handleLogin = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (submitting) return
      setError(null)
      setSubmitting(true)
      try {
        const result = await login(email.trim(), password)
        if (result.status === 'authenticated') {
          const from = location.state?.from || '/'
          navigate(from, { replace: true })
        } else if (result.status === 'mfa-required') {
          navigate('/mfa/verify', { replace: true })
        } else if (result.status === 'mfa-setup') {
          navigate('/mfa/setup-intro', { replace: true })
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'No se pudo iniciar sesión'
        setError(message)
      } finally {
        setSubmitting(false)
      }
    },
    [email, password, submitting, login, navigate, location.state],
  )

  const isFormValid = email.trim().length > 0 && password.length > 0

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{ display: 'flex', alignItems: 'center', minHeight: '100dvh' }}
    >
      <Paper elevation={3} sx={{ width: '100%', p: { xs: 3, sm: 4 } }}>
        <Stack spacing={2} component="form" noValidate onSubmit={handleLogin}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Inicia sesión
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
            value={email}
            onChange={setEmail}
            disabled={submitting}
            inputProps={{ 'data-testid': 'email-input' }}
          />
          <PasswordField
            label="Contraseña"
            name="password"
            required
            value={password}
            onChange={setPassword}
            disabled={submitting}
            inputProps={{ 'data-testid': 'password-input' }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={submitting || !isFormValid}
            startIcon={submitting ? <CircularProgress size={18} /> : null}
          >
            Continuar
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              underline="hover"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </Box>

          <Divider />
          <Typography variant="caption" color="text.secondary" textAlign="center">
            Si tu cuenta requiere verificación MFA, te guiaremos para completarla en el siguiente paso.
          </Typography>
        </Stack>
      </Paper>
    </Container>
  )
}
