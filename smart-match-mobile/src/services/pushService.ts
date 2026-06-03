import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { userService } from './userService';

/**
 * Best-effort registration of the device FCM token with the backend so it can deliver
 * push notifications when the app is backgrounded. Silently ignored on web / Expo Go
 * where a native device token is not available.
 */
export async function registerPushToken() {
  if (Platform.OS === 'web') return;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;
    const token = await Notifications.getDevicePushTokenAsync();
    if (token?.data) {
      await userService.updateFcmToken(String(token.data));
    }
  } catch {
    // Token registration is optional; ignore failures (e.g. no FCM in Expo Go).
  }
}
