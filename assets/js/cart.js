// assets/js/cart.js

class CartSystem {
    constructor() {
        console.log('CartSystem initializing...');
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.setupCartModal();
        this.updateCartCount();
        this.setupEventDelegation();
        console.log('Cart System Initialized');
    }

    setupEventDelegation() {
        // Use event delegation for checkout button
        document.body.addEventListener('click', (e) => {
            const checkoutBtn = e.target.closest('#checkoutBtn');
            if (checkoutBtn) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Checkout button clicked via delegation');
                this.handleCheckout();
            }
        });
    }

    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
            this.showToast('Cart updated successfully!', 'success');
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                img: product.img,
                quantity: product.quantity || 1
            });
            this.showToast('Product added to cart!', 'success');
        }
        
        this.saveCart();
        this.updateCartCount();
        this.updateCartModal();
        
        return true;
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.updateCartModal();
        this.showToast('Product removed from cart', 'info');
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity > 0) {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartCount();
                this.updateCartModal();
            } else {
                this.removeFromCart(productId);
            }
        }
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCartCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const cartCount = this.getCartCount();
        const cartBadges = document.querySelectorAll('.cart-badge');
        
        cartBadges.forEach(badge => {
            badge.textContent = cartCount;
            badge.style.display = cartCount > 0 ? 'flex' : 'none';
        });
    }

    setupCartModal() {
        if (!document.getElementById('cartModal')) {
            const modalHTML = `
                <div class="modal fade" id="cartModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-lg modal-dialog-centered">
                        <div class="modal-content" style="border-radius: 28px; overflow: hidden; border: none; box-shadow: 0 25px 50px -12px rgba(128,128,128,0.25);">
                            <!-- Modal Header with #808080 Gradient -->
                            <div class="modal-header" style="background: linear-gradient(135deg, #808080 0%, #6B7280 100%); color: white; border-bottom: none; padding: 25px 30px;">
                                <h5 class="modal-title d-flex align-items-center">
                                    <div style="background: rgba(255,255,255,0.15); padding: 12px; border-radius: 50%; margin-right: 18px;">
                                        <i class="fas fa-shopping-cart fa-2x"></i>
                                    </div>
                                    <div>
                                        <span style="font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Shopping Cart</span>
                                        <p style="font-size: 14px; opacity: 0.9; margin: 5px 0 0;" id="cartItemCount">0 items</p>
                                    </div>
                                </h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" style="opacity: 0.8; transition: all 0.3s;" 
                                        onmouseover="this.style.opacity='1'; this.style.transform='rotate(90deg)'" 
                                        onmouseout="this.style.opacity='0.8'; this.style.transform='rotate(0)'"></button>
                            </div>
                            
                            <!-- Modal Body -->
                            <div class="modal-body p-0" style="background: #F9FAFB;">
                                <!-- Empty Cart Message (Styled with #808080) -->
                                <div class="text-center mb-4" id="emptyCartMessage" style="display: block;">
                                    <div style="width: 160px; height: 160px; background: linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 30px auto 25px;">
                                        <i class="fas fa-shopping-cart fa-4x" style="color: #9CA3AF;"></i>
                                    </div>
                                    <h4 style="color: #1F2937; font-weight: 600; margin-bottom: 12px;">Your cart is empty</h4>
                                    <p class="text-muted mb-4" style="color: #6B7280; font-size: 1.1rem;">Looks like you haven't added anything yet</p>
                                    <button class="btn btn-lg px-5 py-3" data-bs-dismiss="modal" 
                                            style="background: linear-gradient(135deg, #808080 0%, #6B7280 100%); color: white; border: none; border-radius: 50px; font-weight: 500; box-shadow: 0 10px 20px -5px rgba(128,128,128,0.3); transition: all 0.3s;"
                                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 15px 30px -5px rgba(128,128,128,0.4)'"
                                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 20px -5px rgba(128,128,128,0.3)'">
                                        <i class="fas fa-arrow-left me-2"></i>Continue Shopping
                                    </button>
                                </div>
                                
                                <!-- Cart Items Container -->
                                <div id="cartItemsContainer" style="display: none;">
                                    <div class="p-4" style="max-height: 400px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #808080 #E5E7EB;">
                                        <style>
                                            #cartItemsContainer::-webkit-scrollbar {
                                                width: 6px;
                                            }
                                            #cartItemsContainer::-webkit-scrollbar-track {
                                                background: #E5E7EB;
                                                border-radius: 10px;
                                            }
                                            #cartItemsContainer::-webkit-scrollbar-thumb {
                                                background: #808080;
                                                border-radius: 10px;
                                            }
                                            #cartItemsContainer::-webkit-scrollbar-thumb:hover {
                                                background: #6B7280;
                                            }
                                        </style>
                                        <div class="cart-items-list" id="cartItemsList"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Modal Footer (Cart Summary) -->
                            <div class="modal-footer" id="cartFooter" style="display: none; background: white; border-top: 2px solid #F3F4F6; padding: 20px 30px;">
                                <div class="d-flex justify-content-between align-items-center w-100">
                                    <div>
                                        <p class="text-muted small mb-1" style="font-size: 0.9rem; letter-spacing: 0.5px;">TOTAL AMOUNT</p>
                                        <h3 class="mb-0" style="color: #808080; font-weight: 700; font-size: 2rem;">
                                            Rs <span id="cartTotalAmount">0</span>
                                        </h3>
                                    </div>
                                    <div class="d-flex gap-3">
                                        <button type="button" class="btn btn-lg" data-bs-dismiss="modal" 
                                                style="background: white; color: #808080; border: 2px solid #808080; border-radius: 50px; padding: 12px 25px; font-weight: 600; transition: all 0.3s;"
                                                onmouseover="this.style.background='#F3F4F6'"
                                                onmouseout="this.style.background='white'">
                                            <i class="fas fa-arrow-left me-2"></i>Continue
                                        </button>
                                        <button type="button" class="btn btn-lg" id="checkoutBtn" 
                                                style="background: linear-gradient(135deg, #808080 0%, #6B7280 100%); color: white; border: none; border-radius: 50px; padding: 12px 35px; font-weight: 600; box-shadow: 0 10px 20px -5px rgba(128,128,128,0.3); transition: all 0.3s;"
                                                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 15px 30px -5px rgba(128,128,128,0.4)'"
                                                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 20px -5px rgba(128,128,128,0.3)'">
                                            Checkout <i class="fas fa-arrow-right ms-2"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        this.updateCartModal();
    }

    updateCartModal() {
        const emptyCartMessage = document.getElementById('emptyCartMessage');
        const cartItemsContainer = document.getElementById('cartItemsContainer');
        const cartFooter = document.getElementById('cartFooter');
        const cartItemsList = document.getElementById('cartItemsList');
        const cartTotalAmount = document.getElementById('cartTotalAmount');
        const cartItemCount = document.getElementById('cartItemCount');

        if (!emptyCartMessage || !cartItemsContainer || !cartFooter) return;

        if (this.cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            cartItemsContainer.style.display = 'none';
            cartFooter.style.display = 'none';
            if (cartItemCount) cartItemCount.textContent = '0 items';
        } else {
            emptyCartMessage.style.display = 'none';
            cartItemsContainer.style.display = 'block';
            cartFooter.style.display = 'block';
            
            const total = this.getCartTotal();
            if (cartTotalAmount) cartTotalAmount.textContent = total.toLocaleString();
            if (cartItemCount) cartItemCount.textContent = `${this.getCartCount()} items`;
            
            if (cartItemsList) {
                cartItemsList.innerHTML = this.getCartItemsHTML();
            }

            this.setupCartItemEvents();
        }
    }

    getCartItemsHTML() {
        if (this.cart.length === 0) return '';
        
        let html = '';
        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            html += `
                <div class="cart-item d-flex align-items-center mb-4 pb-4 border-bottom" data-id="${item.id}" style="border-bottom: 2px dashed #E5E7EB !important; transition: all 0.3s;">
                    <!-- Product Image with Quantity Badge -->
                    <div style="position: relative; margin-right: 20px;">
                        <div style="position: absolute; top: -8px; left: -8px; background: #808080; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; box-shadow: 0 2px 5px rgba(128,128,128,0.3);">${item.quantity}</div>
                        <img src="assets/imgs2/${item.img}" class="rounded" style="width: 100px; height: 100px; object-fit: cover; border-radius: 16px !important; box-shadow: 0 8px 15px rgba(128,128,128,0.1); border: 3px solid white;">
                    </div>
                    
                    <!-- Product Details -->
                    <div class="flex-grow-1">
                        <h6 class="mb-2" style="font-weight: 600; color: #1F2937; font-size: 1.1rem;">${item.name}</h6>
                        <div class="d-flex align-items-center gap-2">
                            <button class="btn btn-sm cart-qty-decrease" data-id="${item.id}" 
                                    style="width: 35px; height: 35px; border-radius: 12px; background: #F3F4F6; color: #808080; border: none; display: flex; align-items: center; justify-content: center; font-weight: 700; transition: all 0.2s;"
                                    onmouseover="this.style.background='#E5E7EB'"
                                    onmouseout="this.style.background='#F3F4F6'">−</button>
                            <span class="cart-qty" style="font-weight: 600; color: #1F2937; min-width: 30px; text-align: center;">${item.quantity}</span>
                            <button class="btn btn-sm cart-qty-increase" data-id="${item.id}" 
                                    style="width: 35px; height: 35px; border-radius: 12px; background: #F3F4F6; color: #808080; border: none; display: flex; align-items: center; justify-content: center; font-weight: 700; transition: all 0.2s;"
                                    onmouseover="this.style.background='#E5E7EB'"
                                    onmouseout="this.style.background='#F3F4F6'">+</button>
                            <span class="ms-3 fw-bold" style="color: #808080; font-size: 1.1rem;">Rs ${item.price.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <!-- Total and Remove -->
                    <div class="text-end" style="min-width: 140px;">
                        <div class="fw-bold mb-2" style="color: #808080; font-size: 1.2rem;">Rs ${itemTotal.toLocaleString()}</div>
                        <button class="btn btn-sm cart-remove" data-id="${item.id}" 
                                style="background: #FEE2E2; color: #EF4444; border: none; border-radius: 12px; padding: 8px 15px; font-size: 0.9rem; transition: all 0.2s;"
                                onmouseover="this.style.background='#FECACA'; this.style.transform='scale(1.05)'"
                                onmouseout="this.style.background='#FEE2E2'; this.style.transform='scale(1)'">
                            <i class="fas fa-trash me-1"></i> Remove
                        </button>
                    </div>
                </div>
            `;
        });
        
        return html;
    }

    setupCartItemEvents() {
        // Remove buttons
        document.querySelectorAll('.cart-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = parseInt(btn.dataset.id);
                this.removeFromCart(productId);
            });
        });

        // Increase quantity
        document.querySelectorAll('.cart-qty-increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = parseInt(btn.dataset.id);
                const item = this.cart.find(i => i.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity + 1);
                }
            });
        });

        // Decrease quantity
        document.querySelectorAll('.cart-qty-decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = parseInt(btn.dataset.id);
                const item = this.cart.find(i => i.id === productId);
                if (item && item.quantity > 1) {
                    this.updateQuantity(productId, item.quantity - 1);
                }
            });
        });
    }

    // ===============================
    // HANDLE CHECKOUT (UPDATED)
    // ===============================
    handleCheckout() {
        console.log('Checkout button clicked - handling checkout');
        
        // Check if user is logged in
        if (!window.authSystem || !window.authSystem.isLoggedIn()) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
            if (modal) modal.hide();
            
            setTimeout(() => {
                if (window.authSystem) {
                    // Pass true to indicate this is for checkout
                    window.authSystem.showLoginRequired(true);
                }
            }, 300);
            return;
        }
        
        // Check if cart is empty
        if (this.cart.length === 0) {
            this.showToast('Your cart is empty!', 'error');
            return;
        }
        
        // Close cart modal
        const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
        if (cartModal) cartModal.hide();
        
        // Initialize checkout system if not exists
        if (!window.checkoutSystem) {
            console.log('Initializing checkout system');
            window.checkoutSystem = new CheckoutSystem(this);
        }
        
        // Show checkout with slight delay
        setTimeout(() => {
            if (window.checkoutSystem) {
                console.log('Showing checkout modal');
                window.checkoutSystem.showCheckout();
            } else {
                console.error('Checkout system still not initialized');
                this.showToast('Checkout system error. Please try again.', 'error');
            }
        }, 300);
    }

    showCartModal() {
        this.updateCartModal();
        const cartModalElement = document.getElementById('cartModal');
        if (cartModalElement) {
            const cartModal = new bootstrap.Modal(cartModalElement);
            cartModal.show();
        }
    }

    showToast(message, type = 'success') {
        if (window.authSystem) {
            window.authSystem.showToast(message, type);
        }
    }
}

// Initialize cart system
document.addEventListener('DOMContentLoaded', function() {
    window.cartSystem = new CartSystem();
});