import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { ProgressBar } from '../../components/ProgressBar';
import { PhotoPicker } from '../../components/PhotoPicker';
import { Icon } from '../../components/Icon';
import { useAuth } from '../../auth/AuthContext';
import { profileService } from '../../services/profileService';
import { CandidateProfile } from '../../types';
import { colors } from '../../theme/colors';
import { radius, shadow } from '../../theme/spacing';

const STEPS = ['You', 'Studies', 'Skills', 'CV'];

export function CandidateOnboarding({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [p, setP] = useState<CandidateProfile>({ skills: [], languages: [], preferences: [] });

  const set = (patch: Partial<CandidateProfile>) => setP((prev) => ({ ...prev, ...patch }));
  const setList = (key: 'skills' | 'languages' | 'preferences', v: string) => set({ [key]: v.split(',').map((i) => i.trim()).filter(Boolean) } as Partial<CandidateProfile>);

  const canNext = () => {
    if (step === 0) return Boolean(p.headline?.trim());
    if (step === 2) return (p.skills?.length ?? 0) > 0;
    if (step === 3) return Boolean(p.cvUrl?.trim());
    return true;
  };

  const finish = async () => {
    try {
      setSaving(true);
      await profileService.updateCandidateProfile(p);
      onDone();
    } catch {
      Alert.alert('Almost there', 'Could not save your profile. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : finish());
  const back = () => setStep(Math.max(0, step - 1));

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.kicker}>Set up your profile</Text>
        <Text style={styles.stepLabel}>{STEPS[step]} · {step + 1}/{STEPS.length}</Text>
        <ProgressBar value={((step + 1) / STEPS.length) * 100} style={{ marginTop: 12 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {step === 0 ? (
          <View style={styles.block}>
            <Text style={styles.title}>Welcome, {user?.fullName?.split(' ')[0] || 'there'} 👋</Text>
            <Text style={styles.sub}>Recruiters see this first. Add a photo and a one-line headline.</Text>
            <View style={styles.photoWrap}><PhotoPicker name={user?.fullName} uri={p.photoUrl} onChange={(url) => set({ photoUrl: url })} /></View>
            <AppInput label="Headline" value={p.headline ?? ''} onChangeText={(v) => set({ headline: v })} placeholder="CS student · React & Node developer" />
            <AppInput label="Short bio" multiline value={p.bio ?? ''} onChangeText={(v) => set({ bio: v })} placeholder="What you build, what you're looking for…" />
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.block}>
            <Text style={styles.title}>Your studies</Text>
            <Text style={styles.sub}>Helps us match internships to your level and field.</Text>
            <AppInput label="Education level" value={p.educationLevel ?? ''} onChangeText={(v) => set({ educationLevel: v })} placeholder="Master's, Bachelor's…" />
            <AppInput label="Field of study" value={p.fieldOfStudy ?? ''} onChangeText={(v) => set({ fieldOfStudy: v })} placeholder="Computer science" />
            <AppInput label="Location" icon="location" value={p.location ?? ''} onChangeText={(v) => set({ location: v })} placeholder="Casablanca (remote-friendly)" />
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.block}>
            <Text style={styles.title}>Skills & languages</Text>
            <Text style={styles.sub}>Skills drive your match score. Separate with commas.</Text>
            <AppInput label="Skills" value={p.skills.join(', ')} onChangeText={(v) => setList('skills', v)} placeholder="React, Java, Figma" helper="At least one to continue." />
            <AppInput label="Languages" value={p.languages.join(', ')} onChangeText={(v) => setList('languages', v)} placeholder="English, French" />
            <AppInput label="Preferences" value={p.preferences.join(', ')} onChangeText={(v) => setList('preferences', v)} placeholder="Remote, internship, part-time" />
          </View>
        ) : null}

        {step === 3 ? (
          <View style={styles.block}>
            <Text style={styles.title}>Add your CV</Text>
            <Text style={styles.sub}>Paste a link to your CV (Drive, Dropbox…). In-app file upload arrives with the next build, parsed automatically in the cloud.</Text>
            <View style={styles.cvCard}>
              <View style={styles.cvIcon}><Icon name="document" size={22} color={colors.primary} bg={colors.primaryLight} /></View>
              <Text style={styles.cvHint}>{p.cvUrl ? 'CV link added' : 'No CV yet'}</Text>
            </View>
            <AppInput label="CV link" value={p.cvUrl ?? ''} onChangeText={(v) => set({ cvUrl: v })} placeholder="https://…" autoCapitalize="none" helper="Required — recruiters rank candidates with a CV higher." />
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        {step > 0 ? <AppButton title="Back" variant="ghost" onPress={back} style={styles.back} /> : null}
        <AppButton
          title={step === STEPS.length - 1 ? 'Finish setup' : 'Continue'}
          icon={step === STEPS.length - 1 ? 'check' : 'chevron-right'}
          onPress={next}
          loading={saving}
          disabled={!canNext()}
          style={styles.cta}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 22, paddingBottom: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  kicker: { color: colors.primary, fontWeight: '800', fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase' },
  stepLabel: { color: colors.text, fontWeight: '800', fontSize: 16, marginTop: 4 },
  content: { padding: 22, paddingBottom: 30 },
  block: { gap: 14 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  sub: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: -6 },
  photoWrap: { alignItems: 'center', paddingVertical: 6 },
  cvCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 16, ...shadow.xs },
  cvIcon: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  cvHint: { color: colors.text, fontWeight: '700', fontSize: 14 },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 22, paddingTop: 12, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
  back: { flex: 0, paddingHorizontal: 22 },
  cta: { flex: 1 }
});
