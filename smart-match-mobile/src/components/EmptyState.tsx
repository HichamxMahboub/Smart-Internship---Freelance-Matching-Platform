import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';
import { Icon, IconName } from './Icon';
import { AppButton } from './AppButton';

export function EmptyState({
  title,
  message,
  icon = 'search',
  actionLabel,
  onAction
}: {
  title: string;
  message?: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={30} color={colors.primary} bg={colors.primaryLight} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel ? <AppButton title={actionLabel} variant="secondary" size="sm" onPress={onAction} style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 36, paddingHorizontal: 24, alignItems: 'center', gap: 8, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  iconWrap: { width: 64, height: 64, borderRadius: 22, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title: { fontWeight: '800', color: colors.text, fontSize: 17 },
  message: { color: colors.muted, textAlign: 'center', lineHeight: 21, fontSize: 14 },
  action: { marginTop: 8 }
});
