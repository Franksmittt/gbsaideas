import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { userIdDisplay } from './dom.js';

// =================================================================================
// ✅ Your Firebase Configuration has been added.
// =================================================================================
const firebaseConfig = {
    apiKey: "AIzaSyA7dhSMDcW0i319awDLxWP9oFV5ti4J2fU",
    authDomain: "gbsaadideas.firebaseapp.com",
    projectId: "gbsaadideas",
    storageBucket: "gbsaadideas.appspot.com", // Corrected for future compatibility
    messagingSenderId: "874786659666",
    appId: "1:874786659666:web:49dd4f35e2770e4da1ee8b"
};
// =================================================================================

export async function initializeFirebase() {
    const storedUid = localStorage.getItem('adCenterUser');
    if (!storedUid) {
        console.log("No user selected. Returning to login.");
        return {}; // Let app.js handle the redirect
    }

    // Check if the config is valid (basic check)
    if (!firebaseConfig || !firebaseConfig.apiKey) {
        console.error("Firebase config is missing or incomplete in firebase.js!");
        alert("CRITICAL ERROR: Firebase is not configured. Please check adcenter/modules/firebase.js");
        userIdDisplay.textContent = "Error: Firebase Not Configured";
        return {};
    }

    // Use a simple, unique name for your project's data path
    const appId = 'global-batteries-ad-center';

    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const auth = getAuth(app);
        
        await signInAnonymously(auth);
        
        return { db, auth, userId: storedUid, appId };

    } catch (error) {
        console.error("Firebase connection failed:", error);
        userIdDisplay.textContent = "Connection Error";
        return {};
    }
}