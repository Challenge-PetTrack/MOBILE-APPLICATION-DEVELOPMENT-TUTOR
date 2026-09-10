import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
// @ts-ignore - TS doesn't resolve react-native conditional exports well
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  // TODO: Substitua pelas credenciais reais do seu projeto no Firebase Console
  apiKey: "AIzaSy_YOUR_API_KEY",
  authDomain: "pettrack-your-project.firebaseapp.com",
  projectId: "pettrack-your-project",
  storageBucket: "pettrack-your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: any;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error: any) {
  // Ignora o erro se a Auth já estiver inicializada (comum no Fast Refresh do Expo)
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw error;
  }
}

export { app, auth };
