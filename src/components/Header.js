import { state } from '../js/app.js';

export function Header(renderCallback) {
    const header = document.createElement('div');
    header.className = 'nav-container';

    const cartCount = state.cart.reduce((acc, item) => acc + item.quantity, 0);

    header.innerHTML = `
        <div class="logo" id="go-shop" style="cursor:pointer">🚀 MI TIENDA</div>
        <div class="search-box">
            <input id="search-input" type="text" placeholder="Buscar..." value="${state.searchTerm || ''}">
        </div>
        <div class="nav-actions">
            <div class="cart-icon" id="open-cart-btn" style="cursor:pointer; position:relative;">
                🛒 <span class="cart-count">${cartCount}</span>
            </div>
            <button class="secondary" id="go-login">
                ${state.auth?.isAuth ? 'Panel' : 'Admin'}
            </button>
        </div>
    `;

    // BUSCADOR: Para que no se rompa, solo renderizamos si el valor cambia realmente
    const input = header.querySelector('#search-input');
    input.addEventListener('input', (e) => {
        state.searchTerm = e.target.value.toLowerCase();
        state.filtered = state.products.filter(p => 
            p.name.toLowerCase().includes(state.searchTerm)
        );
        
        // Renderizamos solo si estamos en la tienda
        if (state.view === 'shop') renderCallback();
        
        // Devolvemos el foco al final
        const nuevoInput = document.getElementById('search-input');
        if (nuevoInput) {
            nuevoInput.focus();
            nuevoInput.setSelectionRange(nuevoInput.value.length, nuevoInput.value.length);
        }
    });

    header.querySelector('#open-cart-btn').onclick = () => {
        state.cartOpen = true;
        renderCallback();
    };

    header.querySelector('#go-shop').onclick = () => {
        state.view = 'shop';
        renderCallback();
    };

    header.querySelector('#go-login').onclick = () => {
        state.view = 'login';
        renderCallback();
    };

    return header;
}