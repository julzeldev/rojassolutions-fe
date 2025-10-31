import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import type { ChangeEvent } from 'react';

interface FinancialInfoSectionProps {
  values: {
    grossSalary: string;
    netSalary: string;
    bankAccount: string;
  };
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function FinancialInfoSection({ values, onChange }: FinancialInfoSectionProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" fontWeight={600} color="primary">
        Información Financiera
      </Typography>
      <Divider />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          name="grossSalary"
          label="Salario Bruto"
          value={values.grossSalary}
          onChange={onChange}
          type="number"
          InputProps={{
            startAdornment: <InputAdornment position="start">₡</InputAdornment>,
          }}
          fullWidth
          placeholder="0"
        />
        <TextField
          name="netSalary"
          label="Salario Neto"
          value={values.netSalary}
          onChange={onChange}
          type="number"
          InputProps={{
            startAdornment: <InputAdornment position="start">₡</InputAdornment>,
          }}
          fullWidth
          placeholder="0"
        />
      </Stack>

      <TextField
        name="bankAccount"
        label="Número de Cuenta Bancaria"
        value={values.bankAccount}
        onChange={onChange}
        fullWidth
        placeholder="CR12345678901234567890"
      />
    </Stack>
  );
}
