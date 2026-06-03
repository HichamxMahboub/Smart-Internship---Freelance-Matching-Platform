import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';
import { Icon, IconName } from './Icon';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.track}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable key={opt.value} onPress={() => onChange(opt.value)} style={[styles.segment, active && styles.segmentActive]}>
            {opt.icon ? <Icon name={opt.icon} size={16} color={active ? colors.primary : colors.muted} bg={active ? colors.white : colors.backgroundAlt} /> : null}
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', backgroundColor: colors.backgroundAlt, borderRadius: radius.md, padding: 4, gap: 4 },
  segment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 11, borderRadius: radius.sm },
  segmentActive: { backgroundColor: colors.white, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 5, elevation: 2 },
  label: { color: colors.muted, fontWeight: '700', fontSize: 14 },
  labelActive: { color: colors.text }
});
