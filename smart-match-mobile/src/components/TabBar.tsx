import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { shadow } from '../theme/spacing';
import { Icon, IconName } from './Icon';

const iconMap: Record<string, IconName> = {
  Home: 'home',
  Offers: 'briefcase',
  Applications: 'document',
  Messages: 'chat',
  Profile: 'user'
};
const labelMap: Record<string, string> = {
  Home: 'Home',
  Offers: 'Offers',
  Applications: 'Activity',
  Messages: 'Messages',
  Profile: 'Profile'
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const color = focused ? colors.primary : colors.softText;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tab}>
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Icon name={iconMap[route.name] ?? 'home'} size={23} color={color} bg={focused ? colors.primaryLight : colors.white} />
            </View>
            <Text style={[styles.label, { color }]} numberOfLines={1}>{labelMap[route.name] ?? route.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 8, ...shadow.medium },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  iconWrap: { width: 46, height: 30, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: colors.primaryLight },
  label: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.1 }
});
