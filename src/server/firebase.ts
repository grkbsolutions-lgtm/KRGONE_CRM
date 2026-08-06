import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';

function getFirebaseConfig() {
  const envConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || 'AIzaSyBV1V94SpuVkVcvgRdzXslxsI-GBdNuDNw',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || 'krgone-lead.firebaseapp.com',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'krgone-lead',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || 'krgone-lead.firebasestorage.app',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || '69987599509',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || '1:69987599509:web:bc6ac92d40f011de7f079c',
  };

  if (envConfig.projectId && envConfig.apiKey) {
    return {
      ...envConfig,
      firestoreDatabaseId: process.env.FIREBASE_DATABASE_ID || 'default',
    };
  }

  // Fallback to local firebase-applet-config.json
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const fileData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return fileData;
    }
  } catch (err) {
    console.warn('[Firebase] Could not load firebase-applet-config.json:', err);
  }

  return envConfig;
}

const config = getFirebaseConfig();

const app = getApps().length === 0 ? initializeApp(config) : getApp();

let firestoreInstance: Firestore;
try {
  if (config.firestoreDatabaseId && config.firestoreDatabaseId !== 'default') {
    firestoreInstance = getFirestore(app, config.firestoreDatabaseId);
  } else {
    firestoreInstance = getFirestore(app);
  }
} catch (err) {
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;
export { config as firebaseConfig };
