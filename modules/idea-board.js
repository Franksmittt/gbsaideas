import { doc, updateDoc, setDoc, collection, addDoc, getDoc, arrayUnion, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// --- MODULE STATE ---
let currentUser;
let appContent;
let allIdeas;
let draggedItem = null;
let currentModalIdeaId = null;
const tagColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500'];

// --- MAIN INITIALIZATION FUNCTION ---
export function initializeIdeaBoard(user, container, ideas) {
    currentUser = user;
    appContent = container;
    allIdeas = ideas;
    renderLayout();
    renderAllCards();
    attachEventListeners();
}

// --- RENDERING ---
function renderLayout() {
    appContent.innerHTML = `
        <header class="mb-8">
            <h1 class="text-3xl font-bold text-white mb-1 font-headline">Idea Board</h1>
            <p class="text-lg text-gray-400">Collaborate, vote, and track ad concepts.</p>
        </header>
        <div class="grid grid-rows-5 gap-6">
            <div id="ideas-zone" class="drop-zone bg-gray-800 rounded-lg p-4 flex flex-col overflow-hidden min-h-[26rem]"><h2 class="text-xl font-bold text-white text-center sm:text-left mb-2 flex-shrink-0">Ideas</h2><div class="card-container flex-grow flex items-center gap-4 overflow-x-auto pb-2 hide-scrollbar"></div></div>
            <div id="yes-zone" class="drop-zone bg-green-900/50 rounded-lg p-4 border-2 border-dashed border-green-500 flex flex-col overflow-hidden min-h-[26rem]"><h2 class="text-xl font-bold text-green-300 text-center sm:text-left mb-2 flex-shrink-0">My "Yes" Votes</h2><div class="card-container flex-grow flex items-center gap-4 overflow-x-auto pb-2 hide-scrollbar"></div></div>
            <div id="maybe-zone" class="drop-zone bg-yellow-900/50 rounded-lg p-4 border-2 border-dashed border-yellow-500 flex flex-col overflow-hidden min-h-[26rem]"><h2 class="text-xl font-bold text-yellow-300 text-center sm:text-left mb-2 flex-shrink-0">My "Maybe" Votes</h2><div class="card-container flex-grow flex items-center gap-4 overflow-x-auto pb-2 hide-scrollbar"></div></div>
            <div id="no-zone" class="drop-zone bg-red-900/50 rounded-lg p-4 border-2 border-dashed border-red-500 flex flex-col overflow-hidden min-h-[26rem]"><h2 class="text-xl font-bold text-red-300 text-center sm:text-left mb-2 flex-shrink-0">My "No" Votes</h2><div class="card-container flex-grow flex items-center gap-4 overflow-x-auto pb-2 hide-scrollbar"></div></div>
            <div id="hot-zone" class="bg-purple-900/50 rounded-lg p-4 flex flex-col overflow-hidden min-h-[26rem]"><h2 class="text-xl font-bold text-purple-300 text-center sm:text-left mb-2 flex-shrink-0">Hottest Ideas (Team Votes)</h2><div class="card-container flex-grow flex items-center gap-4 overflow-x-auto pb-2 hide-scrollbar"></div></div>
        </div>
    `;
}

function renderAllCards() {
    const zones = {
        ideas: appContent.querySelector('#ideas-zone .card-container'),
        yes: appContent.querySelector('#yes-zone .card-container'),
        maybe: appContent.querySelector('#maybe-zone .card-container'),
        no: appContent.querySelector('#no-zone .card-container'),
        hot: appContent.querySelector('#hot-zone .card-container'),
    };
    Object.values(zones).forEach(z => z.innerHTML = '');

    allIdeas.forEach(idea => {
        const userVote = idea.votes?.[currentUser.id];
        const card = createCardElement(idea, false);
        const targetZone = userVote ? zones[userVote] : zones.ideas;
        if (targetZone) targetZone.appendChild(card);
    });

    if (currentUser.id === 'frank') {
        zones.ideas.insertAdjacentHTML('beforeend', `<div id="add-new-card" class="bg-gray-700/50 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors w-72 h-full flex-shrink-0 min-h-[290px]"><svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg></div>`);
    }

    const hottestIdeas = allIdeas
        .map(idea => ({ ...idea, yesVotes: idea.votes ? Object.values(idea.votes).filter(v => v === 'yes').length : 0 }))
        .filter(idea => idea.yesVotes > 0)
        .sort((a, b) => b.yesVotes - a.yesVotes);

    hottestIdeas.forEach(idea => zones.hot.appendChild(createCardElement(idea, true)));
}

function createCardElement(idea, isHotCard) {
    const card = document.createElement('div');
    card.className = 'idea-card bg-gray-700 rounded-lg p-4 flex flex-col gap-2 w-72 flex-shrink-0';
    card.dataset.id = idea.id;
    if (!isHotCard) {
        card.draggable = true;
        card.classList.add('cursor-pointer', 'hover:scale-105', 'transition-transform');
    }

    const voteCountHTML = isHotCard ? `<div class="absolute top-2 right-2 bg-purple-600 text-white text-sm font-bold rounded-full h-8 w-8 flex items-center justify-center">${idea.yesVotes}</div>` : '';
    const metadataHTML = `<div class="pointer-events-none"><span class="text-xs font-bold bg-blue-900 text-blue-300 px-2 py-1 rounded-full">${idea.type || 'Idea'}</span><span class="text-xs font-bold bg-gray-700 text-gray-300 px-2 py-1 rounded-full ml-1">${idea.status || 'New'}</span></div>`;

    card.innerHTML = `
        <div class="relative">
            <img src="${idea.imageUrl || 'https://placehold.co/600x400/1a202c/ffffff?text=Idea'}" alt="${idea.title}" class="rounded-md w-full aspect-[4/3] object-cover pointer-events-none">
            ${voteCountHTML}
        </div>
        ${metadataHTML}
        <h3 class="font-bold text-white pointer-events-none mt-1">${idea.title}</h3>
    `;
    return card;
}

// --- EVENT LISTENERS & HANDLERS ---
function attachEventListeners() {
    appContent.addEventListener('click', handleBoardClick);
    appContent.addEventListener('dragstart', e => {
        if (e.target.classList.contains('idea-card')) {
            draggedItem = e.target;
            setTimeout(() => e.target.classList.add('dragging'), 0);
        }
    });
    appContent.addEventListener('dragend', () => {
        if (draggedItem) draggedItem.classList.remove('dragging');
        draggedItem = null;
    });
    appContent.addEventListener('dragover', e => {
        e.preventDefault();
        const dropZone = e.target.closest('.drop-zone');
        if (dropZone) dropZone.classList.add('drag-over');
    });
    appContent.addEventListener('dragleave', e => {
        const dropZone = e.target.closest('.drop-zone');
        if (dropZone) dropZone.classList.remove('drag-over');
    });
    appContent.addEventListener('drop', handleDrop);
}

async function handleBoardClick(e) {
    if (e.target.closest('#add-new-card')) {
        renderAddModal();
    } else if (e.target.closest('.idea-card')) {
        currentModalIdeaId = e.target.closest('.idea-card').dataset.id;
        await renderViewModal();
    }
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
        await setDoc(ideaRef, { votes: { [currentUser.id]: vote } }, { merge: true });
    }
}

// --- MODAL RENDERING & LOGIC ---
function renderAddModal() { /* ... Logic from old modals.js ... */ }
async function renderViewModal() { /* ... Logic from old modals.js ... */ }
// NOTE: Due to length, the detailed modal functions are collapsed. You can copy them from your previous `modals.js` file if needed, they are compatible.