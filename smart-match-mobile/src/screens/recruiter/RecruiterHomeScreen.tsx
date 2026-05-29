import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { applicationService } from '../../services/applicationService';
import { companyService } from '../../services/companyService';
import { offerService } from '../../services/offerService';
import { Company } from '../../types';
import { colors } from '../../theme/colors';

export function RecruiterHomeScreen() { const [company, setCompany] = useState<Company | null>(null); const [offersCount, setOffersCount] = useState(0); const [applicationsCount, setApplicationsCount] = useState(0); const [refreshing, setRefreshing] = useState(false); const load = async () => { try { setRefreshing(true); const [companyData, offers, apps] = await Promise.all([companyService.getMine().catch(() => null), offerService.list({ status: 'DRAFT' as any, size: 50 }), applicationService.recruiterApplications()]); setCompany(companyData); setOffersCount(offers.offers.length); setApplicationsCount(apps.length); } catch { Alert.alert('Error', 'Could not load recruiter dashboard.'); } finally { setRefreshing(false); } }; useFocusEffect(useCallback(() => { load(); }, [])); return <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}><Text style={styles.title}>Recruiter dashboard</Text><Text style={styles.card}>Company: {company?.name ?? 'Not created'}\nValidation: {company?.validationStatus ?? 'N/A'}</Text><Text style={styles.card}>Offers: {offersCount}\nApplications: {applicationsCount}</Text></ScrollView>; }
const styles = StyleSheet.create({ container: { flex: 1, padding: 16, backgroundColor: colors.background }, title: { fontSize: 26, fontWeight: '900', color: colors.text, marginBottom: 14 }, card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, lineHeight: 24, color: colors.text } });
