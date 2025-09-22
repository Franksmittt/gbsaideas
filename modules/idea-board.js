import { doc, updateDoc, setDoc, collection, addDoc, getDoc, arrayUnion, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// --- STATE ---
let currentUser;
let appContent;
let allIdeas;
let draggedItem = null;
let currentModalIdeaId = null;

// --- INITIALIZATION ---
export function initializeIdeaBoard(user, container, ideas) {
    currentUser = user;
    appContent = container;
    allIdeas = ideas;
    renderLayout();
    renderBoard();
    attachEventListeners();
}

// --- LAYOUT RENDERING ---
function renderLayout() {
    appContent.innerHTML = `
        <header class="mb-8">
            <h1 class="text-3xl font-bold text-white mb-1 font-headline">Idea Board</h1>
            <p class="text-lg text-gray-400">Collaborate, vote, and track ad concepts.</p>
        </header>

        <div class="space-y-8">
            <!-- Main Kanban Board -->
            <div id="ideas-zone" class="drop-zone"><h2 class="text-xl font-bold font-headline mb-4">New Ideas</h2><div class="card-container"></div></div>
            <div id="yes-zone" class="drop-zone"><h2 class="text-xl font-bold font-headline mb-4">My "Yes" Votes</h2><div class="card-container"></div></div>
            <div id="maybe-zone" class="drop-zone"><h2 class="text-xl font-bold font-headline mb-4">My "Maybe" Votes</h2><div class="card-container"></div></div>
            <div id="no-zone" class="drop-zone"><h2 class="text-xl font-bold font-headline mb-4">My "No" Votes</h2><div class="card-container"></div></div>
            <div id="hot-zone"><h2 class="text-xl font-bold font-headline mb-4">Hottest Ideas (Team Votes)</h2><div class="card-container"></div></div>
        </div>

        <!-- Modals will be dynamically added to the body -->
    `;
}

// --- BOARD & CARD RENDERING ---
function renderBoard() {
    const dropZones = {
        ideas: appContent.querySelector('#ideas-zone .card-container'),
        yes: appContent.querySelector('#yes-zone .card-container'),
        maybe: appContent.querySelector('#maybe-zone .card-container'),
        no: appContent.querySelector('#no-zone .card-container'),
        hot: appContent.querySelector('#hot-zone .card-container'),
    };

    Object.values(dropZones).forEach(zone => zone.innerHTML = '');

    allIdeas.forEach(idea => {
        const userVote = idea.votes?.[currentUser.id];
        const card = createCard(idea, false);
        const zone = userVote ? dropZones[userVote] : dropZones.ideas;
        if (zone) zone.appendChild(card);
    });

    if (currentUser.id === 'frank') {
        dropZones.ideas.innerHTML += `<div id="add-new-card" class="bg-gray-700/50 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors w-72 h-full flex-shrink-0 min-h-[280px]"><svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg></div>`;
    }

    renderHottestIdeas(dropZones.hot);
}

function renderHottestIdeas(container) {
    const ideasWithVotes = allIdeas.map(idea => ({
        ...idea,
        yesVotes: idea.votes ? Object.values(idea.votes).filter(v => v === 'yes').length : 0
    })).filter(idea => idea.yesVotes > 0).sort((a, b) => b.yesVotes - a.yesVotes);

    container.innerHTML = ideasWithVotes.map(idea => createCard(idea, true)).join('');
}

function createCard(ideaData, isHotCard) {
    const { id, title, imageUrl, type, status, yesVotes } = ideaData;
    const voteCountHTML = isHotCard ? `<div class="absolute top-2 right-2 bg-purple-600 text-white text-sm font-bold rounded-full h-8 w-8 flex items-center justify-center">${yesVotes}</div>` : '';
    const metadataHTML = `<div class="pointer-events-none mt-2"><span class="text-xs font-bold bg-blue-900 text-blue-300 px-2 py-1 rounded-full">${type || 'Idea'}</span><span class="text-xs font-bold bg-gray-700 text-gray-300 px-2 py-1 rounded-full ml-1">${status || 'New'}</span></div>`;

    return `
        <div class="idea-card module-card !p-4 flex flex-col gap-3 w-72 flex-shrink-0 cursor-pointer" draggable="${!isHotCard}" data-id="${id}">
            <div class="relative">
                <img src="${imageUrl || 'https://placehold.co/600x400/1a202c/ffffff?text=Idea'}" alt="${title}" class="rounded-md w-full aspect-[4/3] object-cover pointer-events-none">
                ${voteCountHTML}
            </div>
            ${metadataHTML}
            <h3 class="font-bold text-white pointer-events-none mt-1">${title}</h3>
        </div>
    `;
}

// --- EVENT LISTENERS ---
function attachEventListeners() {
    // Event delegation for the entire board
    appContent.addEventListener('click', handleBoardClick);
    appContent.addEventListener('dragstart', handleDragStart);
    appContent.addEventListener('dragend', handleDragEnd);
    appContent.addEventListener('dragover', handleDragOver);
    appContent.addEventListener('dragleave', handleDragLeave);
    appContent.addEventListener('drop', handleDrop);
}

// --- EVENT HANDLERS ---
async function handleBoardClick(e) {
    if (e.target.closest('#add-new-card')) {
        renderAddModal();
    } else if (e.target.closest('.idea-card')) {
        currentModalIdeaId = e.target.closest('.idea-card').dataset.id;
        await renderViewModal();
    }
}

function handleDragStart(e) {
    if (e.target.classList.contains('idea-card')) {
        draggedItem = e.target;
        setTimeout(() => e.target.classList.add('dragging'), 0);
    }
}
function handleDragEnd(e) {
    if (draggedItem) {
        draggedItem.classList.remove('dragging');
        draggedItem = null;
    }
}
function handleDragOver(e) {
    e.preventDefault();
    const dropZone = e.target.closest('.drop-zone');
    if (dropZone) dropZone.classList.add('drag-over');
}
function handleDragLeave(e) {
    const dropZone = e.target.closest('.drop-zone');
    if (dropZone) dropZone.classList.remove('drag-over');
}
async function handleDrop(e) {
    e.preventDefault();
    const dropZone = e.target.closest('.drop-zone');
    if (!dropZone || !draggedItem) return;

    dropZone.classList.remove('drag-over');
    const ideaId = draggedItem.dataset.id;
    const vote = dropZone.id.replace('-zone', '');
    const ideaRef = doc(currentUser.db, `/artifacts/${currentUser.appId}/public/data/ideas/${ideaId}`);
    const voteKey = `votes.${currentUser.id}`;

    try {
        await updateDoc(ideaRef, { [voteKey]: vote === 'ideas' ? null : vote });
    } catch (error) {
        if (error.code === 'not-found' || error.message.includes('No document to update')) {
            await setDoc(ideaRef, { votes: { [currentUser.id]: vote } }, { merge: true });
        } else {
            console.error("Failed to update vote:", error);
        }
    }
}

// --- MODAL LOGIC ---
// ... (Your existing modal functions for rendering, comments, etc., will go here)
// For brevity, I'll include the structure. You can copy the detailed logic from your modals.js file.
function renderAddModal() { /* ... renders the add idea form ... */ }
async function renderViewModal() { /* ... renders the view idea modal with comments and metrics ... */ }
// ... and so on