import React from 'react'
import { describe, expect, it, beforeEach, vi, type MockedFunction } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { MfaSetupVerifyPage } from '../MfaSetupVerifyPage'
import type { AuthContextValue } from '../../../../auth/authContext'

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

describe('MfaSetupVerifyPage', () => {
  let finalizeMock: MockedFunction<AuthContextValue['finalizeTotpSetup']>
  let clearPreAuthTokenMock: MockedFunction<AuthContextValue['clearPreAuthToken']>

  beforeEach(() => {
    mockAuth.preAuthToken = 'pre-auth-token'
    mockAuth.pendingSetup = { preAuthToken: 'pre-auth-token', email: 'user@example.com' }
    finalizeMock = vi.fn(async () => ['RCODE-1', 'RCODE-2'])
    clearPreAuthTokenMock = vi.fn()
    mockAuth.finalizeTotpSetup = finalizeMock
    mockAuth.clearPreAuthToken = clearPreAuthTokenMock
  })

  function renderPage(initialPath = '/mfa/setup/verify') {
    const router = createMemoryRouter(
      [
        { path: '/mfa/setup/verify', element: <MfaSetupVerifyPage /> },
        { path: '/', element: <div data-testid="home">Home</div> },
        { path: '/mfa/setup/totp', element: <div data-testid="totp">Totp</div> },
        { path: '/login', element: <div data-testid="login">Login</div> },
      ],
      { initialEntries: [initialPath] },
    )
    const view = render(<RouterProvider router={router} />)
    return { router, view }
  }

  it('verifies the code and displays recovery codes', async () => {
    const { router } = renderPage()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/código totp/i), '123456')
    await user.click(screen.getByRole('button', { name: /activar mfa/i }))

    await waitFor(() => expect(finalizeMock).toHaveBeenCalledWith('123456'))
    expect(await screen.findByText(/guarda tus códigos de recuperación/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cerrar y continuar/i }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(clearPreAuthTokenMock).toHaveBeenCalled()
  })

  it('redirects to login when token is missing', () => {
    mockAuth.preAuthToken = null
    const { router } = renderPage()
    expect(router.state.location.pathname).toBe('/login')
  })
})
