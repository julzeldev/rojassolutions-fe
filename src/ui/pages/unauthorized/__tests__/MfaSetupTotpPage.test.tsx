import React from 'react'
import { describe, expect, it, beforeEach, vi, type MockedFunction } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { MfaSetupTotpPage } from '../MfaSetupTotpPage'
import type { AuthContextValue } from '../../../../auth/AuthContext'
import { authService } from '../../../../auth/authService'

const mockAuth: AuthContextValue = {
  isAuthenticated: false,
  userRole: null,
  accessToken: null,
  login: vi.fn(),
  completeTotpLogin: vi.fn(),
  completeRecoveryLogin: vi.fn(),
  cancelMfaChallenge: vi.fn(),
  pendingMfa: null,
  preAuthToken: null,
  clearPreAuthToken: vi.fn(),
  pendingSetup: null,
  finalizeTotpSetup: vi.fn(),
  logout: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
}

vi.mock('../../../../auth/useAuth', () => ({
  useAuth: () => mockAuth,
}))

vi.mock('../../../../auth/authService', () => ({
  authService: {
    initTotpSetup: vi.fn(),
  },
}))

const initTotpSetupMock = vi.mocked(authService).initTotpSetup

describe('MfaSetupTotpPage', () => {
  beforeEach(() => {
    mockAuth.preAuthToken = 'pre-auth-token'
    mockAuth.pendingSetup = { preAuthToken: 'pre-auth-token', email: 'user@example.com' }
    mockAuth.clearPreAuthToken = vi.fn()
    initTotpSetupMock.mockReset()
  })

  function renderPage(initialPath = '/mfa/setup/totp') {
    const router = createMemoryRouter(
      [
        { path: '/mfa/setup/totp', element: <MfaSetupTotpPage /> },
        { path: '/mfa/setup/verify', element: <div data-testid="verify">Verify</div> },
      ],
      { initialEntries: [initialPath] },
    )
    const view = render(<RouterProvider router={router} />)
    return { router, view }
  }

  it('renders QR information returned by the API', async () => {
    initTotpSetupMock!.mockResolvedValue({
      qrSvgDataUrl: 'data:image/svg+xml;base64,XXX',
      otpauthUrl: 'otpauth://totp/Acme%20Inc:user@example.com?secret=ABC123&issuer=Acme%20Inc',
    })

    const { router } = renderPage()
    const user = userEvent.setup()

    expect(await screen.findByRole('img', { name: /código qr/i })).toBeInTheDocument()
    expect(screen.getByText(/Acme Inc/i)).toBeInTheDocument()
    expect(screen.getByText(/ABC123/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /ya lo escaneé/i }))
    expect(router.state.location.pathname).toBe('/mfa/setup/verify')
  })

  it('shows an error message when the QR fetch fails', async () => {
    initTotpSetupMock!.mockRejectedValue(new Error('Network failed'))

    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('Network failed')

    const user = userEvent.setup()
    initTotpSetupMock!.mockResolvedValue({
      qrSvgDataUrl: 'data:image/svg+xml;base64,YYY',
      otpauthUrl: 'otpauth://totp/Issuer:user@example.com?secret=DEF456&issuer=Issuer',
    })

    await user.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(await screen.findByRole('img', { name: /código qr/i })).toBeInTheDocument()
  })
})
