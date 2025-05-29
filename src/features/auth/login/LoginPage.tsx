import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function LoginPage() {
  const { login, loading, error, isAuthenticated } = useAuth();
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!nationalId.trim() || !password.trim()) {
      setFormError('Por favor ingrese su cédula y contraseña.');
      return;
    }
    const ok = await login(nationalId, password);
    if (!ok) {
      setFormError('Cédula o contraseña incorrecta.');
    }
  };

  return (
    <Box
      component={Paper}
      elevation={3}
      sx={{
        maxWidth: 380,
        mx: 'auto',
        my: 10,
        p: 4,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Typography
        variant="h4"
        component="h2"
        sx={{
          mb: 3,
          color: theme.palette.primary.main,
          fontFamily: 'Montserrat, Inter, sans-serif',
          fontWeight: 700,
        }}
      >
        Iniciar sesión
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <TextField
          label="Cédula"
          value={nationalId}
          onChange={e => setNationalId(e.target.value)}
          placeholder="Ej: 1-1234-0562"
          autoComplete="username"
          disabled={loading}
          fullWidth
          variant="outlined"
          slotProps={{ inputLabel: { style: { color: theme.palette.text.secondary } } }}
        />
        <TextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Ingrese su contraseña"
          autoComplete="current-password"
          disabled={loading}
          fullWidth
          variant="outlined"
          slotProps={{ inputLabel: { style: { color: theme.palette.text.secondary } } }}
        />
        {(formError || error) && (
          <Typography color={theme.palette.error.main} sx={{ fontWeight: 500, mt: 0.5, fontSize: 15 }}>
            {formError || error}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            mt: 1,
            fontWeight: 700,
            fontSize: 16,
            borderRadius: 2,
            py: 1.2,
            textTransform: 'none',
            boxShadow: theme.shadows[2],
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Ingresar'}
        </Button>
      </Box>
    </Box>
  );
}
