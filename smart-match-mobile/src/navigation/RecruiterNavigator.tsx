import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RecruiterHomeScreen } from '../screens/recruiter/RecruiterHomeScreen';
import { RecruiterProfileScreen } from '../screens/recruiter/RecruiterProfileScreen';
import { CompanyScreen } from '../screens/recruiter/CompanyScreen';
import { RecruiterOffersScreen } from '../screens/recruiter/RecruiterOffersScreen';
import { OfferFormScreen } from '../screens/recruiter/OfferFormScreen';
import { RecruiterApplicationsScreen } from '../screens/recruiter/RecruiterApplicationsScreen';
import { CandidateDetailScreen } from '../screens/recruiter/CandidateDetailScreen';
import { OfferCandidatesScreen } from '../screens/recruiter/OfferCandidatesScreen';
import { RecruiterAssistantScreen } from '../screens/recruiter/RecruiterAssistantScreen';
import { PayCandidateScreen } from '../screens/recruiter/PayCandidateScreen';
import { NotificationsScreen } from '../screens/recruiter/NotificationsScreen';
import { ConversationsScreen } from '../screens/shared/ConversationsScreen';
import { ChatScreen } from '../screens/shared/ChatScreen';
import { TabBar } from '../components/TabBar';
import { Application, Offer } from '../types';
import { CandidateRecommendation } from '../services/aiService';
import { colors } from '../theme/colors';

export type RecruiterStackParamList = {
  RecruiterTabs: undefined;
  OfferForm: { offer?: Offer } | undefined;
  Chat: { conversationId: string; displayName?: string; displayAvatarUrl?: string; offerTitle?: string };
  Company: undefined;
  Notifications: undefined;
  CandidateDetail: { application: Application; recommendation?: CandidateRecommendation; offer?: Offer };
  OfferCandidates: { offerId: string; offer?: Offer };
  RecruiterAssistant: undefined;
  PayCandidate: { application: Application; offer?: Offer; candidateName?: string };
};
const Stack = createNativeStackNavigator<RecruiterStackParamList>();
const Tab = createBottomTabNavigator();

const stackHeader = {
  headerStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
  headerTintColor: colors.primary,
  headerTitleStyle: { fontWeight: '800' as const, color: colors.text, fontSize: 17 },
  headerBackTitle: '',
  contentStyle: { backgroundColor: colors.background }
};

function RecruiterTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen name="Home" component={RecruiterHomeScreen} />
      <Tab.Screen name="Offers" component={RecruiterOffersScreen} />
      <Tab.Screen name="Applications" component={RecruiterApplicationsScreen} />
      <Tab.Screen name="Messages" component={ConversationsScreen} />
      <Tab.Screen name="Profile" component={RecruiterProfileScreen} />
    </Tab.Navigator>
  );
}

export function RecruiterNavigator() {
  return (
    <Stack.Navigator screenOptions={stackHeader}>
      <Stack.Screen name="RecruiterTabs" component={RecruiterTabs} options={{ headerShown: false }} />
      <Stack.Screen name="OfferForm" component={OfferFormScreen} options={{ title: 'Opportunity' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: '' }} />
      <Stack.Screen name="Company" component={CompanyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="CandidateDetail" component={CandidateDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OfferCandidates" component={OfferCandidatesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RecruiterAssistant" component={RecruiterAssistantScreen} options={{ title: 'AI Assistant' }} />
      <Stack.Screen name="PayCandidate" component={PayCandidateScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
