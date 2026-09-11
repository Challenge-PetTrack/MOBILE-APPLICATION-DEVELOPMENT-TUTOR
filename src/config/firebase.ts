import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
// @ts-ignore - TS doesn't resolve react-native conditional exports well
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDigV2Mn_0r3fPD9ROrCrmvT9bGx8G7yHc",
  authDomain: "pettrack-20299.firebaseapp.com",
  projectId: "pettrack-20299",
  storageBucket: "pettrack-20299.firebasestorage.app",
  messagingSenderId: "863581464520",
  appId: "1:863581464520:web:32974dc0df351119cec2fd",
  measurementId: "G-KV7VS9TQ07"
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
