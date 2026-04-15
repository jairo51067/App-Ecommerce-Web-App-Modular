import { state } from "./app.js";
import { Header } from "../components/Header.js";
import { ProductList } from "../components/ProductList.js";
import { Cart } from "../components/Cart.js";
import { Checkout } from "../components/Checkout.js";
import { AdminPanel } from "../components/AdminPanel.js";
import { Login } from "../components/Login.js";
import { OrderPanel } from "../components/OrderPanel.js";

const app = document.getElementById("app");
const headerContainer = document.createElement("header");
const mainContent = document.createElement("main");
mainContent.id = "main-content";
app.append(headerContainer, mainContent);

function render() {
    // 1. Limpieza total
    headerContainer.innerHTML = '';
    mainContent.innerHTML = '';

    // 2. Lógica de Protección de Rutas (Middleware)
    const protectedRoutes = ['admin', 'orders'];
    
    // Si la vista es protegida y no está logueado...
    if (protectedRoutes.includes(state.view) && !state.auth.isAuth) {
        state.view = 'login'; 
    }

    // Protección por Rol específico
    if (state.view === 'admin' && state.auth.role === 'gerente') {
        // Un gerente no debe entrar al panel de administración/inventario
        state.view = 'orders';
    }

    if (state.view === 'orders' && state.auth.role === 'admin') {
        // Un admin no debería entrar al panel de auditoría de gerencia 
        // (A menos que sea superuser, que saltará estas reglas)
    }

    // El Superusuario siempre tiene paso libre
    if (state.auth.role === 'superuser') {
        // No aplicamos restricciones
    }

    // 3. Renderizar Header y Carrito (Siempre presentes)
    headerContainer.appendChild(Header(render));
    mainContent.appendChild(Cart(render));

    // 4. Enrutador seguro
    try {
        switch (state.view) {
            case 'shop':
                mainContent.appendChild(ProductList(render));
                break;
            case 'checkout':
                mainContent.appendChild(Checkout(render));
                break;
            case 'admin':
                mainContent.appendChild(AdminPanel(render));
                break;
            case 'orders':
                mainContent.appendChild(OrderPanel(render));
                break;
            case 'login':
                mainContent.appendChild(Login(render));
                break;
            default:
                mainContent.appendChild(ProductList(render));
        }
    } catch (error) {
        console.error("Error crítico de navegación:", error);
        state.view = 'shop';
        render();
    }
}

render(); 