import React, { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../../../auth/useAuth'
import { authService } from '../../../auth/authService'

export function SecuritySettings() {
  const { accessToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [qr, setQr] = useState(null)
  const [secret, setSecret] = useState(null)
  const [userId, setUserId] = useState(null)
  const [code, setCode] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [hasSecret, setHasSecret] = useState(false)
  const [message, setMessage] = useState('')

  const refreshMe = useCallback(async () => {
    if (!accessToken) return
    try {
      const me = await authService.me(accessToken)
      setEnabled(me.mfaEnabled)
      setHasSecret(me.hasMfaSecret)
      setUserId(me.id)
    } catch {
      // ignore
    }
  }, [accessToken])

  useEffect(() => { refreshMe() }, [refreshMe])

  async function startSetup() {
    if (!accessToken) return
    setLoading(true); setError(null); setMessage('')
    try {
      const data = await authService.enableMfa(accessToken)
      setQr(data.qr)
      setSecret(data.secret)
      setHasSecret(true)
      setMessage('Scan the QR with your authenticator app, then enter the 6-digit code to confirm.')
    } catch (e) {
      setError(e.message || 'Failed to start MFA setup')
    } finally { setLoading(false) }
  }

  async function confirm() {
    if (!userId) return
    setLoading(true); setError(null); setMessage('')
    try {
      const resp = await authService.verifyMfa(userId, code, 'enable')
      if ('ok' in resp && resp.ok) {
        setMessage('MFA enabled successfully. Next login will require a code.')
        setEnabled(true)
      } else {
        setError('Unexpected response')
      }
    } catch (e) {
      setError(e.message || 'Invalid code')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h2>Security Settings</h2>
      <section>
        <h3>Multi-Factor Authentication (TOTP)</h3>
        {enabled ? (
          <p>MFA is enabled for your account.</p>
        ) : (
          <>
            {!hasSecret && (
              <button disabled={loading} onClick={startSetup}>Start MFA Setup</button>
            )}
            {qr && (
              <div style={{ marginTop: '1rem' }}>
                <img src={qr} alt="MFA QR" style={{ width: 200, height: 200 }} />
                <p>Secret: <code>{secret}</code></p>
                <input
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  maxLength={6}
                  style={{ letterSpacing: '0.3em' }}
                />
                <button disabled={loading || code.length !== 6} onClick={confirm} style={{ marginLeft: '0.5rem' }}>Confirm</button>
              </div>
            )}
          </>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}
      </section>
    </div>
  )
}

export default SecuritySettings
