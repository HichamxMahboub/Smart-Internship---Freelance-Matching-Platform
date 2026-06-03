import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { Brand } from './Brand';

const nativeDriver = Platform.OS !== 'web';

export function LoadingView({ label = 'Preparing Interlance…' }: { label?: string }) {
  const pulse = useRef(new Animated.Value(0.9)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 720, useNativeDriver: nativeDriver }),
        Animated.timing(pulse, { toValue: 0.9, duration: 720, useNativeDriver: nativeDriver })
      ])
    ).start();
  }, [pulse]);
  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Brand size={108} />
      </Animated.View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, backgroundColor: colors.background },
  label: { color: colors.muted, fontWeight: '600', fontSize: 14 }
});
