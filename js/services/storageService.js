// js/services/storageService.js

const KEYS = {
    PRODUCTS: 'APP_INVENTORY_GLOBAL',
    LEADS: 'APP_ORDERS_HISTORY',
    USERS: 'APP_USERS_DB',
    AUTH: 'APP_CURRENT_SESSION',
    CART: 'APP_LOCAL_CART'
};

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

initializeApp();

export const storageService = {

    // --- INVENTARIO ---
    getProducts: () => JSON.parse(localStorage.getItem(KEYS.PRODUCTS)) || [],
    
    saveProducts: (productsArray) => {
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(productsArray));
    },

    // Centraliza el movimiento de stock
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
        return inventory;
    },

    // --- PEDIDOS Y AUDITORÍA ---
    getLeads: () => JSON.parse(localStorage.getItem(KEYS.LEADS)) || [],
    
    saveLead: (orderObject) => {
        const leads = storageService.getLeads();
        // Inicializamos el historial del pedido
        orderObject.history = [{
            date: new Date().toLocaleString(),
            user: "Sistema (Cliente)",
            action: "Pedido Creado",
            status: "Pendiente"
        }];
        leads.push(orderObject);
        localStorage.setItem(KEYS.LEADS, JSON.stringify(leads));
    },

    /**
     * MÉTODO MAESTRO DE CAMBIO DE ESTADO
     * Maneja la auditoría y la devolución de stock si se cancela.
     */
    updateLeadStatus: (orderId, newStatus, currentUser) => {
        const leads = storageService.getLeads();
        const orderIndex = leads.findIndex(l => String(l.id) === String(orderId));
        
        if (orderIndex === -1) return;

        const order = leads[orderIndex];

        // 1. Si ya estaba cancelado, no permitir más cambios (Inmutabilidad)
        if (order.status === 'Cancelado') {
            console.warn("Intento de modificar un pedido ya cancelado y bloqueado.");
            return;
        }

        // 2. Si el nuevo estado es "Cancelado", devolvemos el stock automáticamente
        if (newStatus === 'Cancelado') {
            storageService.modifyStock(order.items, 'add');
        }

        // 3. Registrar en el historial para auditoría
        order.history.push({
            date: new Date().toLocaleString(),
            user: currentUser,
            action: `Estado cambiado a ${newStatus}`,
            status: newStatus
        });

        // 4. Actualizar estado y guardar
        order.status = newStatus;
        leads[orderIndex] = order;
        localStorage.setItem(KEYS.LEADS, JSON.stringify(leads));
        
        return order;
    },

    updateLead: (updatedLeadsArray) => {
        localStorage.setItem(KEYS.LEADS, JSON.stringify(updatedLeadsArray));
    },

    // --- SESIÓN Y USUARIOS ---
    getUsers: () => JSON.parse(localStorage.getItem(KEYS.USERS)) || [],
    getSession: () => JSON.parse(localStorage.getItem(KEYS.AUTH)) || { isAuth: false, role: 'guest' },
    setSession: (sessionData) => localStorage.setItem(KEYS.AUTH, JSON.stringify(sessionData)),
    clearSession: () => localStorage.removeItem(KEYS.AUTH),

    // --- CARRITO ---
    getCart: () => JSON.parse(localStorage.getItem(KEYS.CART)) || [],
    saveCart: (cartArray) => localStorage.setItem(KEYS.CART, JSON.stringify(cartArray)),
    clearCart: () => localStorage.removeItem(KEYS.CART)
};