import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { applicationService } from '../../services/applicationService';
import { Application } from '../../types';
import { colors } from '../../theme/colors';

export function ApplicationsScreen() { const [items, setItems] = useState<Application[]>([]); const [refreshing, setRefreshing] = useState(false); const load = async () => { setRefreshing(true); try { setItems(await applicationService.myApplications()); } finally { setRefreshing(false); } }; useFocusEffect(useCallback(() => { load(); }, [])); return <FlatList style={styles.container} contentContainerStyle={styles.list} data={items} keyExtractor={(item) => item.id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />} ListEmptyComponent={<EmptyState title="No applications" message="Apply to an offer to track it here." />} renderItem={({ item }) => <View style={styles.card}><Text style={styles.title}>Offer {item.offerId}</Text><StatusBadge status={item.status} /><Text style={styles.message}>{item.message}</Text></View>} />; }
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background }, list: { padding: 16, gap: 12 }, card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 8, borderColor: colors.border, borderWidth: 1 }, title: { fontWeight: '800', color: colors.text }, message: { color: colors.muted } });
