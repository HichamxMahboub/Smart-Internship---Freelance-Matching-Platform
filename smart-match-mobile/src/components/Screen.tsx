import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

export function Screen({ children, scroll = false, style, contentStyle }: { children: React.ReactNode; scroll?: boolean; style?: ViewStyle; contentStyle?: ViewStyle }) {
  if (scroll) {
    return (
      <SafeAreaView style={[styles.safe, style]} edges={['left', 'right']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, contentStyle]}>
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return <SafeAreaView style={[styles.safe, styles.content, style]} edges={['left', 'right']}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  scrollContent: { padding: 20, paddingBottom: 32 }
});
