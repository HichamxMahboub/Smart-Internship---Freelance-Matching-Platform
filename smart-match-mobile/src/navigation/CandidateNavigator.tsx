import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CandidateHomeScreen } from '../screens/candidate/CandidateHomeScreen';
import { OfferListScreen } from '../screens/candidate/OfferListScreen';
import { OfferDetailsScreen } from '../screens/candidate/OfferDetailsScreen';
import { CandidateProfileScreen } from '../screens/candidate/CandidateProfileScreen';
import { ApplicationsScreen } from '../screens/candidate/ApplicationsScreen';
import { FavoritesScreen } from '../screens/candidate/FavoritesScreen';
import { PremiumScreen } from '../screens/candidate/PremiumScreen';
import { AIRecommendationsScreen } from '../screens/candidate/AIRecommendationsScreen';
import { NotificationsScreen } from '../screens/candidate/NotificationsScreen';
import { ConversationsScreen } from '../screens/shared/ConversationsScreen';
import { ChatScreen } from '../screens/shared/ChatScreen';
import { TabBar } from '../components/TabBar';
import { Offer } from '../types';
import { colors } from '../theme/colors';

export type CandidateStackParamList = {
  CandidateTabs: undefined;
  OfferDetails: { offerId: string; offer?: Offer };
  AIRecommendations: undefined;
  Chat: { conversationId: string; displayName?: string; displayAvatarUrl?: string; offerTitle?: string };
  Favorites: undefined;
  Premium: undefined;
  Notifications: undefined;
};
const Stack = createNativeStackNavigator<CandidateStackParamList>();
const Tab = createBottomTabNavigator();

const stackHeader = {
  headerStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
  headerTintColor: colors.primary,
  headerTitleStyle: { fontWeight: '800' as const, color: colors.text, fontSize: 17 },
  headerBackTitle: '',
  contentStyle: { backgroundColor: colors.background }
};

function CandidateTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen name="Home" component={CandidateHomeScreen} />
      <Tab.Screen name="Offers" component={OfferListScreen} />
      <Tab.Screen name="Applications" component={ApplicationsScreen} />
      <Tab.Screen name="Messages" component={ConversationsScreen} />
      <Tab.Screen name="Profile" component={CandidateProfileScreen} />
    </Tab.Navigator>
  );
}

export function CandidateNavigator() {
  return (
    <Stack.Navigator screenOptions={stackHeader}>
      <Stack.Screen name="CandidateTabs" component={CandidateTabs} options={{ headerShown: false }} />
      <Stack.Screen name="OfferDetails" component={OfferDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AIRecommendations" component={AIRecommendationsScreen} options={{ title: 'AI Assistant' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: '' }} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Saved offers' }} />
      <Stack.Screen name="Premium" component={PremiumScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
}
