import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';

function badgeColors(status: string) {
  const n = status.toUpperCase();
  if (['PUBLISHED', 'APPROVED', 'ACCEPTED', 'ACTIVE', 'INTERNSHIP'].includes(n)) return { bg: colors.successSoft, fg: colors.success };
  if (['PENDING', 'INTERVIEW', 'DRAFT', 'FREELANCE'].includes(n)) return { bg: colors.warningSoft, fg: colors.warning };
  if (['REJECTED', 'ARCHIVED', 'BLOCKED', 'EXPIRED', 'CANCELLED'].includes(n)) return { bg: colors.dangerSoft, fg: colors.danger };
  return { bg: colors.primaryLight, fg: colors.primary };
}

export function StatusBadge({ status }: { status: string }) {
  const tone = badgeColors(status);
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <View style={[styles.dot, { backgroundColor: tone.fg }]} />
      <Text style={[styles.label, { color: tone.fg }]}>{status.replace(/_/g, ' ')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 }
});
