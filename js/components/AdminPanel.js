// js/components/AdminPanel.js
import { state } from "../app.js"; 
import { storageService } from "../services/storageService.js";

export function AdminPanel(renderCallback) {
    const div = document.createElement("div");
    div.className = "admin-panel";
    const leads = storageService.getLeads();

    div.innerHTML = `
        <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
            <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <div>
                    <h1 style="color: var(--primary);">⚙️ Panel de Administración</h1>
                    <p>Acceso Total: <b>${state.auth.name}</b></p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button id="btn-go-shop" class="secondary">🏪 Ver Tienda</button>
                    <button id="btn-logout" class="danger">Salir</button>
                </div>
            </header>

            <div style="display: grid; grid-template-columns: 380px 1fr; gap: 30px;">
                <aside>
                    <div class="card shadow" id="form-container">
                        <h3 id="form-title">📦 Registrar Nuevo Producto</h3>
                        <form id="product-form" style="margin-top: 15px;">
                            <input type="hidden" id="p-id">
                            <input type="text" id="p-name" placeholder="Nombre" required style="width:100%; margin-bottom:10px; padding:8px;">
                            <input type="number" id="p-price" placeholder="Precio ($)" required style="width:100%; margin-bottom:10px; padding:8px;">
                            <input type="number" id="p-stock" placeholder="Stock" required style="width:100%; margin-bottom:10px; padding:8px;">
                            <textarea id="p-desc" placeholder="Descripción" style="width:100%; margin-bottom:10px; padding:8px; height:60px;"></textarea>
                            <label style="font-size: 0.8em; color: #666;">Imagen (opcional)</label>
                            <input type="file" id="p-img" accept="image/*" style="margin-bottom: 15px; width: 100%;">
                            
                            <button type="submit" id="btn-submit-p" class="success" style="width: 100%; padding: 12px;">GUARDAR PRODUCTO</button>
                            <button type="button" id="btn-cancel-edit" class="secondary" style="width: 100%; padding: 8px; margin-top: 5px; display:none;">Cancelar Edición</button>
                        </form>
                    </div>

                    <div class="card shadow" style="margin-top: 20px; border-top: 4px solid #3498db;">
                        <h3>💰 Verificación de Pagos</h3>
                        <p style="font-size: 0.85em; color: #666;">Pedidos por validar:</p>
                        <ul style="list-style: none; padding: 0; margin-top: 10px;">
                            ${leads.filter(l => l.status === 'Pagado').map(l => `
                                <li style="padding: 10px; background: #f0f7ff; border-radius: 5px; margin-bottom: 5px; font-size: 0.9em;">
                                    <b>#${l.id}</b> - ${l.customer} <br>
                                    Monto: $${l.total.toLocaleString()}
                                </li>
                            `).join('') || '<li style="font-size: 0.8em;">No hay pagos pendientes</li>'}
                        </ul>
                    </div>
                </aside>

                <main>
                    <div class="card shadow" style="margin-bottom: 30px;">
                        <h3>📊 Control de Inventario</h3>
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                                <thead>
                                    <tr style="text-align: left; background: #f8f9fa;">
                                        <th style="padding: 10px;">Producto</th>
                                        <th style="padding: 10px;">Precio</th>
                                        <th style="padding: 10px;">Stock</th>
                                        <th style="padding: 10px;">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${state.products.map(p => `
                                        <tr style="border-bottom: 1px solid #eee;">
                                            <td style="padding: 10px;"><b>${p.name}</b></td>
                                            <td style="padding: 10px;">$${p.price}</td>
                                            <td style="padding: 10px;">${p.stock <= 5 ? `<span style="color:red; font-weight:bold;">${p.stock} ⚠️</span>` : p.stock}</td>
                                            <td style="padding: 10px;">
                                                <button class="btn-edit-p secondary" data-id="${p.id}">✏️</button>
                                                <button class="btn-delete-p danger" data-id="${p.id}">🗑️</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="card shadow">
                        <h3>📋 Historial y Restablecimiento (Auditoría)</h3>
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.9em;">
                                <thead>
                                    <tr style="text-align: left; background: #f8f9fa;">
                                        <th style="padding: 10px;">ID</th>
                                        <th style="padding: 10px;">Cliente</th>
                                        <th style="padding: 10px;">Estado Actual</th>
                                        <th style="padding: 10px;">Acción Admin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${leads.map(l => {
                                        const isCancelled = l.status === 'Cancelado';
                                        return `
                                        <tr style="border-bottom: 1px solid #eee; ${isCancelled ? 'opacity: 0.6;' : ''}">
                                            <td style="padding: 10px;">#${l.id}</td>
                                            <td style="padding: 10px;">${l.customer}</td>
                                            <td style="padding: 10px;">
                                                <span style="color: ${getStatusColor(l.status)}; font-weight: bold;">
                                                    ${l.status}
                                                </span>
                                                ${l.history ? `<div style="font-size: 0.7em; color: #888;">Por: ${l.history[l.history.length-1].user}</div>` : ''}
                                            </td>
                                            <td style="padding: 10px;">
                                                ${isCancelled ? 
                                                    '<span style="font-size:0.8em; color:red;">BLOQUEADO</span>' : 
                                                    `<select class="admin-status-reset" data-id="${l.id}" style="padding: 3px;">
                                                        <option value="" disabled selected>Cambiar...</option>
                                                        <option value="Pendiente">🔄 Restablecer a Pendiente</option>
                                                        <option value="Pagado">💰 Marcar como Pagado</option>
                                                        <option value="Cancelado">❌ Cancelar (Devolver Stock)</option>
                                                    </select>`
                                                }
                                            </td>
                                        </tr>
                                    `}).reverse().join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    `;

    // --- FUNCIONES INTERNAS ---
    function getStatusColor(status) {
        if(status === 'Despachado') return 'green';
        if(status === 'Cancelado') return 'red';
        if(status === 'Pagado') return '#2980b9';
        return 'orange';
    }

    // --- LÓGICA DE EVENTOS ---

    // 1. EDITAR PRODUCTO (Cargar datos al form)
    div.querySelectorAll(".btn-edit-p").forEach(btn => {
        btn.onclick = () => {
            const id = btn.getAttribute("data-id");
            const prod = state.products.find(p => String(p.id) === String(id));
            if (prod) {
                div.querySelector("#form-title").innerText = "✏️ Editando: " + prod.name;
                div.querySelector("#p-id").value = prod.id;
                div.querySelector("#p-name").value = prod.name;
                div.querySelector("#p-price").value = prod.price;
                div.querySelector("#p-stock").value = prod.stock;
                div.querySelector("#p-desc").value = prod.description || "";
                div.querySelector("#btn-submit-p").innerText = "ACTUALIZAR CAMBIOS";
                div.querySelector("#btn-cancel-edit").style.display = "block";
                div.querySelector("#form-container").style.border = "2px solid var(--secondary)";
            }
        };
    });

    // 2. CANCELAR EDICIÓN
    div.querySelector("#btn-cancel-edit").onclick = () => renderCallback();

    // 3. GUARDAR / ACTUALIZAR PRODUCTO
    div.querySelector("#product-form").onsubmit = (e) => {
        e.preventDefault();
        const pId = div.querySelector("#p-id").value;
        const file = div.querySelector("#p-img").files[0];
        
        const processSave = (imgData = null) => {
            let products = storageService.getProducts();
            if (pId) { // EDITAR
                products = products.map(p => String(p.id) === String(pId) ? {
                    ...p,
                    name: div.querySelector("#p-name").value,
                    price: parseFloat(div.querySelector("#p-price").value),
                    stock: parseInt(div.querySelector("#p-stock").value),
                    description: div.querySelector("#p-desc").value,
                    image: imgData || p.image
                } : p);
                alert("✅ Producto actualizado");
            } else { // NUEVO
                products.push({
                    id: Date.now(),
                    name: div.querySelector("#p-name").value,
                    price: parseFloat(div.querySelector("#p-price").value),
                    stock: parseInt(div.querySelector("#p-stock").value),
                    description: div.querySelector("#p-desc").value,
                    image: imgData || ""
                });
                alert("✅ Producto creado");
            }
            storageService.saveProducts(products);
            state.products = products;
            state.filtered = [...products];
            renderCallback();
        };

        if (file) {
            const reader = new FileReader();
            reader.onload = () => processSave(reader.result);
            reader.readAsDataURL(file);
        } else {
            processSave();
        }
    };

    // 4. CAMBIO DE ESTADO DE PEDIDOS (Auditoría)
    div.querySelectorAll(".admin-status-reset").forEach(select => {
        select.onchange = (e) => {
            const orderId = e.target.getAttribute("data-id");
            const newStatus = e.target.value;
            if (confirm(`¿Confirmar cambio de estado del pedido #${orderId} a ${newStatus}?`)) {
                storageService.updateLeadStatus(orderId, newStatus, state.auth.name);
                // Actualizamos stock local para que la tabla de inventario se refresque
                state.products = storageService.getProducts();
                renderCallback();
            }
        };
    });

    // 5. BORRAR PRODUCTO
    div.querySelectorAll(".btn-delete-p").forEach(btn => {
        btn.onclick = () => {
            if (confirm("¿Eliminar definitivamente?")) {
                const id = btn.getAttribute("data-id");
                const filtered = state.products.filter(p => String(p.id) !== String(id));
                storageService.saveProducts(filtered);
                state.products = filtered;
                state.filtered = [...filtered];
                renderCallback();
            }
        };
    });

    div.querySelector("#btn-go-shop").onclick = () => { state.view = 'shop'; renderCallback(); };
    div.querySelector("#btn-logout").onclick = () => { 
        storageService.clearSession(); 
        state.auth = { isAuth: false, role: 'guest' }; 
        state.view = 'shop'; 
        renderCallback(); 
    };

    return div;
}