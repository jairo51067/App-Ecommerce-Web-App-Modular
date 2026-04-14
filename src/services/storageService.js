import defaultProducts from "../data/products.json" with { type: "json" };

export const storageService = {
  // Cambiamos el nombre o añadimos el alias para que app.js lo encuentre
  getProducts() {
    const data = localStorage.getItem("products");
    if (data) return JSON.parse(data);
    
    // Si no hay datos, cargamos los de por defecto
    localStorage.setItem("products", JSON.stringify(defaultProducts));
    return defaultProducts;
  },

  // Mantenemos loadProducts por si lo usas en otro lado, 
  // pero ahora apunta a getProducts
  loadProducts() {
    return this.getProducts();
  },

  saveProducts(list) {
    localStorage.setItem("products", JSON.stringify(list));
  },

  getLeads() {
    return JSON.parse(localStorage.getItem("leads")) || [];
  },

  saveLead(order) {
    const leads = this.getLeads();
    leads.push(order);
    localStorage.setItem("leads", JSON.stringify(leads));
  },

  deleteLead(id) {
    // Aseguramos que la comparación sea robusta convirtiendo a String
    const leads = this.getLeads().filter((l) => String(l.id) !== String(id));
    localStorage.setItem("leads", JSON.stringify(leads));
  },
};