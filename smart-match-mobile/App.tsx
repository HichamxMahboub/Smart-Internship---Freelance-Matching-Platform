import React, { useEffect } from 'react';
import { Alert, Platform, StatusBar } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/auth/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { LoadingView } from './src/components/LoadingView';
import { fontAssets, applyBrandFont } from './src/theme/fonts';
import { colors } from './src/theme/colors';

export default function App() {
  const [fontsLoaded] = useFonts(fontAssets);
  if (fontsLoaded) applyBrandFont();

  useEffect(() => {
    async function requestNotificationPermission() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted' && Platform.OS !== 'web') {
        Alert.alert('Notifications disabled', 'You can enable notifications later in system settings.');
      }
    }
    requestNotificationPermission();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {fontsLoaded ? (
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      ) : (
        <LoadingView label="Loading Interlance…" />
      )}
    </SafeAreaProvider>
  );
}
