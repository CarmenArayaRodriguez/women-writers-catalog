/**
 * Gestión de autenticación administrativa
 */
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');

    try {
        /** Petición de validación a la API */
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            /** Persistencia de sesión y redirección */
            localStorage.setItem('token', data.token);
            window.location.href = 'admin.html';
        } else {
            /** Notificación de error en interfaz */
            errorDiv.innerText = data.error || 'Credenciales incorrectas';
        }
    } catch (err) {
        console.error('Error API login:', err);
        errorDiv.innerText = 'Error de comunicación con el servidor';
    }
});