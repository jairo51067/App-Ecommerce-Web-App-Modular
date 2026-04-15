import { state } from '../js/app.js';
import { sanitize } from '../utils/sanitize.js';

export function Login(renderCallback) {
    const div = document.createElement("div");
    div.className = "panel";
    div.style.cssText = "max-width: 400px; margin: 50px auto; padding: 20px;";

    div.innerHTML = `
        <div class="card" style="text-align: center;">
            <h2 style="margin-bottom: 20px;">Acceso al Sistema</h2>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="text-align: left;">
                    <label style="font-size: 0.9em; color: var(--secondary);">Usuario</label>
                    <input type="text" id="user" placeholder="Ej: admin" style="width: 100%; padding: 10px;">
                </div>
                <div style="text-align: left;">
                    <label style="font-size: 0.9em; color: var(--secondary);">Contraseña</label>
                    <input type="password" id="pass" placeholder="••••••••" style="width: 100%; padding: 10px;">
                </div>
                <button id="btn-login" class="success" style="width: 100%; padding: 12px; margin-top: 10px;">
                    Ingresar
                </button>
                <button id="btn-back" style="background: none; border: none; color: var(--primary); cursor: pointer; font-size: 0.9em;">
                    ← Volver a la tienda
                </button>
            </div>
        </div>
    `;

    // Lógica de Autenticación
    div.querySelector("#btn-login").onclick = () => {
        const userInput = div.querySelector("#user").value.trim();
        const passInput = div.querySelector("#pass").value.trim();

        // --- VALIDACIÓN DE ROLES ---
        
        // 1. SUPER USUARIO (Acceso total)
        if (userInput === "root" && passInput === "master12345") {
            state.auth = { isAuth: true, role: "superuser", username: "Super Usuario" };
            state.view = "admin"; // Entra al panel de control
        } 
        // 2. ADMINISTRADOR (Gestión operativa)
        else if (userInput === "admin" && passInput === "1234") {
            state.auth = { isAuth: true, role: "admin", username: "Administrador" };
            state.view = "admin";
        } 
        // 3. GERENTE (Auditoría y pedidos)
        else if (userInput === "gerente" && passInput === "5678") {
            state.auth = { isAuth: true, role: "gerente", username: "Gerencia" };
            state.view = "orders";
        } 
        else {
            alert("⚠️ Usuario o contraseña incorrectos");
            return;
        }

        console.log(`Sesión iniciada como: ${state.auth.role}`);
        renderCallback(); // Redibujar la aplicación con la nueva vista
    };

    // Botón para volver
    div.querySelector("#btn-back").onclick = () => {
        state.view = "shop";
        renderCallback();
    };

    return div;
}