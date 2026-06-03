import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';
import { matchColors } from '../utils/match';

/**
 * Compact "match level" pill — colored dot + percentage. Surfaced on offer
 * cards, applications, and candidate rows so fit is visible at a glance.
 */
export function MatchBadge({ score, size = 'md', showLabel, style }: { score: number; size?: 'sm' | 'md'; showLabel?: boolean; style?: ViewStyle }) {
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  const c = matchColors(pct);
  const sm = size === 'sm';
  return (
    <View style={[styles.wrap, { backgroundColor: c.soft, paddingVertical: sm ? 4 : 6, paddingHorizontal: sm ? 8 : 10 }, style]}>
      <View style={[styles.dot, { backgroundColor: c.fg, width: sm ? 6 : 7, height: sm ? 6 : 7 }]} />
      <Text style={[styles.pct, { color: c.fg, fontSize: sm ? 12 : 13 }]}>{pct}%</Text>
      {showLabel ? <Text style={[styles.label, { color: c.fg }]}>{c.label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radius.pill, alignSelf: 'flex-start' },
  dot: { borderRadius: 4 },
  pct: { fontWeight: '800', letterSpacing: -0.2 },
  label: { fontWeight: '700', fontSize: 11.5, marginLeft: 1 }
});
