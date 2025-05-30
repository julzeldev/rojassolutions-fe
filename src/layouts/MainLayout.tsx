import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Toolbar,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import RoomIcon from '@mui/icons-material/Room';
import PortalAppBar from '../components/PortalAppBar';
import IconButton from '@mui/material/IconButton';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const drawerWidth = 240;
const collapsedDrawerWidth = 56;

/**
 * MainLayout:
 * AppBar + responsive Drawer/sidebar + content area via <Outlet />
 */
const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleDrawerCollapse = () => setDrawerCollapsed((prev) => !prev);

  const navItems = [
    { text: 'Dashboard', icon: <HomeIcon />, path: '/' },
    { text: 'Sucursales', icon: <RoomIcon />, path: '/sucursales' },
    // Add more modules here as needed
  ];

  const drawerContent = (
    <Box sx={{ width: drawerCollapsed ? collapsedDrawerWidth : drawerWidth }} role="presentation">
      <Toolbar /> {/* Spacer for AppBar height */}
      <Toolbar sx={{ justifyContent: drawerCollapsed ? 'center' : 'flex-start', px: 1 }}>
        <IconButton onClick={handleDrawerCollapse} size="small" sx={{ right: drawerCollapsed ? 0 : 12 }}>
          {drawerCollapsed ? <MenuOpenIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map(({ text, icon, path }) => (
          <ListItemButton
            key={text}
            component={Link}
            to={path}
            sx={{
              justifyContent: drawerCollapsed ? 'center' : 'flex-start',
              px: drawerCollapsed ? 1 : 2,
            }}
          >
            <ListItemIcon
              sx={{ minWidth: 0, mr: drawerCollapsed ? 0 : 2, justifyContent: 'center' }}
            >
              {icon}
            </ListItemIcon>
            {!drawerCollapsed && <ListItemText primary={text} />}
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Top AppBar */}
      <PortalAppBar onMenuClick={handleDrawerToggle} />

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerCollapsed ? collapsedDrawerWidth : drawerWidth,
            overflowX: 'hidden',
            transition: (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          mt: 8,
          ml: { sm: `${drawerCollapsed ? collapsedDrawerWidth : drawerWidth}px` }, // Offset for permanent drawer on desktop
          transition: (theme) => theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
export default MainLayout;