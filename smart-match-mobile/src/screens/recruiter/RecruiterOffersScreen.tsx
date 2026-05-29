import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AppButton } from '../../components/AppButton';
import { EmptyState } from '../../components/EmptyState';
import { OfferCard } from '../../components/OfferCard';
import { StatusBadge } from '../../components/StatusBadge';
import { offerService } from '../../services/offerService';
import { Offer } from '../../types';
import { colors } from '../../theme/colors';

export function RecruiterOffersScreen() { const navigation = useNavigation<any>(); const [offers, setOffers] = useState<Offer[]>([]); const [refreshing, setRefreshing] = useState(false); const load = async () => { setRefreshing(true); try { const result = await offerService.list({ status: 'DRAFT' as any, size: 50 }); setOffers(result.offers); } finally { setRefreshing(false); } }; useFocusEffect(useCallback(() => { load(); }, [])); const publish = async (id: string) => { try { await offerService.publish(id); load(); } catch (e: any) { Alert.alert('Could not publish', e?.response?.data?.message ?? 'Company may not be approved.'); } }; const archive = async (id: string) => { await offerService.archive(id); load(); }; return <View style={styles.container}><AppButton title="Create offer" onPress={() => navigation.navigate('OfferForm')} /><FlatList data={offers} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />} ListEmptyComponent={<EmptyState title="No offers" />} renderItem={({ item }) => <View style={styles.item}><OfferCard offer={item} onPress={() => navigation.navigate('OfferForm', { offer: item })} /><StatusBadge status={item.status} /><View style={styles.actions}><AppButton title="Publish" onPress={() => publish(item.id)} style={styles.action} /><AppButton title="Archive" variant="secondary" onPress={() => archive(item.id)} style={styles.action} /></View></View>} /></View>; }
const styles = StyleSheet.create({ container: { flex: 1, padding: 16, backgroundColor: colors.background }, list: { gap: 12, paddingTop: 12 }, item: { gap: 8 }, actions: { flexDirection: 'row', gap: 8 }, action: { flex: 1 } });
