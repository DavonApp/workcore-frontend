document.getElementById('signup-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email    = document.getElementById('email-address').value;
    const password = document.getElementById('password').value;

    const res = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
    });

    if (res.ok) {
        // Registration successful — send them to login
        window.location.href = 'login.html';
    } else {
        const error = await res.text();
        alert('Registration failed: ' + error);
    }
});