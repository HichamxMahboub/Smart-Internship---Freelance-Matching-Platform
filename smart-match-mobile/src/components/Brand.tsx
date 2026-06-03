import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius, shadow } from '../theme/spacing';

const logo = require('../../assets/logo.png');

/** Square logo lockup (mark + wordmark) straight from the brand asset. */
export function Brand({ size = 96, style }: { size?: number; style?: ViewStyle }) {
  return <Image source={logo} resizeMode="contain" style={[{ width: size, height: size }, style as object]} />;
}

/**
 * Compact logo mark inside a white rounded chip — reads clearly on dark
 * hero surfaces and in headers, mirroring how pro apps badge their mark.
 */
export function BrandMark({ size = 40, radiusValue = radius.md, style }: { size?: number; radiusValue?: number; style?: ViewStyle }) {
  return (
    <View style={[styles.chip, { width: size, height: size, borderRadius: radiusValue }, style]}>
      <Image source={logo} resizeMode="contain" style={{ width: size * 0.84, height: size * 0.84 }} />
    </View>
  );
}

/** Horizontal lockup: mark chip + "Interlance" wordmark, tinted for the surface. */
export function BrandLockup({ size = 34, color = colors.white, style }: { size?: number; color?: string; style?: ViewStyle }) {
  return (
    <View style={[styles.row, style]}>
      <BrandMark size={size} radiusValue={radius.sm} />
      <Text style={[styles.wordmark, { color, fontSize: size * 0.58 }]}>Interlance</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wordmark: { fontWeight: '800', letterSpacing: -0.5 }
});
