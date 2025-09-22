import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

/**
 * Sets up a real-time listener on the 'ideas' collection in Firestore.
 * When data changes, it processes the snapshot and invokes the provided callback function.
 * @param {object} db - The Firestore database instance.
 * @param {string} appId - The application ID for the Firestore path.
 * @param {function} onDataChange - The callback function to execute with the updated ideas data.
 */
export function setupRealtimeListener(db, appId, onDataChange) {
    const ideasCollectionRef = collection(db, `/artifacts/${appId}/public/data/ideas`);
    
    onSnapshot(ideasCollectionRef, (snapshot) => {
        const ideasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        onDataChange(ideasData);
    });
}