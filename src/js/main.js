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
    // 1. Limpieza total para evitar residuos
    headerContainer.innerHTML = '';
    mainContent.innerHTML = '';

    // 2. Renderizar Header y Carrito (Siempre presentes)
    headerContainer.appendChild(Header(render));
    mainContent.appendChild(Cart(render));

    // 3. Enrutador seguro
    try {
        if (state.view === 'shop') {
            mainContent.appendChild(ProductList(render));
        } else if (state.view === 'checkout') {
            mainContent.appendChild(Checkout(render));
        } else if (state.view === 'admin') {
            mainContent.appendChild(AdminPanel(render));
        } else if (state.view === 'orders') {
            mainContent.appendChild(OrderPanel(render));
        } else if (state.view === 'login') {
            mainContent.appendChild(Login(render));
        }
    } catch (error) {
        console.error("Error renderizando vista:", error);
        state.view = 'shop'; // Emergencia: volver a la tienda
    }
}

render(); 