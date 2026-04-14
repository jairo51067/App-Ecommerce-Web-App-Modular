import { state } from '../js/app.js';
import { sanitize } from '../utils/sanitize.js';

export function Login(renderCallback) {
    const div = document.createElement('div');
    div.className = 'panel';
    
    // Contenedor principal con estilo de tarjeta centrada
    div.innerHTML = `
        <div class="card" style="max-width: 400px; margin: 80px auto; text-align: center; border-top: 5px solid var(--primary);">
            <h2 style="color: var(--dark); margin-bottom: 10px;">🔐 Acceso al Sistema</h2>
            <p style="color: var(--secondary); margin-bottom: 25px; font-size: 0.9em;">Introduce tus credenciales de empleado</p>
            
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="text-align: left;">
                    <label style="font-size: 0.8em; color: var(--secondary); font-weight: bold; margin-left: 5px;">USUARIO</label>
                    <input id="user" placeholder="Ej: admin" style="margin-top: 5px;">
                </div>
                
                <div style="text-align: left;">
                    <label style="font-size: 0.8em; color: var(--secondary); font-weight: bold; margin-left: 5px;">CONTRASEÑA</label>
                    <input id="pass" type="password" placeholder="••••••••" style="margin-top: 5px;">
                </div>
            </div>
            
            <div id="login-footer" style="margin-top: 30px;">
                </div>
            
            <div style="margin-top: 20px;">
                <small style="color: #ccc;">Sistema POS v1.0</small>
            </div>
        </div>
    `;

    const btn = document.createElement('button');
    btn.textContent = 'Ingresar al Panel';
    btn.className = 'success'; // Usamos el verde de éxito
    btn.style.width = '100%';
    btn.style.padding = '12px';
    btn.style.fontSize = '1em';
    
    btn.onclick = () => {
        const u = sanitize(document.getElementById('user').value);
        const p = sanitize(document.getElementById('pass').value);
        
        // 1. Verificación para el ADMINISTRADOR
        if (u === 'admin' && p === '1234') {
            state.auth.isAuth = true;
            state.auth.role = 'admin';
            state.view = 'admin';
            renderCallback();
        } 
        // 2. Verificación para el GERENTE / ENCARGADO
        else if (u === 'gerente' && p === '5678') {
            state.auth.isAuth = true;
            state.auth.role = 'gerente';
            state.view = 'orders';
            renderCallback();
        } 
        // 3. Error en las credenciales
        else {
            alert('❌ Usuario o contraseña incorrectos');
        }
    };

    // Buscamos el lugar donde queremos el botón y lo insertamos
    div.querySelector('#login-footer').appendChild(btn);
    
    return div;
}