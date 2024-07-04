// script.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('rectangleForm');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            alert('Please enter both username and password.');
            return;
        }

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert('Logged in successfully');
                window.location.href = '/landing.html';
            } else {
                alert(result.error || 'Login failed.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while logging in.');
        }
    });
});
