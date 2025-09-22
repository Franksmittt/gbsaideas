// Import the core Firebase services and the new view modules
import { initializeFirebase } from './modules/firebase.js';
import { setupRealtimeListener } from './modules/data-services.js'; // Corrected import
import { initializeDashboard } from './modules/dashboard.js';
import { initializeIdeaBoard } from './modules/idea-board.js'; // We will create this next

// --- DOM Elements ---
const mainApp = document.getElementById('main-app');
const appContent = document.getElementById('app-content');
const userInfoEl = document.getElementById('user-info');
const navList = document.getElementById('sidebar-nav');
const loadingOverlay = document.getElementById('loading-overlay');

// --- App State ---
let currentUser = null;
let allIdeas = []; // Central cache for all idea data

// --- App Initialization ---
async function init() {
    const { db, userId, appId } = await initializeFirebase();
    if (!userId) return; 

    currentUser = { db, id: userId, appId };
    mainApp.classList.remove('hidden');

    // Setup the real-time listener for ideas. It will update our `allIdeas` cache.
    setupRealtimeListener(db, appId, (ideas) => {
        allIdeas = ideas;
        // Re-render the current view with fresh data
        const currentView = window.location.hash.substring(1) || 'dashboard';
        navigateTo(currentView);
    });

    renderSidebar();
    attachGlobalListeners();

    // Set the initial view
    const initialView = window.location.hash.substring(1) || 'dashboard';
    navigateTo(initialView);
}

// --- UI Rendering ---
function renderSidebar() {
    const links = [
        { view: 'dashboard', text: 'Dashboard' },
        { view: 'idea-board', text: 'Idea Board' },
    ];
    navList.innerHTML = links.map(link => `<li><a href="#${link.view}" class="nav-link" data-view="${link.view}">${link.text}</a></li>`).join('');
}

// --- View Routing ---
function navigateTo(view) {
    loadingOverlay.classList.remove('hidden');
    window.location.hash = view;

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.view === view);
    });
    
    appContent.innerHTML = '';
    
    switch (view) {
        case 'dashboard':
            initializeDashboard({ name: currentUser.id }, appContent, allIdeas);
            break;
        case 'idea-board':
            initializeIdeaBoard(currentUser, appContent, allIdeas);
            break;
        default:
            appContent.innerHTML = `<h1 class="text-white">Page Not Found</h1>`;
    }

    userInfoEl.textContent = `Logged in as: ${currentUser.id}`;
    setTimeout(() => loadingOverlay.classList.add('hidden'), 200); // Give it a moment to render
}

// --- Global Event Listeners ---
function attachGlobalListeners() {
    window.addEventListener('hashchange', () => {
        const view = window.location.hash.substring(1) || 'dashboard';
        navigateTo(view);
    });
}

// --- Start the App ---
init();