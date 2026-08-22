import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../config/constants';
import { Header } from './Header';

interface PageContainerProps {
  children: React.ReactNode;
  header?: {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    rightAction?: {
      icon: string;
      onPress: () => void;
    };
  };
  scrollable?: boolean;
  style?: ViewStyle;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  header,
  scrollable = true,
  style,
}) => {
  const content = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, style]}>
        {header && (
          <Header
            title={header.title}
            subtitle={header.subtitle}
            onBack={header.onBack}
            rightAction={header.rightAction}
            showBack={!!header.onBack}
          />
        )}
        {content}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  content: {
    flex: 1,
  },
});
