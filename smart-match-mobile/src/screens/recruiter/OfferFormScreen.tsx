import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecruiterStackParamList } from '../../navigation/RecruiterNavigator';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { FilterChip } from '../../components/Chip';
import { offerService } from '../../services/offerService';
import { OfferPayload, OfferType } from '../../types';
import { colors } from '../../theme/colors';

export function OfferFormScreen({ route, navigation }: NativeStackScreenProps<RecruiterStackParamList, 'OfferForm'>) {
  const offer = route.params?.offer;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: offer?.title ?? '',
    description: offer?.description ?? '',
    type: (offer?.type ?? 'INTERNSHIP') as OfferType,
    location: offer?.location ?? '',
    duration: offer?.duration ?? '',
    requiredSkills: offer?.requiredSkills?.join(', ') ?? ''
  });
  const set = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });
  const save = async () => {
    const payload: OfferPayload = { ...form, type: form.type, requiredSkills: form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean) };
    try { setSaving(true); offer ? await offerService.update(offer.id, payload) : await offerService.create(payload); Alert.alert('Saved', 'Offer saved.'); navigation.goBack(); }
    catch { Alert.alert('Error', 'Could not save offer.'); }
    finally { setSaving(false); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>{offer ? 'Edit offer' : 'Create offer'}</Text>
      <AppInput label="Title" value={form.title} onChangeText={(v) => set('title', v)} placeholder="Frontend internship" />
      <View style={styles.typeBlock}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.chips}>
          <FilterChip label="Internship" active={form.type === 'INTERNSHIP'} onPress={() => set('type', 'INTERNSHIP')} />
          <FilterChip label="Freelance" active={form.type === 'FREELANCE'} onPress={() => set('type', 'FREELANCE')} />
        </View>
      </View>
      <AppInput label="Description" value={form.description} onChangeText={(v) => set('description', v)} multiline placeholder="Role responsibilities, mission, and what success looks like." />
      <AppInput label="Location" icon="location" value={form.location} onChangeText={(v) => set('location', v)} placeholder="Remote / Casablanca" />
      <AppInput label="Duration" icon="clock" value={form.duration} onChangeText={(v) => set('duration', v)} placeholder="6 months" />
      <AppInput label="Required skills" value={form.requiredSkills} onChangeText={(v) => set('requiredSkills', v)} helper="Separate with commas." placeholder="React, TypeScript, Figma" />
      <AppButton title="Save offer" icon="check" onPress={save} loading={saving} style={styles.save} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, gap: 14, paddingBottom: 32 },
  heading: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  typeBlock: { gap: 8 },
  label: { color: colors.textSoft, fontWeight: '700', fontSize: 13 },
  chips: { flexDirection: 'row', gap: 8 },
  save: { marginTop: 4 }
});
