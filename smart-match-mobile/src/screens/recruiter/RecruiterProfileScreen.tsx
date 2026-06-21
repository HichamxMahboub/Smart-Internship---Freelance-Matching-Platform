import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { SurfaceCard } from '../../components/SurfaceCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Chip } from '../../components/Chip';
import { Icon, IconName } from '../../components/Icon';
import { PhotoPicker } from '../../components/PhotoPicker';
import { useAuth } from '../../auth/AuthContext';
import { profileService } from '../../services/profileService';
import { companyService } from '../../services/companyService';
import { Company, RecruiterProfile } from '../../types';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';

export function RecruiterProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<RecruiterProfile>({});
  const [company, setCompany] = useState<Company | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profileService.getRecruiterProfile().then(setProfile).catch(() => undefined);
    companyService.getMine().then(setCompany).catch(() => undefined);
  }, []);

  const set = (patch: Partial<RecruiterProfile>) => setProfile((prev) => ({ ...prev, ...patch }));
  const save = async (next: RecruiterProfile = profile, quiet = false) => {
    setProfile(next);
    try { setSaving(true); const saved = await profileService.updateRecruiterProfile(next); setProfile(saved); if (!quiet) Alert.alert('Saved', 'Recruiter profile updated.'); }
    catch { Alert.alert('Error', 'Could not save profile.'); }
    finally { setSaving(false); }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Profile" subtitle="Account & details" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <SurfaceCard style={styles.identity}>
          <PhotoPicker name={user?.fullName} uri={profile.photoUrl} size={84} onChange={(url) => save({ ...profile, photoUrl: url }, true)} />
          <Text style={styles.name} numberOfLines={1}>{user?.fullName || 'Recruiter'}</Text>
          {profile.headline ? <Text style={styles.headline} numberOfLines={2}>{profile.headline}</Text> : <Text style={styles.headlineMuted}>Add a headline (e.g. role at your company).</Text>}
          <Text style={styles.email} numberOfLines={1}>{user?.email}</Text>
          <View style={styles.badges}>
            <Chip label="Recruiter" tone="brand" />
            {company?.name ? <Chip label={company.name} tone="teal" /> : null}
          </View>
        </SurfaceCard>

        <View style={styles.menu}>
          <MenuRow icon="building" label="Organisation profile" onPress={() => navigation.navigate('Company')} />
          <MenuRow icon="sparkles" label="Assistant intelligent" onPress={() => navigation.navigate('RecruiterAssistant')} />
          <MenuRow icon="bell" label="Notifications" onPress={() => navigation.navigate('Notifications')} last />
        </View>

        <Text style={styles.sectionTitle}>Recruiter details</Text>
        <SurfaceCard style={styles.form}>
          <AppInput label="Headline" value={profile.headline ?? ''} onChangeText={(v) => set({ headline: v })} placeholder="Head of Talent at Acme" />
          <AppInput label="About" multiline value={profile.bio ?? ''} onChangeText={(v) => set({ bio: v })} placeholder="What you hire for and what students can expect." />
          <AppInput label="Position" icon="briefcase" value={profile.position ?? ''} onChangeText={(v) => set({ position: v })} placeholder="Talent acquisition lead" />
          <AppInput label="Phone" value={profile.phone ?? ''} onChangeText={(v) => set({ phone: v })} keyboardType="phone-pad" placeholder="+212 …" />
          <AppInput label="LinkedIn" value={profile.linkedin ?? ''} onChangeText={(v) => set({ linkedin: v })} autoCapitalize="none" placeholder="linkedin.com/in/you" />
          <AppButton title="Save profile" icon="check" onPress={() => save()} loading={saving} />
        </SurfaceCard>

        <AppButton title="Log out" icon="logout" variant="ghost" onPress={logout} style={styles.logout} />
      </ScrollView>
    </View>
  );
}

function MenuRow({ icon, label, onPress, last }: { icon: IconName; label: string; onPress: () => void; last?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuRow, !last && styles.menuDivider, pressed && { backgroundColor: colors.background }]}>
      <View style={styles.menuIcon}><Icon name={icon} size={18} color={colors.primary} bg={colors.primaryLight} /></View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Icon name="chevron-right" size={16} color={colors.softText} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingTop: 4, gap: 16, paddingBottom: 28 },
  identity: { alignItems: 'center', gap: 7 },
  name: { color: colors.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.3, marginTop: 4 },
  headline: { color: colors.textSoft, fontSize: 13.5, fontWeight: '600', textAlign: 'center', lineHeight: 18 },
  headlineMuted: { color: colors.softText, fontSize: 13, textAlign: 'center', fontStyle: 'italic' },
  email: { color: colors.muted, fontSize: 13 },
  badges: { flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' },
  menu: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  menuIcon: { width: 34, height: 34, borderRadius: radius.sm, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, color: colors.text, fontWeight: '700', fontSize: 15 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '800', letterSpacing: -0.2, marginTop: 2 },
  form: { gap: 13 },
  logout: { marginTop: 4 }
});
