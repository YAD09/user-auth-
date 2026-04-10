document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signup-form');
    const submitBtn = document.getElementById('submit-btn');
    const generatePasswordBtn = document.getElementById('generate-password-btn');
    const togglePasswordBtn = document.getElementById('toggle-password-btn');
    const passwordInput = document.getElementById('password');

    if (generatePasswordBtn && passwordInput) {
        generatePasswordBtn.addEventListener('click', () => {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
            let generatedPassword = "";
            let hasUpper = false, hasLower = false, hasNum = false, hasSpec = false;
            
            while (!(hasUpper && hasLower && hasNum && hasSpec)) {
                generatedPassword = "";
                hasUpper = false; hasLower = false; hasNum = false; hasSpec = false;
                for (let i = 0; i < 16; i++) {
                    const char = chars.charAt(Math.floor(Math.random() * chars.length));
                    generatedPassword += char;
                    if (/[A-Z]/.test(char)) hasUpper = true;
                    if (/[a-z]/.test(char)) hasLower = true;
                    if (/[0-9]/.test(char)) hasNum = true;
                    if (/[^A-Za-z0-9]/.test(char)) hasSpec = true;
                }
            }
            passwordInput.value = generatedPassword;
            passwordInput.type = "text"; // Show the generated password
        });
    }

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
            } else {
                passwordInput.type = 'password';
            }
        });
    }

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
