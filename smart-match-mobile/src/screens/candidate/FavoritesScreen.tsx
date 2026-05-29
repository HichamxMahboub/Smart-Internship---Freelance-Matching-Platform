import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AppButton } from '../../components/AppButton';
import { EmptyState } from '../../components/EmptyState';
import { OfferCard } from '../../components/OfferCard';
import { favoriteService } from '../../services/favoriteService';
import { Favorite } from '../../types';
import { colors } from '../../theme/colors';

export function FavoritesScreen() { const navigation = useNavigation<any>(); const [items, setItems] = useState<Favorite[]>([]); const [refreshing, setRefreshing] = useState(false); const load = async () => { setRefreshing(true); try { setItems(await favoriteService.list()); } finally { setRefreshing(false); } }; const remove = async (offerId: string) => { try { await favoriteService.remove(offerId); load(); } catch { Alert.alert('Error', 'Could not remove favorite.'); } }; useFocusEffect(useCallback(() => { load(); }, [])); return <FlatList style={styles.container} contentContainerStyle={styles.list} data={items} keyExtractor={(item) => item.id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />} ListEmptyComponent={<EmptyState title="No favorites" />} renderItem={({ item }) => <View style={styles.item}>{item.offer ? <OfferCard offer={item.offer} onPress={() => navigation.navigate('OfferDetails', { offerId: item.offerId, offer: item.offer })} /> : null}<AppButton title="Remove" variant="secondary" onPress={() => remove(item.offerId)} /></View>} />; }
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background }, list: { padding: 16, gap: 12 }, item: { gap: 8 } });
