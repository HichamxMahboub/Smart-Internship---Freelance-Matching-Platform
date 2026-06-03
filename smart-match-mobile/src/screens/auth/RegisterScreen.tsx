import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../auth/AuthContext';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { AnimatedEntrance } from '../../components/AnimatedEntrance';
import { Icon, IconName } from '../../components/Icon';
import { Role } from '../../types';
import { colors } from '../../theme/colors';
import { radius, shadow } from '../../theme/spacing';

export function RegisterScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Register'>) {
  const { register } = useAuth();
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('CANDIDATE');
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    try { setLoading(true); await register({ fullName, email: email.trim(), password, role }); }
    catch { Alert.alert('Registration failed', 'Check Firebase config and backend availability.'); }
    finally { setLoading(false); }
  };
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]} keyboardShouldPersistTaps="handled">
        <AnimatedEntrance>
          <Text style={styles.kicker}>JOIN INTERLANCE</Text>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Choose your workspace, then tell us the essentials.</Text>
        </AnimatedEntrance>
        <AnimatedEntrance delay={120} style={styles.roleRow}>
          <RoleCard icon="user" label="Candidate" caption="Find internships & freelance work" active={role === 'CANDIDATE'} onPress={() => setRole('CANDIDATE')} />
          <RoleCard icon="briefcase" label="Recruiter" caption="Publish offers & manage talent" active={role === 'RECRUITER'} onPress={() => setRole('RECRUITER')} />
        </AnimatedEntrance>
        <AnimatedEntrance delay={180} style={styles.form}>
          <AppInput label="Full name" icon="user" value={fullName} onChangeText={setFullName} placeholder="Latif Abderrahmane" />
          <AppInput label="Email" icon="mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
          <AppInput label="Password" icon="shield" value={password} onChangeText={setPassword} secureTextEntry helper="Use at least 6 characters for Firebase auth." />
          <AppButton title="Create account" size="lg" onPress={submit} loading={loading} />
          <AppButton title="Back to login" variant="ghost" onPress={() => navigation.goBack()} />
        </AnimatedEntrance>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function RoleCard({ icon, label, caption, active, onPress }: { icon: IconName; label: string; caption: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.role, active && styles.activeRole]}>
      <View style={[styles.roleIcon, active && styles.roleIconActive]}>
        <Icon name={icon} size={20} color={active ? colors.white : colors.primary} bg={active ? colors.ink : colors.primaryLight} />
      </View>
      <Text style={[styles.roleLabel, active && styles.activeText]}>{label}</Text>
      <Text style={[styles.roleCaption, active && styles.activeCaption]}>{caption}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, gap: 18, paddingBottom: 40 },
  kicker: { color: colors.primary, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8, fontSize: 12 },
  title: { fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -0.8, lineHeight: 36 },
  subtitle: { color: colors.muted, marginTop: 8, lineHeight: 21, fontSize: 14 },
  roleRow: { flexDirection: 'row', gap: 12 },
  role: { flex: 1, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, padding: 15, minHeight: 132, gap: 8, ...shadow.xs },
  activeRole: { backgroundColor: colors.ink, borderColor: colors.ink },
  roleIcon: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  roleIconActive: { backgroundColor: 'rgba(255,255,255,0.14)' },
  roleLabel: { color: colors.text, fontWeight: '800', fontSize: 16, marginTop: 2 },
  roleCaption: { color: colors.muted, lineHeight: 18, fontSize: 12.5 },
  activeText: { color: colors.white },
  activeCaption: { color: 'rgba(255,255,255,0.7)' },
  form: { gap: 13 }
});
