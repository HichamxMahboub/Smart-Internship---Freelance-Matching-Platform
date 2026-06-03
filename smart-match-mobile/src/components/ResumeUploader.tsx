import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { AppButton } from './AppButton';
import { Icon } from './Icon';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';
import { profileService } from '../services/profileService';

export function ResumeUploader({
  cvUrl,
  onUploaded
}: {
  cvUrl?: string;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const pickResume = async () => {
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
    const mimeType = asset.mimeType ?? 'application/pdf';
    const name = asset.name ?? `resume-${Date.now()}.pdf`;

    setUploading(true);
    try {
      const saved = await profileService.uploadCandidateCvFromUri({
        uri: asset.uri,
        name,
        mimeType
      });
      onUploaded(saved);
      Alert.alert('Uploaded', 'Your resume was saved to your profile.');
    } catch (error) {
      Alert.alert('Upload failed', error instanceof Error ? error.message : 'Could not upload resume.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.card}>
        <View style={styles.icon}>
          <Icon name="document" size={20} color={colors.primary} bg={colors.primaryLight} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{cvUrl ? 'CV attached' : 'No CV yet'}</Text>
          <Text style={styles.sub} numberOfLines={1}>
            {cvUrl ? cvUrl.replace(/^https?:\/\//, '') : 'PDF, DOC or DOCX — stored on Cloudinary'}
          </Text>
        </View>
      </Pressable>
      {uploading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Uploading resume…</Text>
        </View>
      ) : (
        <AppButton title={cvUrl ? 'Replace CV' : 'Upload CV'} icon="document" onPress={pickResume} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: { color: colors.text, fontWeight: '700', fontSize: 14 },
  sub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  loadingText: { color: colors.muted, fontWeight: '600' }
});
