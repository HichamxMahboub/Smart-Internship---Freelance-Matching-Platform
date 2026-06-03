import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { SurfaceCard } from '../../components/SurfaceCard';
import { StatusBadge } from '../../components/StatusBadge';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Icon } from '../../components/Icon';
import { companyService } from '../../services/companyService';
import { Company } from '../../types';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';

export function CompanyScreen() {
  const navigation = useNavigation<any>();
  const [company, setCompany] = useState<Company | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', sector: '', description: '', logoUrl: '', website: '' });
  useEffect(() => { companyService.getMine().then((c) => { setCompany(c); setForm({ name: c.name ?? '', sector: c.sector ?? '', description: c.description ?? '', logoUrl: c.logoUrl ?? '', website: c.website ?? '' }); }).catch(() => undefined); }, []);
  const save = async () => { try { setSaving(true); const saved = company ? await companyService.update(company.id, form) : await companyService.create(form); setCompany(saved); Alert.alert('Saved', 'Company saved.'); } catch { Alert.alert('Error', 'Could not save company.'); } finally { setSaving(false); } };
  const set = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Company profile" subtitle="Recruiter" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <SurfaceCard style={styles.status}>
          <View style={styles.statusHead}>
            <View style={styles.statusIcon}><Icon name="shield" size={18} color={colors.primary} bg={colors.primaryLight} /></View>
            <Text style={styles.statusTitle}>Validation status</Text>
            <StatusBadge status={company?.validationStatus ?? 'PENDING'} />
          </View>
          <Text style={styles.note}>Only approved companies can publish offers. Keep your profile clear and complete for faster validation.</Text>
        </SurfaceCard>
        <SurfaceCard style={styles.form}>
          <AppInput label="Name" icon="building" value={form.name} onChangeText={(v) => set('name', v)} placeholder="Acme Inc." />
          <AppInput label="Sector" value={form.sector} onChangeText={(v) => set('sector', v)} placeholder="Software, finance, education…" />
          <AppInput label="Description" value={form.description} onChangeText={(v) => set('description', v)} multiline placeholder="What does your company do, and why join?" />
          <AppInput label="Logo URL" value={form.logoUrl} onChangeText={(v) => set('logoUrl', v)} autoCapitalize="none" placeholder="https://…" />
          <AppInput label="Website" icon="globe" value={form.website} onChangeText={(v) => set('website', v)} keyboardType="url" autoCapitalize="none" placeholder="https://…" />
          <AppButton title={company ? 'Update company' : 'Create company'} icon="check" onPress={save} loading={saving} />
        </SurfaceCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingTop: 4, gap: 14, paddingBottom: 30 },
  status: { gap: 12 },
  statusHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusIcon: { width: 34, height: 34, borderRadius: radius.sm, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { flex: 1, color: colors.text, fontWeight: '800', fontSize: 15 },
  note: { color: colors.muted, lineHeight: 21, fontSize: 13.5 },
  form: { gap: 13 }
});
