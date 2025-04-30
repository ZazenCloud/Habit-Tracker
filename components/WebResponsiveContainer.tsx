import React, { ReactNode } from 'react';
import { View, Platform, StyleSheet } from 'react-native';

interface WebResponsiveContainerProps {
  children: ReactNode;
}

/**
 * A component that applies responsive container styles only for web platforms
 * On mobile platforms, it renders children directly without modifications
 */
const WebResponsiveContainer: React.FC<WebResponsiveContainerProps> = ({ children }) => {
  // On non-web platforms, just render children without any container
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }
  
  // On web, apply the responsive container styles
  return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // We're not defining web-specific styles here as they're handled by CSS
  },
});

export default WebResponsiveContainer; 