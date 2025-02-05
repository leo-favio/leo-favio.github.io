// auth.js

document.addEventListener('DOMContentLoaded', () => {
    // Registro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;

            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden');
                return;
            }

            try {
                const existingUser = await getUserByUsername(username);
                if (existingUser) {
                    alert('El nombre de usuario ya existe');
                    return;
                }

                const newUser = { username, email, password };
                await addUser(newUser);
                localStorage.setItem('loggedInUser', JSON.stringify({ username }));

                // Redirigir al dashboard
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error('Error al registrar usuario:', error);
                alert('Hubo un error al registrar el usuario');
            }
        });
    }

    // Inicio de sesión
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('login-username').value.trim();
            const passwordInput = document.getElementById('login-password').value;

            try {
                const user = await getUserByUsername(usernameInput);
                if (user && user.password === passwordInput) {
                    localStorage.setItem('loggedInUser', JSON.stringify({ username: user.username }));

                    // Redirigir al dashboard
                    window.location.href = 'dashboard.html';
                } else {
                    alert('Usuario o contraseña incorrectos');
                }
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                alert('Hubo un error al iniciar sesión');
            }
        });
    }
});
