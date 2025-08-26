import React from 'react'
import { TextField } from '@mui/material'

export function FormTextField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  fullWidth = true,
  inputProps,
  autoComplete,
  ...rest
}) {
  return (
    <TextField
      label={label}
      name={name}
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value, e)}
      required={required}
      disabled={disabled}
      error={Boolean(error)}
      helperText={error || helperText || ' '}
      fullWidth={fullWidth}
      size="medium"
      autoComplete={autoComplete}
      inputProps={inputProps}
      {...rest}
    />
  )
}
