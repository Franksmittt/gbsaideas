document.getElementById('user-selection').addEventListener('click', (e) => {
    const userButton = e.target.closest('.user-btn');
    if (userButton) {
        const uid = userButton.dataset.uid;
        // Store the selected user's ID in localStorage
        localStorage.setItem('adCenterUser', uid);
        // Redirect to the main application page
        window.location.href = 'index.html';
    }
});