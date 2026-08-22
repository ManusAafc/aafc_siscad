import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../config/constants';

interface BadgeProps {
  value: number | string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
}

export const Badge: React.FC<BadgeProps> = ({ value, variant = 'primary', size = 'medium' }) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return Colors.success;
      case 'warning':
        return Colors.warning;
      case 'error':
        return Colors.error;
      case 'info':
        return Colors.info;
      default:
        return Colors.primary;
    }
  };

  const getBadgeSize = () => {
    switch (size) {
      case 'small':
        return { minWidth: 20, height: 20, paddingHorizontal: 6 };
      case 'large':
        return { minWidth: 32, height: 32, paddingHorizontal: 10 };
      default:
        return { minWidth: 24, height: 24, paddingHorizontal: 8 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 10;
      case 'large':
        return 14;
      default:
        return 12;
    }
  };

  return (
    <View style={[styles.badge, getBadgeSize(), { backgroundColor: getBackgroundColor() }]}>
      <Text style={[styles.text, { fontSize: getTextSize() }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.white,
    fontWeight: '600',
  },
});
