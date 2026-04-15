import { state } from "../js/app.js";
import { sanitize } from "../utils/sanitize.js";
import { exportService } from "../services/exportService.js";
import { storageService } from "../services/storageService.js";

export function AdminPanel(renderCallback) {
  const div = document.createElement("div");
  div.className = "panel";

  let editingId = null;
  const leads = storageService.getLeads();
  
  // DETECTOR DE RANGO: Verificamos si es Superusuario
  const isSuper = state.auth.role === "superuser";

  // --- 0. BARRA DE SINCRONIZACIÓN ---
  const syncBar = document.createElement("div");
  syncBar.style.cssText = "display:flex; justify-content:flex-end; align-items:center; gap:10px; margin-bottom:15px; font-size:0.85em; color:var(--secondary);";
  
  const lastSync = localStorage.getItem("lastSync_Admin") || "No sincronizado";

  syncBar.innerHTML = `
      ${isSuper ? '<b style="color:var(--primary); margin-right:auto;">⚡ MODO SUPERUSUARIO (Control Total)</b>' : ''}
      <span>Última actualización: <b id="sync-time">${lastSync}</b></span>
      <button id="btn-sync" style="padding: 5px 12px; cursor: pointer; border-radius: 4px; border: 1px solid var(--primary); background: white; color: var(--primary); font-weight: bold; transition: 0.3s;">
          🔄 Sincronizar
      </button>
  `;

  syncBar.querySelector("#btn-sync").onclick = (e) => {
      const btn = e.currentTarget;
      btn.style.transform = "rotate(360deg)";
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      localStorage.setItem("lastSync_Admin", now);
      setTimeout(() => renderCallback(), 300);
  };

  // --- 1. RESUMEN DE ESTADÍSTICAS ---
  const stats = document.createElement("div");
  stats.className = "row";
  stats.style.display = "flex";
  stats.style.gap = "15px";
  stats.style.marginBottom = "20px";

  const totalVentas = leads.filter(l => !l.deleted).reduce((acc, curr) => acc + (curr.total || 0), 0);
  const pendientes = leads.filter((l) => !l.completed && !l.deleted).length;

  stats.innerHTML = `
    <div class="card" style="flex: 1; margin-bottom: 0; text-align: center; border-bottom: 4px solid var(--primary);">
        <small style="color: var(--secondary); text-transform: uppercase;">Ventas Totales</small>
        <h2 style="margin: 5px 0;">$${totalVentas.toLocaleString()}</h2>
    </div>
    <div class="card" style="flex: 1; margin-bottom: 0; text-align: center; border-bottom: 4px solid var(--warning);">
        <small style="color: var(--secondary); text-transform: uppercase;">Pendientes</small>
        <h2 style="margin: 5px 0;">${pendientes}</h2>
    </div>
    <div class="card" style="flex: 1; margin-bottom: 0; text-align: center; border-bottom: 4px solid var(--success);">
        <small style="color: var(--secondary); text-transform: uppercase;">Productos</small>
        <h2 style="margin: 5px 0;">${state.products.length}</h2>
    </div>
  `;

  // --- 2. CABECERA DE ACCIONES ---
  const top = document.createElement("div");
  top.className = "row";
  top.style.display = "flex";
  top.style.justifyContent = "space-between";
  top.style.marginBottom = "20px";

  const mainActions = document.createElement("div");
  mainActions.style.display = "flex";
  mainActions.style.gap = "10px";

  const exportLeadsBtn = document.createElement("button");
  exportLeadsBtn.className = "success";
  exportLeadsBtn.textContent = "📥 Exportar Ventas";
  exportLeadsBtn.onclick = () => exportService.toCSV(leads, "reporte_ventas");

  const exportProductsBtn = document.createElement("button");
  exportProductsBtn.className = "secondary";
  exportProductsBtn.textContent = "📋 Exportar Inventario";
  exportProductsBtn.onclick = () => exportService.toCSV(state.products, "inventario_productos");

  const logout = document.createElement("button");
  logout.className = "danger";
  logout.textContent = `Salir (${state.auth.username})`;
  logout.onclick = () => {
    state.auth.isAuth = false;
    state.view = "shop";
    renderCallback();
  };

  mainActions.append(exportLeadsBtn, exportProductsBtn);
  top.append(mainActions, logout);

  // --- 3. FORMULARIO DE PRODUCTOS ---
  const addBox = document.createElement("div");
  addBox.className = "card";
  addBox.innerHTML = `
    <h4 id="form-title">📦 Gestión de Producto</h4>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
        <input id="pname" placeholder="Nombre del producto">
        <input id="pprice" placeholder="Precio ($)" type="number">
        <textarea id="pdesc" placeholder="Descripción completa" style="grid-column: span 2; height: 80px;"></textarea>
        <div style="grid-column: span 2;">
            <label style="display: block; margin-bottom: 5px; font-size: 0.9em; color: var(--secondary);">Imagen del producto:</label>
            <input id="pimg" type="file" accept="image/*">
        </div>
    </div>
  `;

  const addBtn = document.createElement("button");
  addBtn.id = "btn-save";
  addBtn.className = "success";
  addBtn.style.width = "100%";
  addBtn.style.marginTop = "15px";
  addBtn.textContent = "Guardar en Inventario";

  addBtn.onclick = () => {
    const name = sanitize(document.getElementById("pname").value);
    const price = parseFloat(document.getElementById("pprice").value);
    const desc = sanitize(document.getElementById("pdesc").value);
    const file = document.getElementById("pimg").files[0];

    if (!name || isNaN(price)) return alert("Nombre y precio obligatorios.");

    const saveAndRefresh = (imgBase64 = "") => {
      if (editingId) {
        const index = state.products.findIndex((p) => String(p.id) === String(editingId));
        if (index !== -1) {
          state.products[index] = {
            ...state.products[index],
            name, price, description: desc,
            image: imgBase64 || state.products[index].image,
          };
        }
        editingId = null;
      } else {
        state.products.push({ id: crypto.randomUUID(), name, price, description: desc, image: imgBase64 });
      }
      storageService.saveProducts(state.products);
      state.filtered = [...state.products];
      renderCallback();
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = () => saveAndRefresh(reader.result);
      reader.readAsDataURL(file);
    } else {
      saveAndRefresh();
    }
  };
  addBox.appendChild(addBtn);

  // --- 4. TABLA DE PRODUCTOS ---
  const productsWrap = document.createElement("div");
  productsWrap.className = "card";
  productsWrap.innerHTML = `
    <h4>Gestión de Inventario</h4>
    <table>
      <thead>
        <tr>
          <th>Producto / Descripción</th>
          <th>Precio</th>
          <th style="text-align:center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${state.products.map(p => `
          <tr>
            <td>
                <strong>${p.name}</strong><br>
                <small style="color:var(--secondary)">${p.description || "Sin descripción"}</small>
            </td>
            <td>$${p.price}</td>
            <td style="text-align:center">
                <button class="secondary btn-edit" data-id="${p.id}">Editar</button>
                <button class="danger btn-del" data-id="${p.id}">Borrar</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  productsWrap.addEventListener("click", (e) => {
    const id = String(e.target.getAttribute("data-id"));
    if (!id || id === "null") return;
    if (e.target.classList.contains("btn-del")) {
      if (confirm("¿Eliminar producto definitivamente?")) {
        state.products = state.products.filter((p) => String(p.id) !== id);
        storageService.saveProducts(state.products);
        state.filtered = [...state.products];
        renderCallback();
      }
    }
    if (e.target.classList.contains("btn-edit")) {
      const p = state.products.find((x) => String(x.id) === id);
      if (p) {
        editingId = p.id;
        document.getElementById("pname").value = p.name;
        document.getElementById("pprice").value = p.price;
        document.getElementById("pdesc").value = p.description || "";
        document.getElementById("form-title").textContent = "✏️ Editando: " + p.name;
        document.getElementById("btn-save").textContent = "Actualizar Cambios";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  });

  // --- 5. TABLA DE LEADS (CON LÓGICA DE SUPERUSUARIO) ---
  const leadsWrap = document.createElement("div");
  leadsWrap.className = "card";
  leadsWrap.innerHTML = `
    <h4>Ventas Recibidas</h4>
    <table>
      <thead>
        <tr>
          <th style="text-align: left; padding: 10px;">Folio / Cliente</th>
          <th style="text-align: left; padding: 10px;">Pedido</th>
          <th style="text-align: left; padding: 10px;">Total</th>
          <th style="text-align: center; padding: 10px;">Estado / Auditoría</th>
          <th style="text-align: right; padding: 10px;">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${leads.map((l) => {
          const isDeleted = l.deleted === true;
          // SUPERPODER: El botón solo se bloquea si está completado Y NO eres superusuario
          const canToggle = !l.completed || isSuper;
          const canDelete = !l.completed || isSuper;

          return `
          <tr style="border-left: 5px solid ${isDeleted ? "#666" : (l.completed ? "var(--success)" : "var(--warning)")};
                     ${isDeleted ? "text-decoration: line-through; opacity: 0.5; background: #f2f2f2;" : ""}">
            <td style="padding: 10px;">
                <strong>#${l.id}</strong> - <strong>${l.customer}</strong>
                ${isDeleted ? `<br><small style="color:red; font-weight:bold; text-decoration:none !important;">[ANULADO POR ${l.deletedBy}]</small>` : ""}
                <br><small>${l.date || ''} ${l.time || ''}</small>
            </td>
            <td style="font-size: 0.85em; padding: 10px;">
                ${l.items ? l.items.map((item) => `• ${item.name} (x${item.quantity})`).join("<br>") : "Sin detalle"}
            </td>
            <td style="padding: 10px;"><strong>$${(l.total || 0).toLocaleString()}</strong></td>
            <td style="padding: 10px; text-align: center;">
                ${isDeleted ? `<small>Anulado por:<br><b>${l.deletedBy}</b></small>` : `
                    <button class="${canToggle ? 'btn-check-lead' : ''}" data-id="${l.id}" 
                        ${canToggle ? '' : 'disabled'}
                        style="background:${l.completed ? "var(--success)" : "#ccc"}; color: ${l.completed ? 'white' : 'black'}; border:none; padding: 5px 10px; border-radius:4px; 
                        cursor:${canToggle ? "pointer" : "default"}; opacity:${canToggle ? "1" : "0.5"};">
                        ${l.completed ? "✅ Ejecutado" : "⏳ Marcar OK"}
                    </button>
                    ${l.completedBy ? `<br><small style="font-size:0.75em; color: #666;">Por: <b>${l.completedBy}</b></small>` : ""}
                `}
            </td>
            <td style="text-align:right; padding: 10px;">
                ${isDeleted 
                  ? `<button class="btn-restore-lead" data-id="${l.id}" style="background:var(--primary); color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">↺ Restablecer</button>` 
                  : `<button class="danger btn-del-lead" data-id="${l.id}" 
                        ${canDelete ? '' : 'disabled'}
                        style="border:none; padding: 5px 10px; border-radius:4px; cursor:pointer; opacity:${canDelete ? '1' : '0.3'}">🗑️</button>`
                }
            </td>
          </tr>
        `}).join("")}
      </tbody>
    </table>
  `;

  leadsWrap.addEventListener("click", (e) => {
    const id = String(e.target.closest("button")?.getAttribute("data-id"));
    if (!id || id === "null") return;

    const currentLeads = storageService.getLeads();
    const index = currentLeads.findIndex((l) => String(l.id) === id);
    if (index === -1) return;
    const pedido = currentLeads[index];

    // --- ACCIÓN: COMPLETAR / REVERTIR ---
    if (e.target.classList.contains("btn-check-lead")) {
        // Lógica de reversión exclusiva Superuser
        if (pedido.completed && isSuper) {
            if (confirm("MODO MAESTRO: ¿Deseas reabrir este pedido y eliminar la marca de ejecución?")) {
                pedido.completed = false;
                pedido.completedBy = null;
                localStorage.setItem("leads", JSON.stringify(currentLeads));
                renderCallback();
            }
            return;
        }

        // Lógica normal
        if (confirm(`¿Confirmas que el pedido #${pedido.id} ha sido procesado?`)) {
            pedido.completed = true;
            pedido.completedBy = isSuper ? "SUPERUSER" : "Administrador";
            localStorage.setItem("leads", JSON.stringify(currentLeads));
            renderCallback();
        }
    }

    // --- ACCIÓN: ANULAR ---
    if (e.target.classList.contains("btn-del-lead")) {
      const confirmMsg = (pedido.completed && isSuper) 
          ? "⚠️ EL PEDIDO YA ESTÁ EJECUTADO. ¿Deseas anularlo de todas formas (Modo Superusuario)?" 
          : "¿Anular este pedido? La evidencia quedará tachada.";

      if (confirm(confirmMsg)) {
          pedido.deleted = true;
          pedido.deletedBy = isSuper ? "SUPERUSER" : "Administrador";
          localStorage.setItem("leads", JSON.stringify(currentLeads));
          renderCallback();
      }
    }

    // --- ACCIÓN: RESTABLECER ---
    if (e.target.classList.contains("btn-restore-lead")) {
        if (confirm("¿Restablecer este pedido al historial activo?")) {
            pedido.deleted = false;
            pedido.deletedBy = null;
            localStorage.setItem("leads", JSON.stringify(currentLeads));
            renderCallback();
        }
    }
  });

  div.append(syncBar, stats, top, addBox, productsWrap, leadsWrap);
  return div;
}