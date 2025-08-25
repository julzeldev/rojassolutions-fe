// Central route definitions using React Router v7 style API
import React from 'react'
import { createBrowserRouter } from 'react-router'
import { RootLayout } from './ui/layouts/RootLayout.jsx'
import { HomePage } from './ui/pages/HomePage.jsx'
import { AboutPage } from './ui/pages/AboutPage.jsx'
import { NotFoundPage } from './ui/pages/NotFoundPage.jsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundPage />, // fallback for route errors
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
