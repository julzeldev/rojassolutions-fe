import React from 'react'
import { FormControl, FormControlLabel, FormHelperText, FormLabel, Radio, RadioGroup } from '@mui/material'

export function RadioGroupField({
  label,
  name,
  value,
  onChange,
  options = [], // array { value, label }
  row = false,
  required = false,
  error = false,
  helperText = '',
  disabled = false,
  ...rest
}) {
  return (
    <FormControl component="fieldset" error={Boolean(error)} required={required} disabled={disabled}>
      {label && <FormLabel component="legend">{label}</FormLabel>}
      <RadioGroup
        row={row}
        name={name}
        value={value}
        onChange={(e) => onChange?.(e.target.value, e)}
        {...rest}
      >
        {options.map(opt => (
          <FormControlLabel key={opt.value} value={opt.value} control={<Radio />} label={opt.label} />
        ))}
      </RadioGroup>
      <FormHelperText>{error || helperText || ' '}</FormHelperText>
    </FormControl>
  )
}
