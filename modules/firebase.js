import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { auth, db } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            signOut(auth).catch(error => console.error("Sign out error", error));
        });
    }
});

export function initializeFirebase() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const userId = user.email.split('@')[0];
                const appId = 'global-batteries-ad-center';
                resolve({ db, auth, userId, appId });
            } else {
                window.location.href = 'login.html';
            }
        });
    });
}