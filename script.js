document.addEventListener('DOMContentLoaded', () => {
    // Form Elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleLinks = document.querySelectorAll('.toggle-form');
    const passwordToggles = document.querySelectorAll('.toggle-password');

    // Simulated user database (in real app, this would be your backend)
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Function to switch between forms
    function switchForm(formType) {
        if (formType === 'login') {
            registerForm.classList.remove('active');
            loginForm.classList.add('active');
        } else {
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
        }
    }

    // Toggle form links
    toggleLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (link.textContent.includes('Sign Up')) {
                switchForm('register');
            } else {
                switchForm('login');
            }
        });
    });

    // Improved password toggle with animation
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent any default behavior
            const input = toggle.previousElementSibling;
            
            // Toggle password visibility
            if (input.type === 'password') {
                input.type = 'text';
                toggle.classList.replace('fa-eye-slash', 'fa-eye');
            } else {
                input.type = 'password';
                toggle.classList.replace('fa-eye', 'fa-eye-slash');
            }
        });
    });

    // Add input focus animations
    const inputs = document.querySelectorAll('.input-field input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
    });

    // Add hover effect for input fields
    document.querySelectorAll('.input-field').forEach(field => {
        field.addEventListener('mouseover', () => {
            field.style.borderColor = '#e2e8f0';
        });
        
        field.addEventListener('mouseout', () => {
            if (!field.querySelector('input:focus')) {
                field.style.borderColor = '#e5e7eb';
            }
        });
    });

    // Form Validation
    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const showError = (input, message) => {
        const field = input.parentElement;
        field.classList.add('error');
        field.classList.remove('success');

        // Remove existing error message if any
        const existingError = field.nextElementSibling;
        if (existingError?.classList.contains('error-message')) {
            existingError.remove();
        }

        // Add new error message
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        field.parentElement.appendChild(error);
    };

    const showSuccess = (input) => {
        const field = input.parentElement;
        field.classList.remove('error');
        field.classList.add('success');

        // Remove error message if exists
        const existingError = field.nextElementSibling;
        if (existingError?.classList.contains('error-message')) {
            existingError.remove();
        }
    };

    // Password validation and strength indicator
    const passwordInput = document.getElementById('regPassword');
    const requirements = {
        length: document.querySelector('[data-requirement="length"]'),
        lowercase: document.querySelector('[data-requirement="lowercase"]'),
        uppercase: document.querySelector('[data-requirement="uppercase"]'),
        number: document.querySelector('[data-requirement="number"]'),
        special: document.querySelector('[data-requirement="special"]')
    };
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    // Password validation patterns
    const patterns = {
        length: password => password.length >= 6,
        lowercase: password => /[a-z]/.test(password),
        uppercase: password => /[A-Z]/.test(password),
        number: password => /[0-9]/.test(password),
        special: password => /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        let validCount = 0;

        // Check each requirement
        Object.keys(patterns).forEach(pattern => {
            const isValid = patterns[pattern](password);
            const requirementElement = requirements[pattern];

            if (isValid) {
                requirementElement.classList.add('valid');
                requirementElement.querySelector('i').classList.replace('fa-circle', 'fa-check-circle');
                validCount++;
            } else {
                requirementElement.classList.remove('valid');
                requirementElement.querySelector('i').classList.replace('fa-check-circle', 'fa-circle');
            }
        });

        // Update strength indicator
        updatePasswordStrength(validCount);
    });

    function updatePasswordStrength(validCount) {
        strengthBar.className = 'strength-bar';
        let strengthLevel = '';
        let iconClass = '';

        if (validCount <= 2) {
            strengthLevel = 'weak';
            iconClass = 'fa-face-frown';
        } else if (validCount <= 4) {
            strengthLevel = 'medium';
            iconClass = 'fa-face-meh';
        } else {
            strengthLevel = 'strong';
            iconClass = 'fa-face-smile';
        }

        strengthBar.classList.add(strengthLevel);
        strengthText.innerHTML = `
            <i class="fas ${iconClass}"></i>
            <span>${strengthLevel.charAt(0).toUpperCase() + strengthLevel.slice(1)} Password</span>
        `;
        strengthText.style.color = getStrengthColor(strengthLevel);
    }

    function getStrengthColor(strength) {
        const colors = {
            weak: '#ef4444',
            medium: '#f59e0b',
            strong: '#10b981'
        };
        return colors[strength];
    }

    // Update Register Form Handler
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = passwordInput.value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const submitBtn = registerForm.querySelector('.submit-btn');

        try {
            // Validate inputs
            if (!name || !email || !password || !confirmPassword) {
                throw new Error('Please fill in all fields');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
                passwordInput.parentElement.classList.add('error');
                return;
            }

            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
                return;
            }

            // Check if all requirements are met
            const isValid = Object.keys(patterns).every(pattern => patterns[pattern](password));
            
            if (!isValid) {
                throw new Error('Please meet all password requirements');
            }

            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
            submitBtn.disabled = true;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Save user
            const users = JSON.parse(localStorage.getItem('users')) || [];
            users.push({ name, email, password });
            localStorage.setItem('users', JSON.stringify(users));

            // Show success message
            showNotification('Account created successfully! Please sign in.', 'success');

            // Reset form and switch to login
            registerForm.reset();
            resetPasswordRequirements();
            
            setTimeout(() => {
                switchForm('login');
            }, 200);

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            submitBtn.innerHTML = 'Create Account';
            submitBtn.disabled = false;
        }
    });

    // Login Form Handler
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const submitBtn = loginForm.querySelector('.submit-btn');

        try {
            if (!email || !password) {
                throw new Error('Please fill in all fields');
            }

            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
            submitBtn.disabled = true;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Check credentials
            const user = users.find(u => u.email === email && u.password === password);
            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Save auth state
            localStorage.setItem('currentUser', JSON.stringify(user));

            // Show success message
            showNotification('Login successful! Redirecting...', 'success');

            // Redirect to inventory page with animation
            setTimeout(() => {
                document.body.classList.add('fade-out');
                setTimeout(() => {
                    window.location.href = 'inventory.html';
                }, 500);
            }, 1000);

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            submitBtn.innerHTML = 'Sign In';
            submitBtn.disabled = false;
        }
    });

    // Notification System
    function showNotification(message, type) {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Reset password requirements on form switch
    function resetPasswordRequirements() {
        Object.values(requirements).forEach(req => {
            req.classList.remove('valid');
            req.querySelector('i').classList.replace('fa-check-circle', 'fa-circle');
        });
        strengthBar.className = 'strength-bar';
        strengthText.textContent = '';
    }

    // Add reset to your form switch function
    toggleLinks.forEach(link => {
        link.addEventListener('click', () => {
            resetPasswordRequirements();
            // ... rest of your toggle code
        });
    });
});
