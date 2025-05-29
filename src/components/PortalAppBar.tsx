import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AvatarMenu from './AvatarMenu';
import logo from '../assets/logo.png';

interface PortalAppBarProps {
  onMenuClick: () => void;
}

const PortalAppBar: React.FC<PortalAppBarProps> = ({ onMenuClick }) => (
  <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
    <Toolbar>
      <IconButton
        color="inherit"
        edge="start"
        onClick={onMenuClick}
        sx={{ mr: 2, display: { sm: 'none' } }}
      >
        <MenuIcon />
      </IconButton>
      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
        <img
          src={logo}
          alt="Rojas Solutions Logo"
          style={{ height: 36, width: 36, marginRight: 12, objectFit: 'contain', borderRadius: 4 }}
        />
      </Box>
      <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
        Rojas Solutions | Portal
      </Typography>
      <AvatarMenu />
    </Toolbar>
  </AppBar>
);

export default PortalAppBar;
