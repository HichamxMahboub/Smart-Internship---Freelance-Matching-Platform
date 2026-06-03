import React, { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from './AppButton';
import { AppInput } from './AppInput';
import { Avatar } from './Avatar';
import { Chip } from './Chip';
import { Icon } from './Icon';
import { MatchRing } from './MatchRing';
import { ProgressBar } from './ProgressBar';
import { applicationService } from '../services/applicationService';
import { CandidateProfile, Offer, OfferMatch, User } from '../types';
import { colors } from '../theme/colors';
import { radius, shadow } from '../theme/spacing';

interface Props {
  visible: boolean;
  offer: Offer;
  profile?: CandidateProfile;
  user?: User | null;
  match: OfferMatch;
  onClose: () => void;
  onApplied: () => void;
}

const AVAILABILITY_OPTIONS = ['Immediately', 'In 2 weeks', 'In 1 month', 'Negotiable'];
const DURATION_OPTIONS = ['1 month', '3 months', '6 months', 'Full duration'];
const MIN_NOTE = 60;

type Step = 0 | 1 | 2 | 3;

export function ApplyOfferSheet({ visible, offer, profile, user, match, onClose, onApplied }: Props) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>(0);
  const [note, setNote] = useState('');
  const [availability, setAvailability] = useState<string | undefined>(undefined);
  const [duration, setDuration] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const hasCv = Boolean(profile?.cvUrl);
  const hasSkills = (profile?.skills?.length ?? 0) > 0;
  const emailVerified = user?.emailVerified === true;
  const readinessIssues = useMemo(() => {
    const issues: string[] = [];
    if (!emailVerified) issues.push('Verify your email to apply.');
    if (!hasCv) issues.push('Upload your CV before applying.');
    if (!hasSkills) issues.push('Add at least one skill so the recruiter sees your fit.');
    return issues;
  }, [emailVerified, hasCv, hasSkills]);
  const readyToApply = readinessIssues.length === 0;

  const noteLen = note.trim().length;
  const noteOk = noteLen >= MIN_NOTE;

  const close = () => {
    if (submitting) return;
    setStep(0);
    setNote('');
    setAvailability(undefined);
    setDuration(undefined);
    onClose();
  };

  const buildMessage = () => {
    const meta: string[] = [];
    if (availability) meta.push(`Availability: ${availability}`);
    if (duration) meta.push(`Commitment: ${duration}`);
    const header = meta.length ? `[${meta.join(' • ')}]\n\n` : '';
    return header + note.trim();
  };

  const submit = async () => {
    try {
      setSubmitting(true);
      await applicationService.apply({ offerId: offer.id, message: buildMessage() });
      setStep(3);
      onApplied();
    } catch (e: any) {
      Alert.alert('Could not apply', e?.response?.data?.message ?? 'You may have already applied or your email is not verified.');
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (step === 0) {
      if (!readyToApply) return;
      setStep(1);
    } else if (step === 1) {
      if (!noteOk) {
        Alert.alert('Add more detail', `Cover note needs at least ${MIN_NOTE} characters so recruiters can judge fit.`);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      void submit();
    }
  };

  const back = () => { if (step > 0 && step < 3) setStep((step - 1) as Step); };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.scrim}>
        <Pressable style={{ flex: 1 }} onPress={close} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 14 }]}>
          <View style={styles.head}>
            <View>
              <Text style={styles.kicker}>{step === 3 ? 'Done' : `Step ${step + 1} of 3`}</Text>
              <Text style={styles.title}>{step === 3 ? 'Application sent' : 'Apply to ' + offer.title}</Text>
            </View>
            <Pressable onPress={close} hitSlop={8}><Icon name="close" size={18} color={colors.muted} /></Pressable>
          </View>

          {step < 3 ? <ProgressBar value={((step + 1) / 3) * 100} style={styles.progress} /> : null}

          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {step === 0 ? (
              <View style={{ gap: 14 }}>
                <View style={styles.roleHead}>
                  <Avatar name={offer.title} size={44} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roleTitle} numberOfLines={1}>{offer.title}</Text>
                    <Text style={styles.roleMeta} numberOfLines={1}>
                      {offer.location || 'Remote'} · {offer.duration || 'Flexible'}
                    </Text>
                  </View>
                </View>

                <View style={styles.fitCard}>
                  <MatchRing score={match.score} size={68} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.fitTitle}>Your fit for this role</Text>
                    <Text style={styles.fitSub}>{match.matched.length} of {offer.requiredSkills?.length ?? 0} required skills matched.</Text>
                  </View>
                </View>

                {match.matched.length ? (
                  <View style={styles.block}>
                    <Text style={styles.blockLabel}>Skills you bring</Text>
                    <View style={styles.chips}>{match.matched.map((s) => <Chip key={s} label={s} tone="teal" />)}</View>
                  </View>
                ) : null}

                {match.missing.length ? (
                  <View style={styles.block}>
                    <Text style={styles.blockLabel}>Gaps to address</Text>
                    <View style={styles.chips}>{match.missing.map((s) => <Chip key={s} label={s} tone="accent" />)}</View>
                  </View>
                ) : null}

                <View style={[styles.readiness, { backgroundColor: readyToApply ? colors.successSoft : colors.warningSoft }]}>
                  <Icon name={readyToApply ? 'check' : 'shield'} size={16} color={readyToApply ? colors.success : colors.warning} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.readinessTitle, { color: readyToApply ? colors.success : colors.warning }]}>
                      {readyToApply ? 'You are ready to apply' : 'Finish your profile first'}
                    </Text>
                    {!readyToApply ? readinessIssues.map((i) => (
                      <Text key={i} style={styles.readinessLine}>• {i}</Text>
                    )) : (
                      <Text style={styles.readinessLine}>CV attached · skills set · email verified.</Text>
                    )}
                  </View>
                </View>
              </View>
            ) : null}

            {step === 1 ? (
              <View style={{ gap: 14 }}>
                <View>
                  <Text style={styles.blockLabel}>Cover note <Text style={styles.required}>*</Text></Text>
                  <AppInput
                    multiline
                    value={note}
                    onChangeText={setNote}
                    placeholder="Why are you a strong fit? What relevant projects do you bring? What excites you about this role?"
                  />
                  <Text style={[styles.counter, { color: noteOk ? colors.success : colors.muted }]}>
                    {noteLen} / {MIN_NOTE} minimum
                  </Text>
                </View>

                <View>
                  <Text style={styles.blockLabel}>Availability</Text>
                  <View style={styles.optionRow}>
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <OptionPill key={opt} label={opt} active={availability === opt} onPress={() => setAvailability(availability === opt ? undefined : opt)} />
                    ))}
                  </View>
                </View>

                <View>
                  <Text style={styles.blockLabel}>Commitment you can offer</Text>
                  <View style={styles.optionRow}>
                    {DURATION_OPTIONS.map((opt) => (
                      <OptionPill key={opt} label={opt} active={duration === opt} onPress={() => setDuration(duration === opt ? undefined : opt)} />
                    ))}
                  </View>
                </View>
              </View>
            ) : null}

            {step === 2 ? (
              <View style={{ gap: 14 }}>
                <Text style={styles.reviewKicker}>Review before sending</Text>
                <ReviewRow icon="briefcase" label="Role" value={offer.title} />
                <ReviewRow icon="location" label="Location" value={offer.location || 'Remote'} />
                <ReviewRow icon="clock" label="Duration" value={offer.duration || 'Flexible'} />
                <ReviewRow icon="check" label="Skill match" value={`${Math.round(match.score)}% · ${match.matched.length}/${offer.requiredSkills?.length ?? 0}`} />
                {availability ? <ReviewRow icon="clock" label="Availability" value={availability} /> : null}
                {duration ? <ReviewRow icon="document" label="Commitment" value={duration} /> : null}
                <ReviewRow icon="document" label="CV" value={profile?.cvUrl ? 'Attached' : 'Missing'} />
                <ReviewRow icon="user" label="Profile" value={`${profile?.skills?.length ?? 0} skills · ${profile?.experiences?.length ?? 0} experiences`} />
                <View style={styles.notePreview}>
                  <Text style={styles.previewLabel}>Cover note</Text>
                  <Text style={styles.previewBody}>{note.trim() || '—'}</Text>
                </View>
              </View>
            ) : null}

            {step === 3 ? (
              <View style={{ gap: 16, alignItems: 'center', paddingVertical: 14 }}>
                <View style={styles.success}><Icon name="check" size={28} color={colors.white} /></View>
                <Text style={styles.successTitle}>Application submitted</Text>
                <Text style={styles.successSub}>
                  Recruiter at {offer.title} now sees your profile, CV and AI fit. Track every status update in My applications.
                </Text>
                <View style={styles.stages}>
                  <Stage label="Applied" done />
                  <View style={[styles.stageLine, { backgroundColor: colors.border }]} />
                  <Stage label="Reviewed" />
                  <View style={[styles.stageLine, { backgroundColor: colors.border }]} />
                  <Stage label="Decision" />
                </View>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            {step === 3 ? (
              <AppButton title="Done" icon="check" onPress={close} />
            ) : (
              <View style={styles.footerRow}>
                {step > 0 ? <AppButton title="Back" variant="ghost" onPress={back} size="sm" style={styles.backBtn} /> : null}
                <AppButton
                  title={step === 0 ? 'Continue' : step === 1 ? 'Review' : 'Submit application'}
                  icon={step === 2 ? 'send' : 'chevron-right'}
                  onPress={next}
                  loading={submitting}
                  disabled={(step === 0 && !readyToApply) || (step === 1 && !noteOk)}
                  style={{ flex: 1 }}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function OptionPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ReviewRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <View style={styles.reviewIcon}><Icon name={icon} size={14} color={colors.primary} bg={colors.primaryLight} /></View>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function Stage({ label, done }: { label: string; done?: boolean }) {
  return (
    <View style={styles.stage}>
      <View style={[styles.stageDot, { backgroundColor: done ? colors.success : colors.white, borderColor: done ? colors.success : colors.border }]}>
        {done ? <Icon name="check" size={10} color={colors.white} /> : null}
      </View>
      <Text style={[styles.stageLabel, { color: done ? colors.text : colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: colors.scrim },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '92%', ...shadow.medium },
  head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  kicker: { color: colors.primary, fontWeight: '800', fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { color: colors.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.3, marginTop: 2 },
  progress: { marginHorizontal: 20, marginBottom: 8 },
  body: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 16, gap: 14 },
  roleHead: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 12 },
  roleTitle: { color: colors.text, fontWeight: '800', fontSize: 15 },
  roleMeta: { color: colors.muted, fontSize: 12.5, marginTop: 2 },
  fitCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14 },
  fitTitle: { color: colors.text, fontWeight: '800', fontSize: 14.5 },
  fitSub: { color: colors.muted, fontSize: 12.5, lineHeight: 17 },
  block: { gap: 6 },
  blockLabel: { color: colors.textSoft, fontWeight: '800', fontSize: 12.5, letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 6 },
  required: { color: colors.danger },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  readiness: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: radius.md },
  readinessTitle: { fontWeight: '800', fontSize: 13.5, marginBottom: 2 },
  readinessLine: { color: colors.textSoft, fontSize: 12.5, lineHeight: 17 },
  counter: { fontSize: 12, fontWeight: '700', marginTop: 4, textAlign: 'right' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white },
  pillActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  pillText: { color: colors.textSoft, fontWeight: '700', fontSize: 13 },
  pillTextActive: { color: colors.primary },
  reviewKicker: { color: colors.textSoft, fontWeight: '800', fontSize: 12, letterSpacing: 0.4, textTransform: 'uppercase' },
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 10 },
  reviewIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  reviewLabel: { color: colors.muted, fontWeight: '700', fontSize: 12.5, width: 92 },
  reviewValue: { flex: 1, color: colors.text, fontWeight: '700', fontSize: 13 },
  notePreview: { backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 12, gap: 6 },
  previewLabel: { color: colors.muted, fontWeight: '800', fontSize: 11.5, letterSpacing: 0.4, textTransform: 'uppercase' },
  previewBody: { color: colors.text, fontSize: 13.5, lineHeight: 19 },
  success: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  successTitle: { color: colors.text, fontWeight: '800', fontSize: 19, letterSpacing: -0.3 },
  successSub: { color: colors.muted, fontSize: 13.5, lineHeight: 19, textAlign: 'center', paddingHorizontal: 10 },
  stages: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  stage: { alignItems: 'center', gap: 4, width: 70 },
  stageDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stageLine: { flex: 1, height: 2, borderRadius: 1 },
  stageLabel: { fontSize: 11, fontWeight: '800', textAlign: 'center' },
  footer: { paddingHorizontal: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white },
  footerRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  backBtn: { flex: 0, paddingHorizontal: 18 }
});
