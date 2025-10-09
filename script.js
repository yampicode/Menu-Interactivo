// Estado de la aplicación
let cart = JSON.parse(localStorage.getItem('deliveryCart')) || [];
let currentFilter = 'all';

// Elementos del DOM
const productsGrid = document.getElementById('productsGrid');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartToggle = document.getElementById('cartToggle');
const closeCart = document.getElementById('closeCart');
const sendWhatsApp = document.getElementById('sendWhatsApp');
const filterButtons = document.querySelectorAll('.filter-btn');

// Inicializar la aplicación
function init() {
    renderProducts();
    updateCart();
    setupEventListeners();
}

// Configurar event listeners
function setupEventListeners() {
    cartToggle.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);
    sendWhatsApp.addEventListener('click', sendOrderToWhatsApp);
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.category;
            renderProducts();
        });
    });
}

// Renderizar productos
function renderProducts() {
    const filteredProducts = currentFilter === 'all' 
        ? products 
        : products.filter(product => product.category === currentFilter);
    
    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-image">${product.image}</div>
            <div class="product-title">${product.name}</div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                Agregar al carrito
            </button>
        </div>
    `).join('');
}

// Funciones del carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
    showCartNotification();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
        }
    }
}

function updateCart() {
    // Guardar en localStorage
    localStorage.setItem('deliveryCart', JSON.stringify(cart));
    
    // Actualizar contador
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Actualizar items del carrito
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
            <div class="item-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="item-quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">🗑️</button>
            </div>
        </div>
    `).join('');
    
    // Actualizar total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
}

function toggleCart() {
    cartSidebar.classList.toggle('open');
    cartOverlay.classList.toggle('show');
}

function showCartNotification() {
    const notification = document.createElement('div');
    notification.textContent = '¡Producto agregado!';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #25D366;
        color: white;
        padding: 1rem;
        border-radius: 5px;
        z-index: 1001;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Función para enviar pedido por WhatsApp
function sendOrderToWhatsApp() {
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('customerAddress').value;
    const notes = document.getElementById('customerNotes').value;
    
    // Validaciones básicas
    if (!name || !phone || !address) {
        alert('Por favor completa tu nombre, teléfono y dirección');
        return;
    }
    
    // Formatear mensaje
    let message = `¡Hola! Quiero hacer un pedido:\n\n`;
    
    cart.forEach(item => {
        message += `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n*Total: $${cartTotal.textContent}*\n\n`;
    message += `*Datos del cliente:*\n`;
    message += `Nombre: ${name}\n`;
    message += `Teléfono: ${phone}\n`;
    message += `Dirección: ${address}\n`;
    
    if (notes) {
        message += `Notas: ${notes}\n`;
    }
    
    message += `\n¡Gracias!`;
    
    // Codificar mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Número de WhatsApp del negocio (cambiar por el número real)
    const businessPhone = '+584120348988'; // Reemplazar con número real
    
    // Crear enlace de WhatsApp
    const whatsappUrl = `https://wa.me/${businessPhone}?text=${encodedMessage}`;
    
    // Abrir en nueva pestaña
    window.open(whatsappUrl, '_blank');
    
    // Opcional: Limpiar carrito después del envío
    // cart = [];
    // updateCart();
    // toggleCart();
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', init);