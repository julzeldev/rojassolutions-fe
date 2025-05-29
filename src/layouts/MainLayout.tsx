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
import PortalAppBar from '../components/PortalAppBar';

const drawerWidth = 240;

/**
 * MainLayout:
 * AppBar + responsive Drawer/sidebar + content area via <Outlet />
 */
const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const navItems = [
    { text: 'Dashboard', icon: <HomeIcon />, path: '/' },
    // Add more modules here as needed
  ];

  const drawerContent = (
    <Box sx={{ width: drawerWidth }} role="presentation" onClick={handleDrawerToggle}>
      <Toolbar />
      <Divider />
      <List>
        {navItems.map(({ text, icon, path }) => (
          <ListItemButton key={text} component={Link} to={path}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={text} />
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
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
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
          p: 3,
          mt: 8,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
export default MainLayout;