import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { SurfaceCard } from '../../components/SurfaceCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Avatar } from '../../components/Avatar';
import { Chip } from '../../components/Chip';
import { Icon, IconName } from '../../components/Icon';
import { useAuth } from '../../auth/AuthContext';
import { profileService } from '../../services/profileService';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';

export function RecruiterProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { profileService.getRecruiterProfile().then((p) => { setPosition(p.position ?? ''); setPhone(p.phone ?? ''); }).catch(() => undefined); }, []);
  const save = async () => { try { setSaving(true); await profileService.updateRecruiterProfile({ position, phone }); Alert.alert('Saved', 'Recruiter profile updated.'); } catch { Alert.alert('Error', 'Could not save profile.'); } finally { setSaving(false); } };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Profile" subtitle="Account & details" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SurfaceCard style={styles.identity}>
          <Avatar name={user?.fullName} size={58} />
          <View style={styles.identityText}>
            <Text style={styles.name} numberOfLines={1}>{user?.fullName || 'Recruiter'}</Text>
            <Text style={styles.email} numberOfLines={1}>{user?.email}</Text>
          </View>
          <Chip label="Recruiter" tone="brand" />
        </SurfaceCard>

        <View style={styles.menu}>
          <MenuRow icon="building" label="Company profile" onPress={() => navigation.navigate('Company')} />
          <MenuRow icon="bell" label="Notifications" onPress={() => navigation.navigate('Notifications')} last />
        </View>

        <Text style={styles.sectionTitle}>Recruiter details</Text>
        <SurfaceCard style={styles.form}>
          <AppInput label="Position" icon="briefcase" value={position} onChangeText={setPosition} placeholder="Talent acquisition lead" />
          <AppInput label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+212 …" />
          <AppButton title="Save profile" icon="check" onPress={save} loading={saving} />
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
  identity: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  identityText: { flex: 1, gap: 3 },
  name: { color: colors.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  email: { color: colors.muted, fontSize: 13 },
  menu: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  menuIcon: { width: 34, height: 34, borderRadius: radius.sm, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, color: colors.text, fontWeight: '700', fontSize: 15 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '800', letterSpacing: -0.2, marginTop: 2 },
  form: { gap: 13 },
  logout: { marginTop: 4 }
});
