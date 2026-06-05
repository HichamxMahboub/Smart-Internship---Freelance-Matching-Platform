import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { EmptyState } from '../../components/EmptyState';
import { MatchResultCard } from '../../components/MatchResultCard';
import { Icon } from '../../components/Icon';
import { aiService } from '../../services/aiService';
import { MatchItem } from '../../types';
import { colors } from '../../theme/colors';
import { radius, shadow } from '../../theme/spacing';

/** Candidate AI Assistant: best-matching offers for the profile, ranked + explained (n8n + Gemini). */
export function AIRecommendationsScreen() {
  const navigation = useNavigation<any>();
  const [matches, setMatches] = useState<MatchItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      setMatches(await aiService.candidateMatches());
    } catch {
      setError(true);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.heroIcon}><Icon name="sparkles" size={26} color={colors.white} /></View>
        <Text style={styles.heroTitle}>AI Assistant</Text>
        <Text style={styles.heroSub}>Your best-matching internships and freelance gigs, ranked and explained from your profile.</Text>
      </View>

      {loading && !matches ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Finding your best matches…</Text>
        </View>
      ) : null}

      {matches && matches.length > 0 ? (
        <View style={styles.list}>
          <Text style={styles.count}>{matches.length} {matches.length === 1 ? 'match' : 'matches'} for you</Text>
          {matches.map((m, i) => (
            <MatchResultCard
              key={m.offerId ?? `m${i}`}
              title={m.title ?? 'Offer'}
              subtitle={[m.company, m.type].filter(Boolean).join(' · ')}
              score={m.score}
              reasons={m.reasons}
              gaps={m.gaps}
              rank={i + 1}
              highlight={i === 0}
              onPress={m.offerId ? () => navigation.navigate('OfferDetails', { offerId: m.offerId }) : undefined}
            />
          ))}
        </View>
      ) : null}

      {!loading && matches && matches.length === 0 ? (
        <EmptyState
          icon={error ? 'sparkles' : 'briefcase'}
          title={error ? 'Assistant unavailable' : 'No matches yet'}
          message={error ? 'The AI assistant is busy. Pull to refresh in a moment.' : 'Add more skills to your profile to get matched with offers.'}
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, gap: 14, paddingBottom: 32 },
  hero: { alignItems: 'center', gap: 9, paddingVertical: 10 },
  heroIcon: { width: 60, height: 60, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', ...shadow.xs },
  heroTitle: { color: colors.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  heroSub: { color: colors.muted, textAlign: 'center', lineHeight: 21, fontSize: 14, maxWidth: 320 },
  loadingBox: { alignItems: 'center', gap: 12, paddingVertical: 36 },
  loadingText: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  list: { gap: 12 },
  count: { color: colors.text, fontWeight: '800', fontSize: 16, letterSpacing: -0.2 }
});
