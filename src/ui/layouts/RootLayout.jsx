import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router'
import './RootLayout.css'
import { useAuth } from '../../auth/useAuth.tsx'

export function RootLayout() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  // If user is not authenticated, render only the routed page (e.g., login) without chrome
  if (!isAuthenticated) {
    return <Outlet />
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : undefined}>Home</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : undefined}>About</NavLink>
          <NavLink to="/settings/security" className={({ isActive }) => isActive ? 'active' : undefined}>Security</NavLink>
          <button
            type="button"
            onClick={async () => { await logout(); navigate('/login') }}
            style={{ marginLeft: '1rem' }}
          >Logout</button>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
