import React, { useEffect, useState } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { SurfaceCard } from '../../components/SurfaceCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Chip } from '../../components/Chip';
import { Icon, IconName } from '../../components/Icon';
import { PhotoPicker } from '../../components/PhotoPicker';
import { ProgressBar } from '../../components/ProgressBar';
import { ProjectCard } from '../../components/ProjectCard';
import { TimelineItem } from '../../components/TimelineItem';
import { SocialRow } from '../../components/SocialRow';
import { useAuth } from '../../auth/AuthContext';
import { profileService } from '../../services/profileService';
import { candidateCompletion } from '../../onboarding/completeness';
import { CandidateProfile, Education, Experience, Project } from '../../types';
import { colors } from '../../theme/colors';
import { radius, shadow } from '../../theme/spacing';

const empty: CandidateProfile = { skills: [], languages: [], preferences: [] };

export function CandidateProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<CandidateProfile>(empty);
  const [saving, setSaving] = useState(false);
  const [editDetails, setEditDetails] = useState(false);
  const [projModal, setProjModal] = useState<{ open: boolean; index: number | null }>({ open: false, index: null });
  const [expModal, setExpModal] = useState<{ open: boolean; index: number | null }>({ open: false, index: null });
  const [eduModal, setEduModal] = useState<{ open: boolean; index: number | null }>({ open: false, index: null });

  useEffect(() => { profileService.getCandidateProfile().then((p) => setProfile({ ...empty, ...p })).catch(() => undefined); }, []);

  const persist = async (next: CandidateProfile, quiet = false) => {
    setProfile(next);
    try { setSaving(true); await profileService.updateCandidateProfile(next); if (!quiet) Alert.alert('Saved', 'Your profile is updated.'); }
    catch { Alert.alert('Error', 'Could not save profile.'); }
    finally { setSaving(false); }
  };

  const completion = candidateCompletion(profile);
  const projects = profile.projects ?? [];
  const experiences = profile.experiences ?? [];
  const educations = profile.educations ?? [];

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Profile" subtitle="Your student profile" right={<Pressable onPress={() => setEditDetails(true)} hitSlop={8} style={styles.editLink}><Icon name="edit" size={14} color={colors.primary} /><Text style={styles.editLinkText}>Edit</Text></Pressable>} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>
        {/* Identity */}
        <SurfaceCard style={styles.identity}>
          <PhotoPicker name={user?.fullName} uri={profile.photoUrl} size={88} onChange={(url) => persist({ ...profile, photoUrl: url }, true)} />
          <Text style={styles.name} numberOfLines={1}>{user?.fullName || 'Candidate'}</Text>
          {profile.headline ? <Text style={styles.headline} numberOfLines={2}>{profile.headline}</Text> : <Text style={styles.headlineMuted}>Add a headline so recruiters know your focus.</Text>}
          <View style={styles.identityMeta}>
            {profile.location ? <View style={styles.metaItem}><Icon name="location" size={13} color={colors.muted} /><Text style={styles.metaText}>{profile.location}</Text></View> : null}
            <Chip label={user?.plan ?? 'FREE'} tone={user?.plan === 'PREMIUM' ? 'accent' : 'neutral'} />
          </View>
          <SocialRow socials={profile.socials} />
          <View style={styles.completeBlock}>
            <View style={styles.completeRow}><Text style={styles.completeLabel}>Profile strength</Text><Text style={styles.completeVal}>{completion}%</Text></View>
            <ProgressBar value={completion} color={completion >= 70 ? colors.success : colors.primary} />
          </View>
        </SurfaceCard>

        {/* About */}
        <Section title="About" onAction={() => setEditDetails(true)} actionIcon="edit">
          {profile.bio ? <Text style={styles.bodyText}>{profile.bio}</Text> : <Text style={styles.placeholder}>Tell recruiters about yourself, your goals, and what you build.</Text>}
        </Section>

        {/* Skills */}
        <Section title="Skills" onAction={() => setEditDetails(true)} actionIcon="edit">
          {profile.skills.length ? (
            <View style={styles.chips}>{profile.skills.map((s) => <Chip key={s} label={s} tone="brand" />)}</View>
          ) : <Text style={styles.placeholder}>Add skills to power your match score.</Text>}
          {profile.languages.length ? (
            <>
              <Text style={styles.subLabel}>Languages</Text>
              <View style={styles.chips}>{profile.languages.map((s) => <Chip key={s} label={s} tone="teal" />)}</View>
            </>
          ) : null}
        </Section>

        {/* CV */}
        <Section title="CV / Resume">
          <Pressable style={styles.cvCard} onPress={() => profile.cvUrl && Linking.openURL(profile.cvUrl).catch(() => undefined)}>
            <View style={styles.cvIcon}><Icon name="document" size={20} color={colors.primary} bg={colors.primaryLight} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cvTitle}>{profile.cvUrl ? 'CV attached' : 'No CV yet'}</Text>
              <Text style={styles.cvSub} numberOfLines={1}>{profile.cvUrl ? profile.cvUrl.replace(/^https?:\/\//, '') : 'Add a link in Edit details'}</Text>
            </View>
            {profile.cvUrl ? <Icon name="chevron-right" size={16} color={colors.softText} /> : null}
          </Pressable>
        </Section>

        {/* Portfolio */}
        <Section title="Portfolio" onAction={() => setProjModal({ open: true, index: null })} actionIcon="plus">
          {projects.length ? (
            <View style={{ gap: 10 }}>{projects.map((pr, i) => <ProjectCard key={i} project={pr} onEdit={() => setProjModal({ open: true, index: i })} onPress={() => pr.link && Linking.openURL(pr.link).catch(() => undefined)} />)}</View>
          ) : <Text style={styles.placeholder}>Showcase your best projects — add screenshots and links.</Text>}
        </Section>

        {/* Experience */}
        <Section title="Experience" onAction={() => setExpModal({ open: true, index: null })} actionIcon="plus">
          {experiences.length ? (
            <View>{experiences.map((ex, i) => <TimelineItem key={i} icon="briefcase" title={ex.role} subtitle={ex.org} period={[ex.start, ex.current ? 'Present' : ex.end].filter(Boolean).join(' – ')} description={ex.description} last={i === experiences.length - 1} onEdit={() => setExpModal({ open: true, index: i })} />)}</View>
          ) : <Text style={styles.placeholder}>Add internships, jobs, or volunteering.</Text>}
        </Section>

        {/* Education */}
        <Section title="Education" onAction={() => setEduModal({ open: true, index: null })} actionIcon="plus">
          {educations.length ? (
            <View>{educations.map((ed, i) => <TimelineItem key={i} icon="building" title={ed.school} subtitle={[ed.degree, ed.field].filter(Boolean).join(' · ')} period={[ed.start, ed.end].filter(Boolean).join(' – ')} last={i === educations.length - 1} onEdit={() => setEduModal({ open: true, index: i })} />)}</View>
          ) : <Text style={styles.placeholder}>Add your school and degree.</Text>}
        </Section>

        {/* Menu */}
        <View style={styles.menu}>
          <MenuRow icon="bookmark" label="Saved offers" onPress={() => navigation.navigate('Favorites')} />
          <MenuRow icon="sparkles" label="AI insights" onPress={() => navigation.navigate('AIRecommendations')} />
          <MenuRow icon="star" label="Premium plan" tone="gold" onPress={() => navigation.navigate('Premium')} />
          <MenuRow icon="bell" label="Notifications" onPress={() => navigation.navigate('Notifications')} last />
        </View>

        <AppButton title="Log out" icon="logout" variant="ghost" onPress={logout} style={styles.logout} />
      </ScrollView>

      <DetailsModal
        visible={editDetails}
        profile={profile}
        saving={saving}
        onClose={() => setEditDetails(false)}
        onSave={(next) => { setEditDetails(false); persist(next); }}
      />
      <ProjectModal
        state={projModal}
        items={projects}
        saving={saving}
        onClose={() => setProjModal({ open: false, index: null })}
        onSave={(list) => { setProjModal({ open: false, index: null }); persist({ ...profile, projects: list }, true); }}
      />
      <ExperienceModal
        state={expModal}
        items={experiences}
        saving={saving}
        onClose={() => setExpModal({ open: false, index: null })}
        onSave={(list) => { setExpModal({ open: false, index: null }); persist({ ...profile, experiences: list }, true); }}
      />
      <EducationModal
        state={eduModal}
        items={educations}
        saving={saving}
        onClose={() => setEduModal({ open: false, index: null })}
        onSave={(list) => { setEduModal({ open: false, index: null }); persist({ ...profile, educations: list }, true); }}
      />
    </View>
  );
}

function Section({ title, children, onAction, actionIcon }: { title: string; children: React.ReactNode; onAction?: () => void; actionIcon?: IconName }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onAction ? (
          <Pressable onPress={onAction} hitSlop={8} style={styles.sectionAction}>
            <Icon name={actionIcon ?? 'plus'} size={16} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>
      <SurfaceCard style={styles.sectionCard}>{children}</SurfaceCard>
    </View>
  );
}

function MenuRow({ icon, label, onPress, tone = 'primary', last }: { icon: IconName; label: string; onPress: () => void; tone?: 'primary' | 'gold'; last?: boolean }) {
  const c = tone === 'gold' ? { bg: colors.goldSoft, fg: colors.gold } : { bg: colors.primaryLight, fg: colors.primary };
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuRow, !last && styles.menuDivider, pressed && { backgroundColor: colors.background }]}>
      <View style={[styles.menuIcon, { backgroundColor: c.bg }]}><Icon name={icon} size={18} color={c.fg} bg={c.bg} /></View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Icon name="chevron-right" size={16} color={colors.softText} />
    </Pressable>
  );
}

/* ---------- Bottom-sheet modals ---------- */

function Sheet({ visible, title, onClose, children, footer }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode; footer: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.scrim}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={8}><Icon name="close" size={18} color={colors.muted} /></Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.sheetBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView>
          <View style={styles.sheetFooter}>{footer}</View>
        </View>
      </View>
    </Modal>
  );
}

function DetailsModal({ visible, profile, saving, onClose, onSave }: { visible: boolean; profile: CandidateProfile; saving: boolean; onClose: () => void; onSave: (p: CandidateProfile) => void }) {
  const [draft, setDraft] = useState(profile);
  useEffect(() => { if (visible) setDraft(profile); }, [visible]);
  const setList = (key: 'skills' | 'languages' | 'preferences', v: string) => setDraft({ ...draft, [key]: v.split(',').map((i) => i.trim()).filter(Boolean) });
  const setSocial = (key: keyof NonNullable<CandidateProfile['socials']>, v: string) => setDraft({ ...draft, socials: { ...draft.socials, [key]: v } });
  return (
    <Sheet visible={visible} title="Edit details" onClose={onClose} footer={<AppButton title="Save details" icon="check" onPress={() => onSave(draft)} loading={saving} />}>
      <AppInput label="Headline" value={draft.headline ?? ''} onChangeText={(v) => setDraft({ ...draft, headline: v })} placeholder="CS student · React developer" />
      <AppInput label="Bio" multiline value={draft.bio ?? ''} onChangeText={(v) => setDraft({ ...draft, bio: v })} placeholder="What you build and what you're looking for." />
      <AppInput label="Education level" value={draft.educationLevel ?? ''} onChangeText={(v) => setDraft({ ...draft, educationLevel: v })} placeholder="Master's, Bachelor's…" />
      <AppInput label="Field of study" value={draft.fieldOfStudy ?? ''} onChangeText={(v) => setDraft({ ...draft, fieldOfStudy: v })} placeholder="Computer science" />
      <AppInput label="Location" icon="location" value={draft.location ?? ''} onChangeText={(v) => setDraft({ ...draft, location: v })} placeholder="Casablanca" />
      <AppInput label="Skills" value={draft.skills.join(', ')} onChangeText={(v) => setList('skills', v)} helper="Separate with commas." placeholder="React, Java, Figma" />
      <AppInput label="Languages" value={draft.languages.join(', ')} onChangeText={(v) => setList('languages', v)} placeholder="English, French" />
      <AppInput label="Preferences" value={draft.preferences.join(', ')} onChangeText={(v) => setList('preferences', v)} placeholder="Remote, internship" />
      <AppInput label="CV link" value={draft.cvUrl ?? ''} onChangeText={(v) => setDraft({ ...draft, cvUrl: v })} autoCapitalize="none" placeholder="https://…" />
      <Text style={styles.sheetGroup}>Social links</Text>
      <AppInput label="GitHub" value={draft.socials?.github ?? ''} onChangeText={(v) => setSocial('github', v)} autoCapitalize="none" placeholder="github.com/you" />
      <AppInput label="LinkedIn" value={draft.socials?.linkedin ?? ''} onChangeText={(v) => setSocial('linkedin', v)} autoCapitalize="none" placeholder="linkedin.com/in/you" />
      <AppInput label="Website" value={draft.socials?.website ?? ''} onChangeText={(v) => setSocial('website', v)} autoCapitalize="none" placeholder="yoursite.com" />
    </Sheet>
  );
}

function ProjectModal({ state, items, saving, onClose, onSave }: { state: { open: boolean; index: number | null }; items: Project[]; saving: boolean; onClose: () => void; onSave: (list: Project[]) => void }) {
  const editing = state.index != null ? items[state.index] : undefined;
  const [d, setD] = useState<Project>({ title: '' });
  useEffect(() => { if (state.open) setD(editing ?? { title: '' }); }, [state.open]);
  const save = () => {
    if (!d.title.trim()) return;
    const list = [...items];
    if (state.index != null) list[state.index] = d; else list.push(d);
    onSave(list);
  };
  const remove = () => { if (state.index == null) return; onSave(items.filter((_, i) => i !== state.index)); };
  return (
    <Sheet visible={state.open} title={editing ? 'Edit project' : 'Add project'} onClose={onClose}
      footer={<View style={styles.footerRow}>{editing ? <AppButton title="Delete" variant="danger" size="sm" onPress={remove} style={{ flex: 0, paddingHorizontal: 18 }} /> : null}<AppButton title="Save" icon="check" onPress={save} loading={saving} style={{ flex: 1 }} /></View>}>
      <AppInput label="Title" value={d.title} onChangeText={(v) => setD({ ...d, title: v })} placeholder="Portfolio website" />
      <AppInput label="Description" multiline value={d.description ?? ''} onChangeText={(v) => setD({ ...d, description: v })} placeholder="What it does, your role, the stack." />
      <AppInput label="Link" value={d.link ?? ''} onChangeText={(v) => setD({ ...d, link: v })} autoCapitalize="none" placeholder="https://…" />
      <AppInput label="Image URL" value={d.imageUrl ?? ''} onChangeText={(v) => setD({ ...d, imageUrl: v })} autoCapitalize="none" placeholder="https://…" />
    </Sheet>
  );
}

function ExperienceModal({ state, items, saving, onClose, onSave }: { state: { open: boolean; index: number | null }; items: Experience[]; saving: boolean; onClose: () => void; onSave: (list: Experience[]) => void }) {
  const editing = state.index != null ? items[state.index] : undefined;
  const [d, setD] = useState<Experience>({ role: '', org: '' });
  useEffect(() => { if (state.open) setD(editing ?? { role: '', org: '' }); }, [state.open]);
  const save = () => { if (!d.role.trim() || !d.org.trim()) return; const list = [...items]; if (state.index != null) list[state.index] = d; else list.push(d); onSave(list); };
  const remove = () => { if (state.index == null) return; onSave(items.filter((_, i) => i !== state.index)); };
  return (
    <Sheet visible={state.open} title={editing ? 'Edit experience' : 'Add experience'} onClose={onClose}
      footer={<View style={styles.footerRow}>{editing ? <AppButton title="Delete" variant="danger" size="sm" onPress={remove} style={{ flex: 0, paddingHorizontal: 18 }} /> : null}<AppButton title="Save" icon="check" onPress={save} loading={saving} style={{ flex: 1 }} /></View>}>
      <AppInput label="Role" value={d.role} onChangeText={(v) => setD({ ...d, role: v })} placeholder="Frontend intern" />
      <AppInput label="Organisation" value={d.org} onChangeText={(v) => setD({ ...d, org: v })} placeholder="Acme Inc." />
      <View style={styles.twoCol}>
        <AppInput label="Start" value={d.start ?? ''} onChangeText={(v) => setD({ ...d, start: v })} placeholder="2024" style={{ flex: 1 }} />
        <AppInput label="End" value={d.end ?? ''} onChangeText={(v) => setD({ ...d, end: v })} placeholder="2025" />
      </View>
      <AppInput label="Description" multiline value={d.description ?? ''} onChangeText={(v) => setD({ ...d, description: v })} placeholder="What you did and built." />
    </Sheet>
  );
}

function EducationModal({ state, items, saving, onClose, onSave }: { state: { open: boolean; index: number | null }; items: Education[]; saving: boolean; onClose: () => void; onSave: (list: Education[]) => void }) {
  const editing = state.index != null ? items[state.index] : undefined;
  const [d, setD] = useState<Education>({ school: '' });
  useEffect(() => { if (state.open) setD(editing ?? { school: '' }); }, [state.open]);
  const save = () => { if (!d.school.trim()) return; const list = [...items]; if (state.index != null) list[state.index] = d; else list.push(d); onSave(list); };
  const remove = () => { if (state.index == null) return; onSave(items.filter((_, i) => i !== state.index)); };
  return (
    <Sheet visible={state.open} title={editing ? 'Edit education' : 'Add education'} onClose={onClose}
      footer={<View style={styles.footerRow}>{editing ? <AppButton title="Delete" variant="danger" size="sm" onPress={remove} style={{ flex: 0, paddingHorizontal: 18 }} /> : null}<AppButton title="Save" icon="check" onPress={save} loading={saving} style={{ flex: 1 }} /></View>}>
      <AppInput label="School" value={d.school} onChangeText={(v) => setD({ ...d, school: v })} placeholder="ENSA" />
      <AppInput label="Degree" value={d.degree ?? ''} onChangeText={(v) => setD({ ...d, degree: v })} placeholder="Engineering" />
      <AppInput label="Field" value={d.field ?? ''} onChangeText={(v) => setD({ ...d, field: v })} placeholder="Software" />
      <View style={styles.twoCol}>
        <AppInput label="Start" value={d.start ?? ''} onChangeText={(v) => setD({ ...d, start: v })} placeholder="2021" style={{ flex: 1 }} />
        <AppInput label="End" value={d.end ?? ''} onChangeText={(v) => setD({ ...d, end: v })} placeholder="2025" />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingTop: 4, gap: 16 },
  editLink: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.primaryLight, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill },
  editLinkText: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  identity: { alignItems: 'center', gap: 8 },
  name: { color: colors.text, fontSize: 21, fontWeight: '800', letterSpacing: -0.4, marginTop: 4 },
  headline: { color: colors.textSoft, fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 19 },
  headlineMuted: { color: colors.softText, fontSize: 13.5, textAlign: 'center', fontStyle: 'italic' },
  identityMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: colors.muted, fontWeight: '600', fontSize: 13 },
  completeBlock: { width: '100%', gap: 7, marginTop: 8 },
  completeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  completeLabel: { color: colors.textSoft, fontWeight: '700', fontSize: 13 },
  completeVal: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  section: { gap: 9 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  sectionAction: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  sectionCard: { gap: 11 },
  bodyText: { color: colors.textSoft, fontSize: 14, lineHeight: 21 },
  placeholder: { color: colors.softText, fontSize: 13.5, lineHeight: 19 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  subLabel: { color: colors.textSoft, fontWeight: '700', fontSize: 12.5, marginTop: 4 },
  cvCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cvIcon: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  cvTitle: { color: colors.text, fontWeight: '800', fontSize: 14 },
  cvSub: { color: colors.muted, fontSize: 12.5, marginTop: 1 },
  menu: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  menuIcon: { width: 34, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, color: colors.text, fontWeight: '700', fontSize: 15 },
  logout: { marginTop: 2 },
  scrim: { flex: 1, backgroundColor: colors.scrim },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '88%', ...shadow.medium },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 10 },
  sheetTitle: { color: colors.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  sheetBody: { paddingHorizontal: 20, paddingBottom: 12, gap: 13 },
  sheetGroup: { color: colors.textSoft, fontWeight: '800', fontSize: 13, marginTop: 6 },
  sheetFooter: { paddingHorizontal: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white },
  footerRow: { flexDirection: 'row', gap: 10 },
  twoCol: { flexDirection: 'row', gap: 10 }
});
