export const storageService = {
  // Solo lee lo que hay en el navegador
  getProducts() {
    const data = localStorage.getItem("products");
    try {
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Error al parsear productos:", e);
        return [];
    }
  },

  // Guarda la lista de productos
  saveProducts(list) {
    localStorage.setItem("products", JSON.stringify(list));
  },

  // Obtiene los pedidos (leads)
  getLeads() {
    const data = localStorage.getItem("leads");
    try {
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
  },

  // Guarda un nuevo pedido
  saveLead(order) {
    const leads = this.getLeads();
    leads.push(order);
    localStorage.setItem("leads", JSON.stringify(leads));
  },

  // Elimina un pedido por ID
  deleteLead(id) {
    const leads = this.getLeads().filter((l) => String(l.id) !== String(id));
    localStorage.setItem("leads", JSON.stringify(leads));
  },

  // Alias para mantener compatibilidad si lo usas en otros componentes
  loadProducts() {
    return this.getProducts();
  },
  getCart() {
    const data = localStorage.getItem("shop_cart");
    try {
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveCart(cart) {
    localStorage.setItem("shop_cart", JSON.stringify(cart));
  },

  clearCart() {
    localStorage.removeItem("shop_cart");
  },
};