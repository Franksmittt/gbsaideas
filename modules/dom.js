// A central place to query and export all necessary DOM elements.
// This prevents repetitive document.querySelector calls across different modules.

export const dropZones = {
    ideas: document.querySelector('#ideas-zone .card-container'),
    yes: document.querySelector('#yes-zone .card-container'),
    maybe: document.querySelector('#maybe-zone .card-container'),
    no: document.querySelector('#no-zone .card-container'),
    hot: document.querySelector('#hot-zone .card-container'),
};

export const addNewCardBtn = document.getElementById('add-new-card');
export const userIdDisplay = document.getElementById('user-id-display');

// Modal Elements
export const viewModal = document.getElementById('view-modal');
export const addModal = document.getElementById('add-modal');
export const addIdeaForm = document.getElementById('add-idea-form');

// Modal Content
export const modalTitle = document.getElementById('modal-title');
export const modalImage = document.getElementById('modal-image');
export const modalTags = document.getElementById('modal-tags');
export const modalDescription = document.getElementById('modal-description');

// Modal Close Buttons
export const closeViewModalBtn = document.getElementById('close-view-modal');
export const closeAddModalBtn = document.getElementById('close-add-modal');