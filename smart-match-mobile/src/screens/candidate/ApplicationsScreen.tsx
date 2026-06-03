import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { SurfaceCard } from '../../components/SurfaceCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Icon } from '../../components/Icon';
import { ProgressBar } from '../../components/ProgressBar';
import { applicationService } from '../../services/applicationService';
import { matchColors } from '../../utils/match';
import { Application } from '../../types';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';

export function ApplicationsScreen() {
  const [items, setItems] = useState<Application[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const load = async () => { setRefreshing(true); try { setItems(await applicationService.myApplications()); } finally { setRefreshing(false); } };
  useFocusEffect(useCallback(() => { load(); }, []));

  return (
    <View style={styles.container}>
      <ScreenHeader title="My applications" subtitle={`${items.length} submitted`} />
      <FlatList
        contentContainerStyle={styles.list}
        data={items}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState icon="document" title="No applications yet" message="Apply to an opportunity and track every status update here." />}
        renderItem={({ item }) => {
          const score = item.matchingScore ? Math.round(item.matchingScore) : null;
          return (
            <SurfaceCard style={styles.card}>
              <View style={styles.row}>
                <View style={styles.titleRow}>
                  <View style={styles.iconChip}><Icon name="document" size={16} color={colors.primary} bg={colors.primaryLight} /></View>
                  <Text style={styles.title}>Offer #{item.offerId.slice(0, 8)}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>
              {score !== null ? (
                <View style={styles.scoreBlock}>
                  <View style={styles.scoreLabelRow}><Text style={styles.scoreLabel}>Match score</Text><Text style={[styles.scoreValue, { color: matchColors(score).fg }]}>{score}%</Text></View>
                  <ProgressBar value={score} color={matchColors(score).fg} height={7} />
                </View>
              ) : null}
              {item.message ? <Text style={styles.message} numberOfLines={3}>{item.message}</Text> : null}
            </SurfaceCard>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 18, paddingTop: 4, gap: 12, paddingBottom: 28 },
  card: { gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1 },
  iconChip: { width: 30, height: 30, borderRadius: radius.sm, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '800', color: colors.text, fontSize: 15 },
  scoreBlock: { gap: 6 },
  scoreLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  scoreLabel: { color: colors.muted, fontWeight: '600', fontSize: 12.5 },
  scoreValue: { color: colors.teal, fontWeight: '800', fontSize: 12.5 },
  track: { height: 7, borderRadius: 4, backgroundColor: colors.divider, overflow: 'hidden' },
  fill: { height: 7, borderRadius: 4, backgroundColor: colors.teal },
  message: { color: colors.muted, lineHeight: 20, fontSize: 13.5 }
});
