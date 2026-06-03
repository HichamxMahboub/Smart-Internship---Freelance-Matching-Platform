import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { radius, shadow } from '../theme/spacing';
import { Avatar } from './Avatar';
import { AppButton } from './AppButton';
import { Icon } from './Icon';
import { uploadService } from '../services/uploadService';

export function PhotoPicker({
  name,
  uri,
  size = 96,
  onChange,
  editable = true
}: {
  name?: string;
  uri?: string;
  size?: number;
  onChange?: (url: string) => void;
  editable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickAndUpload = async (source: 'library' | 'camera') => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow access to your photos or camera to upload a profile image.');
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.85,
            allowsEditing: true,
            aspect: [1, 1]
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.85,
            allowsEditing: true,
            aspect: [1, 1]
          });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? 'image/jpeg';
    const fileName = asset.fileName ?? `photo-${Date.now()}.jpg`;

    setUploading(true);
    try {
      const uploaded = await uploadService.uploadImageFromDevice({
        uri: asset.uri,
        name: fileName,
        mimeType
      });
      onChange?.(uploaded.url);
      setOpen(false);
    } catch (error) {
      Alert.alert('Upload failed', error instanceof Error ? error.message : 'Could not upload image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View>
      <Pressable
        disabled={!editable}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [pressed && editable && styles.pressed]}
      >
        <Avatar name={name} uri={uri} size={size} />
        {editable ? (
          <View style={[styles.badge, { right: size * 0.02, bottom: size * 0.02 }]}>
            <Icon name="edit" size={14} color={colors.white} bg={colors.primary} />
          </View>
        ) : null}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => !uploading && setOpen(false)}>
        <Pressable style={styles.scrim} onPress={() => !uploading && setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>Profile photo</Text>
            <Text style={styles.hint}>Choose from your gallery or take a new photo. Files upload to Cloudinary.</Text>
            <View style={styles.preview}>
              <Avatar name={name} uri={uri} size={72} />
            </View>
            {uploading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.loadingText}>Uploading…</Text>
              </View>
            ) : (
              <View style={styles.actions}>
                <AppButton title="Gallery" icon="plus" size="sm" onPress={() => pickAndUpload('library')} style={styles.flex} />
                <AppButton title="Camera" icon="edit" size="sm" variant="secondary" onPress={() => pickAndUpload('camera')} style={styles.flex} />
              </View>
            )}
            <AppButton
              title="Remove photo"
              variant="ghost"
              size="sm"
              disabled={uploading || !uri}
              onPress={() => {
                onChange?.('');
                setOpen(false);
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  badge: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white
  },
  scrim: { flex: 1, backgroundColor: colors.scrim, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 22,
    paddingBottom: 34,
    gap: 12,
    ...shadow.medium
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: -4 },
  preview: { alignItems: 'center', paddingVertical: 6 },
  actions: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 8 },
  loadingText: { color: colors.muted, fontWeight: '600' }
});
