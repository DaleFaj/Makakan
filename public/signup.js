document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('rectangleForm');
    const emailInput = document.getElementById('email');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        const email = emailInput.value.trim();
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password.length < 8) {
            alert('Password must be at least 8 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        try {
            const checkResponse = await fetch('/check-credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username })
            });

            const checkResult = await checkResponse.json();

            if (!checkResult.isUnique) {
                alert('Email or username already exists.');
                return;
            }

            const response = await fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert('Signup successful!');
                window.location.href = '/'; 
            } else {
                alert(result.error || 'An error occurred. Please try again.');
            }

        } catch (error) {
            console.error('Error checking credentials or signing up:', error);
            alert('An error occurred. Please try again.');
        }
    });
});
