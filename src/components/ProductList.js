import { state } from "../js/app.js";

export function ProductList(renderCallback) {
  const div = document.createElement("div");
  div.className = "container"; 

  div.innerHTML = `
        <div style="margin-bottom: 30px; text-align: center;">
            <h1 style="color: var(--dark); margin-bottom: 5px;">Nuestra Tienda</h1>
            <p style="color: var(--secondary);">Los mejores productos al mejor precio</p>
        </div>
        <div class="product-grid">
            ${state.filtered.map((p) => `
                <div class="product-card">
                    <img 
                        src="${p.image && p.image.trim() !== "" ? p.image : "https://placehold.co/600x400?text=Sin+Imagen"}" 
                        class="product-img" 
                        alt="${p.name}"
                        onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Error+de+Carga';"
                    >
                    <div class="product-info">
                        <h4 style="margin:0; border:none; padding:0;">${p.name}</h4>
                        <p style="color: var(--secondary); font-size: 0.85em; margin: 10px 0;">
                            ${p.description || "Sin descripción"}
                        </p>
                        <div class="price-tag">$${p.price.toLocaleString()}</div>
                        <button class="success btn-add" data-id="${p.id}" style="width:100%; padding: 10px;">
                            🛒 Agregar al Carrito
                        </button>
                    </div>
                </div>
            `).join("")}
        </div>
    `;

  // Listener para agregar al carrito
  div.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-add")) {
      const id = e.target.getAttribute("data-id");
      const product = state.products.find((p) => String(p.id) === String(id));

      if (product) {
        const inCart = state.cart.find((item) => String(item.id) === String(id));
        if (inCart) {
          inCart.quantity++;
        } else {
          state.cart.push({ ...product, quantity: 1 });
        }
        // Abrimos el carrito automáticamente para feedback visual
        state.cartOpen = true; 
        renderCallback();
      }
    }
  });

  return div;
} 