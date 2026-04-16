// OrderPanel.js - Panel de Pedidos para Gerencia (Actualizado con Auditoría de Stock)
import { state } from "../js/app.js";
import { storageService } from "../services/storageService.js";

export function OrderPanel(renderCallback) {
    const div = document.createElement("div");
    div.className = "panel";

    const leads = storageService.getLeads();

    // --- 0. BARRA DE SINCRONIZACIÓN ---
    const syncBar = document.createElement("div");
    syncBar.style.cssText = "display:flex; justify-content:flex-end; align-items:center; gap:10px; margin-bottom:15px; font-size:0.85em; color:var(--secondary);";
    const lastSync = localStorage.getItem("lastSync_Gerente") || "No sincronizado";

    syncBar.innerHTML = `
        <span>Visto por última vez: <b id="sync-time">${lastSync}</b></span>
        <button id="btn-sync" style="padding: 5px 12px; cursor: pointer; border-radius: 4px; border: 1px solid var(--primary); background: white; color: var(--primary); font-weight: bold;">
            🔄 Sincronizar
        </button>
    `;

    syncBar.querySelector("#btn-sync").onclick = () => {
        localStorage.setItem("lastSync_Gerente", new Date().toLocaleTimeString());
        renderCallback();
    };

    // --- 1. CABECERA ---
    const header = document.createElement("div");
    header.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;";
    header.innerHTML = `
        <h2 style="margin:0;">Panel de Gestión (Gerencia)</h2>
        <button class="danger" id="logout-btn">Salir</button> 
    `;

    // --- 2. NUEVO: VISTA RÁPIDA DE INVENTARIO PARA GERENTE ---
    const inventoryAudit = document.createElement("div");
    inventoryAudit.className = "card";
    inventoryAudit.style.marginBottom = "25px";
    inventoryAudit.innerHTML = `
        <h4 style="margin-bottom:15px;">📋 Auditoría de Inventario Real</h4>
        <div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px;">
            ${state.products.map(p => `
                <div style="min-width: 140px; background: #fff; border: 1px solid #eee; padding: 10px; border-radius: 8px; text-align: center;">
                    <img src="${p.image || 'https://via.placeholder.com/50'}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; margin-bottom: 5px;">
                    <div style="font-size: 0.8em; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</div>
                    <div style="color: ${p.stock <= 3 ? 'red' : 'var(--success)'}; font-size: 0.9em; font-weight: bold;">
                        Stock: ${p.stock || 0}
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // --- 3. TABLA DE GESTIÓN DE PEDIDOS ---
    const content = document.createElement("div");
    content.className = "card";
    content.innerHTML = `
        <h4>Control de Pedidos y Salida de Mercancía</h4>
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="text-align: left; border-bottom: 2px solid #eee; font-size: 0.9em;">
                        <th style="padding: 10px;">Pedido / Fecha</th>
                        <th style="padding: 10px;">Detalle del Pedido</th>
                        <th style="padding: 10px;">Cliente / Total</th>
                        <th style="padding: 10px; text-align: center;">Estado Operativo</th>
                    </tr>
                </thead>
                <tbody>
                    ${leads.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding:20px;">No hay pedidos</td></tr>' : 
                    leads.map((l) => {
                        const isDeleted = l.deleted === true;
                        return `
                        <tr style="border-bottom: 1px solid #eee; background: ${isDeleted ? '#fff5f5' : (l.completed ? '#f8fff9' : 'transparent')};">
                            <td style="padding: 10px;">
                                <strong>#${l.id}</strong><br>
                                <small>${l.date || ''} ${l.time || ''}</small>
                                ${isDeleted ? `<br><b style="color:red; font-size:0.7em;">[ANULADO]</b>` : ''}
                            </td>
                            <td style="padding: 10px; font-size: 0.85em;">
                                ${l.items ? l.items.map(i => `• ${i.name} (x${i.quantity})`).join('<br>') : 'Sin detalle'}
                            </td>
                            <td style="padding: 10px;">
                                <strong>${l.customer}</strong><br>
                                <span style="color:var(--success); font-weight:bold;">$${(l.total || 0).toLocaleString()}</span>
                            </td>
                            <td style="padding: 10px; text-align: center;">
                                ${isDeleted ? `<small>Por: ${l.deletedBy}</small>` : `
                                    <button class="${l.completed ? '' : 'btn-toggle-status'}" data-id="${l.id}" 
                                        ${l.completed ? 'disabled' : ''}
                                        style="cursor: ${l.completed ? 'default' : 'pointer'}; border: none; padding: 6px 15px; border-radius: 4px; 
                                        background: ${l.completed ? 'var(--success)' : 'var(--primary)'}; color: white; font-size:0.85em;">
                                        ${l.completed ? '✅ Despachado' : '🚚 Despachar'}
                                    </button>
                                    ${l.completedBy ? `<br><small style="font-size: 0.7em;">Auditoría: ${l.completedBy}</small>` : ''}
                                `}
                            </td>
                        </tr>
                        `;
                    }).reverse().join("")}
                </tbody>
            </table>
        </div>
    `;

    // --- LÓGICA DE EVENTOS ---
    div.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-toggle-status")) {
            const id = String(e.target.getAttribute("data-id"));
            const currentLeads = storageService.getLeads();
            const pedido = currentLeads.find((l) => String(l.id) === id);
            
            if (pedido && !pedido.deleted && !pedido.completed) {
                if (confirm(`¿Gerencia confirma la salida del Pedido #${pedido.id}?`)) {
                    pedido.completed = true;
                    pedido.completedBy = "Gerente";
                    localStorage.setItem("leads", JSON.stringify(currentLeads));
                    renderCallback();
                }
            }
        }
    });

    // Ensamblaje
    div.append(syncBar, header, inventoryAudit, content);

    // Logout
    setTimeout(() => {
        const btn = div.querySelector('#logout-btn');
        if(btn) btn.onclick = () => {
            state.auth.isAuth = false;
            state.view = "shop";
            renderCallback();
        };
    }, 0);

    return div;
}