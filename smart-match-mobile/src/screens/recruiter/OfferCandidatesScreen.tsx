import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecruiterStackParamList } from '../../navigation/RecruiterNavigator';
import { EmptyState } from '../../components/EmptyState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SurfaceCard } from '../../components/SurfaceCard';
import { Avatar } from '../../components/Avatar';
import { Icon } from '../../components/Icon';
import { StatusBadge } from '../../components/StatusBadge';
import { MatchBadge } from '../../components/MatchBadge';
import { aiService, CandidateRecommendation } from '../../services/aiService';
import { computeMatch } from '../../utils/match';
import { colors } from '../../theme/colors';
import { radius, shadow } from '../../theme/spacing';

export function OfferCandidatesScreen({ route, navigation }: NativeStackScreenProps<RecruiterStackParamList, 'OfferCandidates'>) {
  const { offerId, offer } = route.params;
  const [items, setItems] = useState<CandidateRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try { setItems(await aiService.candidateRecommendations(offerId)); }
    catch { setItems([]); }
    finally { setRefreshing(false); setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const scoreOf = (rec: CandidateRecommendation) =>
    Math.round(rec.matchingScore ?? rec.application.matchingScore ?? (offer && rec.profile ? computeMatch(rec.profile.skills ?? [], offer.requiredSkills ?? []).score : 0));

  const ranked = [...items].sort((a, b) => scoreOf(b) - scoreOf(a));

  return (
    <View style={styles.container}>
      <ScreenHeader title="Ranked candidates" subtitle={offer?.title ?? 'Best matches first'} onBack={() => navigation.goBack()} />
      <FlatList
        data={ranked}
        keyExtractor={(item) => item.application.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.primary} />}
        ListEmptyComponent={loading ? null : <EmptyState icon="user" title="No candidates yet" message="When students apply to this role, ranked matches appear here." />}
        renderItem={({ item }) => {
          const name = item.candidateName || `Candidate #${item.application.candidateId.slice(0, 8)}`;
          return (
            <Pressable onPress={() => navigation.navigate('CandidateDetail', { application: item.application, recommendation: item, offer })} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
              <Avatar name={name} uri={item.profile?.photoUrl} size={46} />
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.name} numberOfLines={1}>{name}</Text>
                {item.profile?.headline ? <Text style={styles.headline} numberOfLines={1}>{item.profile.headline}</Text> : null}
                <View style={styles.metaRow}>
                  <MatchBadge score={scoreOf(item)} size="sm" />
                  <StatusBadge status={item.application.status} />
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
  headline: { color: colors.muted, fontSize: 12.5, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }
});
