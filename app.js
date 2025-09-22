import { initializeFirebase } from './modules/firebase.js';
import { setupRealtimeListener } from './modules/data.js';
import { renderBoard } from './modules/ui.js';
import { initializeDragAndDrop } from './modules/dragDrop.js';
import { initializeModals } from './modules/modals.js';
import { userIdDisplay, addNewCardBtn } from './modules/dom.js';

async function main() {
    const { db, userId, appId } = await initializeFirebase();

    if (!db || !userId) {
        // If there's no user, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // --- Apply Permissions ---
    // Only 'frank' can add new ideas
    if (userId === 'frank') {
        addNewCardBtn.style.display = 'flex';
    } else {
        addNewCardBtn.style.display = 'none';
    }
    
    userIdDisplay.textContent = userId;

    initializeModals(db, userId, appId);
    initializeDragAndDrop(db, userId, appId);

    setupRealtimeListener(db, appId, (allIdeas) => {
        renderBoard(allIdeas, userId);
    });
}

main();