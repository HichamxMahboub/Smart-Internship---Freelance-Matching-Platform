import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { AppButton } from './AppButton';
import { Icon } from './Icon';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';
import { profileService } from '../services/profileService';
import { CandidateProfile } from '../types';

interface Props {
  onAutofilled: (profile: CandidateProfile, summary: { skills: number; experiences: number; educations: number; source: string }) => void;
  overwrite?: boolean;
  compact?: boolean;
}

export function CvAutofillCard({ onAutofilled, overwrite = false, compact }: Props) {
  const [busy, setBusy] = useState(false);

  const pick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      copyToCacheDirectory: true,
      multiple: false
    });
    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const file = {
      uri: asset.uri,
      name: asset.name ?? `resume-${Date.now()}.pdf`,
      mimeType: asset.mimeType ?? 'application/pdf'
    };

    setBusy(true);
    try {
      const res = await profileService.autofillFromCv(file, overwrite);
      onAutofilled(res.profile, {
        skills: res.extractedSkills,
        experiences: res.extractedExperiences,
        educations: res.extractedEducations,
        source: res.source
      });
      Alert.alert(
        'Profile filled from CV',
        `${res.extractedSkills} skills · ${res.extractedExperiences} experiences · ${res.extractedEducations} educations.\n\nReview and edit any field.`
      );
    } catch (err: any) {
      Alert.alert('CV parse failed', err?.response?.data?.message ?? 'Could not read this CV. Try a text-based PDF or DOCX.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={styles.head}>
        <View style={styles.icon}>
          <Icon name="sparkles" size={20} color={colors.primary} bg={colors.primaryLight} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Auto-fill from CV</Text>
          <Text style={styles.sub}>Upload your CV and we fill skills with proficiency, education, experience and more.</Text>
        </View>
      </View>
      {busy ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Reading your CV…</Text>
        </View>
      ) : (
        <AppButton title="Upload CV & auto-fill" icon="sparkles" onPress={pick} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 16 },
  wrapCompact: { padding: 14 },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  icon: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontWeight: '800', fontSize: 15 },
  sub: { color: colors.muted, fontSize: 12.5, lineHeight: 18, marginTop: 2 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', paddingVertical: 6 },
  loadingText: { color: colors.muted, fontWeight: '600' }
});
