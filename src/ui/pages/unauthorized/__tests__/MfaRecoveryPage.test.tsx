import React from 'react'
import { describe, expect, it, beforeEach, vi, type MockedFunction } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter, Outlet } from 'react-router'
import { MfaRecoveryPage } from '../MfaRecoveryPage'
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

function getRecoveryForm(): HTMLFormElement {
  const headings = screen.getAllByRole('heading', {
    name: /usa un código de recuperación/i,
  })
  const activeHeading = headings[headings.length - 1]
  const form = activeHeading.closest('form')
  if (!form) throw new Error('recovery form not found')
  return form as HTMLFormElement
}

describe('MfaRecoveryPage', () => {
  let completeRecoveryLoginMock: MockedFunction<AuthContextValue['completeRecoveryLogin']>

  beforeEach(() => {
    completeRecoveryLoginMock = vi.fn().mockResolvedValue(true)
    mockAuth.completeRecoveryLogin = completeRecoveryLoginMock
  })

  function renderPage(initialPath = '/mfa/recovery') {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: (
            <div data-testid="root">
              <Outlet />
            </div>
          ),
          children: [
            { index: true, element: <div data-testid="home">Home</div> },
            { path: 'mfa/recovery', element: <MfaRecoveryPage /> },
            { path: 'mfa/verify', element: <div data-testid="verify">Verify</div> },
          ],
        },
      ],
      { initialEntries: [initialPath] },
    )
    render(<RouterProvider router={router} />)
    return router
  }

  it('submits the recovery code and redirects home on success', async () => {
    const router = renderPage()
    const user = userEvent.setup()

    expect(
      screen.getByText(/código se consume después de utilizarlo/i),
    ).toBeInTheDocument()

    const form = getRecoveryForm()
    const emailField = within(form).getByLabelText(/correo electrónico/i)
    const codeField = within(form).getByLabelText(/código de recuperación/i)

    await user.type(emailField, ' user@example.com ')
    await user.type(codeField, ' CODE-123 ')

    const submitButton = within(form).getByTestId('recovery-submit')
    expect(submitButton).not.toBeDisabled()

    await user.click(submitButton)

    await waitFor(() => {
      expect(completeRecoveryLoginMock).toHaveBeenCalledWith('user@example.com', 'CODE-123')
    })
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/')
    })
  })

  it('shows an error message when recovery login fails', async () => {
    const error = new Error('Código inválido')
    completeRecoveryLoginMock.mockRejectedValueOnce(error)

    renderPage()
    const user = userEvent.setup()

    const form = getRecoveryForm()
    const emailField = within(form).getByLabelText(/correo electrónico/i)
    const codeField = within(form).getByLabelText(/código de recuperación/i)

    await user.type(emailField, 'user@example.com')
    await user.type(codeField, 'CODE-123')

    await user.click(within(form).getByTestId('recovery-submit'))

    expect(await screen.findByRole('alert')).toHaveTextContent('Código inválido')
    expect(completeRecoveryLoginMock).toHaveBeenCalledTimes(1)
  })

  it('keeps the submit button disabled until both fields have value', async () => {
    renderPage()
    const user = userEvent.setup()

    const form = getRecoveryForm()
    const submitButton = within(form).getByTestId('recovery-submit')
    expect(submitButton).toBeDisabled()

    await user.type(within(form).getByLabelText(/correo electrónico/i), 'user@example.com')
    expect(submitButton).toBeDisabled()

    await user.type(within(form).getByLabelText(/código de recuperación/i), 'CODE-123')
    expect(submitButton).not.toBeDisabled()
  })
})
