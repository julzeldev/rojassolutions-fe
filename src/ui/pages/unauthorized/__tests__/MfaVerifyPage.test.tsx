import React from 'react'
import { describe, expect, it, beforeEach, vi, type MockedFunction } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { MfaVerifyPage } from '../MfaVerifyPage'
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

type CompleteTotpFn = AuthContextValue['completeTotpLogin']
let completeTotpLoginMock: MockedFunction<CompleteTotpFn>

describe('MfaVerifyPage', () => {
  beforeEach(() => {
    mockAuth.pendingMfa = { userId: 'user-123', email: 'user@example.com' }
    completeTotpLoginMock = vi.fn(async () => true) as vi.MockedFunction<CompleteTotpFn>
    mockAuth.completeTotpLogin = completeTotpLoginMock
    mockAuth.cancelMfaChallenge = vi.fn()
  })

  function renderPage(initialPath = '/mfa/verify') {
    const router = createMemoryRouter(
      [
        { path: '/mfa/verify', element: <MfaVerifyPage /> },
        { path: '/', element: <div data-testid="home">Home</div> },
        { path: '/login', element: <div data-testid="login">Login</div> },
        { path: '/mfa/recovery', element: <div data-testid="recovery">Recovery</div> },
      ],
      { initialEntries: [initialPath] },
    )
    const view = render(<RouterProvider router={router} />)
    return { router, view }
  }

  it('submits the code and navigates home on success', async () => {
    completeTotpLoginMock.mockResolvedValue(true)
    const { router } = renderPage()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/Código TOTP/i), '123456')
    await user.click(screen.getByRole('button', { name: /verificar código/i }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(completeTotpLoginMock).toHaveBeenCalledWith('123456')
  })

  it('shows an error when verification fails', async () => {
    completeTotpLoginMock.mockRejectedValue(new Error('Código inválido'))
    renderPage()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/Código TOTP/i), '000000')
    await user.click(screen.getByRole('button', { name: /verificar código/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Código inválido')
  })
})
