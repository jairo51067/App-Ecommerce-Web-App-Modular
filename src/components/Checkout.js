import { state } from '../js/app.js';
import { sanitize } from '../utils/sanitize.js';
import { validEmail, validPhone } from '../utils/validator.js';
import { storageService } from '../services/storageService.js';

/**
 * @param {Function} renderCallback - Para regresar a la tienda al finalizar
 */
export function Checkout(renderCallback) {
  const div = document.createElement('div'); 
  div.className = 'checkout';
  
  div.innerHTML = `
    <h3>Finalizar Compra</h3>
    <p>Por favor, adjunta tu comprobante de pago (PNG, máx 2MB)</p>
    <input id="name" placeholder="Nombre completo">
    <input id="email" placeholder="Correo electrónico">
    <input id="phone" placeholder="Teléfono de contacto">
    <input id="file" type="file" accept="image/png">
  `;

  const btn = document.createElement('button'); 
  btn.textContent = 'Enviar Pedido';

  btn.onclick = () => {
    // 1. Captura y Sanitización
    const name = sanitize(document.getElementById('name').value);
    const email = sanitize(document.getElementById('email').value);
    const phone = sanitize(document.getElementById('phone').value);
    const file = document.getElementById('file').files[0];

    // 2. Validaciones usando nuestras Utils
    if (!name || !email || !phone) return alert('Completa todos los campos');
    if (!validEmail(email)) return alert('Email inválido');
    if (!validPhone(phone)) return alert('Teléfono inválido');
    
    // Validación de archivo
    if (!file || file.type !== 'image/png') return alert('Debes subir un archivo PNG');
    if (file.size > 2 * 1024 * 1024) return alert('El archivo es demasiado pesado (máx 2MB)');

    // 3. Procesamiento con FileReader
    const reader = new FileReader();
    reader.onload = () => {
  const totalOrder = state.cart.reduce((acc, p) => acc + (p.price * (p.quantity || 1)), 0);

  const order = { 
    id: crypto.randomUUID(), 
    name, 
    email, 
    phone, 
    cart: [...state.cart], // Aquí ya se guardan los productos con su quantity
    total: totalOrder,     // Agregamos el total calculado
    completed: false,      // Estado inicial para el sistema de check
    proof: reader.result, 
    createdAt: new Date().toISOString() 
  };

      // 4. Guardar usando el servicio
      storageService.saveLead(order);
      
      alert('¡Gracias! Tu pedido ha sido enviado correctamente.');
      
      // 5. Limpieza y redirección
      state.cart = []; 
      state.view = 'shop'; 
      renderCallback();
    };
    
    reader.readAsDataURL(file);
  };

  div.appendChild(btn);

  // Botón para cancelar y volver
  const backBtn = document.createElement('button');
  backBtn.textContent = 'Volver a la tienda';
  backBtn.className = 'secondary';
  backBtn.style.marginTop = '10px';
  backBtn.onclick = () => {
    state.view = 'shop';
    renderCallback();
  };
  div.appendChild(backBtn);

  return div;
}