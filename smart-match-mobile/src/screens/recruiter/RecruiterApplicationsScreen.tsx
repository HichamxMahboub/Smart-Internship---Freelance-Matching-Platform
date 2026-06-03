import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Avatar } from '../../components/Avatar';
import { Icon } from '../../components/Icon';
import { MatchBadge } from '../../components/MatchBadge';
import { applicationService } from '../../services/applicationService';
import { Application } from '../../types';
import { colors } from '../../theme/colors';
import { radius, shadow } from '../../theme/spacing';

export function RecruiterApplicationsScreen() {
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<Application[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const load = async () => { setRefreshing(true); try { setItems(await applicationService.recruiterApplications()); } finally { setRefreshing(false); } };
  useFocusEffect(useCallback(() => { load(); }, []));

  const ranked = [...items].sort((a, b) => (b.matchingScore ?? 0) - (a.matchingScore ?? 0));

  return (
    <View style={styles.container}>
      <ScreenHeader title="Applications" subtitle={`${items.length} candidates`} />
      <FlatList
        contentContainerStyle={styles.list}
        data={ranked}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState icon="document" title="No applications yet" message="When candidates apply to your offers, they'll appear here ranked by match." />}
        renderItem={({ item }) => {
          const name = `Candidate #${item.candidateId.slice(0, 8)}`;
          return (
            <Pressable onPress={() => navigation.navigate('CandidateDetail', { application: item })} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
              <Avatar name={name} size={46} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.name} numberOfLines={1}>{name}</Text>
                <Text style={styles.offer} numberOfLines={1}>Offer #{item.offerId.slice(0, 8)}</Text>
                <View style={styles.metaRow}>
                  {typeof item.matchingScore === 'number' ? <MatchBadge score={item.matchingScore} size="sm" /> : null}
                  <StatusBadge status={item.status} />
                </View>
              </View>
              <Icon name="chevron-right" size={16} color={colors.softText} />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 18, paddingTop: 4, gap: 11, paddingBottom: 28 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14, ...shadow.xs },
  pressed: { opacity: 0.96, transform: [{ scale: 0.99 }] },
  name: { color: colors.text, fontWeight: '800', fontSize: 15, letterSpacing: -0.2 },
  offer: { color: colors.muted, fontSize: 12.5, fontWeight: '500' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }
});
