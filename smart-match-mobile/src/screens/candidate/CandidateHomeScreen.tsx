import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../auth/AuthContext';
import { OfferCard } from '../../components/OfferCard';
import { EmptyState } from '../../components/EmptyState';
import { Offer, Subscription } from '../../types';
import { offerService } from '../../services/offerService';
import { applicationService } from '../../services/applicationService';
import { favoriteService } from '../../services/favoriteService';
import { subscriptionService } from '../../services/subscriptionService';
import { colors } from '../../theme/colors';

export function CandidateHomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [applicationCount, setApplicationCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const load = async () => { try { setRefreshing(true); const [offerData, apps, favorites, sub] = await Promise.all([offerService.list({ page: 0, size: 5 }), applicationService.myApplications(), favoriteService.list(), subscriptionService.current()]); setOffers(offerData.offers); setApplicationCount(apps.length); setFavoriteCount(favorites.length); setSubscription(sub); } catch { Alert.alert('Error', 'Could not load home data.'); } finally { setRefreshing(false); } };
  useFocusEffect(useCallback(() => { load(); }, []));
  return <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}><Text style={styles.title}>Welcome, {user?.fullName}</Text><View style={styles.stats}><Text style={styles.stat}>Applications\n{applicationCount}</Text><Text style={styles.stat}>Favorites\n{favoriteCount}</Text><Text style={styles.stat}>Plan\n{subscription?.plan ?? user?.plan}</Text></View><Text style={styles.section}>Recent offers</Text>{offers.length ? offers.map((offer) => <OfferCard key={offer.id} offer={offer} onPress={() => navigation.navigate('OfferDetails', { offerId: offer.id, offer })} />) : <EmptyState title="No offers yet" />}</ScrollView>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 16, backgroundColor: colors.background }, title: { fontSize: 26, fontWeight: '900', color: colors.text, marginBottom: 14 }, stats: { flexDirection: 'row', gap: 10, marginBottom: 18 }, stat: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, textAlign: 'center', fontWeight: '700', color: colors.primary, overflow: 'hidden' }, section: { fontSize: 18, fontWeight: '800', marginBottom: 10, color: colors.text } });
