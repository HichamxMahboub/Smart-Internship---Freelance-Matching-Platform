import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { EmptyState } from '../../components/EmptyState';
import { MatchResultCard } from '../../components/MatchResultCard';
import { SurfaceCard } from '../../components/SurfaceCard';
import { Chip } from '../../components/Chip';
import { Icon } from '../../components/Icon';
import { aiService } from '../../services/aiService';
import { offerService } from '../../services/offerService';
import { MatchItem, Offer } from '../../types';
import { colors } from '../../theme/colors';
import { radius, shadow } from '../../theme/spacing';

/** Placeholder card shown while the AI scores candidates (Gemini call can take several seconds). */
function SkeletonCard() {
  return (
    <View style={styles.skel}>
      <View style={styles.skelHead}>
        <View style={styles.skelAvatar} />
        <View style={{ flex: 1, gap: 7 }}>
          <View style={[styles.skelLine, { width: '55%' }]} />
          <View style={[styles.skelLine, { width: '35%' }]} />
        </View>
        <View style={styles.skelBadge} />
      </View>
      <View style={[styles.skelLine, { width: '90%' }]} />
      <View style={[styles.skelLine, { width: '78%' }]} />
    </View>
  );
}

/** Recruiter AI Assistant: pick one of your offers, get AI-ranked candidates for it (n8n + Gemini). */
export function RecruiterAssistantScreen() {
  const navigation = useNavigation<any>();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchItem[] | null>(null);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const selectOffer = async (offerId: string) => {
    setSelected(offerId);
    setMatches(null);
    setLoadingMatches(true);
    try {
      setMatches(await aiService.recruiterMatches(offerId));
    } catch {
      setMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  };

  const loadOffers = () => {
    setLoadingOffers(true);
    offerService
      .list({ status: 'PUBLISHED' as any, size: 50 })
      .then((r) => {
        setOffers(r.offers);
        if (r.offers[0]) selectOffer(r.offers[0].id);
      })
      .catch(() => setOffers([]))
      .finally(() => setLoadingOffers(false));
  };
  useEffect(() => { loadOffers(); }, []);

  const selectedOffer = offers.find((o) => o.id === selected);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loadingOffers} onRefresh={loadOffers} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.heroIcon}><Icon name="sparkles" size={26} color={colors.white} /></View>
        <Text style={styles.heroTitle}>AI Assistant</Text>
        <Text style={styles.heroSub}>Pick one of your offers — the AI ranks every candidate by fit and explains why.</Text>
      </View>

      {offers.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {offers.map((o) => {
            const active = o.id === selected;
            return (
              <Pressable key={o.id} onPress={() => selectOffer(o.id)} style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>{o.title}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {selectedOffer ? (
        <SurfaceCard style={styles.offerCard}>
          <Text style={styles.offerLabel}>Matching candidates for</Text>
          <Text style={styles.offerTitle}>{selectedOffer.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaTag}>{selectedOffer.type}</Text>
            {selectedOffer.location ? <Text style={styles.meta}>{selectedOffer.location}</Text> : null}
            {selectedOffer.duration ? <Text style={styles.meta}>· {selectedOffer.duration}</Text> : null}
          </View>
          {selectedOffer.requiredSkills && selectedOffer.requiredSkills.length > 0 ? (
            <View style={styles.skills}>
              {selectedOffer.requiredSkills.slice(0, 8).map((s) => <Chip key={s} label={s} tone="teal" />)}
            </View>
          ) : null}
        </SurfaceCard>
      ) : null}

      {loadingMatches ? (
        <View style={styles.list}>
          <View style={styles.loadingHint}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>AI is reading every candidate profile…</Text>
          </View>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : null}

      {!loadingMatches && matches && matches.length > 0 ? (
        <View style={styles.list}>
          <Text style={styles.count}>{matches.length} ranked {matches.length === 1 ? 'candidate' : 'candidates'}</Text>
          {matches.map((m, i) => (
            <MatchResultCard
              key={m.candidateId ?? `m${i}`}
              title={m.name ?? 'Candidate'}
              subtitle={m.headline}
              score={m.score}
              reasons={m.reasons}
              gaps={m.gaps}
              rank={i + 1}
              avatarName={m.name}
              highlight={i === 0}
            />
          ))}
        </View>
      ) : null}

      {!loadingOffers && offers.length === 0 ? (
        <EmptyState icon="briefcase" title="No published offers" message="Publish an offer first, then the AI can rank candidates for it." />
      ) : null}

      {!loadingMatches && matches && matches.length === 0 && offers.length > 0 ? (
        <EmptyState icon="user" title="No candidates to rank" message="There are no candidate profiles to match yet." />
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
  chips: { gap: 8, paddingVertical: 2, paddingRight: 8 },
  chip: { maxWidth: 200, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSoft, fontWeight: '700', fontSize: 13 },
  chipTextActive: { color: colors.white },
  offerCard: { gap: 7 },
  offerLabel: { color: colors.muted, fontSize: 11.5, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  offerTitle: { color: colors.text, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  metaTag: { color: colors.primary, backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
  meta: { color: colors.muted, fontSize: 12.5, fontWeight: '600' },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  loadingHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 4 },
  loadingText: { color: colors.muted, fontSize: 13.5, fontWeight: '600' },
  list: { gap: 12 },
  count: { color: colors.text, fontWeight: '800', fontSize: 16, letterSpacing: -0.2 },
  skel: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 15, gap: 11, opacity: 0.7 },
  skelHead: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  skelAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.backgroundAlt },
  skelBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.backgroundAlt },
  skelLine: { height: 11, borderRadius: 6, backgroundColor: colors.backgroundAlt }
});
