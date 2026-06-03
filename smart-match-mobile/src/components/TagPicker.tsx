import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { radius, shadow } from '../theme/spacing';
import { Chip } from './Chip';
import { Icon } from './Icon';

interface Props {
  label: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  helper?: string;
  allowCustom?: boolean;
}

export function TagPicker({ label, options, values, onChange, placeholder, helper, allowCustom = true }: Props) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const lowerValues = useMemo(() => new Set(values.map((v) => v.toLowerCase())), [values]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options
      .filter((opt) => !lowerValues.has(opt.toLowerCase()))
      .filter((opt) => !q || opt.toLowerCase().includes(q));
  }, [options, lowerValues, query]);

  const customAvailable = allowCustom
    && query.trim().length > 0
    && !lowerValues.has(query.trim().toLowerCase())
    && !options.some((o) => o.toLowerCase() === query.trim().toLowerCase());

  const add = (v: string) => {
    const trimmed = v.trim();
    if (!trimmed) return;
    if (lowerValues.has(trimmed.toLowerCase())) return;
    onChange([...values, trimmed]);
    setQuery('');
  };

  const remove = (v: string) => onChange(values.filter((x) => x !== v));

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={() => setOpen(true)} style={styles.field}>
        {values.length === 0 ? (
          <Text style={styles.placeholder}>{placeholder ?? 'Tap to pick from list'}</Text>
        ) : (
          <View style={styles.chips}>
            {values.map((v) => (
              <Pressable key={v} onPress={() => remove(v)}>
                <Chip label={`${v}  ×`} tone="brand" />
              </Pressable>
            ))}
          </View>
        )}
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

            {values.length ? (
              <View style={styles.selectedRow}>
                {values.map((v) => (
                  <Pressable key={v} onPress={() => remove(v)}>
                    <Chip label={`${v}  ×`} tone="teal" />
                  </Pressable>
                ))}
              </View>
            ) : null}

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
                onSubmitEditing={() => customAvailable && add(query)}
                returnKeyType="done"
              />
            </View>

            {customAvailable ? (
              <Pressable style={styles.customRow} onPress={() => add(query)}>
                <Icon name="plus" size={14} color={colors.primary} />
                <Text style={styles.customText}>Add "{query.trim()}"</Text>
              </Pressable>
            ) : null}

            <FlatList
              data={filtered}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              renderItem={({ item }) => (
                <Pressable onPress={() => add(item)} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
                  <Text style={styles.rowText}>{item}</Text>
                  <Icon name="plus" size={14} color={colors.primary} />
                </Pressable>
              )}
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
    backgroundColor: colors.white, paddingHorizontal: 12, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', gap: 10
  },
  placeholder: { flex: 1, color: colors.softText, fontSize: 14 },
  chips: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  helper: { color: colors.muted, fontSize: 12.5 },
  scrim: { flex: 1, backgroundColor: colors.scrim },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '85%', ...shadow.medium },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  sheetTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  selectedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 20, paddingBottom: 10 },
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
  rowText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  empty: { color: colors.muted, paddingVertical: 18, textAlign: 'center', fontSize: 13 }
});
