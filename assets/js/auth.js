// assets/js/auth.js

// ===============================
// AUTH SYSTEM - COMPLETE VERSION
// ===============================

class Auth {

    constructor() {
        this.users = JSON.parse(localStorage.getItem("users")) || [];
        this.currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
        
        // Add demo user if no users exist
        if (this.users.length === 0) {
            this.addDemoUser();
        }
        
        this.init();
        this.checkAuthState();
    }

    // ===============================
    // ADD DEMO USER
    // ===============================
    addDemoUser() {
        const demoUser = {
            id: 1,
            name: "Test User",
            email: "test@example.com",
            password: "123456",
            orders: []
        };
        
        this.users.push(demoUser);
        localStorage.setItem("users", JSON.stringify(this.users));
        console.log("Demo user created:", { email: "test@example.com", password: "123456" });
    }

    // ===============================
    // INIT
    // ===============================
    init() {
        this.registerEvent();
        this.loginEvent();
        this.setupLogoutButton();
        this.setupProtectedButtons();
    }

    // ===============================
    // CHECK AUTH STATE AND UPDATE UI
    // ===============================
    checkAuthState() {
        const loginRegisterBtn = document.getElementById('loginRegisterBtn');
        const userDropdownMenu = document.getElementById('userDropdownMenu');
        const cartButtonContainer = document.getElementById('cartButtonContainer');
        const ordersButtonContainer = document.getElementById('ordersButtonContainer');
        
        if (this.isLoggedIn()) {
            if (loginRegisterBtn) loginRegisterBtn.style.display = 'none';
            if (userDropdownMenu) userDropdownMenu.style.display = 'block';
            if (cartButtonContainer) cartButtonContainer.style.display = 'block';
            if (ordersButtonContainer) ordersButtonContainer.style.display = 'block';
            
            const userNameElement = document.getElementById('userName');
            if (userNameElement && this.currentUser) {
                userNameElement.textContent = this.currentUser.name.split(' ')[0];
            }
        } else {
            if (loginRegisterBtn) loginRegisterBtn.style.display = 'block';
            if (userDropdownMenu) userDropdownMenu.style.display = 'none';
            if (cartButtonContainer) cartButtonContainer.style.display = 'none';
            if (ordersButtonContainer) ordersButtonContainer.style.display = 'none';
        }

        this.updateCartBadge();
    }

    // ===============================
    // UPDATE CART BADGE
    // ===============================
    updateCartBadge() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        const cartBadges = document.querySelectorAll('.cart-badge');
        
        cartBadges.forEach(badge => {
            badge.textContent = cartCount;
            badge.style.display = cartCount > 0 ? 'flex' : 'none';
        });
    }

    // ===============================
    // SETUP LOGOUT BUTTON
    // ===============================
    setupLogoutButton() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
                e.preventDefault();
                this.logout();
            }
        });
    }

    // ===============================
    // SETUP PROTECTED BUTTONS
    // ===============================
    setupProtectedButtons() {
        const mainCartBtn = document.getElementById('mainCartBtn');
        if (mainCartBtn) {
            mainCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleCartClick();
            });
        }

        document.addEventListener('click', (e) => {
            const addToCartBtn = e.target.closest('.add-to-cart-btn');
            if (addToCartBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                if (!this.isLoggedIn()) {
                    this.showLoginRequired(false);
                    return false;
                }
                
                const productId = addToCartBtn.dataset.productId;
                if (productId && window.cartSystem) {
                    this.handleAddToCart(productId, addToCartBtn);
                }
            }
        });
    }

    // ===============================
    // HANDLE CART CLICK
    // ===============================
    handleCartClick() {
        if (this.isLoggedIn()) {
            if (window.cartSystem) {
                window.cartSystem.showCartModal();
            } else {
                console.error('Cart system not loaded');
                this.showToast('Cart system not available', 'error');
            }
        } else {
            this.showLoginRequired(false);
        }
    }

    // ===============================
    // HANDLE ADD TO CART
    // ===============================
    handleAddToCart(productId, button) {
        if (button.disabled) return;
        button.disabled = true;

        const originalHtml = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Adding...';

        fetch('data.json')
            .then(res => res.json())
            .then(products => {
                const product = products.find(p => p.id == productId);
                
                if (product && window.cartSystem) {
                    window.cartSystem.addToCart({
                        id: product.id,
                        name: product.watch_name,
                        price: product.watch_price,
                        img: product.img,
                        quantity: 1
                    });
                    
                    button.innerHTML = '<i class="fas fa-check me-2"></i>Added!';
                    button.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                    
                    setTimeout(() => {
                        button.innerHTML = originalHtml;
                        button.style.background = 'linear-gradient(135deg, #808080 0%, #6b7280 100%)';
                        button.disabled = false;
                    }, 1500);

                    this.updateCartBadge();
                }
            })
            .catch(error => {
                console.error('Error adding to cart:', error);
                this.showToast('Error adding product to cart', 'error');
                button.innerHTML = originalHtml;
                button.disabled = false;
            });
    }

    // ===============================
    // SHOW LOGIN REQUIRED MODAL (UPDATED)
    // ===============================
    showLoginRequired(redirectToCheckout = false) {
        let modal = document.getElementById('loginRequiredModal');
        if (modal) {
            modal.remove();
        }

        const modalHTML = `
            <div class="modal fade" id="loginRequiredModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header" style="background: #808080; color: white;">
                            <h5 class="modal-title">
                                <i class="fas fa-lock me-2"></i>Login Required
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center py-4">
                            <i class="fas fa-user-lock fa-4x mb-3" style="color: #808080;"></i>
                            <h5>Please Login to Continue</h5>
                            <p class="text-muted">You need to be logged in to ${redirectToCheckout ? 'proceed to checkout' : 'add items to cart'}.</p>
                            <div class="bg-light p-3 rounded mt-3">
                                <p class="mb-1"><strong>Demo Credentials:</strong></p>
                                <p class="mb-0">Email: test@example.com</p>
                                <p class="mb-0">Password: 123456</p>
                            </div>
                        </div>
                        <div class="modal-footer justify-content-center border-0">
                            <button class="btn login-now-btn" style="background: #808080; color: white; border: none; padding: 10px 25px;" data-redirect="${redirectToCheckout}">
                                <i class="fas fa-sign-in-alt me-2"></i>Login Now
                            </button>
                            <a href="register.html" class="btn btn-outline-secondary">
                                <i class="fas fa-user-plus me-2"></i>Register
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        modal = document.getElementById('loginRequiredModal');
        
        // Add event listener for the login button
        const loginBtn = modal.querySelector('.login-now-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                const redirect = loginBtn.dataset.redirect === 'true';
                const bsModal = bootstrap.Modal.getInstance(modal);
                bsModal.hide();
                
                // Store in sessionStorage that we want to redirect to checkout after login
                if (redirect) {
                    sessionStorage.setItem('redirectAfterLogin', 'checkout');
                }
                
                window.location.href = 'login.html';
            });
        }
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    // ===============================
    // SHOW TOAST MESSAGE
    // ===============================
    showToast(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 12px 20px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
            animation: slideIn 0.3s ease;
            border-left: 4px solid ${type === 'success' ? '#28a745' : '#dc3545'};
        `;

        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        const iconColor = type === 'success' ? '#28a745' : '#dc3545';

        toast.innerHTML = `
            <i class="fas ${icon}" style="color: ${iconColor}; font-size: 20px;"></i>
            <div style="flex: 1;">
                <div style="font-weight: 600; margin-bottom: 4px;">
                    ${type === 'success' ? 'Success' : 'Error'}
                </div>
                <div style="color: #666; font-size: 14px;">${message}</div>
            </div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // ===============================
    // REGISTER FUNCTION
    // ===============================
    registerEvent() {
        const registerForm = document.getElementById("registerForm");
        if (!registerForm) return;

        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("registerName").value.trim();
            const email = document.getElementById("registerEmail").value.toLowerCase().trim();
            const password = document.getElementById("registerPassword").value.trim();
            const confirmPassword = document.getElementById("registerConfirmPassword").value.trim();

            if (name === "" || email === "" || password === "") {
                alert("All fields are required");
                return;
            }

            if (password.length < 6) {
                alert("Password must be at least 6 characters");
                return;
            }

            if (password !== confirmPassword) {
                alert("Passwords do not match");
                return;
            }

            const userExists = this.users.find(user => user.email === email);
            if (userExists) {
                alert("Email already registered");
                return;
            }

            const newUser = {
                id: Date.now(),
                name: name,
                email: email,
                password: password,
                orders: []
            };

            this.users.push(newUser);
            localStorage.setItem("users", JSON.stringify(this.users));

            this.showToast("Registration successful! Please login.", "success");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        });
    }

    // ===============================
    // LOGIN FUNCTION (UPDATED WITH TOAST)
    // ===============================
    loginEvent() {
        const loginForm = document.getElementById("loginForm");
        if (!loginForm) return;

        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const email = document.getElementById("loginEmail").value.toLowerCase().trim();
            const password = document.getElementById("loginPassword").value.trim();

            if (email === "" || password === "") {
                alert("Please enter email and password");
                return;
            }

            const user = this.users.find(user =>
                user.email === email &&
                user.password === password
            );

            if (!user) {
                alert("Invalid email or password");
                return;
            }

            const { password: pwd, ...safeUser } = user;
            localStorage.setItem("currentUser", JSON.stringify(safeUser));
            this.currentUser = safeUser;

            // Show success toast instead of alert
            this.showToast("Login successful! Welcome back.", "success");
            
            this.checkAuthState();
            
            // Check if we need to redirect to checkout
            const redirectToCheckout = sessionStorage.getItem('redirectAfterLogin') === 'checkout';
            
            // Redirect after a short delay to show toast
            setTimeout(() => {
                if (redirectToCheckout) {
                    sessionStorage.removeItem('redirectAfterLogin');
                    window.location.href = "index.html?checkout=true";
                } else {
                    window.location.href = "index.html";
                }
            }, 1500);
        });
    }

    // ===============================
    // LOGOUT
    // ===============================
    logout() {
        localStorage.removeItem("currentUser");
        this.currentUser = null;
        this.checkAuthState();
        this.showToast("Logged out successfully", "success");
        
        if (!window.location.pathname.endsWith('index.html') && 
            !window.location.pathname.endsWith('/')) {
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        }
    }

    // ===============================
    // CHECK IF LOGGED IN
    // ===============================
    isLoggedIn() {
        return localStorage.getItem("currentUser") !== null;
    }

    // ===============================
    // GET CURRENT USER
    // ===============================
    getCurrentUser() {
        return JSON.parse(localStorage.getItem("currentUser"));
    }

}

// Create global auth object
const auth = new Auth();
window.auth = auth;
window.authSystem = auth;