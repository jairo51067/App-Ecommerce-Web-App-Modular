// js/components/Login.js
import { state, render } from "../app.js"; // Importamos render directamente para asegurar el refresco
import { storageService } from "../services/storageService.js";

export function Login() { // Quitamos el parámetro si vamos a usar el render de app.js
    const div = document.createElement("div");
    div.className = "login-container";
    div.style.cssText = "max-width: 400px; margin: 100px auto; padding: 20px;";

    div.innerHTML = `
        <div class="card shadow" style="background: white; border-radius: 8px; padding: 20px;">
            <h2 style="text-align: center; color: var(--primary);">🔐 Acceso al Sistema</h2>
            <p style="text-align: center; color: #666; font-size: 0.9em;">Introduce tus credenciales operativas</p>
            
            <form id="form-login" style="margin-top: 20px;">
                <div style="margin-bottom: 15px;">
                    <label style="display:block; margin-bottom:5px;">Usuario</label>
                    <input type="text" id="user" required placeholder="super, admin o gerente" 
                           style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display:block; margin-bottom:5px;">Contraseña</label>
                    <input type="password" id="pass" required placeholder="123" 
                           style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                </div>
                
                <button type="submit" class="success" style="width: 100%; padding: 12px; font-weight: bold; cursor: pointer;">
                    Ingresar al Panel
                </button>
            </form>
            
            <button id="btn-back" style="width: 100%; margin-top: 15px; background: none; border: none; color: #666; cursor: pointer; text-decoration: underline;">
                ← Volver a la tienda
            </button>
        </div>
    `;

    // --- LÓGICA DE AUTENTICACIÓN ---
    div.querySelector("#form-login").onsubmit = (e) => {
        e.preventDefault();

        const username = div.querySelector("#user").value.trim();
        const password = div.querySelector("#pass").value.trim();

        const users = storageService.getUsers();
        const userFound = users.find(u => u.username === username && u.password === password);

        if (userFound) {
            // 1. Crear sesión
            const session = {
                isAuth: true,
                username: userFound.username,
                role: userFound.role,
                name: userFound.name
            };

            // 2. Persistencia Total
            storageService.setSession(session);
            
            // 3. Sincronización del Estado Global (IMPORTANTE)
            state.auth = session; 

            // 4. Enrutamiento dinámico
            if (userFound.role === 'manager') {
                state.view = 'order';
            } else {
                state.view = 'admin';
            }

            console.log("Login exitoso. Redirigiendo a:", state.view);
            render(); // Llamamos directamente a la función maestra
        } else {
            alert("❌ Credenciales inválidas. Prueba con: super / 123");
        }
    };

    div.querySelector("#btn-back").onclick = () => {
        state.view = 'shop';
        render();
    };

    return div;
}