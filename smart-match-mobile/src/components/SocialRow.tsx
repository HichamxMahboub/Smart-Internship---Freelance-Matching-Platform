import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';
import { Icon, IconName } from './Icon';
import { SocialLinks } from '../types';

const META: { key: keyof SocialLinks; label: string; icon: IconName }[] = [
  { key: 'github', label: 'GitHub', icon: 'globe' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'globe' },
  { key: 'website', label: 'Website', icon: 'globe' },
  { key: 'other', label: 'Link', icon: 'globe' }
];

function open(url?: string) {
  if (!url) return;
  const full = /^https?:\/\//.test(url) ? url : `https://${url}`;
  Linking.openURL(full).catch(() => undefined);
}

/** Read-only list of a candidate's social/portfolio links. */
export function SocialRow({ socials }: { socials?: SocialLinks }) {
  const items = META.filter((m) => socials?.[m.key]);
  if (!items.length) return null;
  return (
    <View style={styles.wrap}>
      {items.map((m) => (
        <Pressable key={m.key} onPress={() => open(socials?.[m.key])} style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
          <Icon name={m.icon} size={14} color={colors.primary} />
          <Text style={styles.label}>{m.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primaryLight, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 },
  pressed: { opacity: 0.7 },
  label: { color: colors.primary, fontWeight: '700', fontSize: 13 }
});
