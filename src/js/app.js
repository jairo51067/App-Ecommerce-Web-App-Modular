import { storageService } from '../services/storageService.js';
import { notifier } from '../services/notifier.js';

// Definimos los productos aquí mismo. 
// Esto evita el error 404 de products.json
const defaultProducts = [
  { 
    "id": "prod-001", 
    "name": "Laptop Pro", 
    "price": 500, 
    "description": "Portátil de alto rendimiento.", 
    "image": "assets/img/laptop.jpg" 
  },
  { 
    "id": "prod-002", 
    "name": "Smartphone X", 
    "price": 100, 
    "description": "Smartphone con gran cámara.", 
    "image": "assets/img/phone.jpg" 
  }
];

// Cargamos de LocalStorage o usamos los de arriba si es la primera vez
const initialProducts = storageService.getProducts().length > 0 
    ? storageService.getProducts() 
    : defaultProducts;

// Si es la primera vez, los guardamos para que el Admin pueda editarlos luego
if (storageService.getProducts().length === 0) {
    storageService.saveProducts(defaultProducts);
}

export const state = {
    view: 'shop',
    products: initialProducts,
    filtered: [...initialProducts],
    cart: [],
    cartOpen: false,
    searchTerm: '',
    auth: { 
        isAuth: false, 
        role: null, 
        username: '' // Añadimos esto para saber quién nos saluda
    },
    checkoutData: {
        name: '',
        address: '',
        phone: '',
        notes: ''}
};

/**
 * Añade productos al carrito de forma segura
 * @param {Object} product 
 */
export function addToStateCart(product) {
    console.log("Intentando mostrar Toast para:", product.name); // <--- AÑADE ESTO
    // IMPORTANTE: Aseguramos que el ID se compare como String para evitar errores de tipo
    const existingProduct = state.cart.find(item => String(item.id) === String(product.id));
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        // Clonamos para evitar mutaciones inesperadas
        state.cart.push({ ...product, quantity: 1 });
    }
    // --- FEEDBACK VISUAL ---
    notifier.show(`🛒 ${product.name} añadido`);
    
}  