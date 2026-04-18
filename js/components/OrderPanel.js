import { state } from "../app.js";
import { storageService } from "../services/storageService.js";

// Importaremos el servicio de exportación (crearemos este archivo luego o simularemos la lógica)
const exportToCSV = (data) => {
  const headers = ["ID", "Fecha", "Cliente", "Total", "Estado", "Responsable"];
  const rows = data.map((l) => [
    l.id,
    l.date,
    l.customer,
    l.total,
    l.status,
    l.updatedBy || "N/A",
  ]);

  let csvContent =
    "data:text/csv;charset=utf-8," +
    headers.join(",") +
    "\n" +
    rows.map((e) => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `Reporte_Ventas_${new Date().toLocaleDateString()}.csv`,
  );
  document.body.appendChild(link);
  link.click();
};

export function OrderPanel(renderCallback) {
  const div = document.createElement("div");
  div.className = "panel-container";

  const leads = storageService.getLeads();
  const inventory = storageService.getProducts();

  div.innerHTML = `

        
    
        <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
            <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <div>
                    <h1 style="color: var(--primary);">📋 Panel de Gerencia</h1>
                    <p>Auditor: <b>${state.auth.name}</b> | <span style="color: #666;">ID Acceso: ${state.auth.username}</span></p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button id="btn-go-shop" class="secondary">🏪 Ir a la Tienda</button> <button id="btn-export" class="secondary">📥 Exportar CSV</button>
    <button id="btn-logout" class="danger">Cerrar Sesión</button>
                </div>
            </header>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
                <div class="card shadow" style="border-left: 5px solid #3498db;">
                    <small>Facturación Total</small>
                    <h2>$${leads.reduce((acc, curr) => acc + curr.total, 0).toLocaleString()}</h2>
                </div>
                <div class="card shadow" style="border-left: 5px solid #f1c40f;">
                    <small>Pendientes de Revisión</small>
                    <h2>${leads.filter((l) => l.status === "Pendiente").length}</h2>
                </div>
                <div class="card shadow" style="border-left: 5px solid #2ecc71;">
                    <small>Eficiencia de Despacho</small>
                    <h2>${leads.length > 0 ? Math.round((leads.filter((l) => l.status === "Despachado").length / leads.length) * 100) : 0}%</h2>
                </div>
            </div>

            <div class="card shadow">
                <h3>Historial de Ventas e Inmutabilidad</h3>
                <div style="overflow-x: auto; margin-top: 15px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f8f9fa; text-align: left;">
                                <th style="padding: 12px;">ID / Registro</th>
                                <th style="padding: 12px;">Cliente / Canal</th>
                                <th style="padding: 12px;">Items</th>
                                <th style="padding: 12px;">Estado / Auditor</th>
                                <th style="padding: 12px;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${leads
                              .map((lead) => {
                                const isLocked = lead.status === "Despachado";
                                return `
                                <tr style="border-bottom: 1px solid #eee; background: ${isLocked ? "#f9f9f9" : "white"}">
                                    <td style="padding: 12px;">
                                        <b>#${lead.id}</b><br>
                                        <small>${lead.date} ${lead.time}</small>
                                    </td>
                                    <td style="padding: 12px;">
                                        ${lead.customer}<br>
                                        <small style="color: #25D366;">WhatsApp: ${lead.phone}</small>
                                    </td>
                                    <td style="padding: 12px;">
                                        <div style="font-size: 0.85em;">${lead.items.length} productos | $${lead.total}</div>
                                    </td>
                                    <td style="padding: 12px;">
                                        <span style="padding: 4px 8px; border-radius: 4px; font-size: 0.75em; font-weight: bold; background: ${getStatusColor(lead.status)}; color: white;">
                                            ${lead.status || "Pendiente"}
                                        </span><br>
                                        <small style="color: #999;">By: ${lead.updatedBy || "Auto"}</small>
                                    </td>
                                    <td style="padding: 12px;">
                                        ${
                                          isLocked
                                            ? `🔒 <small style="color: #aaa;">Inmutable</small>`
                                            : `<select class="status-selector" data-id="${lead.id}" style="padding: 5px; cursor: pointer;">
                                                <option value="Pendiente" ${lead.status === "Pendiente" ? "selected" : ""}>⏳ Pendiente</option>
                                                <option value="Pagado" ${lead.status === "Pagado" ? "selected" : ""}>💰 Pagado</option>
                                                <option value="Despachado">🚀 Despachar</option>
                                                <option value="Cancelado">❌ Cancelar</option>
                                               </select>`
                                        }
                                    </td>
                                </tr>`;
                              })
                              .reverse()
                              .join("")}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="card shadow" style="margin-top: 30px;">
                <h3>📦 Consulta de Stock (SSOT)</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <thead>
                        <tr style="background: #f8f9fa; text-align: left;">
                            <th style="padding: 10px;">Producto</th>
                            <th style="padding: 10px;">Stock</th>
                            <th style="padding: 10px;">Situación</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${inventory
                          .map(
                            (p) => `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 10px;">${p.name}</td>
                                <td style="padding: 10px;"><b>${p.stock}</b></td>
                                <td style="padding: 10px;">
                                    <span style="color: ${p.stock < 5 ? "#e74c3c" : "#27ae60"}; font-weight: bold;">
                                        ${p.stock < 5 ? "⚠️ REPOSICIÓN" : "✅ DISPONIBLE"}
                                    </span>
                                </td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;

  // --- LÓGICA DE EVENTOS ---

  // 1. Manejo de Exportación
  div.querySelector("#btn-export").onclick = () => exportToCSV(leads);

  // 2. Cambio de Estado con Auditoría
  div.querySelectorAll(".status-selector").forEach((select) => {
    select.onchange = (e) => {
      const newStatus = e.target.value;
      const orderId = e.target.getAttribute("data-id");

      if (newStatus === "Despachado") {
        if (
          !confirm(
            "Directiva de Inmutabilidad: Una vez despachado, el registro no podrá modificarse. ¿Proceder?",
          )
        ) {
          renderCallback();
          return;
        }
      }

      const allLeads = storageService.getLeads();
      const index = allLeads.findIndex((l) => String(l.id) === String(orderId));

      if (index !== -1) {
        // Aplicamos Trazabilidad
        allLeads[index].status = newStatus;
        allLeads[index].updatedBy = state.auth.username; // Guardamos quién lo hizo
        storageService.updateLead(allLeads);
        renderCallback();
      }
    };
  });

  div.querySelector("#btn-logout").onclick = () => {
    storageService.clearSession();
    state.auth = { isAuth: false, role: "guest" };
    state.view = "shop";
    renderCallback();
  };

  // Evento para volver a la tienda
  div.querySelector("#btn-go-shop").onclick = () => {
    state.view = "shop";
    renderCallback();
  };

  return div;
}

function getStatusColor(status) {
  switch (status) {
    case "Despachado":
      return "#27ae60";
    case "Pagado":
      return "#2980b9";
    case "Cancelado":
      return "#c0392b";
    default:
      return "#f39c12";
  }
}
