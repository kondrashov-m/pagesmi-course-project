
// Этот файл используется для аутентификации Firebase.
// Замените значения YOUR_... на ваши реальные Firebase project credentials.

const firebaseConfig = {
apiKey: "YOUR_API_KEY",
authDomain: "YOUR_AUTH_DOMAIN",
projectId: "YOUR_PROJECT_ID",
storageBucket: "YOUR_STORAGE_BUCKET",
messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
appId: "YOUR_APP_ID",
};

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

let app: FirebaseApp;
let auth: Auth;

if (getApps().length === 0) {
app = initializeApp(firebaseConfig);
} else {
app = getApps()[0]!;
}

auth = getAuth(app);

export { app, auth };
