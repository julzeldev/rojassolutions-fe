import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InputAdornment from '@mui/material/InputAdornment';
import type { ChangeEvent } from 'react';

interface FinancialInfoEditCardProps {
  values: {
    grossSalary: string;
    netSalary: string;
    bankAccount: string;
  };
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isReadOnly?: boolean;
}

export function FinancialInfoEditCard({ values, onChange, isReadOnly = false }: FinancialInfoEditCardProps) {
  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'success.main' }}>
            <AttachMoneyIcon />
          </Avatar>
        }
        title="Información Financiera"
        titleTypographyProps={{ variant: 'h6' }}
      />
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              name="grossSalary"
              label="Salario Bruto"
              value={values.grossSalary}
              onChange={onChange}
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">₡</InputAdornment>,
                readOnly: isReadOnly,
              }}
              fullWidth
              placeholder="0"
              disabled={isReadOnly}
            />
            <TextField
              name="netSalary"
              label="Salario Neto"
              value={values.netSalary}
              onChange={onChange}
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">₡</InputAdornment>,
                readOnly: isReadOnly,
              }}
              fullWidth
              placeholder="0"
              disabled={isReadOnly}
            />
          </Stack>

          <TextField
            name="bankAccount"
            label="Número de Cuenta Bancaria"
            value={values.bankAccount}
            onChange={onChange}
            fullWidth
            placeholder="CR12345678901234567890"
            inputProps={{ readOnly: isReadOnly }}
            disabled={isReadOnly}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
