import { state } from "../js/app.js";
import { storageService } from "../services/storageService.js";

export function OrderPanel(renderCallback) {
    const div = document.createElement("div");
    div.className = "panel";

    // Obtenemos los datos frescos
    const leads = storageService.getLeads();

    // --- 0. BARRA DE SINCRONIZACIÓN (Gerencia) ---
    const syncBar = document.createElement("div");
    syncBar.style.cssText = "display:flex; justify-content:flex-end; align-items:center; gap:10px; margin-bottom:15px; font-size:0.85em; color:var(--secondary);";
    
    const lastSync = localStorage.getItem("lastSync_Gerente") || "No sincronizado";

    syncBar.innerHTML = `
        <span>Visto por última vez: <b id="sync-time">${lastSync}</b></span>
        <button id="btn-sync" style="padding: 5px 12px; cursor: pointer; border-radius: 4px; border: 1px solid var(--primary); background: white; color: var(--primary); font-weight: bold; transition: 0.3s;">
            🔄 Sincronizar
        </button>
    `;

    syncBar.querySelector("#btn-sync").onclick = (e) => {
        const btn = e.currentTarget;
        btn.style.opacity = "0.5";
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        localStorage.setItem("lastSync_Gerente", now);
        
        setTimeout(() => {
            renderCallback(); 
        }, 300);
    };

    // --- 1. CABECERA ---
    const header = document.createElement("div");
    header.className = "row";
    header.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;";
    header.innerHTML = `
        <h2>Panel de Pedidos (Gerencia)</h2>
        <button class="danger" id="logout-btn">Salir</button>
    `;

    // --- 2. CONTENIDO DE LA TABLA ---
    const content = document.createElement("div");
    content.className = "card";
    content.innerHTML = `
        <h4>Control de Gestión y Auditoría</h4>
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="text-align: left; border-bottom: 2px solid #eee;">
                        <th style="padding: 10px;">Folio / Fecha</th>
                        <th style="padding: 10px;">Cliente</th>
                        <th style="padding: 10px;">Total</th>
                        <th style="padding: 10px; text-align: center;">Estado / Auditoría</th>
                    </tr>
                </thead>
                <tbody>
                    ${leads.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding:20px;">No hay pedidos en sistema</td></tr>' : 
                    leads.map((l) => {
                        const isDeleted = l.deleted === true;
                        return `
                        <tr style="border-bottom: 1px solid #eee; 
                                   background: ${isDeleted ? '#fff5f5' : (l.completed ? '#f8fff9' : 'transparent')};
                                   ${isDeleted ? 'opacity: 0.6; text-decoration: line-through;' : ''}">
                            <td style="padding: 10px;">
                                <strong>#${l.id}</strong>
                                ${isDeleted ? `<br><small style="color:red; font-weight:bold; text-decoration:none !important; display:inline-block;">[ELIMINADO POR ADMIN]</small>` : ""}
                                <br><small>${l.date || ''} ${l.time || ''}</small>
                            </td>
                            <td style="padding: 10px;"><strong>${l.customer || 'S/N'}</strong></td>
                            <td style="padding: 10px;">$${(l.total || 0).toLocaleString()}</td>
                            <td style="padding: 10px; text-align: center;">
                                ${isDeleted ? `
                                    <small style="text-decoration:none !important; display:block;">Anulado por: <b>${l.deletedBy}</b></small>
                                ` : `
                                    <button class="${l.completed ? '' : 'btn-toggle-status'}" data-id="${l.id}" 
                                        ${l.completed ? 'disabled' : ''}
                                        style="cursor: ${l.completed ? 'default' : 'pointer'}; border: none; padding: 8px 12px; border-radius: 20px; 
                                        background: ${l.completed ? 'var(--success)' : '#ccc'}; color: black;
                                        opacity: ${l.completed ? '0.8' : '1'};">
                                        ${l.completed ? '✅ Ejecutado' : '⏳ Marcar OK'}
                                    </button>
                                    ${l.completedBy ? `<br><small style="color: #666; font-size: 0.75em;">Marcado por: <b>${l.completedBy}</b></small>` : ''}
                                `}
                            </td>
                        </tr>
                    `}).join("")}
                </tbody>
            </table>
        </div>
    `;

    // --- LOGICA DE EVENTOS (PROTEGIDA) ---
    div.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-toggle-status")) {
            const id = String(e.target.getAttribute("data-id"));
            const currentLeads = storageService.getLeads();
            const index = currentLeads.findIndex((l) => String(l.id) === id);
            
            if (index !== -1) {
                const pedido = currentLeads[index];

                // 1. Doble check de seguridad: No operamos sobre eliminados ni ya completados
                if (pedido.deleted || pedido.completed) return;

                // 2. Advertencia de auditoría
                const confirmacion = confirm(
                    `¿Confirmas que el pedido #${pedido.id} ha sido entregado?\n\n` +
                    `Esta acción quedará registrada bajo tu firma (Gerente) y el registro se cerrará por seguridad.`
                );

                if (confirmacion) {
                    pedido.completed = true;
                    pedido.completedBy = "Gerente";
                    
                    localStorage.setItem("leads", JSON.stringify(currentLeads));
                    renderCallback();
                }
            }
        }
    });

    // Ensamblaje
    div.append(syncBar, header, content);

    // Logout
    setTimeout(() => {
        const btn = div.querySelector('#logout-btn');
        if(btn) {
            btn.onclick = () => {
                state.auth.isAuth = false;
                state.view = "shop";
                renderCallback();
            };
        }
    }, 0);

    return div;
}