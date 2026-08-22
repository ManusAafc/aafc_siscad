export const Colors = {
  primary: '#1976D2',
  primaryDark: '#1565C0',
  primaryLight: '#42A5F5',

  secondary: '#FF9800',
  secondaryDark: '#F57C00',
  secondaryLight: '#FFB74D',

  background: '#F5F5F5',
  surface: '#E0E0E0',
  white: '#FFFFFF',
  black: '#000000',

  textPrimary: '#212121',
  textSecondary: '#757575',
  textTertiary: '#BDBDBD',
  textInverse: '#FFFFFF',

  border: '#E0E0E0',
  divider: '#EEEEEE',

  success: '#4CAF50',
  successLight: '#81C784',
  warning: '#FF9800',
  warningLight: '#FFB74D',
  error: '#F44336',
  errorLight: '#E57373',
  info: '#2196F3',
  infoLight: '#64B5F6',

  disabled: '#BDBDBD',
  disabledBackground: '#F5F5F5',

  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
} as const;

export type ColorKeys = keyof typeof Colors;
