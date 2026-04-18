// js/components/ProductList.js
import { state } from "../app.js";
import { storageService } from "../services/storageService.js";

export function ProductList(renderCallback) {
    const div = document.createElement("div");
    div.className = "product-grid";

    const products = state.products;

    if (products.length === 0) {
        div.innerHTML = `<p style="text-align:center; padding:50px;">El inventario está vacío. Ingresa como Admin para agregar productos.</p>`;
        return div;
    }

    // Mapeo de productos
    const cards = products.map(p => {
        // Creamos el HTML de cada tarjeta de forma limpia
        return `
            <div class="card shadow product-card">
                <img src="${p.image || ''}" alt="${p.name}" style="width:100%; height:150px; object-fit:cover;">
                <h4>${p.name}</h4>
                <p class="price">$${p.price}</p>
                <p class="stock">Stock: ${p.stock}</p>
                <button class="add-to-cart success" data-id="${p.id}">
                    Agregar al Carrito
                </button>
            </div>
        `;
    }).join('');

    div.innerHTML = cards;

    // Lógica de los botones (Eventos)
    div.querySelectorAll(".add-to-cart").forEach(btn => {
        btn.onclick = () => {
            const id = btn.getAttribute("data-id");
            const product = products.find(prod => String(prod.id) === String(id));
            
            if (product && product.stock > 0) {
                const cart = storageService.getCart();
                const itemInCart = cart.find(item => String(item.id) === String(id));

                if (itemInCart) {
                    if (itemInCart.quantity < product.stock) {
                        itemInCart.quantity++;
                    } else {
                        alert("No hay más stock");
                        return;
                    }
                } else {
                    cart.push({ ...product, quantity: 1 });
                }

                storageService.saveCart(cart);
                state.cart = cart;
                renderCallback(); // Esto actualiza el contador del Header
            } else {
                alert("Producto sin stock");
            }
        };
    });

    return div;
}