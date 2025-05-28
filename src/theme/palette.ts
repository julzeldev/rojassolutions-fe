// src/theme/palette.ts
// Central color palette for light and dark mode

export const lightPalette = {
  primary: '#1976D2', // Blue (sober, modern)
  secondary: '#3F51B5', // Indigo
  accent: '#7C4DFF', // Muted Purple (unchanged)
  background: '#F5FAFF', // Soft Off-White (unchanged)
  surface: '#FFFFFF', // Pure White (unchanged)
  textPrimary: '#222222', // Dark Charcoal (unchanged)
  textSecondary: '#6B7280', // Muted Slate Gray
  error: '#D32F2F', // Sober Red
  success: '#43A047', // Sober Green
  warning: '#FBC02D', // Sober Yellow
};

export const darkPalette = {
  primary: '#2196F3', // Blue (sober, modern)
  secondary: '#5C6BC0', // Indigo
  accent: '#9575CD', // Muted Purple (unchanged)
  background: '#181A20', // Deep Charcoal (slightly lighter)
  surface: '#23263A', // Gunmetal (slightly lighter)
  textPrimary: '#E0E0E0', // Light Gray (unchanged)
  textSecondary: '#A0A0B2', // Gray Blue (unchanged)
  error: '#EF5350', // Sober Red
  success: '#66BB6A', // Sober Green
  warning: '#FFD54F', // Sober Yellow
};

export type ThemePalette = typeof lightPalette;
