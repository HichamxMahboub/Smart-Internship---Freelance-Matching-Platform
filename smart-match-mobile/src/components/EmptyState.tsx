import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
export function EmptyState({ title, message }: { title: string; message?: string }) { return <View style={styles.container}><Text style={styles.title}>{title}</Text>{message ? <Text style={styles.message}>{message}</Text> : null}</View>; }
const styles = StyleSheet.create({ container: { padding: 24, alignItems: 'center', gap: 6 }, title: { fontWeight: '700', color: colors.text }, message: { color: colors.muted, textAlign: 'center' } });
