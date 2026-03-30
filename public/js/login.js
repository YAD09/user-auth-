document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const submitBtn = document.getElementById('submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        clearErrors();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    data.errors.forEach(err => {
                        setTextSafe(`${err.path}-error`, err.msg);
                    });
                } else if (data.error) {
                    showAlert(data.error, 'error');
                } else {
                    showAlert('Login failed. Please check credentials.', 'error');
                }
            } else {
                window.location.href = '/dashboard';
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
