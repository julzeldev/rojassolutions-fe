import React from 'react'
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material'

export function SelectField({
  label,
  name,
  value,
  onChange,
  options = [], // array of { value, label }
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  fullWidth = true,
  ...rest
}) {
  const labelId = `${name}-label`
  return (
    <FormControl fullWidth={fullWidth} required={required} disabled={disabled} error={Boolean(error)}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        id={name}
        name={name}
        label={label}
        value={value}
        onChange={(e) => onChange?.(e.target.value, e)}
        {...rest}
      >
        {options.map(opt => (
          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
        ))}
      </Select>
      <FormHelperText>{error || helperText || ' '}</FormHelperText>
    </FormControl>
  )
}
