import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AppButton } from '../../components/AppButton';
import { SurfaceCard } from '../../components/SurfaceCard';
import { Icon } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { subscriptionService } from '../../services/subscriptionService';
import { Subscription } from '../../types';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';

function formatDate(iso?: string) {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

const BENEFITS = [
  'AI CV strengths & gaps analysis',
  'Matched opportunity recommendations',
  'Profile optimization checklist',
  'Priority visibility to recruiters'
];

export function PremiumScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const load = async () => { try { setSubscription(await subscriptionService.current()); } catch {} };
  useFocusEffect(useCallback(() => { load(); }, []));
  const upgrade = async () => { try { setUpgrading(true); await subscriptionService.upgrade(); Alert.alert('Premium active', 'Your simulated payment was accepted.'); load(); } catch (e: any) { Alert.alert('Upgrade failed', e?.response?.data?.message ?? 'Could not upgrade.'); } finally { setUpgrading(false); } };
  const isPremium = (subscription?.plan ?? 'FREE') === 'PREMIUM';

  return (
    <View style={styles.container}>
      <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
        <IconButton icon="chevron-left" onPress={() => navigation.goBack()} bg="rgba(255,255,255,0.16)" color={colors.white} />
        <View style={styles.heroBadge}><Icon name="star" size={16} color={colors.white} /><Text style={styles.heroBadgeText}>INTERLANCE PREMIUM</Text></View>
        <Text style={styles.heroTitle}>Turn your profile into a hiring signal</Text>
        <Text style={styles.heroSub}>Unlock AI CV analysis, tailored offer recommendations, and optimization prompts.</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SurfaceCard style={styles.plan}>
          <View style={styles.planRow}>
            <View>
              <Text style={styles.planLabel}>Current plan</Text>
              <Text style={styles.planName}>{subscription?.plan ?? 'FREE'}</Text>
            </View>
            <View style={[styles.planTag, isPremium ? styles.planTagActive : null]}>
              <Text style={[styles.planTagText, isPremium ? styles.planTagTextActive : null]}>{isPremium ? 'Active' : 'Free tier'}</Text>
            </View>
          </View>
          <Text style={styles.expires}>Renews: {formatDate(subscription?.expirationDate)}</Text>
        </SurfaceCard>

        <SurfaceCard style={styles.benefits}>
          <Text style={styles.benefitsTitle}>What you unlock</Text>
          {BENEFITS.map((b) => (
            <View key={b} style={styles.benefitRow}>
              <View style={styles.benefitIcon}><Icon name="check" size={14} color={colors.success} bg={colors.successSoft} /></View>
              <Text style={styles.benefit}>{b}</Text>
            </View>
          ))}
        </SurfaceCard>

        <AppButton title={isPremium ? 'Renew premium' : 'Upgrade to Premium'} icon="star" onPress={upgrade} loading={upgrading} />
        <AppButton title="Open AI insights" icon="sparkles" variant="secondary" onPress={() => navigation.navigate('AIRecommendations')} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { backgroundColor: colors.primary, paddingHorizontal: 18, paddingBottom: 26, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl, overflow: 'hidden' },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 18 },
  heroBadgeText: { color: colors.white, fontWeight: '800', letterSpacing: 1, fontSize: 11 },
  heroTitle: { color: colors.white, fontSize: 25, fontWeight: '800', letterSpacing: -0.6, lineHeight: 30, marginTop: 10 },
  heroSub: { color: 'rgba(255,255,255,0.82)', lineHeight: 21, marginTop: 8, fontSize: 14 },
  content: { padding: 18, gap: 14, paddingBottom: 30 },
  plan: { gap: 8 },
  planRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planLabel: { color: colors.muted, fontWeight: '600', fontSize: 13 },
  planName: { color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  planTag: { backgroundColor: colors.backgroundAlt, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  planTagActive: { backgroundColor: colors.successSoft },
  planTagText: { color: colors.muted, fontWeight: '800', fontSize: 12 },
  planTagTextActive: { color: colors.success },
  expires: { color: colors.muted, fontSize: 13 },
  benefits: { gap: 12 },
  benefitsTitle: { color: colors.text, fontWeight: '800', fontSize: 16 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  benefitIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' },
  benefit: { color: colors.textSoft, fontWeight: '600', fontSize: 14, flex: 1 }
});
