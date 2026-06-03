import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { EmptyState } from '../../components/EmptyState';
import { OfferCard } from '../../components/OfferCard';
import { Segmented } from '../../components/Segmented';
import { ScreenHeader } from '../../components/ScreenHeader';
import { IconButton } from '../../components/IconButton';
import { FilterChip } from '../../components/Chip';
import { offerService } from '../../services/offerService';
import { profileService } from '../../services/profileService';
import { matchForOffer } from '../../utils/match';
import { Offer, OfferType } from '../../types';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';

type Sort = 'match' | 'recent';

const COPY: Record<OfferType, { title: string; subtitle: string; empty: string }> = {
  INTERNSHIP: { title: 'Internships', subtitle: 'Structured roles to learn and grow', empty: 'No internships match your filters yet.' },
  FREELANCE: { title: 'Freelance', subtitle: 'Flexible, project-based work', empty: 'No freelance gigs match your filters yet.' }
};

export function OfferListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [mode, setMode] = useState<OfferType>((route.params?.mode as OfferType) || 'INTERNSHIP');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [skill, setSkill] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [offline, setOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>('match');

  const load = async (type: OfferType = mode) => {
    try {
      setRefreshing(true);
      const result = await offerService.list({ keyword, type: type as any, location, skill, page: 0, size: 30 });
      setOffers(result.offers); setOffline(result.offline);
    } catch { Alert.alert('Error', 'Could not load offers.'); }
    finally { setRefreshing(false); }
  };
  useFocusEffect(useCallback(() => { load(); }, []));
  useEffect(() => { profileService.getCandidateProfile().then((p) => setSkills(p?.skills ?? [])).catch(() => undefined); }, []);
  useEffect(() => { if (route.params?.mode) setMode(route.params.mode); }, [route.params?.mode]);

  const changeMode = (next: OfferType) => { setMode(next); load(next); };
  const copy = COPY[mode];
  const hasSkills = skills.length > 0;
  const ranked = offers
    .map((offer) => ({ offer, score: matchForOffer(skills, offer).score }))
    .sort((a, b) => (sort === 'match' && hasSkills ? b.score - a.score : 0));

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={copy.title}
        subtitle={copy.subtitle}
        right={<IconButton icon="filter" onPress={() => setShowAdvanced((v) => !v)} bg={showAdvanced ? colors.primaryLight : colors.backgroundAlt} color={showAdvanced ? colors.primary : colors.text} />}
      />
      <FlatList
        data={ranked}
        keyExtractor={({ offer }) => offer.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load()} tintColor={colors.primary} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Segmented
              value={mode}
              onChange={changeMode}
              options={[
                { value: 'INTERNSHIP', label: 'Internships', icon: 'briefcase' },
                { value: 'FREELANCE', label: 'Freelance', icon: 'sparkles' }
              ]}
            />
            <AppInput icon="search" value={keyword} onChangeText={setKeyword} placeholder="Role, skill, keyword…" returnKeyType="search" onSubmitEditing={() => load()} />
            {showAdvanced ? (
              <View style={styles.advanced}>
                <AppInput label="Location" icon="location" value={location} onChangeText={setLocation} placeholder="Remote, Casablanca…" />
                <AppInput label="Skill" value={skill} onChangeText={setSkill} placeholder="Spring Boot, Figma…" />
                <AppButton title="Apply filters" icon="check" onPress={() => load()} />
              </View>
            ) : null}
            <View style={styles.toolbar}>
              <Text style={styles.count}>{ranked.length} {ranked.length === 1 ? 'result' : 'results'}</Text>
              {hasSkills ? (
                <View style={styles.sortRow}>
                  <FilterChip label="Best match" active={sort === 'match'} onPress={() => setSort('match')} />
                  <FilterChip label="Newest" active={sort === 'recent'} onPress={() => setSort('recent')} />
                </View>
              ) : null}
            </View>
            {offline ? <Text style={styles.offline}>Showing cached offline data.</Text> : null}
          </View>
        }
        ListEmptyComponent={<EmptyState icon="search" title="Nothing here yet" message={copy.empty} />}
        renderItem={({ item }) => <OfferCard offer={item.offer} matchScore={hasSkills ? item.score : undefined} onPress={() => navigation.navigate('OfferDetails', { offerId: item.offer.id, offer: item.offer })} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 18, paddingTop: 4, gap: 13, paddingBottom: 28 },
  header: { gap: 14, marginBottom: 2 },
  advanced: { gap: 12, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  count: { color: colors.muted, fontWeight: '700', fontSize: 13 },
  sortRow: { flexDirection: 'row', gap: 8 },
  offline: { color: colors.warning, fontWeight: '700', textAlign: 'center', fontSize: 13 }
});
