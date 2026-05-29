import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { EmptyState } from '../../components/EmptyState';
import { OfferCard } from '../../components/OfferCard';
import { offerService } from '../../services/offerService';
import { Offer } from '../../types';
import { colors } from '../../theme/colors';

export function OfferListScreen() {
  const navigation = useNavigation<any>();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [keyword, setKeyword] = useState(''); const [type, setType] = useState(''); const [location, setLocation] = useState(''); const [skill, setSkill] = useState('');
  const [offline, setOffline] = useState(false); const [refreshing, setRefreshing] = useState(false);
  const load = async () => { try { setRefreshing(true); const result = await offerService.list({ keyword, type: type as any, location, skill, page: 0, size: 30 }); setOffers(result.offers); setOffline(result.offline); } catch { Alert.alert('Error', 'Could not load offers.'); } finally { setRefreshing(false); } };
  useFocusEffect(useCallback(() => { load(); }, []));
  return <View style={styles.container}><View style={styles.filters}><AppInput label="Search" value={keyword} onChangeText={setKeyword} /><AppInput label="Type" value={type} onChangeText={setType} placeholder="INTERNSHIP or FREELANCE" /><AppInput label="Location" value={location} onChangeText={setLocation} /><AppInput label="Skill" value={skill} onChangeText={setSkill} /><AppButton title="Apply filters" onPress={load} /></View>{offline ? <Text style={styles.offline}>Offline data shown</Text> : null}<FlatList data={offers} keyExtractor={(item) => item.id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />} contentContainerStyle={styles.list} ListEmptyComponent={<EmptyState title="No published offers" />} renderItem={({ item }) => <OfferCard offer={item} onPress={() => navigation.navigate('OfferDetails', { offerId: item.id, offer: item })} />} /></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background }, filters: { padding: 16, gap: 10 }, list: { padding: 16, gap: 12 }, offline: { marginHorizontal: 16, color: colors.warning, fontWeight: '700' } });
