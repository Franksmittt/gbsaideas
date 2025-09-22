import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
// ✅ Import the shared auth and db instances from our new config file.
import { auth, db } from './firebase-config.js';

// Handle logout functionality. This needs to be in a main module.
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            signOut(auth).catch(error => console.error("Sign out error", error));
            // The onAuthStateChanged listener below will automatically redirect to login.
        });
    }
});

/**
 * Checks the user's current authentication state using the shared auth instance.
 * @returns {Promise<object>} A promise that resolves with db, auth, userId, and appId if logged in.
 */
export function initializeFirebase() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User IS signed in. The session was correctly found.
                const email = user.email;
                const userId = email.split('@')[0];
                const appId = 'global-batteries-ad-center';
                resolve({ db, auth, userId, appId });
            } else {
                // User is NOT signed in.
                console.log("No active Firebase session. Redirecting to login.");
                window.location.href = 'login.html';
                // We do not resolve, preventing the main app from loading without a user.
            }
        });
    });
}