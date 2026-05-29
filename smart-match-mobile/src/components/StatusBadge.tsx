import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
export function StatusBadge({ status }: { status: string }) { return <Text style={styles.badge}>{status}</Text>; }
const styles = StyleSheet.create({ badge: { alignSelf: 'flex-start', backgroundColor: colors.primaryLight, color: colors.primary, borderRadius: 999, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 4, fontSize: 12, fontWeight: '700' } });
