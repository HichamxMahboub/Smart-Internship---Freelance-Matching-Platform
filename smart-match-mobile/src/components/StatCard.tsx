import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, shadow } from '../theme/spacing';
import { Icon, IconName } from './Icon';

type Tone = 'primary' | 'teal' | 'accent' | 'gold';

const toneMap: Record<Tone, { bg: string; fg: string }> = {
  primary: { bg: colors.primaryLight, fg: colors.primary },
  teal: { bg: colors.tealSoft, fg: colors.teal },
  accent: { bg: colors.accentSoft, fg: colors.accent },
  gold: { bg: colors.goldSoft, fg: colors.gold }
};

export function StatCard({ label, value, tone = 'primary', icon }: { label: string; value: string | number; tone?: Tone; icon?: IconName }) {
  const t = toneMap[tone];
  return (
    <View style={styles.card}>
      {icon ? (
        <View style={[styles.iconChip, { backgroundColor: t.bg }]}>
          <Icon name={icon} size={18} color={t.fg} bg={t.bg} />
        </View>
      ) : null}
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{value}</Text>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: radius.lg, padding: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, gap: 6, ...shadow.xs },
  iconChip: { width: 34, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  value: { color: colors.text, fontSize: 20, fontWeight: '700', letterSpacing: -0.2 },
  label: { color: colors.muted, fontSize: 12, fontWeight: '500' }
});
