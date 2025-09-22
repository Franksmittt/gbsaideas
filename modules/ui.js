import { dropZones, addNewCardBtn } from './dom.js';

const tagColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500'];
let allIdeasCache = []; // Keep a local cache to avoid re-rendering if data is the same

/**
 * Renders the entire board based on the latest idea data.
 * It clears existing cards and re-populates the correct rows based on the current user's votes.
 * @param {Array<object>} allIdeas - An array of all idea objects from Firestore.
 * @param {string} userId - The ID of the current user.
 */
export function renderBoard(allIdeas, userId) {
    allIdeasCache = allIdeas; // Update cache

    // Clear all containers except for the 'add' button
    Object.values(dropZones).forEach(zone => zone.innerHTML = '');
    dropZones.ideas.appendChild(addNewCardBtn);

    allIdeas.forEach(idea => {
        const userVote = idea.votes?.[userId];
        const cardElement = createIdeaCard(idea, false);

        if (userVote === 'yes') dropZones.yes.appendChild(cardElement);
        else if (userVote === 'maybe') dropZones.maybe.appendChild(cardElement);
        else if (userVote === 'no') dropZones.no.appendChild(cardElement);
        else dropZones.ideas.appendChild(cardElement);
    });

    renderHottestIdeas();
}

/**
 * Calculates and renders the "Hottest Ideas" row based on the total number of "yes" votes.
 */
function renderHottestIdeas() {
    const ideasWithVotes = allIdeasCache.map(idea => {
        const yesVotes = idea.votes ? Object.values(idea.votes).filter(v => v === 'yes').length : 0;
        return { ...idea, yesVotes };
    }).filter(idea => idea.yesVotes > 0);

    ideasWithVotes.sort((a, b) => b.yesVotes - a.yesVotes);

    dropZones.hot.innerHTML = '';
    ideasWithVotes.forEach(idea => {
        const hotCard = createIdeaCard(idea, true);
        dropZones.hot.appendChild(hotCard);
    });
}

/**
 * Creates an HTML element for a single idea card.
 * @param {object} ideaData - The data for the idea.
 * @param {boolean} isHotCard - A flag to determine if it's a card for the "Hottest Ideas" row.
 * @returns {HTMLElement} The generated card element.
 */
function createIdeaCard(ideaData, isHotCard) {
    const { id, title, imageUrl, tags, description, yesVotes } = ideaData;
    const card = document.createElement('div');
    card.dataset.id = id;
    card.dataset.title = title;
    card.dataset.image = imageUrl || '';
    card.dataset.tags = tags || '';
    card.dataset.description = description || '';
    card.className = 'idea-card bg-gray-700 rounded-lg p-4 flex flex-col gap-3 w-72 flex-shrink-0';
    
    if (!isHotCard) {
        card.draggable = true;
        card.classList.add('cursor-pointer', 'hover:scale-105', 'transition-transform', 'duration-200');
    }

    let tagsHTML = '';
    if (tags) {
        tags.split(',').forEach((tag, index) => {
            const color = tagColors[index % tagColors.length];
            tagsHTML += `<span class="text-xs ${color} text-white px-2 py-1 rounded-full mr-1">${tag.trim()}</span>`;
        });
    }

    const voteCountHTML = isHotCard ? `<div class="absolute top-2 right-2 bg-purple-600 text-white text-sm font-bold rounded-full h-8 w-8 flex items-center justify-center">${yesVotes}</div>` : '';

    card.innerHTML = `
        <div class="relative">
            <img src="${imageUrl || 'https://placehold.co/600x400/1a202c/ffffff?text=Idea'}" alt="${title}" class="rounded-md w-full aspect-[4/3] object-cover pointer-events-none">
            ${voteCountHTML}
        </div>
        <div class="pointer-events-none">${tagsHTML}</div>
        <h3 class="font-bold text-white pointer-events-none">${title}</h3>
    `;
    return card;
}