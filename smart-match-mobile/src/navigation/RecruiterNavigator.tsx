import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RecruiterHomeScreen } from '../screens/recruiter/RecruiterHomeScreen';
import { RecruiterProfileScreen } from '../screens/recruiter/RecruiterProfileScreen';
import { CompanyScreen } from '../screens/recruiter/CompanyScreen';
import { RecruiterOffersScreen } from '../screens/recruiter/RecruiterOffersScreen';
import { OfferFormScreen } from '../screens/recruiter/OfferFormScreen';
import { RecruiterApplicationsScreen } from '../screens/recruiter/RecruiterApplicationsScreen';
import { NotificationsScreen } from '../screens/recruiter/NotificationsScreen';
import { Offer } from '../types';

export type RecruiterStackParamList = { RecruiterTabs: undefined; OfferForm: { offer?: Offer } | undefined };
const Stack = createNativeStackNavigator<RecruiterStackParamList>();
const Tab = createBottomTabNavigator();
function RecruiterTabs() { return <Tab.Navigator><Tab.Screen name="Home" component={RecruiterHomeScreen} /><Tab.Screen name="Company" component={CompanyScreen} /><Tab.Screen name="Offers" component={RecruiterOffersScreen} /><Tab.Screen name="Applications" component={RecruiterApplicationsScreen} /><Tab.Screen name="Profile" component={RecruiterProfileScreen} /><Tab.Screen name="Notifications" component={NotificationsScreen} /></Tab.Navigator>; }
export function RecruiterNavigator() { return <Stack.Navigator><Stack.Screen name="RecruiterTabs" component={RecruiterTabs} options={{ headerShown: false }} /><Stack.Screen name="OfferForm" component={OfferFormScreen} options={{ title: 'Offer form' }} /></Stack.Navigator>; }
