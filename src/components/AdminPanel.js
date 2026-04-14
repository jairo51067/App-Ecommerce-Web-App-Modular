import { state } from "../js/app.js";
import { sanitize } from "../utils/sanitize.js";
import { exportService } from "../services/exportService.js";
import { storageService } from "../services/storageService.js";

export function AdminPanel(renderCallback) {
  const div = document.createElement("div");
  div.className = "panel";

  let editingId = null;
  const leads = storageService.getLeads();

  // --- 1. RESUMEN DE ESTADÍSTICAS (Nuevo) ---
  const stats = document.createElement("div");
  stats.className = "row";
  stats.style.display = "flex";
  stats.style.gap = "15px";
  stats.style.marginBottom = "20px";
  
  const totalVentas = leads.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const pendientes = leads.filter(l => !l.completed).length;

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
  exportLeadsBtn.onclick = () => {
    const cleanLeads = leads.map(({ proof, ...rest }) => rest);
    exportService.toCSV(cleanLeads, "reporte_ventas");
  };

  const exportProductsBtn = document.createElement("button");
  exportProductsBtn.className = "secondary";
  exportProductsBtn.textContent = "📋 Exportar Inventario";
  exportProductsBtn.onclick = () => exportService.toCSV(state.products, "inventario_productos");

  const logout = document.createElement("button");
  logout.className = "danger";
  logout.textContent = "Sair";
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
          <th>Acciones</th>
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
            <td style="text-align:right">
                <button class="secondary btn-edit" data-id="${p.id}">Editar</button>
                <button class="danger btn-del" data-id="${p.id}">Borrar</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  // Listener Productos
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

  // --- 5. TABLA DE LEADS ---
  const leadsWrap = document.createElement("div");
  leadsWrap.className = "card";
  leadsWrap.innerHTML = `
    <h4>Ventas Recibidas</h4>
    <table>
      <thead>
        <tr>
          <th>Cliente / Contacto</th>
          <th>Pedido</th>
          <th>Total</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${leads.map((l) => `
          <tr style="border-left: 5px solid ${l.completed ? 'var(--success)' : 'var(--warning)'}">
            <td>
                <strong>${l.name}</strong><br>
                <small>${new Date(l.createdAt).toLocaleDateString()}</small><br>
                <small style="color: var(--primary)">${l.phone || ""}</small>
            </td>
            <td style="font-size: 0.85em;">
                ${l.cart ? l.cart.map(item => `• ${item.name} (x${item.quantity || 1})`).join('<br>') : 'Sin detalle'}
            </td>
            <td><strong>$${(l.total || 0).toLocaleString()}</strong></td>
            <td style="text-align:right">
                <button class="btn-check-lead" data-id="${l.id}" style="background:${l.completed ? 'var(--success)' : 'var(--warning)'}; color: white;">
                    ${l.completed ? '✅' : '⏳'}
                </button>
                <button class="secondary btn-view" data-id="${l.id}">📄 PNG</button>
                <button class="danger btn-del-lead" data-id="${l.id}">🗑️</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  leadsWrap.addEventListener("click", (e) => {
    const id = String(e.target.getAttribute("data-id"));
    if (!id || id === "null") return;

    if (e.target.classList.contains("btn-view")) {
      const lead = leads.find((l) => String(l.id) === id);
      if (lead && lead.proof) {
        const win = window.open("");
        win.document.write(`<html><body style="margin:0; background:#333; display:flex; justify-content:center; align-items:center;"><img src="${lead.proof}" style="max-height:100vh;"></body></html>`);
      }
    }

    if (e.target.classList.contains("btn-del-lead")) {
      if (confirm("¿Eliminar registro de venta?")) {
        const updatedLeads = leads.filter((l) => String(l.id) !== id);
        localStorage.setItem("leads", JSON.stringify(updatedLeads));
        renderCallback();
      }
    }

    if (e.target.classList.contains("btn-check-lead")) {
      const index = leads.findIndex((l) => String(l.id) === id);
      if (index !== -1) {
        leads[index].completed = !leads[index].completed;
        localStorage.setItem("leads", JSON.stringify(leads));
        renderCallback();
      }
    }
  });

  div.append(stats, top, addBox, productsWrap, leadsWrap);
  return div;
} 