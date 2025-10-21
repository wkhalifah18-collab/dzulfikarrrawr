// ====== SIDEBAR MENU ======
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
});

overlay.addEventListener("click", () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
});

// ====== CART SIDEBAR ======
const cartToggle = document.getElementById("cart-toggle");
const cartSidebar = document.getElementById("cart");
const closeCartBtn = document.getElementById("close-cart");

cartToggle.addEventListener("click", () => {
  cartSidebar.classList.add("active");
});

closeCartBtn.addEventListener("click", () => {
  cartSidebar.classList.remove("active");
});

// ====== LOGIN MODAL ======
const loginBtn = document.getElementById("login-btn");
const loginModal = document.getElementById("login-modal");
const closeLogin = document.getElementById("close-login");

loginBtn.addEventListener("click", () => {
  loginModal.style.display = "flex";
});

closeLogin.addEventListener("click", () => {
  loginModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === loginModal) {
    loginModal.style.display = "none";
  }
});

// script.js

const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalDisplay = document.getElementById('cart-total');
let cart = [];

// Pilih ukuran (toggle aktif)
document.querySelectorAll('.size-buttons').forEach(group => {
  group.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});

// Tambahkan ke keranjang
addToCartButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    const productCard = button.closest('.product-card');
    const productName = productCard.querySelector('.product-name').textContent;
    const productPrice = parseInt(productCard.querySelector('.product-price').textContent.replace('.', ''));
    const productImage = productCard.querySelector('img').src;

    // Cek ukuran yang dipilih
    const selectedSize = productCard.querySelector('.size-btn.active');
    if (!selectedSize) {
      alert('Please select a size first!');
      return;
    }

    // Tambahkan produk ke array cart
    cart.push({
      name: productName,
      price: productPrice,
      image: productImage,
      size: selectedSize.textContent
    });

    updateCart();
  });
});

// Fungsi update keranjang
function updateCart() {
  cartItemsContainer.innerHTML = '';
  let total = 0;

  cart.forEach((item, i) => {
    total += item.price;

    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <div>${item.name}</div>
        <div>Size: ${item.size}</div>
        <div>Rp ${item.price.toLocaleString()}</div>
      </div>
      <button class="remove-btn" data-index="${i}">&times;</button>
    `;
    cartItemsContainer.appendChild(div);
  });

  // Update total dan count
  cartCount.textContent = cart.length;
  cartTotalDisplay.textContent = total.toLocaleString();

  // Hapus item
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = e.target.getAttribute('data-index');
      cart.splice(idx, 1);
      updateCart();
    });
  });
}
