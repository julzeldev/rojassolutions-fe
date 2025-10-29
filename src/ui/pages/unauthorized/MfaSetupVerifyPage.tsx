import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router'
import { FormTextField } from '../../../components/form'
import { useAuth } from '../../../auth/useAuth'
import { RecoveryCodesDialog } from '../../components/security/RecoveryCodesDialog'

export function MfaSetupVerifyPage() {
  const { preAuthToken, pendingSetup, finalizeTotpSetup, clearPreAuthToken } = useAuth()
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  const email = useMemo(() => pendingSetup?.email ?? '', [pendingSetup])

  useEffect(() => {
    if (!preAuthToken) {
      navigate('/login', { replace: true })
    }
  }, [preAuthToken, navigate])

  if (!preAuthToken) return null

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (submitting) return
      setError(null)
      setSubmitting(true)
      try {
        const codes = await finalizeTotpSetup(code.trim())
        setRecoveryCodes(codes)
        setDialogOpen(true)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo verificar el código'
        setError(message)
      } finally {
        setSubmitting(false)
      }
    },
    [code, finalizeTotpSetup, submitting],
  )

  const handleBack = () => {
    navigate('/mfa/setup/totp')
  }

  const handleCancel = () => {
    clearPreAuthToken()
    navigate('/login', { replace: true })
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    clearPreAuthToken()
    navigate('/', { replace: true })
  }

  const disableSubmit = submitting || code.trim().length !== 6

  return (
    <>
      <Container component="main" maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', minHeight: '100dvh' }}>
        <Paper elevation={3} sx={{ width: '100%', p: { xs: 3, md: 5 } }}>
          <Stack spacing={3} component="form" noValidate onSubmit={handleSubmit}>
            <Box>
              <Typography component="h1" variant="h4" textAlign="center">
                Verifica tu código MFA
              </Typography>
              <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mt: 1 }}>
                {email ? `Ingresa el código generado para ${email}.` : 'Ingresa el código generado por tu app de autenticación.'}
              </Typography>
            </Box>

            {error && (
              <Alert role="alert" severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <FormTextField
              label="Código TOTP"
              name="totp"
              type="text"
              required
              value={code}
              onChange={setCode}
              autoFocus
              autoComplete="one-time-code"
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                maxLength: 6,
                'data-testid': 'setup-totp-input',
              }}
              disabled={submitting}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={disableSubmit}
              startIcon={submitting ? <CircularProgress size={18} /> : null}
            >
              Activar MFA
            </Button>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="outlined" onClick={handleBack} disabled={submitting} fullWidth>
                Volver al QR
              </Button>
              <Button variant="text" color="inherit" onClick={handleCancel} disabled={submitting} fullWidth>
                Cancelar configuración
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>

      <RecoveryCodesDialog
        open={dialogOpen}
        recoveryCodes={recoveryCodes}
        onClose={handleDialogClose}
      />
    </>
  )
}

export default MfaSetupVerifyPage
