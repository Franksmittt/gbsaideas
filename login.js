import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// This config needs to match the one in `firebase.js`
const firebaseConfig = {
    apiKey: "AIzaSyA7dhSMDcW0i319awDLxWP9oFV5ti4J2fU",
    authDomain: "gbsaadideas.firebaseapp.com",
    projectId: "gbsaadideas",
    storageBucket: "gbsaadideas.appspot.com",
    messagingSenderId: "874786659666",
    appId: "1:874786659666:web:49dd4f35e2770e4da1ee8b"
};

// Initialize a separate Firebase app instance for the login page
const loginApp = initializeApp(firebaseConfig, "loginApp");
const auth = getAuth(loginApp);

const userSelectionStep = document.getElementById('user-selection-step');
const pinEntryStep = document.getElementById('pin-entry-step');
const userSelectionGrid = document.getElementById('user-selection-grid');
const pinForm = document.getElementById('pin-form');
const welcomeName = document.getElementById('welcome-name');
const pinInput = document.getElementById('pin-input');
const backBtn = document.getElementById('back-btn');
const errorMessage = document.getElementById('error-message');

let selectedUser = null;

// Handle user selection
userSelectionGrid.addEventListener('click', (e) => {
    const userButton = e.target.closest('.user-btn');
    if (userButton) {
        selectedUser = userButton.dataset.uid;
        welcomeName.textContent = selectedUser;
        userSelectionStep.classList.add('hidden');
        pinEntryStep.classList.remove('hidden');
        pinInput.focus();
    }
});

// Go back to user selection
backBtn.addEventListener('click', () => {
    selectedUser = null;
    pinInput.value = '';
    errorMessage.textContent = '';
    pinEntryStep.classList.add('hidden');
    userSelectionStep.classList.remove('hidden');
});

// Handle PIN form submission
pinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.textContent = '';
    const pin = pinInput.value;
    const email = `${selectedUser}@adcenter.local`;

    try {
        await signInWithEmailAndPassword(auth, email, pin);
        // On successful login, Firebase automatically persists the session.
        // Now we can safely redirect to the main app.
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Login failed:", error.code);
        errorMessage.textContent = "Incorrect PIN. Please try again.";
    }
});