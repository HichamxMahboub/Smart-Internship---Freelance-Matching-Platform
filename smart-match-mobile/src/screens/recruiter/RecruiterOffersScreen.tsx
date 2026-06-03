import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AppButton } from '../../components/AppButton';
import { EmptyState } from '../../components/EmptyState';
import { OfferCard } from '../../components/OfferCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { IconButton } from '../../components/IconButton';
import { offerService } from '../../services/offerService';
import { Offer } from '../../types';
import { colors } from '../../theme/colors';

export function RecruiterOffersScreen() {
  const navigation = useNavigation<any>();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const load = async () => { setRefreshing(true); try { const result = await offerService.list({ status: 'DRAFT' as any, size: 50 }); setOffers(result.offers); } finally { setRefreshing(false); } };
  useFocusEffect(useCallback(() => { load(); }, []));
  const publish = async (id: string) => { try { await offerService.publish(id); load(); } catch (e: any) { Alert.alert('Could not publish', e?.response?.data?.message ?? 'Company may not be approved.'); } };
  const archive = async (id: string) => { await offerService.archive(id); load(); };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Opportunities"
        subtitle={`${offers.length} drafts`}
        right={<IconButton icon="plus" onPress={() => navigation.navigate('OfferForm')} bg={colors.primary} color={colors.white} />}
      />
      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState icon="briefcase" title="No offers yet" message="Create your first offer to start receiving applications." actionLabel="Create offer" onAction={() => navigation.navigate('OfferForm')} />}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <OfferCard offer={item} onPress={() => navigation.navigate('OfferForm', { offer: item })} />
            <View style={styles.actions}>
              <AppButton title="Publish" icon="check" size="sm" onPress={() => publish(item.id)} style={styles.action} />
              <AppButton title="Archive" variant="secondary" size="sm" onPress={() => archive(item.id)} style={styles.action} />
            </View>
            <AppButton title="View ranked candidates" icon="user" variant="ghost" size="sm" onPress={() => navigation.navigate('OfferCandidates', { offerId: item.id, offer: item })} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 18, paddingTop: 4, gap: 14, paddingBottom: 28 },
  item: { gap: 8 },
  actions: { flexDirection: 'row', gap: 8 },
  action: { flex: 1 }
});
