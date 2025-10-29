import React, { useCallback, useState, FormEvent } from 'react'
import { useNavigate } from 'react-router'
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material'
import { FormTextField } from '../../../components/form'
import { useAuth } from '../../../auth/useAuth'

export function MfaRecoveryPage() {
  const { completeRecoveryLogin } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (submitting) return
      setError(null)
      setSubmitting(true)
      try {
        await completeRecoveryLogin(email.trim(), code.trim())
        navigate('/', { replace: true })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'No fue posible validar el código'
        setError(message)
      } finally {
        setSubmitting(false)
      }
    },
    [completeRecoveryLogin, email, code, submitting, navigate],
  )

  const disableSubmit =
    submitting || email.trim().length === 0 || code.trim().length === 0

  return (
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', minHeight: '100dvh' }}>
      <Paper elevation={3} sx={{ width: '100%', p: { xs: 3, sm: 4 } }}>
        <Stack spacing={2} component="form" noValidate onSubmit={handleSubmit}>
          <Typography component="h1" variant="h5" textAlign="center">
            Usa un código de recuperación
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Introduce el correo de tu cuenta y uno de los códigos de recuperación que guardaste al configurar MFA.
          </Typography>

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
          />

          <FormTextField
            label="Código de recuperación"
            name="recoveryCode"
            type="text"
            required
            value={code}
            onChange={setCode}
            helperText="El código se consume después de utilizarlo."
            disabled={submitting}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={disableSubmit}
            startIcon={submitting ? <CircularProgress size={18} /> : null}
            data-testid="recovery-submit"
          >
            Ingresar
          </Button>

          <Divider />
          <Button variant="text" onClick={() => navigate('/mfa/verify', { replace: true })} disabled={submitting}>
            Volver a la verificación con código TOTP
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}

export default MfaRecoveryPage
