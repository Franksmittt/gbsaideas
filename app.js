// Import services and modules
import { initializeFirebase } from './modules/firebase-services.js'; // Renamed for clarity
import { initializeDashboard } from './modules/dashboard.js';
import { initializeIdeaBoard } from './modules/idea-board.js'; // Renamed for clarity

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
    // Authenticate and get user info
    const { db, userId, appId } = await initializeFirebase();
    if (!userId) return; // initializeFirebase handles redirect

    currentUser = { db, id: userId, appId };
    
    // Show the main application layout
    mainApp.classList.remove('hidden');

    // Setup the real-time listener for ideas
    // The third argument is a "callback" function that runs every time data changes
    setupRealtimeListener(db, appId, (ideas) => {
        allIdeas = ideas;
        // Re-render the current view with fresh data whenever it changes
        const currentView = window.location.hash.substring(1) || 'dashboard';
        navigateTo(currentView); 
    });

    renderSidebar();
    attachGlobalListeners();

    // Navigate to the view specified in the URL hash, or default to dashboard
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
    
    // Update URL hash
    window.location.hash = view;

    // Update active link in sidebar
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.view === view);
    });
    
    // Clear previous content
    appContent.innerHTML = '';
    
    // Render the new view
    switch (view) {
        case 'dashboard':
            initializeDashboard({ name: currentUser.id }, appContent, allIdeas);
            break;
        case 'idea-board':
            // We need to create an initializeIdeaBoard function now
            // initializeIdeaBoard(currentUser, appContent, allIdeas);
            appContent.innerHTML = `<h1 class="text-white">Idea Board Coming Soon!</h1>`;
            break;
        default:
            appContent.innerHTML = `<h1 class="text-white">Page Not Found</h1>`;
    }

    userInfoEl.textContent = `Logged in as: ${currentUser.id}`;
    loadingOverlay.classList.add('hidden');
}

// --- Global Event Listeners ---
function attachGlobalListeners() {
    // Handle sidebar navigation clicks
    navList.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-link');
        if (link) {
            e.preventDefault();
            navigateTo(link.dataset.view);
        }
    });
}


// --- Start the App ---
init();