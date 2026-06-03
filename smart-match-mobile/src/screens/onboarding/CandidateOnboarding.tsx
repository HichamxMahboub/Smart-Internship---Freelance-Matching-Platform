import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { TagPicker } from '../../components/TagPicker';
import { OptionPicker } from '../../components/OptionPicker';
import {
  SKILL_OPTIONS, LANGUAGE_OPTIONS, PREFERENCE_OPTIONS,
  FIELD_OF_STUDY_OPTIONS, EDUCATION_LEVEL_OPTIONS
} from '../../constants/profileOptions';
import { LoadingView } from '../../components/LoadingView';
import { ProgressBar } from '../../components/ProgressBar';
import { PhotoPicker } from '../../components/PhotoPicker';
import { ResumeUploader } from '../../components/ResumeUploader';
import { CvAutofillCard } from '../../components/CvAutofillCard';
import { Icon } from '../../components/Icon';
import { useAuth } from '../../auth/AuthContext';
import { candidateOnboardingStep, normalizeCandidateProfile } from '../../onboarding/completeness';
import { profileService } from '../../services/profileService';
import { CandidateProfile } from '../../types';
import { colors } from '../../theme/colors';
import { radius, shadow } from '../../theme/spacing';

const STEPS = ['You', 'Studies', 'Skills', 'CV'];

export function CandidateOnboarding({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [p, setP] = useState<CandidateProfile>({ skills: [], languages: [], preferences: [] });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profile = normalizeCandidateProfile(await profileService.getCandidateProfile());
        if (cancelled) return;
        setP(profile);
        setStep(candidateOnboardingStep(profile));
      } catch {
        if (!cancelled) {
          Alert.alert('Could not load profile', 'Check your connection. You can still continue setup.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const set = (patch: Partial<CandidateProfile>) => setP((prev) => ({ ...prev, ...patch }));
  const setTags = (key: 'skills' | 'languages' | 'preferences', list: string[]) =>
    set({ [key]: list } as Partial<CandidateProfile>);

  const canNext = () => {
    if (step === 0) return Boolean(p.headline?.trim());
    if (step === 2) return (p.skills?.length ?? 0) > 0;
    if (step === 3) return Boolean(p.cvUrl?.trim());
    return true;
  };

  const persist = async () => {
    const saved = await profileService.updateCandidateProfile(p);
    setP(normalizeCandidateProfile(saved));
  };

  const finish = async () => {
    try {
      setSaving(true);
      await persist();
      onDone();
    } catch {
      Alert.alert('Almost there', 'Could not save your profile. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const next = async () => {
    if (!canNext()) return;
    try {
      setSaving(true);
      await persist();
      if (step < STEPS.length - 1) setStep(step + 1);
      else onDone();
    } catch {
      Alert.alert('Save failed', 'Your progress was not saved. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const back = () => setStep(Math.max(0, step - 1));

  if (loading) return <LoadingView label="Loading your profile…" />;

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
            <Text style={styles.sub}>Fastest path: upload your CV and we fill the rest. Or enter everything manually below.</Text>
            <CvAutofillCard
              overwrite
              onAutofilled={(profile) => {
                set({
                  ...profile,
                  skills: profile.skills ?? [],
                  languages: profile.languages ?? [],
                  preferences: profile.preferences ?? []
                });
              }}
            />
            <View style={styles.photoWrap}><PhotoPicker name={user?.fullName} uri={p.photoUrl} onChange={(url) => set({ photoUrl: url })} /></View>
            <AppInput label="Headline" value={p.headline ?? ''} onChangeText={(v) => set({ headline: v })} placeholder="CS student · React & Node developer" />
            <AppInput label="Short bio" multiline value={p.bio ?? ''} onChangeText={(v) => set({ bio: v })} placeholder="What you build, what you're looking for…" />
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.block}>
            <Text style={styles.title}>Your studies</Text>
            <Text style={styles.sub}>Helps us match internships to your level and field.</Text>
            <OptionPicker label="Education level" options={EDUCATION_LEVEL_OPTIONS} value={p.educationLevel} onChange={(v) => set({ educationLevel: v })} placeholder="Pick your level" />
            <OptionPicker label="Field of study" options={FIELD_OF_STUDY_OPTIONS} value={p.fieldOfStudy} onChange={(v) => set({ fieldOfStudy: v })} placeholder="Pick a field" />
            <AppInput label="Location" icon="location" value={p.location ?? ''} onChangeText={(v) => set({ location: v })} placeholder="Casablanca (remote-friendly)" />
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.block}>
            <Text style={styles.title}>Skills & languages</Text>
            <Text style={styles.sub}>Skills drive your match score. Tap to pick from list.</Text>
            <TagPicker label="Skills" options={SKILL_OPTIONS} values={p.skills} onChange={(list) => setTags('skills', list)} placeholder="Pick skills" helper="At least one to continue. Tap a chip to remove." />
            <TagPicker label="Languages" options={LANGUAGE_OPTIONS} values={p.languages} onChange={(list) => setTags('languages', list)} placeholder="Pick languages" />
            <TagPicker label="Preferences" options={PREFERENCE_OPTIONS} values={p.preferences} onChange={(list) => setTags('preferences', list)} placeholder="Pick preferences" />
          </View>
        ) : null}

        {step === 3 ? (
          <View style={styles.block}>
            <Text style={styles.title}>Add your CV</Text>
            <Text style={styles.sub}>Upload a PDF or Word file. It is stored securely on Cloudinary in the resumes folder.</Text>
            <ResumeUploader cvUrl={p.cvUrl} onUploaded={(url) => set({ cvUrl: url })} />
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        {step > 0 ? <AppButton title="Back" variant="ghost" onPress={back} style={styles.back} /> : null}
        <AppButton
          title={step === STEPS.length - 1 ? 'Finish setup' : 'Continue'}
          icon={step === STEPS.length - 1 ? 'check' : 'chevron-right'}
          onPress={step === STEPS.length - 1 ? finish : next}
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
