import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../auth/AuthContext';
import { AppButton } from '../../components/AppButton';
import { StatCard } from '../../components/StatCard';
import { SurfaceCard } from '../../components/SurfaceCard';
import { StatusBadge } from '../../components/StatusBadge';
import { ScreenHeader } from '../../components/ScreenHeader';
import { IconButton } from '../../components/IconButton';
import { Icon } from '../../components/Icon';
import { applicationService } from '../../services/applicationService';
import { companyService } from '../../services/companyService';
import { offerService } from '../../services/offerService';
import { Company } from '../../types';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';

export function RecruiterHomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [company, setCompany] = useState<Company | null>(null);
  const [offersCount, setOffersCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const load = async () => {
    try {
      setRefreshing(true);
      const [companyData, offers, apps] = await Promise.all([
        companyService.getMine().catch(() => null),
        offerService.list({ status: 'DRAFT' as any, size: 50 }),
        applicationService.recruiterApplications()
      ]);
      setCompany(companyData); setOffersCount(offers.offers.length); setApplicationsCount(apps.length);
    } catch { Alert.alert('Error', 'Could not load recruiter dashboard.'); }
    finally { setRefreshing(false); }
  };
  useFocusEffect(useCallback(() => { load(); }, []));
  const approved = company?.validationStatus === 'APPROVED';

  return (
    <View style={styles.screen}>
      <ScreenHeader
        brand
        subtitle="Recruiter"
        title={user?.fullName?.split(' ')[0] || 'there'}
        right={<IconButton icon="bell" onPress={() => navigation.navigate('Notifications')} />}
      />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.primary} />} showsVerticalScrollIndicator={false}>
        <View style={styles.cta}>
          <View style={styles.ctaTop}>
            <View style={styles.ctaIcon}><Icon name="plus" size={22} color={colors.white} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>Post a new role</Text>
              <Text style={styles.ctaCaption}>Reach matched internship & freelance talent.</Text>
            </View>
          </View>
          <AppButton title="Create opportunity" icon="briefcase" variant="secondary" onPress={() => navigation.navigate('OfferForm')} />
        </View>

        <View style={styles.stats}>
          <StatCard label="Open drafts" value={offersCount} icon="briefcase" tone="primary" />
          <StatCard label="Applications" value={applicationsCount} icon="document" tone="teal" />
        </View>

        <SurfaceCard style={styles.company}>
          <View style={styles.companyHead}>
            <View style={styles.companyIcon}><Icon name="building" size={20} color={colors.primary} bg={colors.primaryLight} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.companyName} numberOfLines={1}>{company?.name ?? 'Company not created'}</Text>
              <StatusBadge status={company?.validationStatus ?? 'PENDING'} />
            </View>
          </View>
          <Text style={styles.companyNote}>{approved ? 'Your company is approved — publish offers anytime.' : 'Only approved companies can publish public offers. Complete your profile for faster validation.'}</Text>
          <AppButton title={company ? 'Manage company' : 'Create company'} icon="edit" variant="ghost" size="sm" onPress={() => navigation.navigate('Company')} />
        </SurfaceCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingTop: 4, gap: 16, paddingBottom: 28 },
  cta: { backgroundColor: colors.ink, borderRadius: radius.lg, padding: 18, gap: 16 },
  ctaTop: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  ctaIcon: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  ctaTitle: { color: colors.white, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  ctaCaption: { color: 'rgba(255,255,255,0.66)', fontSize: 13, lineHeight: 18, marginTop: 2 },
  stats: { flexDirection: 'row', gap: 10 },
  company: { gap: 12 },
  companyHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  companyIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  companyName: { color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: 5 },
  companyNote: { color: colors.muted, lineHeight: 20, fontSize: 13.5 }
});
