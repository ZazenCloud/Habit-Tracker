import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import LoadingScreen from './components/LoadingScreen';

// User persistence key - must match the one in AuthContext
const USER_PERSISTENCE_KEY = 'auth_user';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasPersistedUser, setHasPersistedUser] = useState(false);

  useEffect(() => {
    const checkForPersistedUser = async () => {
      try {
        if (Platform.OS !== 'web') {
          const userData = await AsyncStorage.getItem(USER_PERSISTENCE_KEY);
          if (userData) {
            // User data exists in storage
            setHasPersistedUser(true);
          }
        }
      } catch (error) {
        console.error('Error checking for persisted user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkForPersistedUser();
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Starting app..." />;
  }

  // If we have a persisted user, go straight to the app
  // Otherwise, go to the login screen
  return hasPersistedUser ? 
    <Redirect href={"/(tabs)" as any} /> : 
    <Redirect href={"auth/login" as any} />;
} 