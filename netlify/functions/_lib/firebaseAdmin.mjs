import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function init() {
  if (getApps().length) return;

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON");

  const serviceAccount = JSON.parse(json);
  initializeApp({ credential: cert(serviceAccount) });
}

export function adminAuth() {
  init();
  return getAuth();
}

export function adminDb() {
  init();
  return getFirestore();
}
