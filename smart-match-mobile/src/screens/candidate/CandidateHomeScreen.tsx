import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/AuthContext';
import { BrandMark } from '../../components/Brand';
import { OfferCard } from '../../components/OfferCard';
import { EmptyState } from '../../components/EmptyState';
import { AnimatedEntrance } from '../../components/AnimatedEntrance';
import { SectionHeader } from '../../components/SectionHeader';
import { IconButton } from '../../components/IconButton';
import { Icon, IconName } from '../../components/Icon';
import { ProgressBar } from '../../components/ProgressBar';
import { Offer, Subscription, CandidateProfile } from '../../types';
import { offerService } from '../../services/offerService';
import { subscriptionService } from '../../services/subscriptionService';
import { profileService } from '../../services/profileService';
import { matchForOffer } from '../../utils/match';
import { candidateCompletion } from '../../onboarding/completeness';
import { colors } from '../../theme/colors';
import { radius, shadow } from '../../theme/spacing';

export function CandidateHomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const pulse = useRef(new Animated.Value(0)).current;
  const [offers, setOffers] = useState<Offer[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      setRefreshing(true);
      const [offerData, sub, prof] = await Promise.all([
        offerService.list({ page: 0, size: 5 }),
        subscriptionService.current(),
        profileService.getCandidateProfile().catch(() => null)
      ]);
      setOffers(offerData.offers);
      setSubscription(sub);
      setProfile(prof);
    } catch {
      Alert.alert('Error', 'Could not load home data.');
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 1600, easing: Easing.in(Easing.quad), useNativeDriver: false })
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, [pulse]);

  const plan = subscription?.plan ?? user?.plan ?? 'FREE';
  const isPremium = plan === 'PREMIUM';
  const firstName = user?.fullName?.split(' ')[0] || 'there';
  const completion = candidateCompletion(profile);
  const skills = profile?.skills ?? [];
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0.45] });

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedEntrance>
          <View style={styles.hero}>
            <Animated.View style={[styles.heroGlow, { opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]} />
            <View style={styles.heroOrbOne} />
            <View style={styles.heroOrbTwo} />

            <View style={styles.heroTop}>
              <View style={styles.brandRow}>
                <BrandMark size={42} />
                <View>
                  <Text style={styles.kicker}>Interlance radar</Text>
                  <Text style={styles.heroName}>Hi, {firstName}</Text>
                </View>
              </View>
              <IconButton icon="bell" onPress={() => navigation.navigate('Notifications')} />
            </View>

            <Text style={styles.heroTitle}>Find work that feels made for you.</Text>
            <Text style={styles.heroText}>Internships, freelance missions, and AI-picked roles in one focused flow.</Text>

            <Pressable style={({ pressed }) => [styles.heroCta, pressed && styles.pressed]} onPress={() => navigation.navigate('Offers')}>
              <Icon name="sparkles" size={18} color={colors.white} bg={colors.primary} />
              <Text style={styles.heroCtaText}>Launch smart search</Text>
              <Icon name="chevron-right" size={14} color={colors.white} bg={colors.primary} />
            </Pressable>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={80}>
          <Pressable style={({ pressed }) => [styles.search, pressed && styles.pressed]} onPress={() => navigation.navigate('Offers')}>
            <Icon name="search" size={18} color={colors.primary} />
            <Text style={styles.searchText}>Search roles, skills, companies…</Text>
            <View style={styles.searchSpark}><Icon name="filter" size={13} color={colors.primary} bg={colors.primaryLight} /></View>
          </Pressable>
        </AnimatedEntrance>

        <AnimatedEntrance delay={130}>
          <PlanCard isPremium={isPremium} onPress={() => navigation.navigate('Premium')} />
        </AnimatedEntrance>

        {completion < 100 ? (
          <AnimatedEntrance delay={155}>
            <Pressable style={({ pressed }) => [styles.completeCard, pressed && styles.pressed]} onPress={() => navigation.navigate('Profile')}>
              <View style={styles.completeHead}>
                <View style={styles.completeIcon}><Icon name="user" size={18} color={colors.primary} bg={colors.primaryLight} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.completeTitle}>Complete your profile</Text>
                  <Text style={styles.completeText}>A richer profile gets you ranked higher by recruiters.</Text>
                </View>
                <Text style={styles.completePct}>{completion}%</Text>
              </View>
              <ProgressBar value={completion} style={{ marginTop: 12 }} />
            </Pressable>
          </AnimatedEntrance>
        ) : null}

        <AnimatedEntrance delay={180}>
          <Text style={styles.label}>Choose your lane</Text>
          <View style={styles.splitRow}>
            <SplitCard
              icon="briefcase"
              tone="teal"
              title="Internships"
              caption="Mentored roles, real teams, clear growth."
              onPress={() => navigation.navigate('Offers', { mode: 'INTERNSHIP' })}
            />
            <SplitCard
              icon="sparkles"
              tone="primary"
              title="Freelance"
              caption="Flexible missions that match your skills."
              onPress={() => navigation.navigate('Offers', { mode: 'FREELANCE' })}
            />
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={230}>
          <View style={styles.pathCard}>
            <View style={styles.pathIcon}><Icon name="send" size={18} color={colors.accent} bg={colors.accentSoft} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pathTitle}>Today’s quick win</Text>
              <Text style={styles.pathText}>Browse fresh matches, open one role, and keep your momentum moving.</Text>
            </View>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={280}>
          <SectionHeader title="Recommended for you" action="See all" onAction={() => navigation.navigate('Offers')} />
          <View style={styles.list}>
            {offers.length ? (
              [...offers]
                .map((offer) => ({ offer, score: matchForOffer(skills, offer).score }))
                .sort((a, b) => b.score - a.score)
                .map(({ offer, score }, i) => (
                  <AnimatedEntrance key={offer.id} delay={320 + i * 50}>
                    <OfferCard offer={offer} matchScore={skills.length ? score : undefined} onPress={() => navigation.navigate('OfferDetails', { offerId: offer.id, offer })} />
                  </AnimatedEntrance>
                ))
            ) : (
              <EmptyState icon="briefcase" title="No offers yet" message="Pull to refresh once recruiters publish new opportunities." actionLabel="Browse offers" onAction={() => navigation.navigate('Offers')} />
            )}
          </View>
        </AnimatedEntrance>
      </ScrollView>
    </View>
  );
}

function PlanCard({ isPremium, onPress }: { isPremium: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.planCard, pressed && styles.pressed]}>
      <View style={styles.planBadge}>
        <Icon name={isPremium ? 'star' : 'sparkles'} size={21} color={colors.gold} bg={colors.goldSoft} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.planEyebrow}>{isPremium ? 'Premium active' : 'Free explorer'}</Text>
        <Text style={styles.planTitle}>{isPremium ? 'Your AI boost is on' : 'Upgrade your match power'}</Text>
        <Text style={styles.planText}>
          {isPremium ? 'Priority recommendations and CV insights are ready.' : 'Unlock CV analysis and tailored opportunity picks.'}
        </Text>
      </View>
      <View style={styles.planPill}>
        <Text style={styles.planPillText}>{isPremium ? 'Active' : 'View'}</Text>
      </View>
    </Pressable>
  );
}

function SplitCard({ icon, title, caption, tone, onPress }: { icon: IconName; title: string; caption: string; tone: 'teal' | 'primary'; onPress: () => void }) {
  const c = tone === 'teal' ? { bg: colors.tealSoft, fg: colors.teal } : { bg: colors.primaryLight, fg: colors.primary };
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.split, pressed && styles.pressed]}>
      <View style={[styles.splitIcon, { backgroundColor: c.bg }]}><Icon name={icon} size={22} color={c.fg} bg={c.bg} /></View>
      <Text style={styles.splitTitle}>{title}</Text>
      <Text style={styles.splitCaption}>{caption}</Text>
      <View style={styles.splitCta}><Text style={[styles.splitCtaText, { color: c.fg }]}>Explore</Text><Icon name="chevron-right" size={13} color={c.fg} /></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, gap: 18, paddingBottom: 28 },
  hero: { backgroundColor: colors.ink, borderRadius: radius.xl, padding: 18, minHeight: 250, overflow: 'hidden', ...shadow.medium },
  heroGlow: { position: 'absolute', width: 190, height: 190, borderRadius: 95, right: -46, top: -34, backgroundColor: colors.primary },
  heroOrbOne: { position: 'absolute', width: 86, height: 86, borderRadius: 43, right: 42, bottom: -28, backgroundColor: 'rgba(16,181,166,0.22)' },
  heroOrbTwo: { position: 'absolute', width: 58, height: 58, borderRadius: 29, left: -16, top: 96, backgroundColor: 'rgba(255,255,255,0.08)' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 22 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  kicker: { color: 'rgba(255,255,255,0.66)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 },
  heroName: { color: colors.white, fontSize: 20, fontWeight: '900', letterSpacing: -0.4 },
  heroTitle: { color: colors.white, fontSize: 28, lineHeight: 34, fontWeight: '900', letterSpacing: -0.8, maxWidth: 270 },
  heroText: { color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 21, fontWeight: '600', marginTop: 10, maxWidth: 290 },
  heroCta: { marginTop: 18, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 14, borderRadius: radius.pill, ...shadow.brand },
  heroCtaText: { color: colors.white, fontWeight: '900', fontSize: 13.5 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, height: 54, ...shadow.xs },
  searchText: { color: colors.muted, fontSize: 14.5, fontWeight: '600', flex: 1 },
  searchSpark: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  label: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 12 },
  splitRow: { flexDirection: 'row', gap: 12 },
  split: { flex: 1, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 8, minHeight: 154, justifyContent: 'space-between', ...shadow.xs },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  splitIcon: { width: 46, height: 46, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  splitTitle: { color: colors.text, fontSize: 17, fontWeight: '900', letterSpacing: -0.3, marginTop: 2 },
  splitCaption: { color: colors.muted, fontSize: 12.5, lineHeight: 17, flex: 1, fontWeight: '500' },
  splitCta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  splitCtaText: { fontWeight: '900', fontSize: 13 },
  planCard: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: colors.goldSoft, borderRadius: radius.xl, borderWidth: 1, borderColor: '#F2E2C0', padding: 16, ...shadow.soft },
  planBadge: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  planEyebrow: { color: colors.warning, fontSize: 11.5, fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 3 },
  planTitle: { color: colors.text, fontWeight: '900', fontSize: 16, letterSpacing: -0.3 },
  planText: { color: colors.muted, fontSize: 12.5, lineHeight: 18, fontWeight: '600', marginTop: 3 },
  planPill: { backgroundColor: colors.white, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
  planPillText: { color: colors.primary, fontWeight: '900', fontSize: 12 },
  pathCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 15, ...shadow.xs },
  pathIcon: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  pathTitle: { color: colors.text, fontWeight: '900', fontSize: 14.5 },
  pathText: { color: colors.muted, fontWeight: '500', fontSize: 12.5, lineHeight: 18, marginTop: 2 },
  list: { gap: 13 },
  completeCard: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 16, ...shadow.xs },
  completeHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  completeIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  completeTitle: { color: colors.text, fontWeight: '800', fontSize: 14.5, letterSpacing: -0.2 },
  completeText: { color: colors.muted, fontSize: 12.5, lineHeight: 17, marginTop: 2 },
  completePct: { color: colors.primary, fontWeight: '800', fontSize: 16 }
});
