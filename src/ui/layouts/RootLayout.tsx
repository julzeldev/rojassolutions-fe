import { useCallback, useMemo, useState, type MouseEvent } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../auth/useAuth';
import { navigationItems } from '../navigation/navConfig';
import { useThemeMode } from '../../theme/ThemeModeProvider';

const drawerWidth = 260;

export function RootLayout() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  const { mode, toggleMode } = useThemeMode();

  const navItems = useMemo(() => navigationItems, []);

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const handleNavigate = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const { path } = event.currentTarget.dataset;
      if (!path) return;
      navigate(path);
      setMobileOpen(false);
    },
    [navigate],
  );

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleToggleTheme = useCallback(() => {
    toggleMode();
  }, [toggleMode]);

  if (!isAuthenticated) {
    return <Outlet />;
  }

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ alignItems: 'flex-start', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="h6" component="div">
          Panel Administrativo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Rojas Solutions
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => {
          const ItemIcon = item.icon;
          const isSelected = item.path === '/'
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.path}
              data-path={item.path}
              onClick={handleNavigate}
              selected={isSelected}
              disabled={item.disabled}
            >
              <ListItemIcon>
                <ItemIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                secondary={item.disabled ? 'Próximamente' : undefined}
              />
            </ListItemButton>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ padding: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          onClick={handleLogout}
        >
          Cerrar sesión
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={1}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          {!isDesktop && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
              aria-label="abrir navegación"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Portal administrativo
          </Typography>
          <Tooltip title={mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
            <IconButton color="inherit" onClick={handleToggleTheme} aria-label="alternar modo de color">
              {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="secciones"
      >
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
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          padding: { xs: 2, sm: 4 },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
