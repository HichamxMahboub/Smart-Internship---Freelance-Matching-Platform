import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../auth/AuthContext';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { Role } from '../../types';
import { colors } from '../../theme/colors';

export function RegisterScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Register'>) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('CANDIDATE');
  const [loading, setLoading] = useState(false);
  const submit = async () => { try { setLoading(true); await register({ fullName, email: email.trim(), password, role }); } catch { Alert.alert('Registration failed', 'Check Firebase config and backend availability.'); } finally { setLoading(false); } };
  return <View style={styles.container}><Text style={styles.title}>Create account</Text><View style={styles.roleRow}><Pressable style={[styles.role, role === 'CANDIDATE' && styles.active]} onPress={() => setRole('CANDIDATE')}><Text>Candidate</Text></Pressable><Pressable style={[styles.role, role === 'RECRUITER' && styles.active]} onPress={() => setRole('RECRUITER')}><Text>Recruiter</Text></Pressable></View><AppInput label="Full name" value={fullName} onChangeText={setFullName} /><AppInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" /><AppInput label="Password" value={password} onChangeText={setPassword} secureTextEntry /><AppButton title="Register" onPress={submit} loading={loading} /><AppButton title="Back to login" variant="secondary" onPress={() => navigation.goBack()} /></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: 24, gap: 14, backgroundColor: colors.background }, title: { fontSize: 30, fontWeight: '900', color: colors.primary, textAlign: 'center' }, roleRow: { flexDirection: 'row', gap: 10 }, role: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 14, alignItems: 'center' }, active: { backgroundColor: colors.primaryLight, borderColor: colors.primary } });
