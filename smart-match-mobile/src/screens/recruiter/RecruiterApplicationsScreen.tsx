import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppButton } from '../../components/AppButton';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { applicationService } from '../../services/applicationService';
import { Application, ApplicationStatus } from '../../types';
import { colors } from '../../theme/colors';

export function RecruiterApplicationsScreen() { const [items, setItems] = useState<Application[]>([]); const [refreshing, setRefreshing] = useState(false); const load = async () => { setRefreshing(true); try { setItems(await applicationService.recruiterApplications()); } finally { setRefreshing(false); } }; useFocusEffect(useCallback(() => { load(); }, [])); const setStatus = async (id: string, status: ApplicationStatus) => { try { await applicationService.updateStatus(id, status); load(); } catch { Alert.alert('Error', 'Could not update application.'); } }; return <FlatList style={styles.container} contentContainerStyle={styles.list} data={items} keyExtractor={(item) => item.id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />} ListEmptyComponent={<EmptyState title="No applications" />} renderItem={({ item }) => <View style={styles.card}><Text style={styles.title}>Candidate {item.candidateId}</Text><Text style={styles.message}>{item.message}</Text><StatusBadge status={item.status} /><View style={styles.actions}><AppButton title="Interview" onPress={() => setStatus(item.id, 'INTERVIEW')} style={styles.action} /><AppButton title="Accept" onPress={() => setStatus(item.id, 'ACCEPTED')} style={styles.action} /><AppButton title="Reject" variant="danger" onPress={() => setStatus(item.id, 'REJECTED')} style={styles.action} /></View></View>} />; }
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background }, list: { padding: 16, gap: 12 }, card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 8, borderColor: colors.border, borderWidth: 1 }, title: { fontWeight: '800', color: colors.text }, message: { color: colors.muted }, actions: { flexDirection: 'row', gap: 6 }, action: { flex: 1 } });
