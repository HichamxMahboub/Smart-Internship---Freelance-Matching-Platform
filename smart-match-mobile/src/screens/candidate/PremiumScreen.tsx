import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AppButton } from '../../components/AppButton';
import { subscriptionService } from '../../services/subscriptionService';
import { Subscription } from '../../types';
import { colors } from '../../theme/colors';

export function PremiumScreen() { const navigation = useNavigation<any>(); const [subscription, setSubscription] = useState<Subscription | null>(null); const load = async () => { try { setSubscription(await subscriptionService.current()); } catch {} }; useFocusEffect(useCallback(() => { load(); }, [])); const upgrade = async () => { try { await subscriptionService.upgrade(); Alert.alert('Premium active', 'Your simulated payment was accepted.'); load(); } catch (e: any) { Alert.alert('Upgrade failed', e?.response?.data?.message ?? 'Could not upgrade.'); } }; return <View style={styles.container}><Text style={styles.title}>Premium</Text><Text style={styles.card}>Current plan: {subscription?.plan ?? 'FREE'}\nExpires: {subscription?.expirationDate ?? 'N/A'}</Text><Text style={styles.benefits}>Premium unlocks AI CV analysis, offer recommendations and profile optimization.</Text><AppButton title="Upgrade with simulated payment" onPress={upgrade} /><AppButton title="Open AI recommendations" variant="secondary" onPress={() => navigation.navigate('AIRecommendations')} /></View>; }
const styles = StyleSheet.create({ container: { flex: 1, padding: 16, gap: 14, backgroundColor: colors.background }, title: { fontSize: 26, fontWeight: '900', color: colors.text }, card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, color: colors.text, lineHeight: 24 }, benefits: { color: colors.muted, lineHeight: 22 } });
