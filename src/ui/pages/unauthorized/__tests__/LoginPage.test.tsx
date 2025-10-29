import React from 'react'
import { describe, expect, it, beforeEach, vi, type MockedFunction } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { LoginPage } from '../LoginPage'
import type { AuthContextValue, LoginResult } from '../../../../auth/AuthContext'

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

type LoginFn = AuthContextValue['login']
let loginMock: MockedFunction<LoginFn>

describe('LoginPage', () => {
  beforeEach(() => {
    mockAuth.isAuthenticated = false
    loginMock = vi.fn(async () => ({ status: 'authenticated' })) as MockedFunction<LoginFn>
    mockAuth.login = loginMock
  })

  function renderLogin() {
    const router = createMemoryRouter(
      [
        { path: '/login', element: <LoginPage /> },
        { path: '/', element: <div>Inicio</div> },
        { path: '/mfa/verify', element: <div data-testid="mfa-verify">MFA</div> },
        { path: '/mfa/setup-intro', element: <div data-testid="mfa-setup">Setup</div> },
      ],
      { initialEntries: ['/login'] },
    )

    const view = render(<RouterProvider router={router} />)
    return { router, view }
  }

  it('navigates to home after successful login', async () => {
    loginMock.mockResolvedValue({ status: 'authenticated' } satisfies LoginResult)

    const { router } = renderLogin()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/correo/i), 'test@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'password123')
    await user.click(screen.getByRole('button', { name: /continuar/i }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })

  it('redirects to MFA verification when required', async () => {
    loginMock.mockResolvedValue({ status: 'mfa-required', userId: 'user-123' } satisfies LoginResult)

    const { router } = renderLogin()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/correo/i), 'mfa@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'password123')
    await user.click(screen.getByRole('button', { name: /continuar/i }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/mfa/verify'))
  })

  it('redirects to MFA setup intro when required', async () => {
    loginMock.mockResolvedValue({ status: 'mfa-setup', preAuthToken: 'token' } satisfies LoginResult)

    const { router } = renderLogin()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/correo/i), 'setup@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'password123')
    await user.click(screen.getByRole('button', { name: /continuar/i }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/mfa/setup-intro'))
  })

  it('shows an error when login throws', async () => {
    loginMock.mockRejectedValue(new Error('Credenciales inválidas'))

    renderLogin()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/correo/i), 'fail@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'password123')
    await user.click(screen.getByRole('button', { name: /continuar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas')
  })
})
