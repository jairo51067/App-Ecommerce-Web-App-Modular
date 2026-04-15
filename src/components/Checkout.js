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
                <div style="max-height: 300px; overflow-y: auto;">
                    ${state.cart.map(item => `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>${item.name} x${item.quantity}</span>
                            <span>$${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    `).join('')}
                </div>
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
                    <input type="tel" id="phone" placeholder="Ej. 04241234567" required style="width:100%; margin-bottom:15px; padding:10px;">
                    
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

        // --- GENERACIÓN DE DATOS DE TIEMPO Y PEDIDO ---
        const ahora = new Date();
        const fecha = ahora.toLocaleDateString(); 
        const hora = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        
        // Número de pedido: Usamos los últimos 5 dígitos del timestamp para que sea corto pero único
        const nroPedido = String(Date.now()).slice(-5);

        // 1. Guardamos el pedido en el historial (Leads)
        const newOrder = {
            id: nroPedido,
            customer: name,
            address,
            phone,
            items: [...state.cart],
            total,
            date: fecha,
            time: hora
        };
        storageService.saveLead(newOrder);

        // 2. Construimos el mensaje de WhatsApp con formato mejorado
        let message = `*ORDEN Nro ${nroPedido}* 📦%0A`;
        message += `📅 *Fecha:* ${fecha}%0A`;
        message += `⏰ *Hora:* ${hora}%0A`;
        message += `----------------------------%0A`;
        message += `*Cliente:* ${name}%0A`;
        message += `*Dirección:* ${address}%0A`;
        message += `*WhatsApp:* ${phone}%0A%0A`;
        
        message += `*PRODUCTOS:*%0A`;
        state.cart.forEach(item => {
            message += `- ${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toLocaleString()}%0A`;
        });

        message += `----------------------------%0A`;
        message += `*TOTAL A PAGAR: $${total.toLocaleString()}*%0A%0A`;
        message += `_Enviado desde el catálogo modular_`;

        // 3. Abrir WhatsApp (Número corregido para Venezuela)
        const myWhatsAppNumber = "584245231898"; 
        window.open(`https://wa.me/${myWhatsAppNumber}?text=${message}`, '_blank');

        // 4. Limpiar carrito y volver al inicio
        state.cart = [];
        state.view = 'shop';
        renderCallback();
        alert(`¡Pedido #${nroPedido} generado con éxito! Redirigiendo a WhatsApp...`);
    };

    div.querySelector('#back-to-shop').onclick = () => {
        state.view = 'shop';
        renderCallback();
    };

    return div;
}