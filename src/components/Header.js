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
                ${state.auth?.isAuth ? 'Panel' : 'Entrar'}
            </button>
        </div>
    `;

    // --- BUSCADOR EN TIEMPO REAL ---
    const input = header.querySelector('#search-input');
    input.addEventListener('input', (e) => {
        state.searchTerm = e.target.value.toLowerCase();
        
        // Filtramos por nombre y descripción para mayor precisión
        state.filtered = state.products.filter(p => 
            p.name.toLowerCase().includes(state.searchTerm) || 
            (p.description && p.description.toLowerCase().includes(state.searchTerm))
        );
        
        // Si estamos en la tienda, actualizamos la vista
        if (state.view === 'shop') {
            renderCallback();
            
            // Re-enfocamos el input y ponemos el cursor al final
            const nuevoInput = document.getElementById('search-input');
            if (nuevoInput) {
                nuevoInput.focus();
                const val = nuevoInput.value;
                nuevoInput.value = ''; // Truco para resetear posición
                nuevoInput.value = val;
            }
        }
    });

    // --- NAVEGACIÓN ---
    header.querySelector('#open-cart-btn').onclick = () => {
        state.cartOpen = true;
        renderCallback();
    };

    header.querySelector('#go-shop').onclick = () => {
        state.view = 'shop';
        state.searchTerm = ''; // Limpiamos al volver al inicio
        state.filtered = [...state.products];
        renderCallback();
    };

    header.querySelector('#go-login').onclick = () => {
        if (state.auth?.isAuth) {
            // Si ya está logueado, lo mandamos a su vista según su rol
            if (state.auth.role === 'admin') state.view = 'admin';
            else if (state.auth.role === 'gerente' || state.auth.role === 'superuser') state.view = 'orders';
        } else {
            state.view = 'login';
        }
        renderCallback();
    };

    return header;
} 