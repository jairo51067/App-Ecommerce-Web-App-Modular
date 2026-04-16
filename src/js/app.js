import { storageService } from "../services/storageService.js";
import { notifier } from "../services/notifier.js";

const defaultProducts = [
  {
    id: "p1",
    name: "MacBook Pro M3",
    price: 2500,
    stock: 15,
    description: "Potencia pura para profesionales del código.",
    image:
      "https://plus.unsplash.com/premium_photo-1681666713728-9ed75e148617?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fE1hY0Jvb2slMjBQcm8lMjBNM3xlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    id: "p2",
    name: "iPhone 15 Pro",
    price: 1200,
    stock: 20,
    description: "Cámara de titanio y el chip más rápido.",
    image:
      "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&auto=format",
  },
  {
    id: "p3",
    name: "Audífonos Sony XM5",
    price: 350,
    stock: 25,
    description: "Cancelación de ruido líder en la industria.",
    image:
      "https://images.unsplash.com/photo-1721300217761-e580569047f5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8QXVkJUMzJUFEZm9ub3MlMjBTb255JTIwWE01fGVufDB8fDB8fHww",
  },
  {
    id: "p4",
    name: "Monitor Odyssey G9",
    price: 1100,
    stock: 15,
    description: "Pantalla curva ultra-wide para gaming extremo.",
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format",
  },
  {
    id: "p5",
    name: "Teclado Keychron K2",
    price: 90,
    stock: 20,
    description: "Mecánico, inalámbrico y minimalista.",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format",
  },
  {
    id: "p6",
    name: "Mouse MX Master 3S",
    price: 110,
    stock: 15,
    description: "Ergonomía perfecta para largas jornadas.",
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format",
  },
  {
    id: "p7",
    name: "Apple Watch Ultra",
    price: 800,
    stock: 15,
    description: "Resistencia extrema para deportistas.",
    image:
      "https://images.unsplash.com/photo-1713056878930-c5604da9acfd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8QXBwbGUlMjBXYXRjaCUyMFVsdHJhfGVufDB8fDB8fHww",
  },
  {
    id: "p8",
    name: "iPad Pro 12.9",
    price: 1000,
    stock: 15,
    description: "Tu próximo ordenador no es un ordenador.",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format",
  },
  {
    id: "p9",
    name: "Memorias Ram DDR3 16GB",
    price: 800,
    stock: 20,
    description:
      "Memoria RAM DDR3 de 16GB para mejorar el rendimiento de tu computadora.",
    image:
      "https://images.unsplash.com/photo-1704175970187-1f7eaaa30312?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWVtb3JpYXMlMjBkZHIzfGVufDB8fDB8fHww",
  },
  {
    id: "p10",
    name: "Tarjeta Madre ASUS ROG DDR3",
    price: 2800,
    stock: 15,
    description: "Tarjeta madre de alta gama para sistemas gaming.",
    image:
      "https://media.istockphoto.com/id/1160419586/es/foto/primer-plano-de-la-placa-madre-de-la-computadora-con-la-cpu-instalada.webp?a=1&b=1&s=612x612&w=0&k=20&c=bSg-PR_4Jji4hpndgIPdrghr_Asn2Y_qjzlYwfCTWm4=",
  },
  {
    id: "p11",
    name: "Procesadores Intel Core i9",
    price: 2800,
    stock: 15,
    description: "Procesadores de alta gama para sistemas gaming.",
    image:
      "https://media.istockphoto.com/id/1076524688/es/foto/microprocesadores.webp?a=1&b=1&s=612x612&w=0&k=20&c=4n4m-A6GugNe0wUROsyV7CDEOZKPPHbxNeht-DQ95hU=",
  },
  {
    id: "p12",
    name: "Cases Gaming RGB",
    price: 2800,
    stock: 15,
    description: "Cases de alta gama para sistemas gaming.",
    image:
      "https://plus.unsplash.com/premium_photo-1671439429636-6d8d66247143?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2FzZSUyMGFkbSUyMHBjfGVufDB8fDB8fHww",
  },
];

// Lógica de carga inteligente
const savedProducts = storageService.getProducts();
const initialProducts =
  savedProducts.length > 0 ? savedProducts : defaultProducts;
const initialCart = storageService.getCart();

if (savedProducts.length === 0) {
  storageService.saveProducts(defaultProducts);
}

export const state = {
  view: "shop",
  products: initialProducts,
  filtered: [...initialProducts], // Esto asegura que la grilla no arranque vacía
  cart: initialCart, // <--- CARGA EL CARRITO GUARDADO
  cartOpen: false,
  searchTerm: "",
  auth: { isAuth: false, role: null, username: "" },
  checkoutData: { name: "", address: "", phone: "", notes: "" },
};

export function addToStateCart(product) {
  const existingProduct = state.cart.find(
    (item) => String(item.id) === String(product.id),
  );

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    state.cart.push({ ...product, quantity: 1 });
  }

  // 2. GUARDAR: Persistimos el cambio en el LocalStorage
  storageService.saveCart(state.cart);

  notifier.show(`🛒 ${product.name} añadido`);
} 
 