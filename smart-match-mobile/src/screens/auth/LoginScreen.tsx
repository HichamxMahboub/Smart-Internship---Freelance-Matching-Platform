import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../auth/AuthContext';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { AnimatedEntrance } from '../../components/AnimatedEntrance';
import { Brand } from '../../components/Brand';
import { colors } from '../../theme/colors';
import { radius, shadow } from '../../theme/spacing';

export function LoginScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Login'>) {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    try { setLoading(true); await login(email.trim(), password); }
    catch { Alert.alert('Login failed', 'Check your email, password, and Firebase configuration.'); }
    finally { setLoading(false); }
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.ink} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 40 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <AnimatedEntrance style={styles.brandBlock}>
            <View style={styles.logoChip}><Brand size={84} /></View>
            <Text style={styles.brand}>Interlance</Text>
            <Text style={styles.tagline}>Where internships and freelance talent meet.</Text>
          </AnimatedEntrance>
          <AnimatedEntrance delay={120}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Welcome back</Text>
              <Text style={styles.cardSubtitle}>Sign in to continue building your next career move.</Text>
              <AppInput label="Email" icon="mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
              <AppInput label="Password" icon="shield" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
              <AppButton title="Sign in" size="lg" onPress={submit} loading={loading} style={styles.cta} />
              <View style={styles.divider}><View style={styles.line} /><Text style={styles.dividerText}>New to Interlance?</Text><View style={styles.line} /></View>
              <AppButton title="Create an account" variant="secondary" onPress={() => navigation.navigate('Register')} />
            </View>
          </AnimatedEntrance>
          <Text style={styles.footer}>Internships · Freelance · AI matching</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ink, overflow: 'hidden' },
  flex: { flex: 1 },
  scroll: { padding: 22, paddingBottom: 40, flexGrow: 1, justifyContent: 'center' },
  brandBlock: { alignItems: 'center', marginBottom: 28 },
  logoChip: { width: 100, height: 100, borderRadius: radius.xl, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginBottom: 16, ...shadow.medium },
  brand: { color: colors.white, fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  tagline: { color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 6, fontWeight: '500', fontSize: 14 },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: 22, gap: 14, ...shadow.medium },
  cardTitle: { color: colors.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  cardSubtitle: { color: colors.muted, lineHeight: 21, marginBottom: 2, fontSize: 14 },
  cta: { marginTop: 4 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 2 },
  line: { flex: 1, height: 1, backgroundColor: colors.divider },
  dividerText: { color: colors.softText, fontSize: 12, fontWeight: '600' },
  footer: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 24, fontSize: 12, fontWeight: '600', letterSpacing: 0.3 }
});
