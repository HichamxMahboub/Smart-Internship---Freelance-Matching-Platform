import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../auth/AuthContext';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { colors } from '../../theme/colors';

export function LoginScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Login'>) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async () => { try { setLoading(true); await login(email.trim(), password); } catch { Alert.alert('Login failed', 'Check your Firebase credentials and backend user sync.'); } finally { setLoading(false); } };
  return <View style={styles.container}><Text style={styles.title}>Smart Match</Text><Text style={styles.subtitle}>Internship and freelance matching</Text><View style={styles.form}><AppInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" /><AppInput label="Password" value={password} onChangeText={setPassword} secureTextEntry /><AppButton title="Sign in" onPress={submit} loading={loading} /><AppButton title="Create candidate or recruiter account" variant="secondary" onPress={() => navigation.navigate('Register')} /></View></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background }, title: { fontSize: 34, fontWeight: '900', color: colors.primary, textAlign: 'center' }, subtitle: { color: colors.muted, textAlign: 'center', marginTop: 6, marginBottom: 28 }, form: { gap: 14 } });
