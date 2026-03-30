document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signup-form');
    const submitBtn = document.getElementById('submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Basic DOM validation
        clearErrors();
        
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Visual feedback
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    // Display field specific errors
                    data.errors.forEach(err => {
                        setTextSafe(`${err.path}-error`, err.msg);
                    });
                } else if (data.error) {
                    showAlert(data.error, 'error');
                } else {
                    showAlert('Signup failed. Please try again.', 'error');
                }
            } else {
                showAlert('Account created successfully! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            }
        } catch (error) {
            console.error('Network Error:', error);
            showAlert('Network error occurred. Please try again later.', 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
});

// Inherits from shared script
function setTextSafe(elementId, text) {
    const el = document.getElementById(elementId);
    if(el) {
        el.textContent = text;
    }
}

function showAlert(message, type) {
    const alertEl = document.getElementById('general-alert');
    if(!alertEl) return;
    
    alertEl.textContent = message;
    alertEl.className = `alert ${type}`;
    alertEl.style.display = 'block';
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
}
