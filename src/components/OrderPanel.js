import { storageService } from '../services/storageService.js';
import { state } from '../js/app.js';

export function OrderPanel(renderCallback) {
  const div = document.createElement('div');
  div.className = 'panel';

  const leads = storageService.getLeads();
  const pendientes = leads.filter(l => !l.completed).length;

  div.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin:0;">📦 Panel de Despacho</h2>
        <button class="danger" id="btn-logout-gerente">Cerrar Sesión</button>
    </div>

    <div class="card" style="border-left: 5px solid var(--primary); display: flex; align-items: center; gap: 20px; padding: 15px;">
        <div style="font-size: 2em;">🚚</div>
        <div>
            <h4 style="margin:0; border:none;">Estado de Entregas</h4>
            <p style="margin:0; color: var(--secondary);">${pendientes} pedidos pendientes por despachar hoy</p>
        </div>
    </div>

    <div class="card">
        <h4>Lista de Pedidos</h4>
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Pedido a Preparar</th>
              <th style="text-align:center">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${leads.map(l => `
              <tr style="background: ${l.completed ? '#f8fdf9' : 'white'}">
                <td>
                    <strong>${l.name}</strong><br>
                    <small style="color: var(--secondary)">${new Date(l.createdAt).toLocaleDateString()}</small>
                </td>
                <td style="font-size: 0.9em;">
                    ${l.cart ? l.cart.map(i => `<span style="display:block;">• ${i.name} <strong>(x${i.quantity})</strong></span>`).join('') : ''}
                </td>
                <td style="text-align:center">
                    <button class="btn-check ${l.completed ? 'secondary' : 'success'}" data-id="${l.id}" style="width: 120px;">
                        ${l.completed ? '✅ Listo' : '⏳ Despachar'}
                    </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
    </div>
  `;

  div.onclick = (e) => {
    if (e.target.id === 'btn-logout-gerente') {
        state.auth.isAuth = false;
        state.view = 'shop';
        renderCallback();
    }

    const id = e.target.getAttribute('data-id');
    if (e.target.classList.contains('btn-check')) {
        const allLeads = storageService.getLeads();
        const idx = allLeads.findIndex(x => String(x.id) === String(id));
        allLeads[idx].completed = !allLeads[idx].completed;
        localStorage.setItem('leads', JSON.stringify(allLeads));
        renderCallback();
    }
  };

  return div;
}