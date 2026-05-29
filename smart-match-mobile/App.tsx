import React, { useEffect } from 'react';
import { Alert, Platform, StatusBar } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from './src/auth/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    async function requestNotificationPermission() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted' && Platform.OS !== 'web') {
        Alert.alert('Notifications disabled', 'You can enable notifications later in system settings.');
      }
      // TODO: connect Expo notification token with Firebase Cloud Messaging backend registration if needed.
    }
    requestNotificationPermission();
  }, []);

  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </AuthProvider>
  );
}
