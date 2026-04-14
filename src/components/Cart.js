import { state } from '../js/app.js';

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
            ${state.cart.length === 0 ? '<p>El carrito está vacío</p>' : 
              state.cart.map(item => `
                <div class="cart-item">
                    <div>
                        <strong>${item.name}</strong><br>
                        <small>$${item.price} x ${item.quantity}</small>
                    </div>
                    <button class="danger btn-remove" data-id="${item.id}" style="padding: 2px 8px;">x</button>
                </div>
              `).join('')}
        </div>
        <div style="border-top: 2px solid var(--light); padding-top: 15px;">
            <h4>Total: $${total.toLocaleString()}</h4>
            <button class="success" id="go-checkout" style="width: 100%; padding: 12px;" 
                ${state.cart.length === 0 ? 'disabled' : ''}>
                Finalizar Compra
            </button>
        </div>
    `;

    // Eventos
    sidebar.querySelector('#close-cart').onclick = () => {
        state.cartOpen = false;
        renderCallback();
    };

    overlay.onclick = () => {
        state.cartOpen = false;
        renderCallback();
    };

    if (sidebar.querySelector('#go-checkout')) {
        sidebar.querySelector('#go-checkout').onclick = () => {
            state.cartOpen = false;
            state.view = 'checkout';
            renderCallback();
        };
    }

    // Botón borrar item
    sidebar.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove')) {
            const id = e.target.getAttribute('data-id');
            state.cart = state.cart.filter(item => String(item.id) !== String(id));
            renderCallback();
        }
    });

    const container = document.createDocumentFragment();
    container.appendChild(overlay);
    container.appendChild(sidebar);
    return container;
}