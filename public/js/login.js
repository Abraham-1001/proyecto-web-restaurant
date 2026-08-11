document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const alertaError = document.getElementById('alertaError');

    const loginSchema = {
        correo: { type: 'email', required: true },
        password: { type: 'string', required: true, minLength: 6 }
    };

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Ocultar alerta de error previa
        alertaError.classList.add('d-none');
        alertaError.textContent = '';

        const correo = document.getElementById('correo').value.trim();
        const password = document.getElementById('password').value;

        const validationErrors = formValidators.validateForm({ correo, password }, loginSchema);
        if (validationErrors.length) {
            alertaError.textContent = validationErrors[0].message;
            alertaError.classList.remove('d-none');
            return;
        }

        try {
            const response = await fetch('/usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ correo, password })
            });

            const data = await response.json();

            if (!response.ok) {
                // Mostrar error del backend
                alertaError.textContent = data.message || 'Error al iniciar sesión';
                alertaError.classList.remove('d-none');
                return;
            }

            // Éxito - Guardar en localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));

            // Redirección según el rol
            const rol = data.usuario.rol;
            if (rol === 'ADMIN') {
                window.location.href = '/admin.html';
            } else if (rol === 'MESERO') {
                window.location.href = '/mesero.html';
            } else if (rol === 'CAJERO') {
                window.location.href = '/cajero.html';
            } else {
                window.location.href = '/';
            }

        } catch (error) {
            console.error('Error en el login:', error);
            alertaError.textContent = 'Hubo un error de conexión con el servidor.';
            alertaError.classList.remove('d-none');
        }
    });
});
