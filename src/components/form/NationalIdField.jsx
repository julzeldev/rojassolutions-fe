import React, { useCallback } from 'react'
import { TextField } from '@mui/material'

// Costa Rican Cédula format: 0-1234-5678 (1 digit)-(4 digits)-(4 digits)
export function NationalIdField({
  label = 'Cédula',
  name = 'nationalId',
  value,
  onChange,
  required = false,
  disabled = false,
  error = false,
  helperText = 'Format: 0-1234-5678',
  fullWidth = true,
  ...rest
}) {
  const format = useCallback((raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 9)
    if (digits.length <= 1) return digits
    if (digits.length <= 5) return `${digits[0]}-${digits.slice(1)}`
    return `${digits[0]}-${digits.slice(1, 5)}-${digits.slice(5)}`
  }, [])

  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 9)
    const formatted = format(digits)
    onChange?.(digits, e, { formatted })
  }

  const digits = value?.replace(/\D/g, '') || ''
  const display = format(digits)
  const validationError = error || (required && digits.length !== 9 ? 'Cédula must be 9 digits' : '')

  return (
    <TextField
      label={label}
      name={name}
      value={display}
      onChange={handleChange}
      required={required}
      disabled={disabled}
      error={Boolean(validationError)}
      helperText={validationError || helperText || ' '}
      fullWidth={fullWidth}
      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
      {...rest}
    />
  )
}
