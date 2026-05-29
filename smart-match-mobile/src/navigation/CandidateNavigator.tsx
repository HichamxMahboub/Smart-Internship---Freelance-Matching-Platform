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
import { Offer } from '../types';

export type CandidateStackParamList = { CandidateTabs: undefined; OfferDetails: { offerId: string; offer?: Offer }; AIRecommendations: undefined };
const Stack = createNativeStackNavigator<CandidateStackParamList>();
const Tab = createBottomTabNavigator();

function CandidateTabs() { return <Tab.Navigator screenOptions={{ headerShown: true }}><Tab.Screen name="Home" component={CandidateHomeScreen} /><Tab.Screen name="Offers" component={OfferListScreen} /><Tab.Screen name="Applications" component={ApplicationsScreen} /><Tab.Screen name="Favorites" component={FavoritesScreen} /><Tab.Screen name="Premium" component={PremiumScreen} /><Tab.Screen name="Profile" component={CandidateProfileScreen} /><Tab.Screen name="Notifications" component={NotificationsScreen} /></Tab.Navigator>; }
export function CandidateNavigator() { return <Stack.Navigator><Stack.Screen name="CandidateTabs" component={CandidateTabs} options={{ headerShown: false }} /><Stack.Screen name="OfferDetails" component={OfferDetailsScreen} options={{ title: 'Offer details' }} /><Stack.Screen name="AIRecommendations" component={AIRecommendationsScreen} options={{ title: 'AI recommendations' }} /></Stack.Navigator>; }
