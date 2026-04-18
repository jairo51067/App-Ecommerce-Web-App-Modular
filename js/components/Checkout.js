import { state, render } from "../app.js";
import { storageService } from "../services/storageService.js";

// --- FUNCIÓN AUXILIAR DE INGENIERÍA: Gestión de Stock ---
function updateInventory(cartItems, action = "sub") {
    cartItems.forEach(cartItem => {
        const product = state.products.find(p => String(p.id) === String(cartItem.id));
        if (product) {
            if (action === "sub") {
                product.stock -= cartItem.quantity;
            } else {
                product.stock += cartItem.quantity;
            }
        }
    });
}

export function Checkout(renderCallback) {
    const div = document.createElement("div");
    div.className = "container";

    const total = state.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    div.innerHTML = `
        <div class="checkout-container" style="max-width: 800px; margin: 40px auto; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; padding: 20px;">
            <div class="card shadow" style="background: #f8f9fa; padding: 25px; border-radius: 12px;">
                <h3 style="margin-top:0">🛒 Resumen de Compra</h3>
                <hr style="border: 0; border-top: 1px solid #ddd; margin: 15px 0;">
                <div style="max-height: 250px; overflow-y: auto; padding-right: 10px;">
                    ${state.cart.map(item => `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.95em;">
                            <span>${item.name} <small>(x${item.quantity})</small></span>
                            <span style="font-weight:600;">$${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    `).join('')}
                </div>
                <hr style="border: 0; border-top: 2px solid #eee; margin: 15px 0;">
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.3em; color: var(--primary);">
                    <span>Total:</span>
                    <span>$${total.toLocaleString()}</span>
                </div>
            </div>

            <div class="card shadow" style="padding: 25px; border-radius: 12px; background: white;">
                <h3 style="margin-top:0">📍 Datos de Envío</h3>
                <form id="form-checkout">
                    <div style="margin-bottom: 15px;">
                        <label style="display:block; font-size: 0.85em; margin-bottom: 5px; color: #666;">Nombre Completo</label>
                        <input type="text" id="name" placeholder="Ej. Juan Pérez" required style="width:100%; padding:12px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display:block; font-size: 0.85em; margin-bottom: 5px; color: #666;">Dirección Completa</label>
                        <input type="text" id="address" placeholder="Calle, Edificio, Apt..." required style="width:100%; padding:12px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div style="margin-bottom: 25px;">
                        <label style="display:block; font-size: 0.85em; margin-bottom: 5px; color: #666;">WhatsApp de contacto</label>
                        <input type="tel" id="phone" placeholder="Ej. 0424..." required style="width:100%; padding:12px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    
                    <button type="submit" class="success" style="width: 100%; padding: 16px; font-size: 1em; font-weight: bold; border-radius: 8px;">
                        CONFIRMAR PEDIDO ✅
                    </button>
                    <button type="button" id="back-to-shop" style="width: 100%; margin-top: 12px; background: none; border: none; color: #888; cursor: pointer; text-decoration: underline;">
                        Seguir comprando
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

        if (state.cart.length === 0) return alert("Tu carrito expiró o está vacío.");

        const ahora = new Date();
        const fecha = ahora.toLocaleDateString(); 
        const hora = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const nroPedido = String(Date.now()).slice(-5);

        // 1. ACTUALIZACIÓN DE STOCK
        updateInventory(state.cart, "sub"); 
        storageService.saveProducts(state.products);
        state.filtered = [...state.products];

        // 2. GENERAR EL LEAD (Con estado inicial para el Gerente)
        const newOrder = {
            id: nroPedido,
            customer: name,
            address: address,
            phone: phone,
            items: [...state.cart], 
            total: total,
            date: fecha,
            time: hora,
            status: "Pendiente" // <-- CLAVE: Para que aparezca en el OrderPanel
        };

        const currentLeads = storageService.getLeads();
        currentLeads.push(newOrder);
        storageService.updateLead(currentLeads);

        // 3. MENSAJE WHATSAPP (Simplificado y efectivo)
        let textoMsg = `*ORDEN #${nroPedido}* 📦\n\n`;
        textoMsg += `📅 *Fecha:* ${fecha}\n`;
        textoMsg += `⏰ *Hora:* ${hora}\n`;
        textoMsg += `----------------------------\n`;
        textoMsg += `👤 *Cliente:* ${name}\n`;
        textoMsg += `📍 *Dirección:* ${address}\n`;
        textoMsg += `📱 *WhatsApp:* ${phone}\n\n`;
        textoMsg += `*PEDIDO:*\n`;
        state.cart.forEach(item => {
            textoMsg += `• ${item.name} (x${item.quantity})\n`;
        });
        textoMsg += `\n💰 *TOTAL A PAGAR: $${total.toLocaleString()}*\n`;
        textoMsg += `----------------------------\n`;
        textoMsg += `💳 *PASOS A SEGUIR:*\n`;
        textoMsg += `0. Necesita nuestros metodos de pago.\n`;
        textoMsg += `1. Realiza el pago por el monto total.\n`;
        textoMsg += `2. *Adjunta tu comprobante de pago* en este chat.\n`;
        textoMsg += `----------------------------\n`;
        textoMsg += `_¡Gracias por tu compra! ✨_`;

        const myWhatsAppNumber = "584245231898"; 
        window.open(`https://wa.me/${myWhatsAppNumber}?text=${encodeURIComponent(textoMsg)}`, '_blank');

        // 4. LIMPIEZA
        state.cart = [];
        storageService.saveCart([]); // Sincronizamos storage
        state.view = 'shop';
        
        alert(`¡Gracias ${name}! Pedido #${nroPedido} registrado.`);
        renderCallback();
    };

    div.querySelector('#back-to-shop').onclick = () => {
        state.view = 'shop';
        renderCallback();
    };

    return div;
}