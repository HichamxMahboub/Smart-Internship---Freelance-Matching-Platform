import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { Icon } from './Icon';

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} style={styles.actionRow} hitSlop={8}>
          <Text style={styles.action}>{action}</Text>
          {onAction ? <Icon name="chevron-right" size={14} color={colors.primary} /> : null}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 4 },
  title: { color: colors.text, fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  action: { color: colors.primary, fontWeight: '600', fontSize: 13.5 }
});
