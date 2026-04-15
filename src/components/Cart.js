import { state } from '../js/app.js';
import { notifier } from '../services/notifier.js';

export function Cart(renderCallback) {
    const overlay = document.createElement('div');
    overlay.className = `cart-overlay ${state.cartOpen ? 'active' : ''}`;
    
    const sidebar = document.createElement('div');
    sidebar.className = `cart-sidebar ${state.cartOpen ? 'active' : ''}`;

    const total = state.cart.reduce((acc, p) => acc + (p.price * p.quantity), 0);

    sidebar.innerHTML = `
        <div class="cart-header">
            <h3>Tu Carrito 🛒</h3>
            <button class="secondary" id="close-cart">Cerrar</button>
        </div>
        <div class="cart-items-list">
            ${state.cart.length === 0 ? '<p style="text-align:center; margin-top:20px;">El carrito está vacío</p>' : 
              state.cart.map(item => `
                <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding: 10px 0;">
                    <div style="flex: 1;">
                        <strong style="display:block;">${item.name}</strong>
                        <small style="color:var(--secondary)">$${item.price.toLocaleString()}</small>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 8px; margin: 0 15px;">
                        <button class="btn-qty btn-minus" data-id="${item.id}" 
                            style="width:25px; height:25px; cursor:pointer; border-radius:4px; border:1px solid #ccc; background:#fff;">-</button>
                        <span style="font-weight:bold; min-width:20px; text-align:center;">${item.quantity}</span>
                        <button class="btn-qty btn-plus" data-id="${item.id}" 
                            style="width:25px; height:25px; cursor:pointer; border-radius:4px; border:1px solid #ccc; background:#fff;">+</button>
                    </div>

                    <div style="text-align: right; min-width: 70px;">
                        <strong style="display:block;">$${(item.price * item.quantity).toLocaleString()}</strong>
                        <button class="btn-remove" data-id="${item.id}" 
                            style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:0.8em; padding:0;">Eliminar</button>
                    </div>
                </div>
              `).join('')}
        </div>
        <div style="border-top: 2px solid var(--light); padding-top: 15px; margin-top: auto;">
            <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                <h4>Total:</h4>
                <h4 style="color:var(--primary)">$${total.toLocaleString()}</h4>
            </div>
            <button class="success" id="go-checkout" style="width: 100%; padding: 12px; cursor: pointer;" 
                ${state.cart.length === 0 ? 'disabled style="opacity:0.5; cursor:default;"' : ''}>
                Finalizar Compra
            </button>
        </div>
    `;

    // --- MANEJO DE EVENTOS  ---
    sidebar.addEventListener('click', (e) => {
        // Detenemos la propagación para que no interfiera con otros elementos
        const target = e.target;
        const id = target.getAttribute('data-id');

        // Lógica de botones con ID (Cerrar y Checkout)
        if (target.id === 'close-cart') {
            state.cartOpen = false;
            renderCallback();
            return;
        }

        if (target.id === 'go-checkout') {
            if (state.cart.length > 0) {
                state.cartOpen = false;
                state.view = 'checkout';
                renderCallback();
            }
            return;
        }

        // Lógica de botones con DATA-ID (Cantidades y eliminar)
        if (!id) return;
        const item = state.cart.find(p => String(p.id) === String(id));
        if (!item) return;

        if (target.classList.contains('btn-plus')) {
            item.quantity++;
            renderCallback();
        }

        else if (target.classList.contains('btn-minus')) {
            if (item.quantity > 1) {
                item.quantity--;
            } else {
                state.cart = state.cart.filter(p => String(p.id) !== String(id));
                notifier.show(`🗑️ ${item.name} eliminado`, "error");
            }
            renderCallback();
        }

        else if (target.classList.contains('btn-remove')) {
            state.cart = state.cart.filter(p => String(p.id) !== String(id));
            notifier.show("Producto eliminado", "error");
            renderCallback();
        }
    });

    overlay.onclick = () => {
        state.cartOpen = false;
        renderCallback();
    };

    const container = document.createDocumentFragment();
    container.appendChild(overlay);
    container.appendChild(sidebar);
    return container;
} 