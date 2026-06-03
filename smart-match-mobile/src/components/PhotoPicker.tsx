import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, shadow } from '../theme/spacing';
import { Avatar } from './Avatar';
import { AppInput } from './AppInput';
import { AppButton } from './AppButton';
import { Icon } from './Icon';

/**
 * Avatar with an edit affordance. No-dep path (npm registry blocked): tapping
 * opens a sheet to paste an image URL. Native gallery picker (expo-image-picker)
 * can replace the sheet once the registry is reachable.
 */
export function PhotoPicker({ name, uri, size = 96, onChange, editable = true }: { name?: string; uri?: string; size?: number; onChange?: (url: string) => void; editable?: boolean }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(uri ?? '');

  const save = () => { onChange?.(draft.trim()); setOpen(false); };

  return (
    <View>
      <Pressable disabled={!editable} onPress={() => { setDraft(uri ?? ''); setOpen(true); }} style={({ pressed }) => [pressed && editable && styles.pressed]}>
        <Avatar name={name} uri={uri} size={size} />
        {editable ? (
          <View style={[styles.badge, { right: size * 0.02, bottom: size * 0.02 }]}>
            <Icon name="edit" size={14} color={colors.white} bg={colors.primary} />
          </View>
        ) : null}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.scrim} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>Profile photo</Text>
            <Text style={styles.hint}>Paste an image link. Gallery upload arrives with the next build.</Text>
            <View style={styles.preview}><Avatar name={name} uri={draft || undefined} size={72} /></View>
            <AppInput label="Image URL" value={draft} onChangeText={setDraft} placeholder="https://…" autoCapitalize="none" />
            <View style={styles.row}>
              {draft ? <AppButton title="Remove" variant="ghost" size="sm" onPress={() => { onChange?.(''); setOpen(false); }} style={styles.flex} /> : null}
              <AppButton title="Save photo" icon="check" size="sm" onPress={save} style={styles.flex} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  badge: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.white },
  scrim: { flex: 1, backgroundColor: colors.scrim, justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 22, paddingBottom: 34, gap: 12, ...shadow.medium },
  title: { color: colors.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: -4 },
  preview: { alignItems: 'center', paddingVertical: 6 },
  row: { flexDirection: 'row', gap: 10, marginTop: 4 },
  flex: { flex: 1 }
});
