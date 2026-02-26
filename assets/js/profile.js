// assets/js/profile.js

class ProfileSystem {
    constructor() {
        this.currentUser = null;
        this.orders = [];
        this.init();
    }

    init() {
        this.checkAuth();
        this.loadUserData();
        this.setupEventListeners();
    }

    checkAuth() {
        if (!window.authSystem || !window.authSystem.isLoggedIn()) {
            if (window.authSystem) {
                window.authSystem.showToast("Please login first!", "error");
            }
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
            return false;
        }
        
        this.currentUser = window.authSystem.getCurrentUser();
        return true;
    }

    loadUserData() {
        if (!this.currentUser) return;

        // Load orders
        const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
        this.orders = allOrders.filter(order => order.userEmail === this.currentUser.email);

        // Update profile display
        this.updateProfileDisplay();
        this.updateStats();
        this.loadRecentOrders();
    }

    updateProfileDisplay() {
        if (!this.currentUser) return;

        // Update header
        document.getElementById('profileName').textContent = this.currentUser.name || 'User';
        document.getElementById('profileEmail').textContent = this.currentUser.email || '';

        // Format join date
        const joinDate = this.currentUser.createdAt ? new Date(this.currentUser.createdAt) : new Date();
        const formattedDate = joinDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('profileJoined').textContent = formattedDate;

        // Update info cards
        document.getElementById('displayName').textContent = this.currentUser.name || '-';
        document.getElementById('displayEmail').textContent = this.currentUser.email || '-';
        document.getElementById('displayJoined').textContent = formattedDate;
        document.getElementById('displayTotalOrders').textContent = this.orders.length;

        // Pre-fill edit form
        document.getElementById('editName').value = this.currentUser.name || '';
        document.getElementById('editEmail').value = this.currentUser.email || '';
    }

    updateStats() {
        if (!this.currentUser) return;

        const totalOrders = this.orders.length;
        const pendingOrders = this.orders.filter(o => o.status === 'processing' || o.status === 'shipped').length;
        const completedOrders = this.orders.filter(o => o.status === 'delivered').length;
        const totalSpent = this.orders.reduce((sum, order) => sum + (order.total || 0), 0);

        document.getElementById('statTotalOrders').textContent = totalOrders;
        document.getElementById('statPendingOrders').textContent = pendingOrders;
        document.getElementById('statCompletedOrders').textContent = completedOrders;
        document.getElementById('statTotalSpent').textContent = `Rs ${totalSpent.toLocaleString()}`;
    }

    loadRecentOrders() {
        const container = document.getElementById('recentOrdersList');
        if (!container) return;

        if (this.orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-shopping-bag fa-3x mb-3" style="color: #ccc;"></i>
                    <p class="text-muted">No orders yet</p>
                    <a href="index.html" class="btn btn-sm" style="background: #808080; color: white;">Start Shopping</a>
                </div>
            `;
            return;
        }

        // Get last 3 orders
        const recentOrders = this.orders.slice(0, 3);
        let html = '';

        recentOrders.forEach(order => {
            const orderDate = new Date(order.date);
            const formattedDate = orderDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            html += `
                <div class="order-item-small d-flex justify-content-between align-items-center">
                    <div>
                        <small class="text-muted">${formattedDate}</small>
                        <h6 class="mb-0">Order #${order.id.slice(-8)}</h6>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-warning text-dark">${order.status}</span>
                        <br>
                        <small class="fw-bold">Rs ${order.total.toLocaleString()}</small>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    setupEventListeners() {
        // Edit profile button
        const editBtn = document.getElementById('editProfileBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                const modal = new bootstrap.Modal(document.getElementById('editProfileModal'));
                modal.show();
            });
        }

        // Save profile button
        const saveBtn = document.getElementById('saveProfileBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProfile());
        }

        // View details buttons (for order history page)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-details-btn') || e.target.closest('.view-details-btn')) {
                const btn = e.target.classList.contains('view-details-btn') ? e.target : e.target.closest('.view-details-btn');
                const orderId = btn.dataset.orderId;
                if (orderId) {
                    this.showOrderDetails(orderId);
                }
            }
        });
    }

    saveProfile() {
        const name = document.getElementById('editName').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        const currentPassword = document.getElementById('editCurrentPassword').value;
        const newPassword = document.getElementById('editNewPassword').value;
        const confirmPassword = document.getElementById('editConfirmPassword').value;

        // Validation
        if (!name || !email) {
            alert('Name and email are required');
            return;
        }

        if (!currentPassword) {
            alert('Please enter your current password');
            return;
        }

        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);

        if (userIndex === -1) {
            alert('User not found');
            return;
        }

        // Verify current password
        if (users[userIndex].password !== currentPassword) {
            alert('Current password is incorrect');
            return;
        }

        // Check if new email already exists (if changed)
        if (email !== this.currentUser.email) {
            const emailExists = users.some(u => u.email === email && u.id !== this.currentUser.id);
            if (emailExists) {
                alert('Email already in use by another account');
                return;
            }
        }

        // Update user object
        users[userIndex].name = name;
        users[userIndex].email = email;

        // Update password if provided
        if (newPassword) {
            if (newPassword.length < 6) {
                alert('New password must be at least 6 characters');
                return;
            }
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match');
                return;
            }
            users[userIndex].password = newPassword;
        }

        // Save to localStorage
        localStorage.setItem('users', JSON.stringify(users));

        // Update current user
        const { password, ...safeUser } = users[userIndex];
        localStorage.setItem('currentUser', JSON.stringify(safeUser));
        this.currentUser = safeUser;

        // Update display
        this.updateProfileDisplay();

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
        modal.hide();

        // Clear password fields
        document.getElementById('editCurrentPassword').value = '';
        document.getElementById('editNewPassword').value = '';
        document.getElementById('editConfirmPassword').value = '';

        // Show success message
        if (window.authSystem) {
            window.authSystem.showToast('Profile updated successfully!', 'success');
        }
    }

    showOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId) || 
                     JSON.parse(localStorage.getItem('orders'))?.find(o => o.id === orderId);
        
        if (!order) {
            if (window.authSystem) {
                window.authSystem.showToast('Order not found', 'error');
            }
            return;
        }

        const modalBody = document.getElementById('orderDetailsContent');
        if (!modalBody) return;

        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const statusClass = this.getStatusClass(order.status);
        const paymentMethod = this.getPaymentMethod(order.payment?.method);

        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="assets/imgs2/${item.img}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                            <div class="ms-3">
                                <h6 class="mb-0">${item.name}</h6>
                                <small class="text-muted">ID: ${item.id}</small>
                            </div>
                        </div>
                    </td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-end">Rs ${item.price.toLocaleString()}</td>
                    <td class="text-end">Rs ${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
            `;
        });

        modalBody.innerHTML = `
            <div class="order-detail-container">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5 class="mb-0">Order #${order.id}</h5>
                    <span class="badge ${statusClass} p-2">${order.status}</span>
                </div>
                
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header bg-light">
                                <h6 class="mb-0">Order Information</h6>
                            </div>
                            <div class="card-body">
                                <p class="mb-2"><strong>Date:</strong> ${formattedDate}</p>
                                <p class="mb-2"><strong>Payment Method:</strong> ${paymentMethod}</p>
                                <p class="mb-0"><strong>Order Status:</strong> ${order.status}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header bg-light">
                                <h6 class="mb-0">Shipping Information</h6>
                            </div>
                            <div class="card-body">
                                <p class="mb-1"><strong>${order.customer.firstName} ${order.customer.lastName}</strong></p>
                                <p class="mb-1">${order.customer.address}</p>
                                <p class="mb-1">${order.customer.city}, ${order.customer.country}</p>
                                <p class="mb-1">${order.customer.phone}</p>
                                <p class="mb-0">${order.customer.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card mb-4">
                    <div class="card-header bg-light">
                        <h6 class="mb-0">Order Items</h6>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover mb-0">
                                <thead class="bg-light">
                                    <tr>
                                        <th>Product</th>
                                        <th class="text-center">Qty</th>
                                        <th class="text-end">Price</th>
                                        <th class="text-end">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                                <tfoot class="bg-light">
                                    <tr>
                                        <td colspan="3" class="text-end"><strong>Subtotal:</strong></td>
                                        <td class="text-end">Rs ${order.subtotal.toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" class="text-end"><strong>Shipping:</strong></td>
                                        <td class="text-end">Rs ${order.shipping.toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" class="text-end"><strong>Total:</strong></td>
                                        <td class="text-end"><strong>Rs ${order.total.toLocaleString()}</strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
                
                ${order.status === 'processing' ? `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    Your order is being processed. You will receive a confirmation email shortly.
                </div>
                ` : ''}
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        modal.show();
    }

    getStatusClass(status) {
        switch(status?.toLowerCase()) {
            case 'processing':
                return 'bg-warning text-dark';
            case 'shipped':
                return 'bg-info text-white';
            case 'delivered':
                return 'bg-success text-white';
            case 'cancelled':
                return 'bg-danger text-white';
            default:
                return 'bg-secondary text-white';
        }
    }

    getPaymentMethod(method) {
        switch(method) {
            case 'cod':
                return 'Cash on Delivery';
            case 'card':
                return 'Credit/Debit Card';
            case 'jazzcash':
                return 'JazzCash';
            default:
                return method || 'Cash on Delivery';
        }
    }
}

// Initialize profile system
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.profileSystem = new ProfileSystem();
    }, 200);
});