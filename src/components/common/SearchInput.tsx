import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../config/constants';

interface SearchInputProps extends TextInputProps {
  onSearch?: (text: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch, ...props }) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="magnify" size={24} color={Colors.textSecondary} />
      <TextInput
        style={styles.input}
        placeholderTextColor={Colors.textTertiary}
        returnKeyType="search"
        onChangeText={onSearch}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.textPrimary,
  },
});
