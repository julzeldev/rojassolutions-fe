import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';

/**
 * AuthLayout:
 * Wraps auth routes (login/signup) in a centered card layout.
 */
const AuthLayout: React.FC = () => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    minHeight="100vh"
    bgcolor={(theme) => theme.palette.background.default}
    p={2}
  >
    <Container maxWidth="sm">
      <Outlet />
    </Container>
  </Box>
);

export default AuthLayout;
