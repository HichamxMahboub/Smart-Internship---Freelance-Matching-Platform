import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SurfaceCard } from '../../components/SurfaceCard';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { paymentService } from '../../services/paymentService';
import { Payment } from '../../types';
import { colors } from '../../theme/colors';
import { radius, shadow } from '../../theme/spacing';

function formatDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_TONE: Record<Payment['status'], { bg: string; fg: string; label: string }> = {
  PAID: { bg: colors.successSoft, fg: colors.success, label: 'Received' },
  PENDING: { bg: colors.backgroundAlt, fg: colors.muted, label: 'Pending' },
  FAILED: { bg: colors.backgroundAlt, fg: colors.danger, label: 'Failed' },
  REFUNDED: { bg: colors.backgroundAlt, fg: colors.muted, label: 'Refunded' }
};

export function EarningsScreen() {
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<Payment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setRefreshing(true);
    try { setItems(await paymentService.earnings()); }
    catch { setItems([]); }
    finally { setRefreshing(false); setLoading(false); }
  };
  useFocusEffect(useCallback(() => { load(); }, []));

  const paid = items.filter((p) => p.status === 'PAID');
  const currency = paid[0]?.currency ?? items[0]?.currency ?? 'USD';
  const total = paid.reduce((sum, p) => sum + (p.amount ?? 0), 0);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Earnings" subtitle="Freelance payments" onBack={() => navigation.goBack()} />
      <FlatList
        data={items}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.primary} />}
        ListHeaderComponent={
          <SurfaceCard style={styles.totalCard}>
            <View style={styles.totalIcon}><Icon name="briefcase" size={20} color={colors.success} /></View>
            <Text style={styles.totalLabel}>Total received</Text>
            <Text style={styles.totalValue}>{total.toLocaleString()} {currency}</Text>
            <Text style={styles.totalSub}>{paid.length} paid mission{paid.length === 1 ? '' : 's'}</Text>
          </SurfaceCard>
        }
        ListEmptyComponent={loading ? null : <EmptyState icon="briefcase" title="No earnings yet" message="When a recruiter pays you for a freelance mission, it shows up here." />}
        renderItem={({ item }) => {
          const tone = STATUS_TONE[item.status];
          return (
            <View style={styles.row}>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>{item.description || item.offerTitle || 'Freelance payment'}</Text>
                <Text style={styles.rowMeta} numberOfLines={1}>
                  {item.payerName ? `From ${item.payerName}` : 'From recruiter'}{item.paidAt || item.createdAt ? ` · ${formatDate(item.paidAt ?? item.createdAt)}` : ''}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 5 }}>
                <Text style={styles.amount}>+{(item.amount ?? 0).toLocaleString()} {item.currency}</Text>
                <View style={[styles.tag, { backgroundColor: tone.bg }]}><Text style={[styles.tagText, { color: tone.fg }]}>{tone.label}</Text></View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 18, paddingTop: 4, gap: 10, paddingBottom: 28 },
  totalCard: { alignItems: 'center', gap: 4, paddingVertical: 22, marginBottom: 6 },
  totalIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  totalLabel: { color: colors.muted, fontWeight: '700', fontSize: 13 },
  totalValue: { color: colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.6 },
  totalSub: { color: colors.softText, fontSize: 12.5, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14, ...shadow.xs },
  rowTitle: { color: colors.text, fontWeight: '800', fontSize: 14.5, letterSpacing: -0.2 },
  rowMeta: { color: colors.muted, fontSize: 12.5, fontWeight: '600' },
  amount: { color: colors.success, fontWeight: '800', fontSize: 15 },
  tag: { borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 },
  tagText: { fontWeight: '800', fontSize: 10.5, letterSpacing: 0.3 }
});
