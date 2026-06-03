import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';
import { Icon, IconName } from './Icon';

/**
 * One row in an experience / education timeline (LinkedIn-style). A node + line
 * on the left, title/subtitle/period on the right.
 */
export function TimelineItem({
  icon = 'briefcase',
  title,
  subtitle,
  period,
  description,
  last,
  onEdit
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  period?: string;
  description?: string;
  last?: boolean;
  onEdit?: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View style={styles.node}><Icon name={icon} size={15} color={colors.primary} bg={colors.primaryLight} /></View>
        {!last ? <View style={styles.line} /> : null}
      </View>
      <View style={[styles.body, !last && styles.bodyGap]}>
        <View style={styles.headRow}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          {onEdit ? (
            <Pressable hitSlop={8} onPress={onEdit}><Icon name="edit" size={14} color={colors.muted} /></Pressable>
          ) : null}
        </View>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        {period ? <Text style={styles.period}>{period}</Text> : null}
        {description ? <Text style={styles.desc}>{description}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 34 },
  node: { width: 34, height: 34, borderRadius: radius.sm, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  line: { flex: 1, width: 2, backgroundColor: colors.divider, marginTop: 2 },
  body: { flex: 1, paddingTop: 2 },
  bodyGap: { paddingBottom: 18 },
  headRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, color: colors.text, fontWeight: '800', fontSize: 14.5, letterSpacing: -0.2 },
  subtitle: { color: colors.textSoft, fontWeight: '600', fontSize: 13, marginTop: 1 },
  period: { color: colors.muted, fontSize: 12, fontWeight: '600', marginTop: 2 },
  desc: { color: colors.muted, fontSize: 12.5, lineHeight: 18, marginTop: 4 }
});
