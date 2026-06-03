import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { BrandMark } from './Brand';
import { IconButton } from './IconButton';

/**
 * Branded top bar for main tab screens (headers are hidden at the navigator
 * level so we control spacing, the logo mark, and quick actions).
 */
export function ScreenHeader({
  title,
  subtitle,
  brand,
  onBack,
  right
}: {
  title: string;
  subtitle?: string;
  brand?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <View style={styles.left}>
        {onBack ? <IconButton icon="chevron-left" onPress={onBack} /> : null}
        {brand ? <BrandMark size={42} /> : null}
        <View style={styles.titleBlock}>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
        </View>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 12, backgroundColor: colors.background, gap: 12 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  titleBlock: { flex: 1 },
  subtitle: { color: colors.muted, fontSize: 12.5, fontWeight: '500', marginBottom: 2 },
  title: { color: colors.text, fontSize: 20, fontWeight: '700', letterSpacing: -0.2 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 }
});
