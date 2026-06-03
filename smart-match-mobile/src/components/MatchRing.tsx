import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { matchColors } from '../utils/match';

/**
 * Circular match gauge for detail/profile heroes. Pure-RN (no react-native-svg
 * dependency): a tinted ring + soft fill + percentage. The fill segment count
 * (out of 10 ticks) communicates the level alongside the colour ramp.
 */
export function MatchRing({ score, size = 76, thickness = 7, caption = true }: { score: number; size?: number; thickness?: number; caption?: boolean }) {
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  const c = matchColors(pct);
  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={[StyleSheet.absoluteFill, { borderRadius: size / 2, borderWidth: thickness, borderColor: colors.matchTrack }]} />
        <View style={[StyleSheet.absoluteFill, { borderRadius: size / 2, borderWidth: thickness, borderColor: c.fg, opacity: 0.18 + (pct / 100) * 0.82 }]} />
        <View style={{ width: size - thickness * 4, height: size - thickness * 4, borderRadius: size, backgroundColor: c.soft, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[styles.pct, { color: c.fg, fontSize: size * 0.3 }]}>{pct}</Text>
          <Text style={[styles.unit, { color: c.fg }]}>% match</Text>
        </View>
      </View>
      {caption ? <Text style={[styles.caption, { color: c.fg }]}>{c.label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pct: { fontWeight: '800', letterSpacing: -0.5 },
  unit: { fontWeight: '800', fontSize: 10, letterSpacing: 0.2, marginTop: -2 },
  caption: { fontWeight: '800', fontSize: 12.5, letterSpacing: -0.1 }
});
