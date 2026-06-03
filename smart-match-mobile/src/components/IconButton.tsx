import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';
import { Icon, IconName } from './Icon';

export function IconButton({
  icon,
  onPress,
  color = colors.text,
  bg = colors.backgroundAlt,
  size = 42,
  badge,
  style
}: {
  icon: IconName;
  onPress?: () => void;
  color?: string;
  bg?: string;
  size?: number;
  badge?: number | boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, { width: size, height: size, borderRadius: radius.md, backgroundColor: bg }, pressed && styles.pressed, style]}>
      <Icon name={icon} size={size * 0.5} color={color} bg={bg} />
      {badge ? (
        <View style={styles.badge}>
          {typeof badge === 'number' && badge > 0 ? <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text> : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.6 },
  badge: { position: 'absolute', top: 6, right: 6, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: colors.white },
  badgeText: { color: colors.white, fontSize: 9.5, fontWeight: '800' }
});
