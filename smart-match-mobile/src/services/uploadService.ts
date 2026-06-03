import { Platform } from 'react-native';
import { apiClient, getApiErrorMessage } from '../api/apiClient';

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  resourceType: string;
  uploadUrl: string;
}

export interface AssetUploadResult {
  url: string;
  publicId?: string;
}

type PickedFile = { uri: string; name: string; mimeType: string };

/** React Native accepts { uri, name, type }; browsers need a real File/Blob. */
export async function appendDeviceFile(form: FormData, file: PickedFile) {
  if (Platform.OS === 'web') {
    const response = await fetch(file.uri);
    const blob = await response.blob();
    form.append('file', new File([blob], file.name, { type: file.mimeType || blob.type || 'image/jpeg' }));
    return;
  }
  form.append('file', { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);
}

async function uploadToCloudinary(file: PickedFile, signature: UploadSignature): Promise<string> {
  const form = new FormData();
  await appendDeviceFile(form, file);
  form.append('api_key', signature.apiKey);
  form.append('timestamp', String(signature.timestamp));
  form.append('signature', signature.signature);
  form.append('folder', signature.folder);

  const response = await fetch(signature.uploadUrl, { method: 'POST', body: form });
  const payload = (await response.json()) as { secure_url?: string; error?: { message?: string } };
  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message ?? 'Cloudinary upload failed');
  }
  return payload.secure_url;
}

export const uploadService = {
  async signImage(): Promise<UploadSignature> {
    const { data } = await apiClient.get<UploadSignature>('/uploads/sign-image');
    return data;
  },

  async signResume(): Promise<UploadSignature> {
    const { data } = await apiClient.get<UploadSignature>('/uploads/sign-resume');
    return data;
  },

  /** Upload image directly to Cloudinary (signed by backend). */
  async uploadImageFromDevice(file: PickedFile): Promise<AssetUploadResult> {
    try {
      const signature = await this.signImage();
      const url = await uploadToCloudinary(file, signature);
      return { url };
    } catch (error) {
      const message = getApiErrorMessage(error, 'Image upload failed');
      const viaBackend = await this.uploadImageViaBackend(file);
      if (viaBackend) return viaBackend;
      throw new Error(message);
    }
  },

  /** Fallback: multipart upload through the API. */
  async uploadImageViaBackend(file: PickedFile): Promise<AssetUploadResult | null> {
    try {
      const form = new FormData();
      await appendDeviceFile(form, file);
      const { data } = await apiClient.post<AssetUploadResult>('/uploads/images', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    } catch {
      return null;
    }
  },

  async uploadResumeFromDevice(file: PickedFile): Promise<AssetUploadResult> {
    try {
      const signature = await this.signResume();
      const url = await uploadToCloudinary(file, signature);
      return { url };
    } catch (error) {
      const message = getApiErrorMessage(error, 'Resume upload failed');
      const viaBackend = await this.uploadResumeViaBackend(file);
      if (viaBackend) return viaBackend;
      throw new Error(message);
    }
  },

  async uploadResumeViaBackend(file: PickedFile): Promise<AssetUploadResult | null> {
    try {
      const form = new FormData();
      await appendDeviceFile(form, file);
      const { data } = await apiClient.post<AssetUploadResult>('/uploads/resumes', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    } catch {
      return null;
    }
  }
};
