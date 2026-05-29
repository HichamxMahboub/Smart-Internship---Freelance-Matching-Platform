import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { profileService } from '../../services/profileService';
import { colors } from '../../theme/colors';

export function RecruiterProfileScreen() { const [position, setPosition] = useState(''); const [phone, setPhone] = useState(''); useEffect(() => { profileService.getRecruiterProfile().then((p) => { setPosition(p.position ?? ''); setPhone(p.phone ?? ''); }).catch(() => undefined); }, []); const save = async () => { try { await profileService.updateRecruiterProfile({ position, phone }); Alert.alert('Saved', 'Profile updated.'); } catch { Alert.alert('Error', 'Could not save profile.'); } }; return <View style={styles.container}><Text style={styles.title}>Recruiter profile</Text><AppInput label="Position" value={position} onChangeText={setPosition} /><AppInput label="Phone" value={phone} onChangeText={setPhone} /><AppButton title="Save" onPress={save} /></View>; }
const styles = StyleSheet.create({ container: { flex: 1, padding: 16, gap: 12, backgroundColor: colors.background }, title: { fontSize: 26, fontWeight: '900', color: colors.text } });
