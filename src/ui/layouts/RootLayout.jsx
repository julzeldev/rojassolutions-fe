import React from 'react'
import { Outlet, NavLink } from 'react-router'
import './RootLayout.css'

export function RootLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : undefined}>Home</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : undefined}>About</NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
