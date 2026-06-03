import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius, shadow } from '../theme/spacing';
import { Icon, IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const sizeMap: Record<Size, { h: number; font: number; px: number; icon: number }> = {
  sm: { h: 40, font: 14, px: 14, icon: 16 },
  md: { h: 50, font: 15, px: 18, icon: 18 },
  lg: { h: 56, font: 16, px: 22, icon: 20 }
};

export function AppButton({ title, onPress, variant = 'primary', size = 'md', icon, loading, disabled, style }: Props) {
  const isLight = variant === 'secondary' || variant === 'ghost';
  const fg = variant === 'secondary' ? colors.primary : isLight ? colors.text : colors.white;
  const dims = sizeMap[size];
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { minHeight: dims.h, paddingHorizontal: dims.px },
        styles[variant],
        pressed && !disabled && styles.pressed,
        (disabled || loading) && styles.disabled,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={dims.icon} color={fg} /> : null}
          <Text style={[styles.text, { color: fg, fontSize: dims.font }]} numberOfLines={1}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  primary: { backgroundColor: colors.primary },
  accent: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primarySoft },
  danger: { backgroundColor: colors.danger },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
  text: { fontWeight: '700', letterSpacing: 0.1 }
});
