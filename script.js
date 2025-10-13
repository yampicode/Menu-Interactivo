// =============================================
// ESTADO DE LA APLICACIÓN
// =============================================

let products = [];
let cart = JSON.parse(localStorage.getItem('deliveryCart')) || [];
let currentFilter = 'all';

// =============================================
// ELEMENTOS DEL DOM
// =============================================

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
const customerName = document.getElementById('customerName');
const customerPhone = document.getElementById('customerPhone');
const customerAddress = document.getElementById('customerAddress');
const customerNotes = document.getElementById('customerNotes');

// =============================================
// INICIALIZACIÓN
// =============================================

function init() {
    loadProducts();
    updateCart();
    setupEventListeners();
}

function setupEventListeners() {
    // Carrito
    cartToggle.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);
    sendWhatsApp.addEventListener('click', sendOrderToWhatsApp);
    
    // Filtros
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.category;
            renderProducts();
        });
    });
}

// =============================================
// SISTEMA DE PRODUCTOS
// =============================================

// Datos de productos locales (respaldo)
const localProducts = [
    {
        id: 1,
        name: "Pizza Margarita",
        price: 12.99,
        category: "comida",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
        description: "Pizza clásica con tomate, mozzarella y albahaca"
    },
    {
        id: 2,
        name: "Hamburguesa Clásica",
        price: 8.99,
        category: "comida",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
        description: "Hamburguesa con carne, lechuga, tomate y queso"
    },
    {
        id: 3,
        name: "Ensalada César",
        price: 6.99,
        category: "comida",
        image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop",
        description: "Ensalada fresca con pollo, crutones y aderezo césar"
    },
    {
        id: 4,
        name: "Sushi Variado",
        price: 15.99,
        category: "comida",
        image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
        description: "Selección de sushi fresco con variedad de pescados"
    },
    {
        id: 5,
        name: "Tacos Mexicanos",
        price: 9.99,
        category: "comida",
        image: "https://images.unsplash.com/photo-1565299585323-38174c13fae8?w=400&h=300&fit=crop",
        description: "Tacos auténticos con carne, cebolla y cilantro"
    },
    {
        id: 6,
        name: "Pasta Carbonara",
        price: 11.99,
        category: "comida",
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
        description: "Pasta con salsa cremosa, panceta y queso parmesano"
    },
    {
        id: 7,
        name: "Coca Cola",
        price: 1.99,
        category: "bebidas",
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop",
        description: "Refresco de cola 500ml"
    },
    {
        id: 8,
        name: "Jugo Natural",
        price: 2.99,
        category: "bebidas",
        image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop",
        description: "Jugo natural de naranja recién exprimido"
    },
    {
        id: 9,
        name: "Agua Mineral",
        price: 1.49,
        category: "bebidas",
        image: "https://www.pexels.com/es-es/foto/botella-de-plastico-aguamarina-vacia-593099/",
        description: "Agua mineral natural 500ml"
    },
    {
        id: 10,
        name: "Helado de Vainilla",
        price: 4.99,
        category: "postres",
        image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop",
        description: "Helado cremoso de vainilla con topping"
    },
    {
        id: 11,
        name: "Pastel de Chocolate",
        price: 5.99,
        category: "postres",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
        description: "Torta de chocolate con crema y fresas"
    },
    {
        id: 12,
        name: "Brownie con Helado",
        price: 6.99,
        category: "postres",
        image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&h=300&fit=crop",
        description: "Brownie caliente con helado de vainilla"
    }
];

function loadProducts() {
    // Intentar cargar desde archivo JSON
    fetch('products.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar products.json');
            }
            return response.json();
        })
        .then(data => {
            products = data.products || data;
            renderProducts();
            preloadImages();
        })
        .catch(error => {
            console.warn('Error cargando products.json, usando datos locales:', error);
            products = localProducts;
            renderProducts();
            preloadImages();
        });
}

function renderProducts() {
    const filteredProducts = currentFilter === 'all' 
        ? products 
        : products.filter(product => product.category === currentFilter);
    
    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img 
                    src="${product.image}" 
                    alt="${product.name}"
                    loading="lazy"
                    onerror="handleImageError(this)"
                >
            </div>
            <div class="product-title">${product.name}</div>
            <div class="product-description">${product.description}</div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                Agregar al carrito
            </button>
        </div>
    `).join('');
}

function preloadImages() {
    products.forEach(product => {
        const img = new Image();
        img.src = product.image;
    });
}

function handleImageError(img) {
    const productName = img.alt;
    const firstLetter = productName.charAt(0).toUpperCase();
    
    // Crear fallback con la primera letra del producto
    const fallback = document.createElement('div');
    fallback.className = 'image-fallback';
    fallback.innerHTML = firstLetter;
    fallback.style.cssText = `
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #ff6b35, #ff8e53);
        color: white;
        font-size: 3rem;
        font-weight: bold;
        border-radius: 10px;
    `;
    
    img.parentNode.appendChild(fallback);
    img.style.display = 'none';
}

// =============================================
// SISTEMA DEL CARRITO
// =============================================

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
        padding: 1rem 2rem;
        border-radius: 10px;
        z-index: 1001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// =============================================
// SISTEMA DE WHATSAPP
// =============================================

function sendOrderToWhatsApp() {
    const name = customerName.value;
    const phone = customerPhone.value;
    const address = customerAddress.value;
    const notes = customerNotes.value;
    
    // Validaciones básicas
    if (!name || !phone || !address) {
        alert('Por favor completa tu nombre, teléfono y dirección');
        return;
    }
    
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    // Formatear mensaje para WhatsApp
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
    
    // Generar número de pedido simple
    const orderNumber = 'PED' + Date.now().toString().slice(-6);
    message += `N° de Pedido: ${orderNumber}\n`;
    
    message += `\n¡Gracias!`;
    
    // Codificar mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Número de WhatsApp del negocio - ¡CAMBIAR POR NÚMERO REAL!
    const businessPhone = '+584120348988';
    
    // Crear enlace de WhatsApp
    const whatsappUrl = `https://wa.me/${businessPhone}?text=${encodedMessage}`;
    
    // Abrir en nueva pestaña
    window.open(whatsappUrl, '_blank');
    
    // Mostrar confirmación
    showOrderConfirmation(orderNumber);
    
    // Limpiar carrito y formulario
    cart = [];
    updateCart();
    toggleCart();
    
    // Limpiar formulario
    customerName.value = '';
    customerPhone.value = '';
    customerAddress.value = '';
    customerNotes.value = '';
}

function showOrderConfirmation(orderNumber) {
    const confirmation = document.createElement('div');
    confirmation.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 2000;
            text-align: center;
            max-width: 90%;
            width: 400px;
        ">
            <h3 style="color: #25D366; margin-bottom: 1rem;">¡Pedido Enviado! ✅</h3>
            <p style="margin-bottom: 1rem;">Tu pedido <strong>${orderNumber}</strong> ha sido enviado por WhatsApp.</p>
            <p style="margin-bottom: 1.5rem; font-size: 0.9rem; color: #666;">
                El restaurante se pondrá en contacto contigo para confirmar.
            </p>
            <button id="aceptar" onclick="this.parentElement.remove()" style="
                background: #ff6b35;
                color: white;
                border: none;
                padding: 0.75rem 2rem;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
            ">
                Aceptar
            </button>
        </div>
    `;
    
    // Agregar overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1999;
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(confirmation);
    
    // Remover ambos elementos al hacer clic en el botón aceptar
const aceptarBtn = document.querySelector("#aceptar");
    aceptarBtn.addEventListener('click', function() {
        overlay.remove();
        confirmation.remove();
    });
}

// =============================================
// INICIALIZAR APLICACIÓN
// =============================================

document.addEventListener('DOMContentLoaded', init);