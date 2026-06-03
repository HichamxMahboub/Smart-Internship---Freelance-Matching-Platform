type ExpoEnv = {
  EXPO_PUBLIC_API_BASE_URL?: string;
  EXPO_PUBLIC_WS_URL?: string;
  EXPO_PUBLIC_FIREBASE_API_KEY?: string;
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
  EXPO_PUBLIC_FIREBASE_PROJECT_ID?: string;
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?: string;
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string;
  EXPO_PUBLIC_FIREBASE_APP_ID?: string;
};

const expoEnv = ((globalThis as typeof globalThis & { process?: { env?: ExpoEnv } }).process?.env ?? {});

export const API_BASE_URL = expoEnv.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api';

// STOMP WebSocket endpoint. For Android emulator use ws://10.0.2.2:8080/ws.
export const WS_URL = expoEnv.EXPO_PUBLIC_WS_URL ?? 'ws://localhost:8080/ws';

export const firebaseConfig = {
  apiKey: expoEnv.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'replace-me',
  authDomain: expoEnv.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'replace-me.firebaseapp.com',
  projectId: expoEnv.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'replace-me',
  storageBucket: expoEnv.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'replace-me.appspot.com',
  messagingSenderId: expoEnv.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? 'replace-me',
  appId: expoEnv.EXPO_PUBLIC_FIREBASE_APP_ID ?? 'replace-me'
};
