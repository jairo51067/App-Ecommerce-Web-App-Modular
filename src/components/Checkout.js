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

    div.querySelector('#form-checkout').onsubmit = (e) => {
        e.preventDefault();

        const name = div.querySelector('#name').value.trim();
        const address = div.querySelector('#address').value.trim();
        const phone = div.querySelector('#phone').value.trim();

        const ahora = new Date();
        const fecha = ahora.toLocaleDateString(); 
        const hora = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        const nroPedido = String(Date.now()).slice(-5);

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

        // --- CONSTRUCCIÓN DEL MENSAJE PROFESIONAL ---
        // Usamos una estructura de array y join por legibilidad
        let textoMsg = `*ORDEN Nro ${nroPedido}* 📦\n`;
        textoMsg += `📅 *Fecha:* ${fecha}\n`;
        textoMsg += `⏰ *Hora:* ${hora}\n`;
        textoMsg += `----------------------------\n`;
        textoMsg += `👤 *Cliente:* ${name}\n`;
        textoMsg += `📍 *Dirección:* ${address}\n`;
        textoMsg += `📱 *WhatsApp:* ${phone}\n\n`;
        
        textoMsg += `*PRODUCTOS:*\n`;
        state.cart.forEach(item => {
            textoMsg += `- ${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toLocaleString()}\n`;
        });

        textoMsg += `\n💰 *TOTAL A PAGAR: $${total.toLocaleString()}*\n`;
        textoMsg += `----------------------------\n`;
        textoMsg += `💳 *PASOS A SEGUIR:*\n`;
        textoMsg += `1. ¿Necesitas nuestros métodos de pago? (Solicítalos aquí).\n`;
        textoMsg += `2. Indica tu método de pago y detalles adicionales.\n`;
        textoMsg += `3. *Adjunta tu comprobante de pago* en este chat.\n`;
        textoMsg += `----------------------------\n`;
        textoMsg += `_Confirmaremos tu pago y te notificaremos cuando tu pedido esté listo._\n`;
        textoMsg += `¡Gracias por tu compra! ✨`;

        // 3. ENCRIPTAR PARA URL (Seguridad para caracteres especiales)
        const encodedMessage = encodeURIComponent(textoMsg);
        const myWhatsAppNumber = "584245231898"; 

        // 4. Limpiar carrito ANTES de salir
        state.cart = [];
        state.view = 'shop';
        renderCallback();

        // 5. Abrir WhatsApp
        window.open(`https://wa.me/${myWhatsAppNumber}?text=${encodedMessage}`, '_blank');
        alert(`¡Pedido #${nroPedido} generado con éxito! Redirigiendo a WhatsApp...`);
    };

    div.querySelector('#back-to-shop').onclick = () => {
        state.view = 'shop';
        renderCallback();
    };

    return div;
}