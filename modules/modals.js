import { collection, addDoc, doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { viewModal, addModal, addIdeaForm, modalTitle, modalImage, modalTags, modalDescription, closeViewModalBtn, closeAddModalBtn } from './dom.js';

let draggedItem = null;
let currentIdeaId = null;

document.addEventListener('dragstart', () => draggedItem = true);
document.addEventListener('dragend', () => setTimeout(() => draggedItem = false, 50));

export function initializeModals(db, userId, appId) {
    const commentForm = document.getElementById('comment-form');

    document.addEventListener('click', async (e) => {
        if (draggedItem) return;
        if (e.target.closest('#add-new-card')) {
            openAddModal();
        } else if (e.target.closest('.idea-card')) {
            const card = e.target.closest('.idea-card');
            currentIdeaId = card.dataset.id;
            await openViewModal(currentIdeaId, db, appId, userId);
        } else if (e.target.id === 'mark-posted-btn') {
            if (currentIdeaId) {
                const ideaRef = doc(db, `/artifacts/${appId}/public/data/ideas/${currentIdeaId}`);
                await updateDoc(ideaRef, { status: 'Live' });
                closeModals();
            }
        }
    });
    
    addIdeaForm.addEventListener('submit', (e) => handleAddIdea(e, db, appId, userId));
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
    const newComment = { userId: userId, text: commentText, timestamp: serverTimestamp() };

    try {
        await updateDoc(ideaRef, { comments: arrayUnion(newComment) });
        commentInput.value = '';
        const updatedDoc = await getDoc(ideaRef);
        renderComments(updatedDoc.data().comments || []);
    } catch (error) {
        console.error("Error adding comment: ", error);
        // ✅ THIS IS THE CRITICAL FIX: Show an alert if something goes wrong.
        alert(`Could not post comment. Please check your Firestore Security Rules and ensure you have read/write permissions. Error: ${error.message}`);
    }
}

// ... (The rest of the file remains the same) ...
async function handleAddIdea(e, db, appId, userId) {
    e.preventDefault();
    if (userId !== 'frank') return;
    const newIdea = {
        title: document.getElementById('title').value,
        imageUrl: document.getElementById('image-url').value,
        description: document.getElementById('description').value,
        type: document.getElementById('idea-type').value,
        status: 'Pending Approval',
        author: 'frank',
        createdAt: serverTimestamp(),
        votes: {},
        comments: [],
        metrics: []
    };
    try {
        const ideasCollectionRef = collection(db, `/artifacts/${appId}/public/data/ideas`);
        await addDoc(ideasCollectionRef, newIdea);
        addIdeaForm.reset();
        closeModals();
    } catch (error) { console.error("Error adding document: ", error); }
}

async function openViewModal(ideaId, db, appId, userId) {
    const ideaRef = doc(db, `/artifacts/${appId}/public/data/ideas/${ideaId}`);
    const docSnap = await getDoc(ideaRef);
    if (!docSnap.exists()) { console.error("Idea not found!"); return; }
    const ideaData = docSnap.data();
    modalTitle.textContent = ideaData.title;
    modalImage.src = ideaData.imageUrl || 'https://placehold.co/600x400/1a202c/ffffff?text=No+Image';
    modalDescription.textContent = ideaData.description;
    modalTags.innerHTML = `<span class="text-xs font-bold bg-blue-900 text-blue-300 px-2 py-1 rounded-full">${ideaData.type}</span><span class="text-xs font-bold bg-gray-700 text-gray-300 px-2 py-1 rounded-full">${ideaData.status}</span>`;
    const metricsSection = document.getElementById('metrics-section');
    if (ideaData.status === 'Live') {
        metricsSection.innerHTML = `<hr class="border-gray-600 my-4"><h3 class="text-xl font-bold mb-4">Performance Metrics</h3><p class="text-gray-400 text-sm">Metrics tracking will be added here soon.</p><button class="mt-4 secondary-button w-full">Add Daily Report</button>`;
        metricsSection.classList.remove('hidden');
    } else {
        metricsSection.innerHTML = '';
        metricsSection.classList.add('hidden');
    }
    const modalFooter = document.getElementById('view-modal-footer');
    const userVote = ideaData.votes?.[userId];
    if (userId === 'frank' && userVote === 'yes' && ideaData.status === 'Pending Approval') {
        modalFooter.innerHTML = `<button id="mark-posted-btn" class="primary-button w-full bg-green-600 hover:bg-green-700">Mark as Posted & Live</button>`;
    } else {
        modalFooter.innerHTML = '';
    }
    renderComments(ideaData.comments || []);
    viewModal.classList.remove('hidden');
}

function renderComments(comments) {
    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = '';
    if (comments.length === 0) {
        commentsList.innerHTML = `<p class="text-gray-400">No recommendations yet.</p>`;
        return;
    }
    comments.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
    comments.forEach(comment => {
        const commentEl = document.createElement('div');
        commentEl.className = 'bg-gray-700 p-3 rounded-lg';
        const date = comment.timestamp ? new Date(comment.timestamp.seconds * 1000).toLocaleString() : 'Just now';
        commentEl.innerHTML = `<p class="text-white">${comment.text}</p><p class="text-xs text-gray-400 mt-2"><strong class="font-bold capitalize">${comment.userId}</strong> - ${date}</p>`;
        commentsList.appendChild(commentEl);
    });
}

function openAddModal() { addModal.classList.remove('hidden'); }
function closeModals() { viewModal.classList.add('hidden'); addModal.classList.add('hidden'); currentIdeaId = null; }