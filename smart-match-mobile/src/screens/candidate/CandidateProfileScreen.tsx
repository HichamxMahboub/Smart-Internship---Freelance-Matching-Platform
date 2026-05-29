import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { profileService } from '../../services/profileService';
import { CandidateProfile } from '../../types';
import { colors } from '../../theme/colors';

export function CandidateProfileScreen() {
  const [profile, setProfile] = useState<CandidateProfile>({ skills: [], languages: [], preferences: [] });
  useEffect(() => { profileService.getCandidateProfile().then(setProfile).catch(() => undefined); }, []);
  const save = async () => { try { await profileService.updateCandidateProfile(profile); Alert.alert('Saved', 'Profile updated.'); } catch { Alert.alert('Error', 'Could not save profile.'); } };
  const setList = (key: 'skills' | 'languages' | 'preferences', value: string) => setProfile({ ...profile, [key]: value.split(',').map((item) => item.trim()).filter(Boolean) });
  return <ScrollView style={styles.container} contentContainerStyle={styles.content}><Text style={styles.title}>Candidate profile</Text><AppInput label="Education level" value={profile.educationLevel ?? ''} onChangeText={(v) => setProfile({ ...profile, educationLevel: v })} /><AppInput label="Field of study" value={profile.fieldOfStudy ?? ''} onChangeText={(v) => setProfile({ ...profile, fieldOfStudy: v })} /><AppInput label="Location" value={profile.location ?? ''} onChangeText={(v) => setProfile({ ...profile, location: v })} /><AppInput label="Skills" value={profile.skills.join(', ')} onChangeText={(v) => setList('skills', v)} /><AppInput label="Languages" value={profile.languages.join(', ')} onChangeText={(v) => setList('languages', v)} /><AppInput label="Preferences" value={profile.preferences.join(', ')} onChangeText={(v) => setList('preferences', v)} /><AppButton title="Upload CV (TODO)" variant="secondary" onPress={() => Alert.alert('TODO', 'Connect Expo document picker to /candidate-profiles/me/upload-cv.')} /><AppButton title="Save profile" onPress={save} /></ScrollView>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background }, content: { padding: 16, gap: 12 }, title: { fontSize: 24, fontWeight: '900', color: colors.text } });
