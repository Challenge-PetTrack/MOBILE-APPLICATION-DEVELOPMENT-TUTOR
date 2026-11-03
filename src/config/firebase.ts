import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, type Auth } from "firebase/auth";
// @ts-ignore - o TypeScript não resolve bem os exports condicionais de react-native do firebase/auth
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore, initializeFirestore, type Firestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDigV2Mn_0r3fPD9ROrCrmvT9bGx8G7yHc",
  authDomain: "pettrack-20299.firebaseapp.com",
  projectId: "pettrack-20299",
  storageBucket: "pettrack-20299.firebasestorage.app",
  messagingSenderId: "863581464520",
  appId: "1:863581464520:web:32974dc0df351119cec2fd",
  measurementId: "G-KV7VS9TQ07",
};

// Inicializa o Firebase apenas uma vez (Fast Refresh pode reexecutar este módulo)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error: any) {
  // Ignora o erro se a Auth já estiver inicializada (comum no Fast Refresh do Expo)
  if (error.code === "auth/already-initialized") {
    auth = getAuth(app);
  } else {
    throw error;
  }
}

let db: Firestore;
try {
  // Long polling automático evita problemas de WebChannel em algumas redes móveis;
  // ignoreUndefinedProperties permite enviar objetos com campos opcionais não preenchidos.
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true,
  });
} catch {
  db = getFirestore(app);
}

export { app, auth, db };
