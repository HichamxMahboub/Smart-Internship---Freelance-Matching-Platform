import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../theme/colors';

interface Props extends TextInputProps { label: string; }
export function AppInput({ label, style, ...props }: Props) {
  return <View style={styles.wrapper}><Text style={styles.label}>{label}</Text><TextInput placeholderTextColor="#98a2b3" style={[styles.input, style]} {...props} /></View>;
}
const styles = StyleSheet.create({ wrapper: { gap: 6 }, label: { color: colors.text, fontWeight: '600' }, input: { minHeight: 46, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff', paddingHorizontal: 12, color: colors.text } });
