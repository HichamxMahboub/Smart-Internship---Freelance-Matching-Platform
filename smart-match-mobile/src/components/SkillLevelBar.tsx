import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  name: string;
  level: number;
  matched?: boolean;
}

export function SkillLevelBar({ name, level, matched }: Props) {
  const pct = Math.max(0, Math.min(100, level));
  const tone = matched ? colors.matchHigh : pct >= 75 ? colors.success : pct >= 50 ? colors.primary : colors.muted;
  return (
    <View style={styles.row}>
      <View style={styles.head}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={[styles.level, { color: tone }]}>{Math.round(pct)}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: tone }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 5 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: colors.text, fontWeight: '700', fontSize: 13.5, flex: 1, marginRight: 8 },
  level: { fontWeight: '800', fontSize: 12.5 },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 }
});
