import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
// ✅ Import the shared auth instance from our new config file.
import { auth } from './modules/firebase-config.js';

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
        // Use the imported, shared auth instance.
        await signInWithEmailAndPassword(auth, email, pin);
        // On successful login, Firebase's session persistence will work correctly.
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Login failed:", error.code);
        errorMessage.textContent = "Incorrect PIN. Please try again.";
    }
});