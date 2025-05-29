import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getMuiTheme } from './theme/muiTheme';
import { useMode } from './hooks/useMode';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

const Root: React.FC = () => {
  const { mode } = useMode();
  const theme = getMuiTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default Root;
