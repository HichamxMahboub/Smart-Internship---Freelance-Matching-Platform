import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
export function LoadingView({ label = 'Loading...' }: { label?: string }) { return <View style={styles.container}><ActivityIndicator color={colors.primary} /><Text>{label}</Text></View>; }
const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 } });
