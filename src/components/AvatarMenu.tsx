// src/components/AvatarMenu.tsx
import React, { useState } from 'react';
import type { MouseEvent } from 'react';
import { Avatar, IconButton, Menu, MenuItem, ListItemIcon, Typography } from '@mui/material';
import { lightBlue } from '@mui/material/colors';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * AvatarMenu:
 * Renders a user avatar button that opens a menu for Profile and Logout.
 */
const AvatarMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const initials = user?.firstName
    ? user.firstName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : undefined;

  return (
    <>
      <IconButton onClick={handleOpen} size="small" sx={{ ml: 2 }}>
        <Avatar sx={{ bgcolor: lightBlue['500'] }}>{initials || <AccountCircleIcon />}</Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Profile</Typography>
        </MenuItem>

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Logout</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default AvatarMenu;
