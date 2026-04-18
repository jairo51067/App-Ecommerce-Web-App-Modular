// js/services/storageService.js

// 1. CONSTANTES DE DOMINIO (Para evitar errores de tipeo en las llaves de LocalStorage)
const KEYS = {
    PRODUCTS: 'APP_INVENTORY_GLOBAL', // SSOT del Inventario
    LEADS: 'APP_ORDERS_HISTORY',      // Historial de Ventas
    USERS: 'APP_USERS_DB',            // Base de datos de credenciales
    AUTH: 'APP_CURRENT_SESSION',      // Sesión activa
    CART: 'APP_LOCAL_CART'            // Carrito del cliente
};

// 2. INICIALIZACIÓN DE DATOS MAESTROS (Si el sistema está en blanco)
const initializeApp = () => {
    if (!localStorage.getItem(KEYS.USERS)) {
        const defaultUsers = [
            { id: "u1", username: "super", password: "123", role: "superuser", name: "Super Admin" },
            { id: "u2", username: "admin", password: "123", role: "admin", name: "Administrador Logístico" },
            { id: "u3", username: "gerente", password: "123", role: "manager", name: "Gerente de Despacho" }
        ];
        localStorage.setItem(KEYS.USERS, JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem(KEYS.PRODUCTS)) localStorage.setItem(KEYS.PRODUCTS, JSON.stringify([]));
    if (!localStorage.getItem(KEYS.LEADS)) localStorage.setItem(KEYS.LEADS, JSON.stringify([]));
};

// Ejecutamos la inicialización al cargar el servicio
initializeApp();

// 3. EL SERVICIO CENTRALIZADO
export const storageService = {

    // ==========================================
    // MÓDULO DE INVENTARIO (Single Source of Truth)
    // ==========================================
    getProducts: () => JSON.parse(localStorage.getItem(KEYS.PRODUCTS)) || [],
    
    saveProducts: (productsArray) => {
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(productsArray));
    },

    // LA FUNCIÓN MAESTRA DE STOCK: Reemplaza a updateInventory suelta en app.js
    // type: 'subtract' (Venta) | 'add' (Devolución/Anulación)
    modifyStock: (items, type = 'subtract') => {
        const inventory = storageService.getProducts();
        
        items.forEach(item => {
            const product = inventory.find(p => String(p.id) === String(item.id));
            if (product) {
                if (type === 'subtract') {
                    product.stock = Math.max(0, (product.stock || 0) - item.quantity);
                } else if (type === 'add') {
                    product.stock = (product.stock || 0) + item.quantity;
                }
            }
        });
        
        storageService.saveProducts(inventory);
        return inventory; // Retorna el inventario fresco
    },

    // ==========================================
    // MÓDULO DE PEDIDOS (Inmutabilidad y Auditoría)
    // ==========================================
    getLeads: () => JSON.parse(localStorage.getItem(KEYS.LEADS)) || [],
    
    saveLead: (orderObject) => {
        const leads = storageService.getLeads();
        leads.push(orderObject);
        localStorage.setItem(KEYS.LEADS, JSON.stringify(leads));
    },

    updateLead: (updatedLeadsArray) => {
        // Uso directo para guardados masivos o actualizaciones de estado complejas
        localStorage.setItem(KEYS.LEADS, JSON.stringify(updatedLeadsArray));
    },

    // ==========================================
    // MÓDULO DE USUARIOS Y AUTENTICACIÓN (RBAC)
    // ==========================================
    getUsers: () => JSON.parse(localStorage.getItem(KEYS.USERS)) || [],
    
    saveUsers: (usersArray) => {
        localStorage.setItem(KEYS.USERS, JSON.stringify(usersArray));
    },

    getSession: () => {
        return JSON.parse(localStorage.getItem(KEYS.AUTH)) || { isAuth: false, role: 'guest' };
    },

    setSession: (sessionData) => {
        localStorage.setItem(KEYS.AUTH, JSON.stringify(sessionData));
    },

    clearSession: () => {
        localStorage.removeItem(KEYS.AUTH);
    },

    // ==========================================
    // MÓDULO DE CARRITO LOCAL
    // ==========================================
    getCart: () => JSON.parse(localStorage.getItem(KEYS.CART)) || [],
    saveCart: (cartArray) => localStorage.setItem(KEYS.CART, JSON.stringify(cartArray)),
    clearCart: () => localStorage.removeItem(KEYS.CART)
};