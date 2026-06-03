import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';

type Tone = 'neutral' | 'brand' | 'teal' | 'accent';

const tones: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.backgroundAlt, fg: colors.textSoft },
  brand: { bg: colors.primaryLight, fg: colors.primary },
  teal: { bg: colors.tealSoft, fg: colors.teal },
  accent: { bg: colors.accentSoft, fg: colors.accent }
};

/** Static label pill (skills, tags). */
export function Chip({ label, tone = 'brand', style }: { label: string; tone?: Tone; style?: ViewStyle }) {
  const t = tones[tone];
  return (
    <View style={[styles.chip, { backgroundColor: t.bg }, style]}>
      <Text style={[styles.text, { color: t.fg }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

/** Selectable filter chip (offer list, segmented choices). */
export function FilterChip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.filter, active && styles.filterActive, pressed && styles.pressed]}>
      <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 6, alignSelf: 'flex-start' },
  text: { fontSize: 12.5, fontWeight: '600' },
  filter: { borderRadius: radius.pill, paddingHorizontal: 15, paddingVertical: 9, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  filterActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  filterText: { color: colors.textSoft, fontWeight: '600', fontSize: 13.5 },
  filterTextActive: { color: colors.white },
  pressed: { opacity: 0.7 }
});
