import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useSegments, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useCallback } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Platform } from 'react-native';
import React from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { HabitsProvider } from '../context/HabitsContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { GeminiProvider } from '../context/GeminiContext';
import LoadingScreen from './components/LoadingScreen';

// Import global CSS for web platform
if (Platform.OS === 'web') {
  // Need to use require for CSS imports on React Native Web
  try {
    require('../app/global.css');
    console.log('Successfully imported global.css');
  } catch (e) {
    console.error('Error importing global.css:', e);
  }
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Define a component to handle auth-protected routes
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Callback to check if the current route is protected
  const isProtectedRoute = useCallback(() => {
    // Check if the path is a protected route (tabs)
    return segments[0] === '(tabs)';
  }, [segments]);

  useEffect(() => {
    if (loading) {
      // Still loading auth state, don't redirect yet
      return;
    }

    const inAuthGroup = segments[0] === 'auth';
    
    // Routes that require authentication
    if (!user && isProtectedRoute()) {
      console.log("User not authenticated, redirecting to login");
      
      // Use setTimeout to avoid navigation conflicts
      setTimeout(() => {
        router.replace('auth/login' as any);
      }, 100);
    } 
    // Auth screens that should redirect to app if already logged in
    else if (user && inAuthGroup) {
      console.log("User authenticated, redirecting to tabs");
      
      // Use setTimeout to avoid navigation conflicts
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    }
  }, [user, loading, segments, isProtectedRoute, router]);

  // Show a loading indicator while auth state is being determined
  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <LoadingScreen message="Loading app resources..." />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <HabitsProvider>
          <GeminiProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <AuthGuard>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="auth" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </AuthGuard>
              <StatusBar style="auto" />
            </ThemeProvider>
          </GeminiProvider>
        </HabitsProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
