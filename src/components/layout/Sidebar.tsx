import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../config/constants';

interface SidebarProps {
  items: Array<{
    icon: string;
    label: string;
    route: string;
  }>;
  activeRoute: string;
  onNavigate: (route: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, activeRoute, onNavigate }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="shield-account"
          size={40}
          color={Colors.primary}
        />
        <Text style={styles.title}>Manus Siscad</Text>
        <Text style={styles.subtitle}>AAFC</Text>
      </View>

      <ScrollView style={styles.menuContainer}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={[
              styles.menuItem,
              activeRoute === item.route && styles.menuItemActive,
            ]}
            onPress={() => onNavigate(item.route)}
          >
            <MaterialCommunityIcons
              name={item.icon as any}
              size={24}
              color={activeRoute === item.route ? Colors.primary : Colors.textSecondary}
            />
            <Text
              style={[
                styles.menuLabel,
                activeRoute === item.route && styles.menuLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    width: 280,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: Colors.surface,
  },
  menuLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 12,
  },
  menuLabelActive: {
    color: Colors.primary,
    fontWeight: '500',
  },
});
