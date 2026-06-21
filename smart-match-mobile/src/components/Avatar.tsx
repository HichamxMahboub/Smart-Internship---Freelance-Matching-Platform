import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

const palette = [colors.primary, colors.teal, colors.accent, colors.gold, colors.primaryDark, colors.success];

function initials(name?: string) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export function Avatar({ name, uri, size = 44, style }: { name?: string; uri?: string; size?: number; style?: ViewStyle }) {
  const [imageFailed, setImageFailed] = useState(false);
  const tone = palette[(name?.length ?? 0) % palette.length];
  useEffect(() => setImageFailed(false), [uri]);

  if (uri && !imageFailed) {
    return <Image source={{ uri }} onError={() => setImageFailed(true)} style={[{ width: size, height: size, borderRadius: size / 2 }, style as object]} />;
  }

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2, backgroundColor: tone }, style]}>
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.white, fontWeight: '800', letterSpacing: 0.2 }
});
