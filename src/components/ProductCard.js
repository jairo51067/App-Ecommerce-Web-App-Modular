export function ProductCard(product, onAddToCart) {
  console.log("Dibujando producto:", product.name); // <--- Línea de prueba
  const card = document.createElement('div'); 
  card.className = 'card';
  
  const img = product.image ? `<img class="thumb" src="${product.image}" alt="${product.name}">` : '';
  
  card.innerHTML = `
    ${img}
    <div class="row" style="justify-content:space-between;align-items:center;">
      <h3>${product.name}</h3>
      <span class="badge">Oferta</span>
    </div>
    <p>${product.description || ''}</p>
    <p><strong>$${product.price}</strong></p>
  `;

  const btn = document.createElement('button');
  btn.textContent = 'Comprar';
  btn.onclick = () => onAddToCart(product);
  
  card.appendChild(btn);
  return card;
}