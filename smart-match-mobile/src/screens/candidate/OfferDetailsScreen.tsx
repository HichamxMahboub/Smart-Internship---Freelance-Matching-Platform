import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CandidateStackParamList } from '../../navigation/CandidateNavigator';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { LoadingView } from '../../components/LoadingView';
import { StatusBadge } from '../../components/StatusBadge';
import { SurfaceCard } from '../../components/SurfaceCard';
import { Chip } from '../../components/Chip';
import { Avatar } from '../../components/Avatar';
import { Icon } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { MatchRing } from '../../components/MatchRing';
import { applicationService } from '../../services/applicationService';
import { favoriteService } from '../../services/favoriteService';
import { offerService } from '../../services/offerService';
import { profileService } from '../../services/profileService';
import { chatService } from '../../services/chatService';
import { computeMatch } from '../../utils/match';
import { Offer, OfferMatch } from '../../types';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';

export function OfferDetailsScreen({ route, navigation }: NativeStackScreenProps<CandidateStackParamList, 'OfferDetails'>) {
  const insets = useSafeAreaInsets();
  const [offer, setOffer] = useState<Offer | undefined>(route.params.offer);
  const [message, setMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(!route.params.offer);
  const [skills, setSkills] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favBusy, setFavBusy] = useState(false);

  useEffect(() => {
    if (!offer) offerService.get(route.params.offerId).then(setOffer).catch(() => Alert.alert('Error', 'Could not load offer.')).finally(() => setLoading(false));
    profileService.getCandidateProfile().then((p) => setSkills(p?.skills ?? [])).catch(() => undefined);
    favoriteService.list().then((f) => setIsFavorite(f.some((x) => x.offerId === route.params.offerId))).catch(() => undefined);
  }, []);

  const apply = async () => {
    try { setApplying(true); await applicationService.apply({ offerId: route.params.offerId, message }); Alert.alert('Application sent', 'Your application was submitted.'); }
    catch (e: any) { Alert.alert('Could not apply', e?.response?.data?.message ?? 'You may have already applied or your email is not verified.'); }
    finally { setApplying(false); }
  };
  const toggleFavorite = async () => {
    if (favBusy) return;
    setFavBusy(true);
    const next = !isFavorite;
    setIsFavorite(next);
    try { next ? await favoriteService.add(route.params.offerId) : await favoriteService.remove(route.params.offerId); }
    catch (e: any) { setIsFavorite(!next); Alert.alert('Could not update saved', e?.response?.data?.message ?? 'Try again.'); }
    finally { setFavBusy(false); }
  };
  const messageRecruiter = async () => {
    try { const c = await chatService.start(route.params.offerId); navigation.navigate('Chat', { conversationId: c.id }); }
    catch (e: any) { Alert.alert('Could not start chat', e?.response?.data?.message ?? 'Try again later.'); }
  };

  if (loading || !offer) return <LoadingView />;

  const match: OfferMatch = computeMatch(skills, offer.requiredSkills ?? []);
  const hasSkills = skills.length > 0;

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <IconButton icon="chevron-left" onPress={() => navigation.goBack()} />
        <IconButton icon="bookmark" onPress={toggleFavorite} bg={isFavorite ? colors.primary : colors.backgroundAlt} color={isFavorite ? colors.white : colors.text} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Avatar name={offer.title} size={56} />
          <StatusBadge status={offer.type} />
        </View>
        <Text style={styles.title}>{offer.title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}><Icon name="location" size={14} color={colors.muted} /><Text style={styles.meta}>{offer.location || 'Remote'}</Text></View>
          <View style={styles.metaItem}><Icon name="clock" size={14} color={colors.muted} /><Text style={styles.meta}>{offer.duration || 'Flexible'}</Text></View>
        </View>

        {hasSkills && offer.requiredSkills?.length ? (
          <SurfaceCard style={styles.matchCard}>
            <MatchRing score={match.score} size={84} />
            <View style={styles.matchBody}>
              <Text style={styles.matchTitle}>Your fit for this role</Text>
              <Text style={styles.matchSub}>{match.matched.length} of {offer.requiredSkills.length} required skills matched.</Text>
              {match.matched.length ? (
                <View style={styles.breakRow}>
                  <View style={[styles.dot, { backgroundColor: colors.matchHigh }]} />
                  <Text style={styles.breakLabel} numberOfLines={2}>You have: {match.matched.join(', ')}</Text>
                </View>
              ) : null}
              {match.missing.length ? (
                <View style={styles.breakRow}>
                  <View style={[styles.dot, { backgroundColor: colors.matchMed }]} />
                  <Text style={styles.breakLabel} numberOfLines={2}>To learn: {match.missing.join(', ')}</Text>
                </View>
              ) : null}
            </View>
          </SurfaceCard>
        ) : null}

        <SurfaceCard style={styles.card}>
          <Text style={styles.section}>About this opportunity</Text>
          <Text style={styles.description}>{offer.description}</Text>
          {offer.requiredSkills?.length ? (
            <>
              <Text style={styles.subsection}>Required skills</Text>
              <View style={styles.skills}>{offer.requiredSkills.map((s) => <Chip key={s} label={s} tone={match.matched.includes(s) ? 'teal' : 'brand'} />)}</View>
            </>
          ) : null}
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <Text style={styles.section}>Apply to this role</Text>
          <AppInput label="Application message" value={message} onChangeText={setMessage} multiline placeholder="Share why you're a great fit, your availability, and motivation." />
          <AppButton title="Apply now" icon="send" onPress={apply} loading={applying} />
          <View style={styles.actions}>
            <AppButton title="Message" icon="chat" variant="secondary" onPress={messageRecruiter} style={styles.action} />
            <AppButton title={isFavorite ? 'Saved' : 'Save'} icon="bookmark" variant={isFavorite ? 'primary' : 'secondary'} onPress={toggleFavorite} style={styles.action} />
          </View>
        </SurfaceCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 6 },
  scroll: { flex: 1 },
  content: { padding: 18, paddingTop: 8, gap: 14, paddingBottom: 32 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.5, lineHeight: 30, marginTop: 4 },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  meta: { color: colors.muted, fontWeight: '600', fontSize: 13.5 },
  matchCard: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 },
  matchBody: { flex: 1, gap: 5 },
  matchTitle: { color: colors.text, fontWeight: '800', fontSize: 15.5, letterSpacing: -0.2 },
  matchSub: { color: colors.muted, fontSize: 12.5, lineHeight: 17 },
  breakRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, marginTop: 2 },
  dot: { width: 7, height: 7, borderRadius: 4, marginTop: 5 },
  breakLabel: { flex: 1, color: colors.textSoft, fontSize: 12.5, lineHeight: 17, fontWeight: '600' },
  card: { gap: 12, marginTop: 4 },
  section: { color: colors.text, fontWeight: '800', fontSize: 17 },
  subsection: { color: colors.textSoft, fontWeight: '700', fontSize: 13, marginTop: 2 },
  description: { color: colors.textSoft, lineHeight: 22, fontSize: 14.5 },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  actions: { flexDirection: 'row', gap: 10 },
  action: { flex: 1 }
});
