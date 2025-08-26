import React from 'react'
import { NavLink } from 'react-router'

export function UnauthorizedPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Unauthorized</h1>
      <p>You must be signed in to view this page.</p>
      <NavLink to="/login">Go to Login</NavLink>
    </div>
  )
}
