import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';

/** Thin track + fill. Used for onboarding steps and profile completeness. */
export function ProgressBar({ value, color = colors.primary, height = 8, style }: { value: number; color?: string; height?: number; style?: ViewStyle }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={[styles.track, { height, borderRadius: height }, style]}>
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color, borderRadius: height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', backgroundColor: colors.matchTrack, overflow: 'hidden' },
  fill: { height: '100%', minWidth: 6, borderRadius: radius.pill }
});
