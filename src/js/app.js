import { storageService } from '../services/storageService.js';
import { notifier } from '../services/notifier.js';

const defaultProducts = [
    { 
        "id": "p1", "name": "MacBook Pro M3", "price": 2500, 
        "description": "Potencia pura para profesionales del código.", 
        "image": "https://images.unsplash.com/photo-1517336714460-45732d9776d1?q=80&w=800" 
    },
    { 
        "id": "p2", "name": "iPhone 15 Pro", "price": 1200, 
        "description": "Cámara de titanio y el chip más rápido.", 
        "image": "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800" 
    },
    { 
        "id": "p3", "name": "Audífonos Sony XM5", "price": 350, 
        "description": "Cancelación de ruido líder en la industria.", 
        "image": "https://images.unsplash.com/photo-1546435770-a3e426fb472b?q=80&w=800" 
    },
    { 
        "id": "p4", "name": "Monitor Odyssey G9", "price": 1100, 
        "description": "Pantalla curva ultra-wide para gaming extremo.", 
        "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800" 
    },
    { 
        "id": "p5", "name": "Teclado Keychron K2", "price": 90, 
        "description": "Mecánico, inalámbrico y minimalista.", 
        "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800" 
    },
    { 
        "id": "p6", "name": "Mouse MX Master 3S", "price": 110, 
        "description": "Ergonomía perfecta para largas jornadas.", 
        "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800" 
    },
    { 
        "id": "p7", "name": "Apple Watch Ultra", "price": 800, 
        "description": "Resistencia extrema para deportistas.", 
        "image": "https://images.unsplash.com/photo-1546868871-70ca1bc73db9?q=80&w=800" 
    },
    { 
        "id": "p8", "name": "iPad Pro 12.9", "price": 1000, 
        "description": "Tu próximo ordenador no es un ordenador.", 
        "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800" 
    }
];

// Lógica de carga inteligente
const savedProducts = storageService.getProducts();
const initialProducts = savedProducts.length > 0 ? savedProducts : defaultProducts;

if (savedProducts.length === 0) {
    storageService.saveProducts(defaultProducts);
}

export const state = {
    view: 'shop',
    products: initialProducts,
    filtered: [...initialProducts], // Esto asegura que la grilla no arranque vacía
    cart: [],
    cartOpen: false,
    searchTerm: '',
    auth: { isAuth: false, role: null, username: '' },
    checkoutData: { name: '', address: '', phone: '', notes: '' }
};

export function addToStateCart(product) {
    const existingProduct = state.cart.find(item => String(item.id) === String(product.id));
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        state.cart.push({ ...product, quantity: 1 });
    }
    notifier.show(`🛒 ${product.name} añadido`);
}