import { doc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

let draggedItem = null;

/**
 * Initializes all event listeners for drag and drop functionality.
 * @param {object} db - The Firestore database instance.
 * @param {string} userId - The current user's ID.
 * @param {string} appId - The application ID.
 */
export function initializeDragAndDrop(db, userId, appId) {
    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('idea-card')) {
            draggedItem = e.target;
            setTimeout(() => e.target.classList.add('dragging'), 0);
        }
    });

    document.addEventListener('dragend', () => {
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
            draggedItem = null;
        }
    });

    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.addEventListener('dragover', e => { 
            e.preventDefault(); 
            e.currentTarget.classList.add('drag-over'); 
        });
        zone.addEventListener('dragleave', e => e.currentTarget.classList.remove('drag-over'));
        zone.addEventListener('drop', (e) => handleDrop(e, db, userId, appId));
    });
}

/**
 * Handles the logic when a card is dropped into a zone.
 * It updates the user's vote in Firestore.
 * @param {Event} e - The drop event.
 * @param {object} db - The Firestore database instance.
 * @param {string} userId - The current user's ID.
 * @param {string} appId - The application ID.
 */
async function handleDrop(e, db, userId, appId) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (!draggedItem || !userId) return;

    const ideaId = draggedItem.dataset.id;
    const vote = e.currentTarget.id.replace('-zone', ''); // 'yes', 'no', 'maybe', 'ideas'
    
    const ideaRef = doc(db, `/artifacts/${appId}/public/data/ideas/${ideaId}`);
    const voteKey = `votes.${userId}`;

    try {
        if (vote === 'ideas') {
            // "Moving back to ideas" means removing the vote by setting it to null
            await updateDoc(ideaRef, { [voteKey]: null });
        } else {
            await updateDoc(ideaRef, { [voteKey]: vote });
        }
    } catch (error) {
        // This handles the case where the 'votes' map doesn't exist yet for the document
        if (error.code === 'not-found' || error.message.includes('No document to update')) {
             await setDoc(ideaRef, { votes: { [userId]: vote } }, { merge: true });
        } else {
            console.error("Failed to update vote:", error);
        }
    }
}