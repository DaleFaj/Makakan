document.getElementById('edit-profile-rectangle').addEventListener('submit', function(event) {
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;

    let valid = true;

    // Email validation
    if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        valid = false;
    }

    // Username validation
    if (username.trim() === '') {
        alert('Username cannot be empty.');
        valid = false;
    }

    // Password validation
    if (!validatePassword(password)) {
        alert('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
        valid = false;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        valid = false;
    }

    // Prevent form submission if any validation fails
    if (!valid) {
        event.preventDefault();
    }
});

function validateEmail(email) {
    // Basic email pattern validation
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}

function validatePassword(password) {
    // Password pattern validation
    const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    return pattern.test(password);
}