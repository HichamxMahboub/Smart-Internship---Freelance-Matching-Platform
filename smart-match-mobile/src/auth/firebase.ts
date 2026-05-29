import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { firebaseConfig } from '../config/env';

declare const require: any;

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const firebaseAuth = (() => {
  try {
    const reactNativeAuth = require('@firebase/auth');
    const getReactNativePersistence = reactNativeAuth.getReactNativePersistence;
    if (typeof getReactNativePersistence === 'function') {
      return initializeAuth(firebaseApp, { persistence: getReactNativePersistence(AsyncStorage) });
    }
  } catch {
    // Web and some SDK builds do not expose React Native persistence from the default condition.
  }
  return getAuth(firebaseApp);
})();
