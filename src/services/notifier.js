export const notifier = {
  show(message, type = 'success') {
    // 1. Asegurarnos de que el contenedor existe y está al frente de TODO
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 999999; 
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    // 2. Crear el elemento visual
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? '#2ecc71' : '#e74c3c';
    
    toast.style.cssText = `
      background: ${bgColor};
      color: white;
      padding: 12px 25px;
      border-radius: 8px;
      font-family: sans-serif;
      font-weight: bold;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      pointer-events: auto;
      min-width: 200px;
      transform: translateX(120%);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      opacity: 0;
    `;

    toast.innerHTML = message;
    container.appendChild(toast);

    // 3. Pequeño delay para que la transición de entrada funcione
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    }, 10);

    // 4. Auto-remover
    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }
};