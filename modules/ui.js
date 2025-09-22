// Inside the createIdeaCard function...
function createIdeaCard(ideaData, isHotCard) {
    // ... (keep the existing variable declarations) ...
    const { id, title, imageUrl, type, status, description, yesVotes } = ideaData;

    // ... (keep the card creation and dataset lines) ...
    
    // ✅ UPDATED TAGS/METADATA section
    const metadataHTML = isHotCard 
        ? `<div class="absolute top-2 right-2 bg-purple-600 text-white text-sm font-bold rounded-full h-8 w-8 flex items-center justify-center">${yesVotes}</div>`
        : `<div class="pointer-events-none">
               <span class="text-xs font-bold bg-blue-900 text-blue-300 px-2 py-1 rounded-full">${type || 'Idea'}</span>
               <span class="text-xs font-bold bg-gray-700 text-gray-300 px-2 py-1 rounded-full">${status || 'New'}</span>
           </div>`;

    card.innerHTML = `
        <div class="relative">
            <img src="${imageUrl || 'https://placehold.co/600x400/1a202c/ffffff?text=Idea'}" alt="${title}" class="rounded-md w-full aspect-[4/3] object-cover pointer-events-none">
            ${isHotCard ? metadataHTML : ''}
        </div>
        ${!isHotCard ? metadataHTML : ''}
        <h3 class="font-bold text-white pointer-events-none mt-2">${title}</h3>
    `;
    return card;
}