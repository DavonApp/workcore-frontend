document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email    = document.getElementById('email-address').value;
    const password = document.getElementById('password').value;

    const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Critical — lets browser store the session cookie
        body: JSON.stringify({ email, password })
    });

    if (res.ok) {
        const data = await res.json();
        localStorage.setItem('jwt_token', data.token); // Save the JWT
        window.location.href = 'dashboard.html'; // redirect to your main page
    } else {
        const error = await res.text();
        alert('Login failed: ' + error);
    }
});