// assets/js/order-history.js

class OrderHistorySystem {
    constructor() {
        this.container = document.getElementById("orderHistoryContainer");
        this.init();
    }

    init() {
        setTimeout(() => {
            this.checkLogin();
            this.loadOrders();
        }, 100);
    }

    checkLogin() {
        if (!window.authSystem || !window.authSystem.isLoggedIn()) {
            if (window.authSystem) {
                window.authSystem.showToast("Please login first!", "error");
            }
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        }
    }

    loadOrders() {
        if (!this.container) return;
        
        const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
        const currentUser = window.authSystem ? window.authSystem.getCurrentUser() : null;
        
        if (!currentUser) {
            this.container.innerHTML = this.getErrorHTML("User not found. Please login again.");
            return;
        }

        console.log('All orders:', allOrders);
        console.log('Current user:', currentUser);

        const userOrders = allOrders.filter(order => order.userEmail === currentUser.email);
        
        console.log('User orders:', userOrders);

        if (userOrders.length === 0) {
            this.container.innerHTML = this.getEmptyStateHTML();
            return;
        }

        // Sort orders by date (newest first)
        userOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        let html = '';
        
        userOrders.forEach(order => {
            html += this.getOrderCardHTML(order);
        });

        this.container.innerHTML = html;
        
        // Add click handlers for view details buttons
        this.setupViewDetailsButtons();
    }

    setupViewDetailsButtons() {
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const orderId = btn.dataset.orderId;
                if (orderId && window.profileSystem) {
                    window.profileSystem.showOrderDetails(orderId);
                } else if (orderId) {
                    // Fallback if profile system not available
                    this.showOrderDetailsFallback(orderId);
                }
            });
        });
    }

    showOrderDetailsFallback(orderId) {
        const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
        const order = allOrders.find(o => o.id === orderId);
        
        if (!order) {
            alert('Order not found');
            return;
        }

        // Simple alert for order details
        let message = `Order #${orderId}\n\n`;
        message += `Date: ${new Date(order.date).toLocaleDateString()}\n`;
        message += `Status: ${order.status}\n`;
        message += `Total: Rs ${order.total.toLocaleString()}\n\n`;
        message += `Items:\n`;
        
        order.items.forEach(item => {
            message += `- ${item.name} x${item.quantity} = Rs ${(item.price * item.quantity).toLocaleString()}\n`;
        });
        
        alert(message);
    }

    getOrderCardHTML(order) {
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const statusClass = this.getStatusClass(order.status);
        const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);
        
        return `
            <div class="order-card">
                <div class="order-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="order-id fw-bold">Order #${order.id}</span>
                            <span class="order-date ms-3 text-muted">
                                <i class="far fa-calendar"></i> ${formattedDate}
                            </span>
                        </div>
                        <span class="badge ${statusClass} p-2">${order.status}</span>
                    </div>
                </div>
                
                <div class="order-items p-3">
                    <h6 class="mb-3">Items (${itemCount})</h6>
                    ${this.getOrderItemsHTML(order.items)}
                </div>
                
                <div class="order-footer bg-light p-3">
                    <div class="row">
                        <div class="col-md-6">
                            <small class="text-muted d-block">
                                <i class="fas fa-credit-card me-2"></i>Payment: ${this.getPaymentMethod(order.payment?.method)}
                            </small>
                            <small class="text-muted d-block">
                                <i class="fas fa-map-marker-alt me-2"></i>Delivery: ${order.customer.city}, ${order.customer.country}
                            </small>
                        </div>
                        <div class="col-md-6 text-md-end mt-3 mt-md-0">
                            <div class="fw-bold fs-5 mb-2">Total: Rs ${order.total.toLocaleString()}</div>
                            <button class="btn btn-sm view-details-btn" 
                                    style="background: #808080; color: white; border: none;"
                                    data-order-id="${order.id}">
                                <i class="fas fa-eye me-2"></i>View Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getOrderItemsHTML(items) {
        let html = '<div class="row g-2">';
        const maxDisplay = 3;
        
        items.slice(0, maxDisplay).forEach(item => {
            html += `
                <div class="col-md-4">
                    <div class="d-flex align-items-center border rounded p-2">
                        <img src="assets/imgs2/${item.img}" 
                             alt="${item.name}"
                             style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;"
                             onerror="this.src='assets/imgs2/placeholder.jpg'">
                        <div class="ms-2">
                            <small class="d-block fw-bold">${item.name}</small>
                            <small class="text-muted">Qty: ${item.quantity}</small>
                            <br>
                            <small class="fw-bold" style="color:#808080;">Rs ${item.price.toLocaleString()}</small>
                        </div>
                    </div>
                </div>
            `;
        });
        
        if (items.length > maxDisplay) {
            html += `<div class="col-12"><small class="text-muted">+${items.length - maxDisplay} more items</small></div>`;
        }
        
        html += '</div>';
        return html;
    }

    getEmptyStateHTML() {
        return `
            <div class="text-center py-5">
                <div class="mb-4">
                    <i class="fas fa-shopping-bag fa-4x" style="color: #ccc;"></i>
                </div>
                <h3>No Orders Yet</h3>
                <p class="text-muted mb-4">Looks like you haven't placed any orders yet.</p>
                <a href="index.html" class="btn btn-primary" style="background: #808080; border: none; padding: 12px 30px;">
                    <i class="fas fa-shopping-cart me-2"></i>Start Shopping
                </a>
            </div>
        `;
    }

    getErrorHTML(message) {
        return `
            <div class="text-center py-5">
                <div class="mb-4">
                    <i class="fas fa-exclamation-triangle fa-4x" style="color: #dc3545;"></i>
                </div>
                <h3>Oops!</h3>
                <p class="text-muted">${message}</p>
                <a href="login.html" class="btn btn-primary mt-3" style="background: #808080; border: none;">
                    <i class="fas fa-sign-in-alt me-2"></i>Login Again
                </a>
            </div>
        `;
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

// Initialize order history system
document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        window.orderHistorySystem = new OrderHistorySystem();
    }, 200);
});

// Make viewOrderDetails available globally for inline onclick
window.viewOrderDetails = function(orderId) {
    if (window.profileSystem) {
        window.profileSystem.showOrderDetails(orderId);
    } else if (window.orderHistorySystem) {
        window.orderHistorySystem.showOrderDetailsFallback(orderId);
    } else {
        // Last resort fallback
        const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
        const order = allOrders.find(o => o.id === orderId);
        if (order) {
            alert(`Order #${orderId}\nTotal: Rs ${order.total}\nStatus: ${order.status}`);
        }
    }
};