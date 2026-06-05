import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Linking, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { Avatar } from '../../components/Avatar';
import { useAuth } from '../../auth/AuthContext';
import { chatService } from '../../services/chatService';
import { realtimeClient } from '../../services/realtimeClient';
import { Conversation, Message } from '../../types';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const URL_RE = /(https?:\/\/[^\s]+)/;

/** First URL in a message (trailing punctuation trimmed), or null. */
function firstUrl(text: string): string | null {
  const match = text.match(URL_RE);
  return match ? match[0].replace(/[).,]+$/, '') : null;
}

export function ChatScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const conversationId = route.params?.conversationId as string;
  const paramName = route.params?.displayName as string | undefined;
  const paramAvatar = route.params?.displayAvatarUrl as string | undefined;
  const paramOffer = route.params?.offerTitle as string | undefined;

  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [meta, setMeta] = useState<Pick<Conversation, 'displayName' | 'displayAvatarUrl' | 'offerTitle'>>({
    displayName: paramName,
    displayAvatarUrl: paramAvatar,
    offerTitle: paramOffer
  });
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  const displayName = meta.displayName?.trim() || 'Conversation';
  const avatarUri = resolveMediaUrl(meta.displayAvatarUrl);

  useEffect(() => {
    if (paramName) return;
    chatService
      .conversations()
      .then((list) => {
        const match = list.find((c) => c.id === conversationId);
        if (match) {
          setMeta({
            displayName: match.displayName,
            displayAvatarUrl: match.displayAvatarUrl,
            offerTitle: match.offerTitle
          });
        }
      })
      .catch(() => undefined);
  }, [conversationId, paramName]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleRow}>
          <Avatar name={displayName} uri={avatarUri} size={34} />
          <View style={styles.headerTitle}>
            <Text style={styles.headerName} numberOfLines={1}>
              {displayName}
            </Text>
            {meta.offerTitle ? (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {meta.offerTitle}
              </Text>
            ) : null}
          </View>
        </View>
      )
    });
  }, [navigation, displayName, avatarUri, meta.offerTitle]);

  useEffect(() => {
    chatService.messages(conversationId).then(setMessages).catch(() => undefined);
    return realtimeClient.onMessage((message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      }
    });
  }, [conversationId]);

  const send = async () => {
    const content = draft.trim();
    if (!content) return;
    setSending(true);
    try {
      const sent = await chatService.send(conversationId, content);
      setMessages((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]));
      setDraft('');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.empty}>
            <EmptyState icon="chat" title="No messages yet" message="Say hello to start the conversation." />
          </View>
        }
        renderItem={({ item }) => {
          const mine = item.senderId === user?.id;
          const url = firstUrl(item.content);
          return (
            <View style={[styles.bubbleRow, mine ? styles.rowMine : styles.rowTheirs]}>
              <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                <Text style={mine ? styles.mineText : styles.theirsText}>{item.content}</Text>
                {url ? (
                  <Pressable
                    onPress={() => Linking.openURL(url)}
                    style={({ pressed }) => [styles.joinBtn, pressed && { opacity: 0.85 }]}
                  >
                    <Text style={styles.joinText}>🎥  Join meeting</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        }}
      />
      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message…"
          placeholderTextColor={colors.softText}
          style={styles.input}
          multiline
        />
        <Pressable
          onPress={send}
          disabled={sending || !draft.trim()}
          style={({ pressed }) => [styles.send, (!draft.trim() || sending) && styles.sendDisabled, pressed && { opacity: 0.85 }]}
        >
          <Icon name="send" size={20} color={colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, maxWidth: 260 },
  headerTitle: { flexShrink: 1 },
  headerName: { color: colors.text, fontWeight: '800', fontSize: 16 },
  headerSubtitle: { color: colors.softText, fontSize: 12, fontWeight: '600', marginTop: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, gap: 8, flexGrow: 1 },
  empty: { flex: 1, justifyContent: 'center' },
  bubbleRow: { flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '78%', borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 10 },
  mine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  theirs: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  mineText: { color: colors.white, fontSize: 14.5, lineHeight: 20 },
  theirsText: { color: colors.text, fontSize: 14.5, lineHeight: 20 },
  joinBtn: {
    marginTop: 10,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center'
  },
  joinText: { color: colors.white, fontWeight: '800', fontSize: 14 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.white
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 46,
    borderRadius: radius.xl,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    color: colors.text,
    fontSize: 15
  },
  send: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendDisabled: { backgroundColor: colors.borderStrong }
});
