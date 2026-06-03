import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';
import { Icon, IconName } from './Icon';

interface Props extends TextInputProps {
  label?: string;
  helper?: string;
  icon?: IconName;
}

export function AppInput({ label, helper, icon, style, secureTextEntry, multiline, onFocus, onBlur, ...props }: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, multiline && styles.fieldMultiline, focused && styles.fieldFocused]}>
        {icon ? <Icon name={icon} size={18} color={focused ? colors.primary : colors.softText} /> : null}
        <TextInput
          placeholderTextColor={colors.softText}
          secureTextEntry={hidden}
          multiline={multiline}
          style={[styles.input, multiline && styles.multiline, style]}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          {...props}
        />
        {secureTextEntry ? (
          <Pressable hitSlop={8} onPress={() => setHidden((h) => !h)}>
            <Text style={styles.toggle}>{hidden ? 'Show' : 'Hide'}</Text>
          </Pressable>
        ) : null}
      </View>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 7 },
  label: { color: colors.textSoft, fontWeight: '700', fontSize: 13 },
  field: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  fieldMultiline: { minHeight: 110, alignItems: 'flex-start', paddingVertical: 12 },
  fieldFocused: { borderColor: colors.primary, backgroundColor: colors.white },
  input: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '500', paddingVertical: 12 },
  multiline: { textAlignVertical: 'top', minHeight: 86 },
  toggle: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  helper: { color: colors.muted, fontSize: 12.5 }
});
