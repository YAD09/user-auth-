document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication and get safe user details
    try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
            window.location.href = '/login.html';
            return;
        }
        
        const data = await response.json();
        const usernameEl = document.getElementById('user-name');
        
        // Prevent DOM Based XSS context strictly using textContent via safe helper
        if(usernameEl) {
            usernameEl.textContent = data.username;
        }
    } catch (error) {
        console.error('Session check failed:', error);
        window.location.href = '/login.html';
    }

    // Secure logout handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login.html';
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }
});
