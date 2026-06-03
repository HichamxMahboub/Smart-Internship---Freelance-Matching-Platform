import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { ProgressBar } from '../../components/ProgressBar';
import { Icon } from '../../components/Icon';
import { useAuth } from '../../auth/AuthContext';
import { companyService } from '../../services/companyService';
import { colors } from '../../theme/colors';
import { radius, shadow } from '../../theme/spacing';

export function RecruiterOnboarding({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', sector: '', description: '', logoUrl: '', website: '' });
  const set = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });

  const finish = async () => {
    if (!form.name.trim()) return;
    try {
      setSaving(true);
      await companyService.create(form);
      onDone();
    } catch {
      Alert.alert('Almost there', 'Could not create your company. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.kicker}>Set up your company</Text>
        <Text style={styles.stepLabel}>Company profile · 1/1</Text>
        <ProgressBar value={100} style={{ marginTop: 12 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Welcome, {user?.fullName?.split(' ')[0] || 'there'} 👋</Text>
        <Text style={styles.sub}>Tell students who you are. You'll post remote internships and freelance missions next.</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}><Icon name="shield" size={18} color={colors.primary} bg={colors.primaryLight} /></View>
          <Text style={styles.infoText}>Companies are reviewed before offers go live. A clear profile gets approved faster.</Text>
        </View>

        <AppInput label="Company name" icon="building" value={form.name} onChangeText={(v) => set('name', v)} placeholder="Acme Inc." helper="Required." />
        <AppInput label="Sector" value={form.sector} onChangeText={(v) => set('sector', v)} placeholder="Software, finance, education…" />
        <AppInput label="Description" multiline value={form.description} onChangeText={(v) => set('description', v)} placeholder="What you do, and why students should join." />
        <AppInput label="Logo URL" value={form.logoUrl} onChangeText={(v) => set('logoUrl', v)} autoCapitalize="none" placeholder="https://…" />
        <AppInput label="Website" icon="globe" value={form.website} onChangeText={(v) => set('website', v)} keyboardType="url" autoCapitalize="none" placeholder="https://…" />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <AppButton title="Create company" icon="check" onPress={finish} loading={saving} disabled={!form.name.trim()} style={{ flex: 1 }} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 22, paddingBottom: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  kicker: { color: colors.primary, fontWeight: '800', fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase' },
  stepLabel: { color: colors.text, fontWeight: '800', fontSize: 16, marginTop: 4 },
  content: { padding: 22, paddingBottom: 30, gap: 14 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  sub: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: -6 },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14, ...shadow.xs },
  infoIcon: { width: 38, height: 38, borderRadius: radius.sm, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  infoText: { flex: 1, color: colors.muted, fontSize: 13, lineHeight: 18 },
  footer: { flexDirection: 'row', paddingHorizontal: 22, paddingTop: 12, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border }
});
