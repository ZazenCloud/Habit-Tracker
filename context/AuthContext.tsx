import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
  indexedDBLocalPersistence
} from 'firebase/auth';
import { auth } from '../app/config/firebase';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define user persistence key for native platforms
const USER_PERSISTENCE_KEY = 'auth_user';

// Simplified user type for persistence
interface PersistedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [persistedUser, setPersistedUser] = useState<PersistedUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load persisted user on app start (for native platforms)
  useEffect(() => {
    const loadPersistedUser = async () => {
      try {
        // Only needed for non-web platforms
        if (Platform.OS !== 'web') {
          const userData = await AsyncStorage.getItem(USER_PERSISTENCE_KEY);
          if (userData) {
            const parsedUser = JSON.parse(userData) as PersistedUser;
            setPersistedUser(parsedUser);
            console.log("Loaded persisted user data:", parsedUser.uid);
            
            // Only use cached data for initial loading state if Firebase hasn't loaded yet
            if (!user && loading) {
              // Keep loading as true since we're still waiting for Firebase
              // but we can use this data to pre-render UI elements that need
              // user information
            }
          }
        }
      } catch (error) {
        console.error("Error loading persisted user:", error);
      }
    };

    loadPersistedUser();
  }, []);

  // Setup Firebase auth state listener
  useEffect(() => {
    console.log("Setting up Firebase auth state listener");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser?.uid);
      
      try {
        if (Platform.OS !== 'web') {
          if (firebaseUser) {
            // Persist user data in AsyncStorage for native platforms
            const userData: PersistedUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL
            };
            
            await AsyncStorage.setItem(USER_PERSISTENCE_KEY, JSON.stringify(userData));
            console.log("Persisted user data to AsyncStorage");
          } else {
            // Clear persisted user data on logout
            await AsyncStorage.removeItem(USER_PERSISTENCE_KEY);
            console.log("Cleared persisted user data from AsyncStorage");
          }
        }
      } catch (error) {
        console.error("Error persisting user data:", error);
      }

      setUser(firebaseUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Set appropriate persistence based on platform
  useEffect(() => {
    const setupPersistence = async () => {
      try {
        if (Platform.OS === 'web') {
          // For web, use browserLocalPersistence (localStorage)
          await setPersistence(auth, browserLocalPersistence);
          console.log("Set browser persistence for web");
        }
        // Mobile platforms use our AsyncStorage implementation
      } catch (error) {
        console.error("Error setting auth persistence:", error);
      }
    };

    setupPersistence();
  }, []);

  // Sign up new users
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name and wait for it to complete
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
        
        // Force a user refresh to make sure we have the latest data
        const updatedUser = auth.currentUser;
        if (updatedUser) {
          setUser(updatedUser);
        }
      }
    } catch (error) {
      console.error("Sign up error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during sign up');
      }
      throw error;
    }
  };

  // Login existing users
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during login');
      }
      throw error;
    }
  };

  // Logout users
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      
      // Clear persisted user data on native platforms
      if (Platform.OS !== 'web') {
        await AsyncStorage.removeItem(USER_PERSISTENCE_KEY);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during logout');
      }
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signUp,
    login,
    logout,
    error,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 