import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA7dhSMDcW0i319awDLxWP9oFV5ti4J2fU",
    authDomain: "gbsaadideas.firebaseapp.com",
    projectId: "gbsaadideas",
    storageBucket: "gbsaadideas.appspot.com",
    messagingSenderId: "874786659666",
    appId: "1:874786659666:web:49dd4f35e2770e4da1ee8b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Handle logout functionality
// Find the logout button once the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            signOut(auth).catch(error => console.error("Sign out error", error));
            // The onAuthStateChanged listener below will handle the redirect automatically.
        });
    }
});


/**
 * Checks the user's current authentication state.
 * This function is now the single source of truth for whether a user is logged in.
 * It waits for Firebase to confirm the session before proceeding.
 * @returns {Promise<object>} A promise that resolves with db, auth, userId, and appId if logged in.
 */
export function initializeFirebase() {
    return new Promise((resolve) => {
        // onAuthStateChanged is the official Firebase listener for login status.
        // It runs automatically when the page loads and when the auth state changes.
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User IS signed in.
                const email = user.email; // e.g., "frank@adcenter.local"
                const userId = email.split('@')[0]; // extracts "frank"
                const appId = 'global-batteries-ad-center';
                
                // Resolve the promise with all the necessary info for the app to run.
                resolve({ db, auth, userId, appId });
            } else {
                // User is NOT signed in.
                console.log("No active Firebase session. Redirecting to login.");
                window.location.href = 'login.html';
                // We do not resolve the promise here, preventing the main app from loading.
            }
        });
    });
}