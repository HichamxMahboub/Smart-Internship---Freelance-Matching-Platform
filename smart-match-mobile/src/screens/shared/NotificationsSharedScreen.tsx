import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppButton } from '../../components/AppButton';
import { EmptyState } from '../../components/EmptyState';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types';
import { colors } from '../../theme/colors';

export function NotificationsScreen() { const [items, setItems] = useState<Notification[]>([]); const [refreshing, setRefreshing] = useState(false); const load = async () => { setRefreshing(true); try { setItems(await notificationService.list()); } finally { setRefreshing(false); } }; useFocusEffect(useCallback(() => { load(); }, [])); const markRead = async (id: string) => { await notificationService.markRead(id); load(); }; const markAll = async () => { setItems(await notificationService.markAllRead()); }; return <View style={styles.container}><AppButton title="Mark all read" variant="secondary" onPress={markAll} /><FlatList data={items} keyExtractor={(item) => item.id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />} contentContainerStyle={styles.list} ListEmptyComponent={<EmptyState title="No notifications" />} renderItem={({ item }) => <View style={[styles.card, !item.read && styles.unread]}><Text style={styles.title}>{item.title}</Text><Text style={styles.message}>{item.message}</Text><Text style={styles.meta}>{item.type}</Text><AppButton title={item.read ? 'Read' : 'Mark read'} disabled={item.read} variant="secondary" onPress={() => markRead(item.id)} /></View>} /></View>; }
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background, padding: 16, gap: 10 }, list: { gap: 12 }, card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 8, borderColor: colors.border, borderWidth: 1 }, unread: { borderLeftWidth: 5, borderLeftColor: colors.primary }, title: { fontWeight: '800', color: colors.text }, message: { color: colors.text }, meta: { color: colors.muted, fontSize: 12 } });
