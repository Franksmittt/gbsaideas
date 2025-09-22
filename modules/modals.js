import { collection, addDoc, doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { viewModal, addModal, addIdeaForm, modalTitle, modalImage, modalTags, modalDescription, closeViewModalBtn, closeAddModalBtn } from './dom.js';

let draggedItem = null;
let currentIdeaId = null; // To keep track of which idea is open in the modal

document.addEventListener('dragstart', () => draggedItem = true);
document.addEventListener('dragend', () => setTimeout(() => draggedItem = false, 50));

export function initializeModals(db, userId, appId) {
    const commentForm = document.getElementById('comment-form');

    document.addEventListener('click', (e) => {
        if (draggedItem) return;
        if (e.target.closest('#add-new-card')) {
            openAddModal();
        } else {
            const card = e.target.closest('.idea-card');
            if (card) {
                currentIdeaId = card.dataset.id;
                openViewModal(card.dataset, db, appId);
            }
        }
    });
    
    addIdeaForm.addEventListener('submit', (e) => handleAddIdea(e, db, appId));
    commentForm.addEventListener('submit', (e) => handleAddComment(e, db, userId, appId));
    
    closeViewModalBtn.addEventListener('click', closeModals);
    closeAddModalBtn.addEventListener('click', closeModals);
    viewModal.querySelector('.modal-backdrop').addEventListener('click', closeModals);
    addModal.querySelector('.modal-backdrop').addEventListener('click', closeModals);
}

async function handleAddComment(e, db, userId, appId) {
    e.preventDefault();
    if (!currentIdeaId || !userId) return;

    const commentInput = document.getElementById('comment-input');
    const commentText = commentInput.value.trim();
    if (commentText === '') return;

    const ideaRef = doc(db, `/artifacts/${appId}/public/data/ideas/${currentIdeaId}`);
    const newComment = {
        userId: userId,
        text: commentText,
        timestamp: serverTimestamp() // Use the server's timestamp for consistency
    };

    try {
        await updateDoc(ideaRef, {
            comments: arrayUnion(newComment)
        });
        commentInput.value = '';
        // Re-fetch and render comments to show the new one immediately
        const updatedDoc = await getDoc(ideaRef);
        renderComments(updatedDoc.data().comments || []);
    } catch (error) {
        console.error("Error adding comment: ", error);
    }
}

async function handleAddIdea(e, db, appId) {
    e.preventDefault();
    const newIdea = {
        title: document.getElementById('title').value,
        imageUrl: document.getElementById('image-url').value,
        tags: document.getElementById('tags').value,
        description: document.getElementById('description').value,
        votes: {},
        comments: [] // Initialize with an empty comments array
    };
    try {
        const ideasCollectionRef = collection(db, `/artifacts/${appId}/public/data/ideas`);
        await addDoc(ideasCollectionRef, newIdea);
        addIdeaForm.reset();
        closeModals();
    } catch (error) { console.error("Error adding document: ", error); }
}

async function openViewModal(cardData, db, appId) {
    modalTitle.textContent = cardData.title;
    modalImage.src = cardData.image || 'https://placehold.co/600x400/1a202c/ffffff?text=No+Image';
    modalDescription.textContent = cardData.description;
    
    // Render tags from data attributes (they don't change)
    const tagColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500'];
    modalTags.innerHTML = '';
    if (cardData.tags) {
        cardData.tags.split(',').forEach((tag, index) => {
             const color = tagColors[index % tagColors.length];
             const tagElement = document.createElement('span');
             tagElement.className = `text-xs ${color} text-white px-2 py-1 rounded-full mr-1`;
             tagElement.textContent = tag.trim();
             modalTags.appendChild(tagElement);
        });
    }
    
    // Fetch fresh comment data from Firestore
    const ideaRef = doc(db, `/artifacts/${appId}/public/data/ideas/${currentIdeaId}`);
    const docSnap = await getDoc(ideaRef);
    if (docSnap.exists()) {
        renderComments(docSnap.data().comments || []);
    }

    viewModal.classList.remove('hidden');
}

function renderComments(comments) {
    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = ''; // Clear old comments
    if (comments.length === 0) {
        commentsList.innerHTML = `<p class="text-gray-400">No recommendations yet.</p>`;
        return;
    }

    // Sort comments by timestamp, newest first
    comments.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

    comments.forEach(comment => {
        const commentEl = document.createElement('div');
        commentEl.className = 'bg-gray-700 p-3 rounded-lg';
        const date = comment.timestamp ? new Date(comment.timestamp.seconds * 1000).toLocaleString() : 'Just now';
        commentEl.innerHTML = `
            <p class="text-white">${comment.text}</p>
            <p class="text-xs text-gray-400 mt-2"><strong class="font-bold capitalize">${comment.userId}</strong> - ${date}</p>
        `;
        commentsList.appendChild(commentEl);
    });
}


function openAddModal() { addModal.classList.remove('hidden'); }
function closeModals() { viewModal.classList.add('hidden'); addModal.classList.add('hidden'); currentIdeaId = null; }