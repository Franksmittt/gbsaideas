/**
 * Renders the main dashboard view.
 * @param {object} client - The current client context.
 * @param {HTMLElement} container - The element to render the content into.
 * @param {Array<object>} allIdeas - All idea documents from Firestore.
 */
export function initializeDashboard(client, container, allIdeas) {
    // Calculate stats
    const ideasPending = allIdeas.filter(idea => idea.status === 'Pending Approval').length;
    const ideasLive = allIdeas.filter(idea => idea.status === 'Live').length;
    const totalComments = allIdeas.reduce((sum, idea) => sum + (idea.comments?.length || 0), 0);

    container.innerHTML = `
        <header class="mb-8">
            <h1 class="text-3xl font-bold text-white mb-1 font-headline">Welcome, ${client.name}</h1>
            <p class="text-lg text-gray-400">Here's your high-level overview of the AdFlow Hub.</p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="module-card text-center">
                <p class="text-sm font-medium text-gray-400 uppercase tracking-wider">Ideas Pending Approval</p>
                <p class="text-6xl font-bold text-white mt-2">${ideasPending}</p>
            </div>
            <div class="module-card text-center">
                <p class="text-sm font-medium text-gray-400 uppercase tracking-wider">Campaigns & Ads Live</p>
                <p class="text-6xl font-bold text-white mt-2">${ideasLive}</p>
            </div>
            <div class="module-card text-center">
                <p class="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Team Comments</p>
                <p class="text-6xl font-bold text-white mt-2">${totalComments}</p>
            </div>
        </div>

        <div class="mt-8 module-card">
            <h2 class="text-2xl font-bold font-headline mb-4">Next Steps</h2>
            <p class="text-gray-400">
                Use the sidebar to navigate to the <strong>Idea Board</strong> to review, vote on, and discuss new ad concepts.
            </p>
        </div>
    `;
}