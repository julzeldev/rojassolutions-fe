import React from 'react'
import { NavLink } from 'react-router'

export function NotFoundPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>404 - Not Found</h1>
      <p>The page you requested does not exist.</p>
      <NavLink to="/">Go Home</NavLink>
    </div>
  )
}
