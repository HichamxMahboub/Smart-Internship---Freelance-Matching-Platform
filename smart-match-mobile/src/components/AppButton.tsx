import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface Props { title: string; onPress?: () => void; variant?: 'primary' | 'secondary' | 'danger'; loading?: boolean; disabled?: boolean; style?: ViewStyle; }
export function AppButton({ title, onPress, variant = 'primary', loading, disabled, style }: Props) {
  return <Pressable disabled={disabled || loading} onPress={onPress} style={[styles.button, styles[variant], (disabled || loading) && styles.disabled, style]}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.text, variant !== 'primary' && styles.darkText]}>{title}</Text>}</Pressable>;
}
const styles = StyleSheet.create({ button: { minHeight: 46, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }, primary: { backgroundColor: colors.primary }, secondary: { backgroundColor: colors.primaryLight }, danger: { backgroundColor: colors.danger }, disabled: { opacity: 0.6 }, text: { color: '#fff', fontWeight: '700' }, darkText: { color: colors.primary } });
