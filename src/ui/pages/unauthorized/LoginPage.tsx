import React, { useState, useEffect, useCallback, FormEvent } from 'react'
import { useNavigate, useLocation, NavLink } from 'react-router'
import { useAuth } from '../../../auth/useAuth'
import { Avatar, Box, Button, Container, Typography, Alert, CircularProgress, Stack, Divider, Paper } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { FormTextField, PasswordField } from '../../../components/form'

// Mobile-first responsive login (email + password). If backend indicates MFA required,
// display MFA field and verify via verifyMfa().
export function LoginPage() {
  const { login, verifyMfa, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as ReturnType<typeof useLocation> & { state?: { from?: string } }

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [mfaCode, setMfaCode] = useState<string>('')
  const [awaitingMfa, setAwaitingMfa] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, location.state, navigate])

  const handleLogin = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (awaitingMfa || submitting) return
    setError(null)
    setInfo(null)
    setSubmitting(true)
    try {
      const res = await login(email.trim(), password)
      if (res?.mfaRequired) {
        setAwaitingMfa(true)
        setInfo('Multi-factor authentication required. Enter your code.')
      } else {
        navigate('/')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }, [awaitingMfa, email, login, navigate, password, submitting])

  const handleVerifyMfa = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!awaitingMfa || submitting) return
    setError(null)
    setSubmitting(true)
    try {
      await verifyMfa(mfaCode.trim())
      navigate('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'MFA verification failed'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }, [awaitingMfa, mfaCode, navigate, submitting, verifyMfa])

  return (
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', minHeight: '100dvh' }}>
      <Paper elevation={3} sx={{ width: '100%', p: { xs: 3, sm: 4 } }}>
  <Stack spacing={2} component="form" noValidate onSubmit={awaitingMfa ? handleVerifyMfa : handleLogin}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              {awaitingMfa ? 'Enter MFA Code' : 'Sign in'}
            </Typography>
          </Box>
          {error && <Alert role="alert" severity="error" onClose={() => setError(null)}>{error}</Alert>}
          {info && <Alert role="status" severity="info" onClose={() => setInfo(null)}>{info}</Alert>}

          {!awaitingMfa && (
            <>
              <FormTextField
                label="Email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(val) => setEmail(val)}
                disabled={submitting}
                inputProps={{ 'data-testid': 'email-input' }}
              />
              <PasswordField
                label="Password"
                name="password"
                required
                value={password}
                onChange={(val) => setPassword(val)}
                disabled={submitting}
                inputProps={{ 'data-testid': 'password-input' }}
              />
            </>
          )}

          {awaitingMfa && (
            <FormTextField
              label="MFA Code"
              name="mfa"
              type="text"
              required
              value={mfaCode}
              onChange={(val) => setMfaCode(val)}
              autoFocus
              disabled={submitting}
              autoComplete="one-time-code"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', 'data-testid': 'mfa-input', maxLength: 6 }}
              helperText="Check your authenticator app or email for the code"
            />
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={submitting || (!awaitingMfa && (!email || !password)) || (awaitingMfa && mfaCode.length !== 6)}
            startIcon={submitting ? <CircularProgress size={18} /> : null}
          >
            {awaitingMfa ? 'Verify Code' : 'Sign In'}
          </Button>
          {!awaitingMfa && (
            <Typography variant="body2" textAlign="center" sx={{ mt: 1 }}>
              Need an account? <NavLink to="/register">Register</NavLink>
            </Typography>
          )}
          {awaitingMfa && (
            <Button
              variant="text"
              size="small"
              onClick={() => { if (!submitting) { setAwaitingMfa(false); setMfaCode('') } }}
              disabled={submitting}
            >
              Back to login
            </Button>
          )}
          <Divider />
          <Typography variant="caption" color="text.secondary" textAlign="center">
            Secure access portal
          </Typography>
        </Stack>
      </Paper>
    </Container>
  )
}
