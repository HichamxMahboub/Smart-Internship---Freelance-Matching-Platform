import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { EmptyState } from '../../components/EmptyState';
import { Icon, IconName } from '../../components/Icon';
import { notificationService } from '../../services/notificationService';
import { Notification, NotificationType } from '../../types';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';

const typeIcon: Record<NotificationType, IconName> = {
  APPLICATION: 'document',
  OFFER: 'briefcase',
  SUBSCRIPTION: 'star',
  PAYMENT: 'check',
  AI: 'sparkles',
  ADMIN: 'shield'
};

export function NotificationsScreen() {
  const [items, setItems] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const load = async () => { setRefreshing(true); try { setItems(await notificationService.list()); } finally { setRefreshing(false); } };
  useFocusEffect(useCallback(() => { load(); }, []));
  const markRead = async (id: string) => { await notificationService.markRead(id); load(); };
  const markAll = async () => { setItems(await notificationService.markAllRead()); };
  const unreadCount = items.filter((i) => !i.read).length;

  return (
    <View style={styles.container}>
      {items.length ? (
        <View style={styles.bar}>
          <Text style={styles.barText}>{unreadCount} unread</Text>
          <Pressable onPress={markAll} hitSlop={8}><Text style={styles.markAll}>Mark all read</Text></Pressable>
        </View>
      ) : null}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.primary} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="bell" title="No notifications" message="Updates about applications, offers, and AI will show up here." />}
        renderItem={({ item }) => (
          <Pressable onPress={() => !item.read && markRead(item.id)} style={({ pressed }) => [styles.card, !item.read && styles.unread, pressed && { opacity: 0.92 }]}>
            <View style={[styles.iconChip, !item.read && styles.iconChipUnread]}>
              <Icon name={typeIcon[item.type] ?? 'bell'} size={18} color={item.read ? colors.muted : colors.primary} bg={item.read ? colors.backgroundAlt : colors.primaryLight} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, !item.read && styles.titleUnread]} numberOfLines={1}>{item.title}</Text>
                {!item.read ? <View style={styles.dot} /> : null}
              </View>
              <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
              <Text style={styles.type}>{item.type}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  bar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 12 },
  barText: { color: colors.muted, fontWeight: '600', fontSize: 13 },
  markAll: { color: colors.primary, fontWeight: '800', fontSize: 13.5 },
  list: { paddingHorizontal: 16, paddingBottom: 28, gap: 10, flexGrow: 1 },
  card: { flexDirection: 'row', gap: 12, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14 },
  unread: { borderColor: colors.primarySoft, backgroundColor: colors.white },
  iconChip: { width: 38, height: 38, borderRadius: radius.sm, backgroundColor: colors.backgroundAlt, alignItems: 'center', justifyContent: 'center' },
  iconChipUnread: { backgroundColor: colors.primaryLight },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: colors.text, fontWeight: '700', fontSize: 15, flex: 1 },
  titleUnread: { fontWeight: '800' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  message: { color: colors.muted, lineHeight: 19, fontSize: 13.5 },
  type: { color: colors.softText, fontSize: 11, fontWeight: '700', letterSpacing: 0.4, marginTop: 1 }
});
