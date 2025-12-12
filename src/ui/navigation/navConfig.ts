import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { SvgIconTypeMap } from '@mui/material/SvgIcon';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export interface NavigationItem {
  label: string;
  path: string;
  icon: OverridableComponent<SvgIconTypeMap<unknown, 'svg'>>;
  disabled?: boolean;
}

export const navigationItems: NavigationItem[] = [
  { label: 'Inicio', path: '/', icon: HomeOutlinedIcon },
  { label: 'Empleados', path: '/empleados', icon: PeopleAltOutlinedIcon },
  { label: 'Sucursales', path: '/sucursales', icon: BusinessOutlinedIcon },
  { label: 'Acerca de', path: '/about', icon: InfoOutlinedIcon },
  { label: 'Inventario', path: '/inventario', icon: Inventory2OutlinedIcon, disabled: true },
  { label: 'Calendario', path: '/calendario', icon: CalendarMonthOutlinedIcon },
];
