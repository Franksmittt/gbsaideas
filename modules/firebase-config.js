import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// This is now the SINGLE source of truth for your Firebase configuration.
const firebaseConfig = {
    apiKey: "AIzaSyA7dhSMDcW0i319awDLxWP9oFV5ti4J2fU",
    authDomain: "gbsaadideas.firebaseapp.com",
    projectId: "gbsaadideas",
    storageBucket: "gbsaadideas.appspot.com",
    messagingSenderId: "874786659666",
    appId: "1:874786659666:web:49dd4f35e2770e4da1ee8b"
};

// Initialize Firebase ONCE and export the core services for other modules to use.
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);