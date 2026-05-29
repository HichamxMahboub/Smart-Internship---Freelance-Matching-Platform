import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { CandidateNavigator } from './CandidateNavigator';
import { RecruiterNavigator } from './RecruiterNavigator';
import { useAuth } from '../auth/AuthContext';
import { LoadingView } from '../components/LoadingView';

export function AppNavigator() {
  const { user, initializing } = useAuth();
  if (initializing) return <LoadingView label="Restoring session..." />;
  return <NavigationContainer>{!user ? <AuthNavigator /> : user.role === 'RECRUITER' ? <RecruiterNavigator /> : <CandidateNavigator />}</NavigationContainer>;
}
