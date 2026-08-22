import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../config/constants';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: string;
  style?: ViewStyle;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.selected, style]}
      onPress={onPress}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon as any}
          size={16}
          color={selected ? Colors.white : Colors.primary}
          style={styles.icon}
        />
      )}
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    marginRight: 8,
    marginBottom: 8,
  },
  selected: {
    backgroundColor: Colors.primary,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 14,
    color: Colors.primary,
  },
  selectedLabel: {
    color: Colors.white,
  },
});
