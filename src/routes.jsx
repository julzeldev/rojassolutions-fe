// Central route definitions using React Router v7 style API
import React from 'react'
import { createBrowserRouter } from 'react-router'
import { RootLayout } from './ui/layouts/RootLayout.tsx'
import { HomePage } from './ui/pages/HomePage.tsx'
import { AboutPage } from './ui/pages/AboutPage.jsx'
import { NotFoundPage } from './ui/pages/NotFoundPage.jsx'
import { LoginPage } from './ui/pages/unauthorized/LoginPage.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { SecuritySettings } from './ui/pages/settings/SecuritySettings.jsx'
import { EmployeesPage } from './ui/pages/employees/EmployeesPage.tsx'
import { EmployeeDetailPage } from './ui/pages/employees/detail/EmployeeDetailPage.tsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundPage />, // fallback for route errors
    children: [
      { index: true, element: (
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      ) },
      { path: 'about', element: (
        <ProtectedRoute>
          <AboutPage />
        </ProtectedRoute>
      ) },
      { path: 'empleados', element: (
        <ProtectedRoute>
          <EmployeesPage />
        </ProtectedRoute>
      ) },
      { path: 'empleados/:id', element: (
        <ProtectedRoute>
          <EmployeeDetailPage />
        </ProtectedRoute>
      ) },
      { path: 'settings/security', element: (
        <ProtectedRoute>
          <SecuritySettings />
        </ProtectedRoute>
      ) },
      { path: 'login', element: <LoginPage /> },
      { path: '*', element: (
        <ProtectedRoute>
          <NotFoundPage />
        </ProtectedRoute>
      ) },
    ],
  },
])
