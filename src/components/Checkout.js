import { state } from "../js/app.js";
import { storageService } from "../services/storageService.js";

export function Checkout(renderCallback) {
    const div = document.createElement("div");
    div.className = "container";

    const total = state.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    div.innerHTML = `
        <div class="checkout-container" style="max-width: 800px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
            
            <div class="order-summary" style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                <h3>Resumen de tu compra</h3>
                <hr>
                ${state.cart.map(item => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>${item.name} x${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                `).join('')}
                <hr>
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2em;">
                    <span>Total:</span>
                    <span style="color: var(--success);">$${total.toLocaleString()}</span>
                </div>
            </div>

            <div class="checkout-form">
                <h3>Datos de Envío</h3>
                <form id="form-checkout">
                    <label>Nombre Completo</label>
                    <input type="text" id="name" placeholder="Ej. Juan Pérez" required style="width:100%; margin-bottom:15px; padding:10px;">
                    
                    <label>Dirección de Entrega</label>
                    <input type="text" id="address" placeholder="Calle, Ciudad, Referencia" required style="width:100%; margin-bottom:15px; padding:10px;">
                    
                    <label>WhatsApp / Teléfono</label>
                    <input type="tel" id="phone" placeholder="Ej. +573001234567" required style="width:100%; margin-bottom:15px; padding:10px;">
                    
                    <button type="submit" class="success" style="width: 100%; padding: 15px; font-size: 1.1em; cursor: pointer;">
                        ✅ Confirmar y Enviar por WhatsApp
                    </button>
                    <button type="button" id="back-to-shop" class="secondary" style="width: 100%; margin-top: 10px; background: none; border: 1px solid #ccc; color: #666;">
                        Volver a la tienda
                    </button>
                </form>
            </div>
        </div>
    `;

    // --- LÓGICA DE ENVÍO ---
    div.querySelector('#form-checkout').onsubmit = (e) => {
        e.preventDefault();

        const name = div.querySelector('#name').value;
        const address = div.querySelector('#address').value;
        const phone = div.querySelector('#phone').value;

        // 1. Guardamos el pedido en el historial (Leads)
        const newOrder = {
            id: Date.now(),
            customer: name,
            address,
            phone,
            items: [...state.cart],
            total,
            date: new Date().toLocaleDateString()
        };
        storageService.saveLead(newOrder);

        // 2. Construimos el mensaje de WhatsApp
        let message = `*NUEVO PEDIDO - MI TIENDA*%0A`;
        message += `----------------------------%0A`;
        message += `*Cliente:* ${name}%0A`;
        message += `*Dirección:* ${address}%0A`;
        message += `*Teléfono:* ${phone}%0A%0A`;
        message += `*PRODUCTOS:*%0A`;
        
        state.cart.forEach(item => {
            message += `- ${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toLocaleString()}%0A`;
        });

        message += `----------------------------%0A`;
        message += `*TOTAL A PAGAR: $${total.toLocaleString()}*%0A%0A`;
        message += `_Enviado desde la Web App Modular_`;

        // 3. Abrir WhatsApp (Pon tu número real aquí sin el +)
        const myWhatsAppNumber = "5804245231898"; // CAMBIA ESTO POR TU NÚMERO
        window.open(`https://wa.me/${myWhatsAppNumber}?text=${message}`, '_blank');

        // 4. Limpiar carrito y volver al inicio
        state.cart = [];
        state.view = 'shop';
        renderCallback();
        alert("¡Pedido enviado con éxito! Serás redirigido a WhatsApp.");
    };

    div.querySelector('#back-to-shop').onclick = () => {
        state.view = 'shop';
        renderCallback();
    };

    return div;
}