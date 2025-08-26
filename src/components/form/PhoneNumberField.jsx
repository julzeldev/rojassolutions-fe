import React, { useCallback } from 'react'
import { TextField } from '@mui/material'

// Costa Rica phone numbers: 8 digits. Display format: ####-####
export function PhoneNumberField({
  label = 'Phone Number',
  name = 'phone',
  value,
  onChange,
  required = false,
  disabled = false,
  error = false,
  helperText = 'Format: 8888-8888',
  fullWidth = true,
  ...rest
}) {
  const format = useCallback((raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8)
    if (digits.length <= 4) return digits
    return `${digits.slice(0, 4)}-${digits.slice(4)}`
  }, [])

  const handleChange = (e) => {
    const raw = e.target.value
    const digits = raw.replace(/\D/g, '').slice(0, 8)
    const formatted = format(digits)
    onChange?.(digits, e, { formatted })
  }

  const digits = value?.replace(/\D/g, '') || ''
  const display = format(digits)
  const validationError = error || (required && digits.length !== 8 ? 'Phone must be 8 digits' : '')

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
