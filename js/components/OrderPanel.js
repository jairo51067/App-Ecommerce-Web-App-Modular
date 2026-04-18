/**
 * The `OrderPanel` function generates a dynamic HTML element displaying order management information
 * and allows for status updates with audit trail and stock management features.
 * @param renderCallback - The `renderCallback` parameter in the `OrderPanel` function is a callback
 * function that is used to trigger a re-render of the component or update the view when certain events
 * occur, such as a change in order status or a logout action. This callback function is passed from
 * the parent component or module
 * @returns The `OrderPanel` function is returning a dynamically created `div` element that contains
 * various HTML elements and data fetched from the `storageService`. The returned `div` represents an
 * order management panel with information about pending orders, orders to be dispatched, completed
 * orders, a list of orders with details like order ID, customer, products, status, and actions, as
 * well as a section displaying available stock
 */
// js/components/OrderPanel.js
import { state } from "../app.js";
import { storageService } from "../services/storageService.js";

export function OrderPanel(renderCallback) {
    const div = document.createElement("div");
    div.className = "order-panel";
    
    // Sincronización de datos frescos
    const leads = storageService.getLeads();
    const products = storageService.getProducts();

    // Cálculos de métricas
    const pendingCount = leads.filter(l => l.status === 'Pendiente').length;
    const paidCount = leads.filter(l => l.status === 'Pagado').length;

    div.innerHTML = `
        <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
            <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <div>
                    <h1 style="color: #2c3e50;">📦 Gestión Logística e Inventario</h1>
                    <p>Gerente: <span style="color: var(--secondary); font-weight: bold;">${state.auth.name}</span></p>
                </div>
                <button id="btn-logout" class="danger">Cerrar Sesión</button>
            </header>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
                <div class="card shadow" style="border-left: 5px solid #f39c12; background: #fffcf5;">
                    <h4 style="margin:0; color: #d35400;">⏳ PENDIENTES</h4>
                    <p style="font-size: 1.8em; font-weight: bold; margin: 5px 0;">${pendingCount}</p>
                </div>
                <div class="card shadow" style="border-left: 5px solid #2980b9; background: #f5faff;">
                    <h4 style="margin:0; color: #2980b9;">💰 POR DESPACHAR</h4>
                    <p style="font-size: 1.8em; font-weight: bold; margin: 5px 0;">${paidCount}</p>
                </div>
                <div class="card shadow" style="border-left: 5px solid #27ae60; background: #f5fff8;">
                    <h4 style="margin:0; color: #27ae60;">✅ COMPLETADOS</h4>
                    <p style="font-size: 1.8em; font-weight: bold; margin: 5px 0;">${leads.filter(l => l.status === 'Despachado').length}</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 350px; gap: 25px;">
                
                <main>
                    <div class="card shadow">
                        <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                            📋 Listado de Órdenes
                        </h3>
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="text-align: left; background: #f8f9fa; border-bottom: 2px solid #eee;">
                                        <th style="padding: 12px;">Pedido</th>
                                        <th style="padding: 12px;">Cliente</th>
                                        <th style="padding: 12px;">Productos</th>
                                        <th style="padding: 12px;">Estado / Auditoría</th>
                                        <th style="padding: 12px;">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${leads.slice().reverse().map(l => {
                                        const isCancelled = l.status === 'Cancelado';
                                        return `
                                        <tr style="border-bottom: 1px solid #eee; ${isCancelled ? 'opacity: 0.5; background: #fdf2f2;' : ''}">
                                            <td style="padding: 12px;">
                                                <b>#${l.id}</b>
                                                <div style="font-size: 0.7em; color: #999;">${new Date(l.id).toLocaleTimeString()}</div>
                                            </td>
                                            <td style="padding: 12px;">
                                                <div style="font-weight: 500;">${l.customer}</div>
                                            </td>
                                            <td style="padding: 12px; font-size: 0.85em;">
                                                ${l.items.map(i => `• ${i.quantity}x ${i.name}`).join('<br>')}
                                            </td>
                                            <td style="padding: 12px;">
                                                <span style="padding: 3px 7px; border-radius: 4px; background: ${getStatusColor(l.status)}; color: white; font-size: 0.75em; font-weight: bold;">
                                                    ${l.status.toUpperCase()}
                                                </span>
                                                ${l.history ? `<div style="font-size: 0.65em; color: #888; margin-top:4px;">Por: ${l.history[l.history.length-1].user}</div>` : ''}
                                            </td>
                                            <td style="padding: 12px;">
                                                ${isCancelled ? 
                                                    '<small style="color:red; font-weight:bold;">ANULADA</small>' : 
                                                    `<select class="mgr-status-select" data-id="${l.id}" style="padding: 5px; font-size: 0.85em;">
                                                        <option value="" disabled selected>Mover a...</option>
                                                        <option value="Pendiente" ${l.status === 'Pendiente' ? 'selected' : ''}>🔄 Pendiente</option>
                                                        <option value="Pagado" ${l.status === 'Pagado' ? 'selected' : ''}>💰 Pagado</option>
                                                        <option value="Despachado" ${l.status === 'Despachado' ? 'selected' : ''}>🚚 Despachado</option>
                                                        <option value="Cancelado">❌ Cancelar</option>
                                                    </select>`
                                                }
                                            </td>
                                        </tr>`;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>

                <aside>
                    <div class="card shadow" style="border-top: 4px solid var(--secondary);">
                        <h3 style="margin-bottom: 15px;">📊 Stock Disponible</h3>
                        <div style="max-height: 600px; overflow-y: auto;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
                                <thead>
                                    <tr style="text-align: left; border-bottom: 2px solid #eee;">
                                        <th style="padding: 8px;">Producto</th>
                                        <th style="padding: 8px;">Stock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${products.map(p => `
                                        <tr style="border-bottom: 1px solid #f9f9f9;">
                                            <td style="padding: 8px;">${p.name}</td>
                                            <td style="padding: 8px;">
                                                ${p.stock <= 5 
                                                    ? `<b style="color: #e74c3c;">${p.stock} ⚠️</b>` 
                                                    : `<b style="color: #27ae60;">${p.stock}</b>`}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        <p style="font-size: 0.75em; color: #888; margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px;">
                            * Vista de solo lectura. Para modificar stock base, contacte al Administrador.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    `;

    // --- FUNCIONES DE APOYO ---
    function getStatusColor(status) {
        switch(status) {
            case 'Despachado': return '#27ae60';
            case 'Cancelado': return '#e74c3c';
            case 'Pagado': return '#2980b9';
            default: return '#f39c12';
        }
    }

    // --- LOGICA DE EVENTOS ---

    // Cambio de estado con Auditoría y Stock
    div.querySelectorAll(".mgr-status-select").forEach(select => {
        select.onchange = (e) => {
            const orderId = e.target.getAttribute("data-id");
            const newStatus = e.target.value;

            const confirmMsg = newStatus === 'Cancelado'
                ? `¿ESTÁS SEGURO? Se cancelará la orden #${orderId} y el stock volverá al inventario.`
                : `¿Cambiar pedido #${orderId} a ${newStatus}?`;

            if (confirm(confirmMsg)) {
                storageService.updateLeadStatus(orderId, newStatus, state.auth.name);
                // Refrescamos la vista para actualizar tablas y contadores
                renderCallback();
            } else {
                e.target.value = ""; 
            }
        };
    });

    // Salida
    div.querySelector("#btn-logout").onclick = () => {
        storageService.clearSession();
        state.auth = { isAuth: false, role: 'guest' };
        state.view = 'shop';
        renderCallback();
    };

    return div;
}