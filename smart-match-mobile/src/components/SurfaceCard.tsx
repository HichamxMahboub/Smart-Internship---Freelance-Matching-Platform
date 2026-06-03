import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius, shadow } from '../theme/spacing';

export function SurfaceCard({ children, style, flat }: { children: React.ReactNode; style?: ViewStyle; flat?: boolean }) {
  return <View style={[styles.card, !flat && shadow.soft, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18
  }
});
