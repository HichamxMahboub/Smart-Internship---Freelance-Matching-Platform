import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { radius, shadow } from '../theme/spacing';
import { Icon, IconName } from './Icon';

interface Props {
  label: string;
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helper?: string;
  icon?: IconName;
  allowCustom?: boolean;
}

export function OptionPicker({ label, options, value, onChange, placeholder, helper, icon, allowCustom = true }: Props) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter((opt) => !q || opt.toLowerCase().includes(q));
  }, [options, query]);

  const customAvailable = allowCustom
    && query.trim().length > 0
    && !options.some((o) => o.toLowerCase() === query.trim().toLowerCase());

  const pick = (v: string) => {
    onChange(v.trim());
    setQuery('');
    setOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={() => setOpen(true)} style={styles.field}>
        {icon ? <Icon name={icon} size={18} color={colors.softText} /> : null}
        <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {value || placeholder || 'Tap to pick'}
        </Text>
        <Icon name="chevron-right" size={16} color={colors.softText} />
      </Pressable>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.scrim}>
          <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 14 }]}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <Icon name="close" size={18} color={colors.muted} />
              </Pressable>
            </View>

            <View style={styles.search}>
              <Icon name="search" size={16} color={colors.softText} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search…"
                placeholderTextColor={colors.softText}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={() => customAvailable && pick(query)}
                returnKeyType="done"
              />
            </View>

            {customAvailable ? (
              <Pressable style={styles.customRow} onPress={() => pick(query)}>
                <Icon name="plus" size={14} color={colors.primary} />
                <Text style={styles.customText}>Use "{query.trim()}"</Text>
              </Pressable>
            ) : null}

            <FlatList
              data={filtered}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              renderItem={({ item }) => {
                const selected = item === value;
                return (
                  <Pressable onPress={() => pick(item)} style={({ pressed }) => [styles.row, pressed && styles.rowPressed, selected && styles.rowSelected]}>
                    <Text style={[styles.rowText, selected && styles.rowTextSelected]}>{item}</Text>
                    {selected ? <Icon name="check" size={14} color={colors.primary} /> : null}
                  </Pressable>
                );
              }}
              ListEmptyComponent={!customAvailable ? <Text style={styles.empty}>No matches.</Text> : null}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 7 },
  label: { color: colors.textSoft, fontWeight: '700', fontSize: 13 },
  field: {
    minHeight: 52, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.white, paddingHorizontal: 14, flexDirection: 'row',
    alignItems: 'center', gap: 10
  },
  value: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '500' },
  placeholder: { color: colors.softText, fontWeight: '400' },
  helper: { color: colors.muted, fontSize: 12.5 },
  scrim: { flex: 1, backgroundColor: colors.scrim },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '85%', ...shadow.medium },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  sheetTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  search: {
    marginHorizontal: 20, marginBottom: 8, borderRadius: radius.md, borderWidth: 1.5,
    borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: 10 },
  customRow: {
    marginHorizontal: 20, marginBottom: 6, paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: colors.primaryLight, borderRadius: radius.md, flexDirection: 'row',
    alignItems: 'center', gap: 8
  },
  customText: { color: colors.primary, fontWeight: '700', fontSize: 13.5 },
  list: { paddingHorizontal: 12 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider
  },
  rowPressed: { backgroundColor: colors.primaryLight },
  rowSelected: { backgroundColor: colors.primaryLight },
  rowText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  rowTextSelected: { color: colors.primary },
  empty: { color: colors.muted, paddingVertical: 18, textAlign: 'center', fontSize: 13 }
});
