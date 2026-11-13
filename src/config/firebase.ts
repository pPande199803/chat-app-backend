
import { initializeApp, cert, getApps } from "firebase-admin/app";
import type { App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "../config/chat-backend-46a18-firebase-adminsdk-fbsvc-84e4773245.json";

let firebaseApp: App;

if (getApps().length > 0) {
  firebaseApp = getApps()[0]!;
} else {
  firebaseApp = initializeApp({
    credential: cert(serviceAccount as any),
    projectId: serviceAccount.project_id,
  });
}

export const firestore = getFirestore(firebaseApp);

export default firebaseApp;
