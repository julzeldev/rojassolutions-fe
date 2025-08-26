import React, { useState } from 'react'
import { TextField, IconButton, InputAdornment } from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

export function PasswordField({
  label = 'Password',
  name = 'password',
  value,
  onChange,
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  fullWidth = true,
  autoComplete = 'current-password',
  inputProps,
  ...rest
}) {
  const [show, setShow] = useState(false)
  return (
    <TextField
      label={label}
      name={name}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={(e) => onChange?.(e.target.value, e)}
      required={required}
      disabled={disabled}
      error={Boolean(error)}
      helperText={error || helperText || ' '}
      fullWidth={fullWidth}
      autoComplete={autoComplete}
      inputProps={inputProps}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={show ? 'Hide password' : 'Show password'}
              onClick={() => setShow(s => !s)}
              edge="end"
              size="small"
              tabIndex={-1}
            >
              {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...rest}
    />
  )
}
