// VERSUSFY FIREBASE SUPREME - v2.2.0-OMNI
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let app: any = null;
let db: any = null;
let auth: any = null;

const runtimeConfig = (window as any).VERSUSFY_RUNTIME_CONFIG || {};

// Helper to get env var with fallback
const getEnv = (key: string, customKey: string, fallback: string) => {
  const envVal = (import.meta as any).env?.[key];
  const configVal = (firebaseConfig as any)[customKey];
  const runtimeVal = runtimeConfig[customKey];

  // If we have a specific AI Studio ID in config, and the env is just "(default)" or "default", prefer the config
  if (customKey === 'firestoreDatabaseId' && (envVal === '(default)' || envVal === 'default') && configVal && configVal !== '(default)' && configVal !== 'default') {
    return configVal;
  }

  // If env is the generic placeholder, prefer the config file
  if (key === 'VITE_FIREBASE_PROJECT_ID' && envVal?.startsWith('gen-lang-client-') && configVal) {
    return configVal;
  }

  return envVal || runtimeVal || configVal || fallback;
};

const finalConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY', 'apiKey', firebaseConfig.apiKey),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', 'authDomain', firebaseConfig.authDomain),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', 'projectId', firebaseConfig.projectId),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', 'storageBucket', firebaseConfig.storageBucket),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', 'messagingSenderId', firebaseConfig.messagingSenderId),
  appId: getEnv('VITE_FIREBASE_APP_ID', 'appId', firebaseConfig.appId),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID', 'measurementId', firebaseConfig.measurementId),
  databaseId: getEnv('VITE_FIREBASE_DATABASE_ID', 'firestoreDatabaseId', 'ai-studio-f0c1260c-872e-4bbe-ba1c-fdb9dc1d1205')
};

// Remove the forced logic that was overriding with (default)
/* 
if ((import.meta as any).env?.VITE_FIREBASE_DATABASE_ID === '(default)') {
  finalConfig.databaseId = '(default)';
}
*/

try {
  if (!getApps().length) {
    app = initializeApp(finalConfig);
  } else {
    app = getApps()[0];
  }
  
  // FORCE THE SPECIFIC DATABASE ID
  // If it's "(default)" or "default", we can call getFirestore(app)
  const isDefault = !finalConfig.databaseId || finalConfig.databaseId === '(default)' || finalConfig.databaseId === 'default';
  db = isDefault ? getFirestore(app) : getFirestore(app, finalConfig.databaseId);
  auth = getAuth(app);

  console.log(`Versusfy: Firebase initialized for project ${finalConfig.projectId} with DB: ${finalConfig.databaseId}`);
} catch (error) {
  console.error("Versusfy: Firebase Failure.", error);
}

export { db, auth, app };
