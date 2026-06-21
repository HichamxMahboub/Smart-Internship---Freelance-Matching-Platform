import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AppButton } from '../../components/AppButton';
import { EmptyState } from '../../components/EmptyState';
import { OfferCard } from '../../components/OfferCard';
import { favoriteService } from '../../services/favoriteService';
import { profileService } from '../../services/profileService';
import { matchForOffer } from '../../utils/match';
import { useCandidateMatches } from '../../match/CandidateMatchContext';
import { Favorite } from '../../types';
import { colors } from '../../theme/colors';

export function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<Favorite[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { scoreFor } = useCandidateMatches();
  const load = async () => { setRefreshing(true); try { setItems(await favoriteService.list()); } finally { setRefreshing(false); } };
  const remove = async (offerId: string) => { try { await favoriteService.remove(offerId); load(); } catch { Alert.alert('Error', 'Could not remove favorite.'); } };
  useFocusEffect(useCallback(() => { load(); }, []));
  useEffect(() => { profileService.getCandidateProfile().then((p) => setSkills(p?.skills ?? [])).catch(() => undefined); }, []);
  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={items}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.primary} />}
      ListEmptyComponent={<EmptyState icon="bookmark" title="No saved offers" message="Save roles you like, then compare them from this shortlist." actionLabel="Browse offers" onAction={() => navigation.navigate('Offers')} />}
      renderItem={({ item }) => (
        <View style={styles.item}>
          {item.offer ? <OfferCard offer={item.offer} matchScore={scoreFor(item.offerId) ?? (skills.length ? matchForOffer(skills, item.offer).score : undefined)} onPress={() => navigation.navigate('OfferDetails', { offerId: item.offerId, offer: item.offer })} /> : null}
          <AppButton title="Remove from saved" icon="close" variant="ghost" size="sm" onPress={() => remove(item.offerId)} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 18, gap: 14, paddingBottom: 28 },
  item: { gap: 6 }
});
