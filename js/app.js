// js/app.js
import { storageService } from "./services/storageService.js";
import { Header } from "./components/Header.js";
import { ProductList } from "./components/ProductList.js";
import { Login } from "./components/Login.js";
import { AdminPanel } from "./components/AdminPanel.js";
import { OrderPanel } from "./components/OrderPanel.js";
import { Cart } from "./components/Cart.js"; // Cambiado de CartPanel a Cart
import { Checkout } from "./components/Checkout.js"; // Importa el nuevo archivo

// js/app.js - Al inicio
const session = storageService.getSession();

export const state = {
  products: storageService.getProducts() || [],
  cart: storageService.getCart() || [],
  auth: session,
  // Si ya está logueado, determinamos la vista inicial para que no salte a la tienda
  view: session.isAuth
    ? session.role === "manager"
      ? "order"
      : "admin"
    : "shop",
};

// js/app.js

export function render() {
  const root = document.getElementById("app");
  if (!root) return;
  root.innerHTML = "";

  // DEBUG: Para saber qué está viendo el orquestador realmente
  console.log("--- RENDERIZANDO ---");
  console.log("Vista:", state.view);
  console.log("Auth Status:", state.auth.isAuth);
  console.log("Rol:", state.auth.role);

  // 1. Header (Solo se oculta en el login para mayor limpieza)
  if (state.view === "shop") {
    root.appendChild(Header(render));
  }

  // 2. Orquestador con Seguridad Flexibilizada
  switch (state.view) {
    case "shop":
      root.appendChild(ProductList(render));
      break;

    case "login":
      root.appendChild(Login());
      break;

    case "checkout": // <--- AÑADE ESTE CASO
      root.appendChild(Checkout(render));
      break;

    case "admin":
      // Verificamos si es Admin O Superuser
      if (
        state.auth.isAuth &&
        (state.auth.role === "admin" || state.auth.role === "superuser")
      ) {
        root.appendChild(AdminPanel(render));
      } else {
        console.warn("Bloqueo de seguridad: Redirigiendo a Login");
        state.view = "login";
        root.appendChild(Login());
      }
      break;

    case "order":
    case "orders": // Aceptamos ambos nombres para evitar errores de dedo
      if (
        state.auth.isAuth &&
        (state.auth.role === "manager" || state.auth.role === "superuser")
      ) {
        root.appendChild(OrderPanel(render));
      } else {
        state.view = "login";
        root.appendChild(Login());
      }
      break;

    default:
      root.appendChild(ProductList(render));
  }

  // 3. CAPA SUPERIOR: El Carrito (Overlay)
  // Si la vista es shop y el estado cartOpen es true, inyectamos el panel del carrito
  if (state.view === "shop" && state.cartOpen) {
    root.appendChild(Cart(render));
  }
}
// Iniciar la app por primera vez
render();
