import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { SurfaceCard } from '../../components/SurfaceCard';
import { StatusBadge } from '../../components/StatusBadge';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Icon } from '../../components/Icon';
import { PhotoPicker } from '../../components/PhotoPicker';
import { companyService } from '../../services/companyService';
import { Company } from '../../types';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';

const emptyForm = { name: '', sector: '', size: '', location: '', description: '', logoUrl: '', website: '' };

export function CompanyScreen() {
  const navigation = useNavigation<any>();
  const [company, setCompany] = useState<Company | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  useEffect(() => { companyService.getMine().then((c) => { setCompany(c); setForm({ name: c.name ?? '', sector: c.sector ?? '', size: c.size ?? '', location: c.location ?? '', description: c.description ?? '', logoUrl: c.logoUrl ?? '', website: c.website ?? '' }); }).catch(() => undefined); }, []);
  const save = async (next = form, quiet = false) => { setForm(next); try { setSaving(true); const saved = company ? await companyService.update(company.id, next) : await companyService.create(next); setCompany(saved); if (!quiet) Alert.alert('Saved', 'Company saved.'); } catch { Alert.alert('Error', 'Could not save company.'); } finally { setSaving(false); } };
  const set = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Organisation profile" subtitle="Recruiter" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <SurfaceCard style={styles.identity}>
          <PhotoPicker name={form.name || 'Company'} uri={form.logoUrl || undefined} size={76} editable={!!company} onChange={(url) => save({ ...form, logoUrl: url }, true)} />
          <Text style={styles.companyName} numberOfLines={1}>{form.name || 'Your organisation'}</Text>
          {form.sector || form.location ? <Text style={styles.companyMeta} numberOfLines={1}>{[form.sector, form.location].filter(Boolean).join(' · ')}</Text> : null}
          <StatusBadge status={company?.validationStatus ?? 'PENDING'} />
        </SurfaceCard>

        <SurfaceCard style={styles.status}>
          <View style={styles.statusHead}>
            <View style={styles.statusIcon}><Icon name="shield" size={18} color={colors.primary} bg={colors.primaryLight} /></View>
            <Text style={styles.statusTitle}>Why this matters</Text>
          </View>
          <Text style={styles.note}>Only approved companies can publish offers. A complete organisation profile gets validated faster and ranks higher with students.</Text>
        </SurfaceCard>

        <SurfaceCard style={styles.form}>
          <AppInput label="Name" icon="building" value={form.name} onChangeText={(v) => set('name', v)} placeholder="Acme Inc." />
          <View style={styles.row}>
            <AppInput label="Sector" value={form.sector} onChangeText={(v) => set('sector', v)} placeholder="Software" style={{ flex: 1 }} />
            <AppInput label="Team size" value={form.size} onChangeText={(v) => set('size', v)} placeholder="11–50" />
          </View>
          <AppInput label="Location" icon="location" value={form.location} onChangeText={(v) => set('location', v)} placeholder="Remote · Casablanca" />
          <AppInput label="Description" value={form.description} onChangeText={(v) => set('description', v)} multiline placeholder="What does your company do, and why join?" />
          <AppInput label="Logo URL (optional)" value={form.logoUrl} onChangeText={(v) => set('logoUrl', v)} autoCapitalize="none" placeholder="Leave blank to use company initials" />
          <AppInput label="Website" icon="globe" value={form.website} onChangeText={(v) => set('website', v)} keyboardType="url" autoCapitalize="none" placeholder="https://…" />
          <AppButton title={company ? 'Update company' : 'Create company'} icon="check" onPress={() => save()} loading={saving} />
        </SurfaceCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingTop: 4, gap: 14, paddingBottom: 30 },
  identity: { alignItems: 'center', gap: 7 },
  companyName: { color: colors.text, fontSize: 19, fontWeight: '800', letterSpacing: -0.3, marginTop: 4 },
  companyMeta: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 10 },
  status: { gap: 12 },
  statusHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusIcon: { width: 34, height: 34, borderRadius: radius.sm, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { flex: 1, color: colors.text, fontWeight: '800', fontSize: 15 },
  note: { color: colors.muted, lineHeight: 21, fontSize: 13.5 },
  form: { gap: 13 }
});
