import { storageService } from '../services/storageService.js';

// 1. Cargamos los productos iniciales del storage
const initialProducts = storageService.getProducts();
export const state = {
    view: 'shop',
    products: initialProducts,
    filtered: [...initialProducts], // Se inicializa con los productos cargados
    cart: [],
    cartOpen: false,
    searchTerm: '',
    auth: {
        isAuth: false,
        role: null
    }
};

/**
 * Añade productos al carrito de forma segura
 * @param {Object} product 
 */
export function addToStateCart(product) {
    // IMPORTANTE: Aseguramos que el ID se compare como String para evitar errores de tipo
    const existingProduct = state.cart.find(item => String(item.id) === String(product.id));
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        // Clonamos para evitar mutaciones inesperadas
        state.cart.push({ ...product, quantity: 1 });
    }
}