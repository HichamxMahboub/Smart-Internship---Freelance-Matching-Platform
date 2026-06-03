import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { EmptyState } from '../../components/EmptyState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Avatar } from '../../components/Avatar';
import { chatService } from '../../services/chatService';
import { realtimeClient } from '../../services/realtimeClient';
import { Conversation } from '../../types';
import { colors } from '../../theme/colors';

function timeLabel(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function ConversationsScreen() {
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<Conversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const load = async () => { setRefreshing(true); try { setItems(await chatService.conversations()); } finally { setRefreshing(false); } };
  useFocusEffect(useCallback(() => { load(); }, []));
  useEffect(() => realtimeClient.onMessage(() => { load(); }), []);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Messages" subtitle={`${items.length} conversations`} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.primary} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<View style={styles.empty}><EmptyState icon="chat" title="No conversations" message="Start a chat from an offer or an application." /></View>}
        renderItem={({ item }) => {
          const unread = item.unread > 0;
          return (
            <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={() => navigation.navigate('Chat', { conversationId: item.id })}>
              <Avatar name={'Conversation'} size={50} />
              <View style={styles.body}>
                <View style={styles.row}>
                  <Text style={[styles.title, unread && styles.titleUnread]} numberOfLines={1}>Conversation</Text>
                  <Text style={styles.time}>{timeLabel(item.lastMessageAt)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={[styles.message, unread && styles.messageUnread]} numberOfLines={1}>{item.lastMessage ?? 'No messages yet'}</Text>
                  {unread ? <View style={styles.badge}><Text style={styles.badgeText}>{item.unread > 9 ? '9+' : item.unread}</Text></View> : null}
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { paddingVertical: 8, paddingHorizontal: 12, flexGrow: 1 },
  empty: { padding: 8 },
  separator: { height: 1, backgroundColor: colors.divider, marginLeft: 74 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 14 },
  pressed: { backgroundColor: colors.white },
  body: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { color: colors.text, fontWeight: '700', fontSize: 15, flex: 1 },
  titleUnread: { fontWeight: '800' },
  time: { color: colors.softText, fontSize: 12, fontWeight: '600' },
  message: { color: colors.muted, fontSize: 13.5, flex: 1 },
  messageUnread: { color: colors.text, fontWeight: '600' },
  badge: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { color: colors.white, fontWeight: '800', fontSize: 11 }
});
