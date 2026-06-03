import React, { useEffect } from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { CandidateNavigator } from './CandidateNavigator';
import { RecruiterNavigator } from './RecruiterNavigator';
import { OnboardingGate } from './OnboardingGate';
import { useAuth } from '../auth/AuthContext';
import { LoadingView } from '../components/LoadingView';
import { realtimeClient } from '../services/realtimeClient';
import { registerPushToken } from '../services/pushService';
import { colors } from '../theme/colors';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    primary: colors.primary,
    card: colors.white,
    text: colors.text,
    border: colors.border
  }
};

export function AppNavigator() {
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (!user) {
      realtimeClient.disconnect();
      return;
    }
    realtimeClient.connect();
    registerPushToken();
    return () => realtimeClient.disconnect();
  }, [user]);

  if (initializing) return <LoadingView label="Restoring your Interlance session..." />;
  return (
    <NavigationContainer theme={navigationTheme}>
      {!user ? (
        <AuthNavigator />
      ) : (
        <OnboardingGate user={user}>
          {user.role === 'RECRUITER' ? <RecruiterNavigator /> : <CandidateNavigator />}
        </OnboardingGate>
      )}
    </NavigationContainer>
  );
}
