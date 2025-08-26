import React from 'react'
import { FormControlLabel, Switch, FormHelperText } from '@mui/material'

export function SwitchField({
  label,
  name,
  checked,
  onChange,
  disabled = false,
  helperText = '',
  error = false,
  size = 'medium',
  ...rest
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <FormControlLabel
        control={(
          <Switch
            name={name}
            checked={Boolean(checked)}
            onChange={(e, v) => onChange?.(v, e)}
            disabled={disabled}
            size={size}
            {...rest}
          />
        )}
        label={label}
      />
      <FormHelperText error={Boolean(error)}>{error || helperText || ' '}</FormHelperText>
    </div>
  )
}
