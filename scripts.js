let cart = {};

async function registerUser(name, lastname, email, password) {
    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, lastname, email, password })
        });

        if (!response.ok) {
            throw new Error('Error al registrar el usuario.');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        alert("Usuario registrado exitosamente.");
    } catch (error) {
        alert(error.message);
    }
}

async function loginUser(email, password) {
    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Error al iniciar sesión.');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        alert("Inicio de sesión exitoso.");
    } catch (error) {
        alert(error.message);
    }
}

function add(productName, productPrice) {
    if (cart[productName]) {
        cart[productName].quantity += 1;
    } else {
        cart[productName] = { price: productPrice, quantity: 1 };
    }
    updateCartDisplay();
}

function remove(productName) {
    if (cart[productName]) {
        cart[productName].quantity -= 1;
        if (cart[productName].quantity <= 0) {
            delete cart[productName];
        }
    }
    updateCartDisplay();
}

async function pay() {
    if (Object.keys(cart).length === 0) {
        alert("No hay productos en el carrito.");
        return;
    }

    let total = 0;
    let items = "Resumen de la compra:\n";
    for (const [productName, productDetails] of Object.entries(cart)) {
        items += `${productName} (x${productDetails.quantity}): $${productDetails.price * productDetails.quantity}\n`;
        total += productDetails.price * productDetails.quantity;
    }
    items += `\nTotal: $${total}`;

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token de autorización no encontrado. Inicia sesión nuevamente.');
        }

        const response = await fetch('/api/products/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(cart)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al procesar el pago.');
        }

        const data = await response.json();
        alert(data.message);
        cart = {};
        updateCartDisplay();
    } catch (error) {
        alert(error.message);
    }
}

function updateCartDisplay() {
    let cartDisplay = document.getElementById("cart-display");
    if (!cartDisplay) {
        cartDisplay = document.createElement("div");
        cartDisplay.id = "cart-display";
        document.body.appendChild(cartDisplay);
    }

    let cartContent = "<ul class='list-group'>";
    for (const [productName, productDetails] of Object.entries(cart)) {
        cartContent += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${productName} (x${productDetails.quantity}): $${productDetails.price * productDetails.quantity}</span>
                <button class="btn btn-danger btn-sm" onclick="remove('${productName}')">Eliminar uno</button>
            </li>`;
    }
    cartContent += "</ul>";
    cartDisplay.innerHTML = cartContent;
}
