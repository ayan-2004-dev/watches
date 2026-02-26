// assets/js/checkout.js

class CheckoutSystem {
    constructor(cartSystem) {
        this.cartSystem = cartSystem;
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.currentStep = 1;
        this.init();
    }

    init() {
        this.setupCheckoutModal();
        this.setupOrderSuccessModal();
        this.checkForAutoCheckout(); // Check if we should auto-open checkout
        console.log('Checkout System initialized');
    }

    // ===============================
    // CHECK FOR AUTO CHECKOUT (NEW)
    // ===============================
    checkForAutoCheckout() {
        // Check if URL has checkout parameter
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('checkout') && urlParams.get('checkout') === 'true') {
            // Check if user is logged in and cart is not empty
            if (window.authSystem && window.authSystem.isLoggedIn()) {
                const cart = this.getCart();
                if (cart.length > 0) {
                    setTimeout(() => {
                        this.showCheckout();
                    }, 1000);
                }
            }
        }
    }

    setupCheckoutModal() {
        if (!document.getElementById('checkoutModal')) {
            const modalHTML = `
                <div class="modal fade" id="checkoutModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-lg modal-dialog-centered">
                        <div class="modal-content" style="border-radius: 28px; overflow: hidden; border: none; box-shadow: 0 25px 50px -12px rgba(128,128,128,0.25);">
                            <!-- Modal Header with #808080 -->
                            <div class="modal-header" style="background: linear-gradient(135deg, #808080 0%, #6B7280 100%); color: white; border: none; padding: 25px 30px;">
                                <h5 class="modal-title d-flex align-items-center">
                                    <div style="background: rgba(255,255,255,0.15); padding: 12px; border-radius: 50%; margin-right: 18px;">
                                        <i class="fas fa-credit-card fa-2x"></i>
                                    </div>
                                    <div>
                                        <span style="font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Secure Checkout</span>
                                        <p style="font-size: 14px; opacity: 0.9; margin: 5px 0 0;">Complete your purchase</p>
                                    </div>
                                </h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" style="opacity: 0.8; transition: all 0.3s;" 
                                        onmouseover="this.style.opacity='1'; this.style.transform='rotate(90deg)'" 
                                        onmouseout="this.style.opacity='0.8'; this.style.transform='rotate(0)'"></button>
                            </div>
                            
                            <div class="modal-body p-4" style="background: #F9FAFB;">
                                <!-- Checkout Steps with #808080 -->
                                <div class="checkout-steps mb-5" style="position: relative;">
                                    <div style="position: absolute; top: 20px; left: 12%; right: 12%; height: 3px; background: #E5E7EB; z-index: 1;"></div>
                                    <div style="position: absolute; top: 20px; left: 12%; width: 0%; height: 3px; background: #808080; z-index: 2; transition: width 0.3s ease;" id="progressLine"></div>
                                    
                                    <div class="d-flex justify-content-between position-relative" style="z-index: 3;">
                                        <div class="step" data-step="1" style="flex:1; text-align:center;">
                                            <div class="step-circle" style="width: 45px; height: 45px; border-radius: 50%; background: #808080; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-weight: 700; border: 3px solid #808080; box-shadow: 0 5px 15px rgba(128,128,128,0.1); transition: all 0.3s;">
                                                <i class="fas fa-map-marker-alt" style="font-size: 1.2rem;"></i>
                                            </div>
                                            <div style="font-weight: 600; color: #2D3748;">Shipping</div>
                                            <small style="color: #9CA3AF; font-size: 0.8rem;">Delivery Info</small>
                                        </div>
                                        
                                        <div class="step" data-step="2" style="flex:1; text-align:center;">
                                            <div class="step-circle" style="width: 45px; height: 45px; border-radius: 50%; background: white; color: #9CA3AF; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-weight: 700; border: 3px solid #E5E7EB; box-shadow: 0 5px 15px rgba(128,128,128,0.1); transition: all 0.3s;">
                                                <i class="fas fa-credit-card" style="font-size: 1.2rem;"></i>
                                            </div>
                                            <div style="font-weight: 400; color: #9CA3AF;">Payment</div>
                                            <small style="color: #9CA3AF; font-size: 0.8rem;">Select Method</small>
                                        </div>
                                        
                                        <div class="step" data-step="3" style="flex:1; text-align:center;">
                                            <div class="step-circle" style="width: 45px; height: 45px; border-radius: 50%; background: white; color: #9CA3AF; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-weight: 700; border: 3px solid #E5E7EB; box-shadow: 0 5px 15px rgba(128,128,128,0.1); transition: all 0.3s;">
                                                <i class="fas fa-check-circle" style="font-size: 1.2rem;"></i>
                                            </div>
                                            <div style="font-weight: 400; color: #9CA3AF;">Confirm</div>
                                            <small style="color: #9CA3AF; font-size: 0.8rem;">Review Order</small>
                                        </div>
                                    </div>
                                </div>
                                
                                <form id="checkoutForm">
                                    <!-- Step 1: Shipping -->
                                    <div id="step1" style="display: block;">
                                        <h5 class="mb-4" style="color: #2D3748; font-weight: 600;">
                                            <i class="fas fa-truck me-2" style="color: #808080;"></i>
                                            Shipping Information
                                        </h5>
                                        <div class="row g-4">
                                            <div class="col-md-6">
                                                <label class="form-label fw-500" style="color: #4B5563;">First Name</label>
                                                <input type="text" class="form-control form-control-lg" id="firstName" required 
                                                       style="border-radius: 16px; border: 2px solid #E5E7EB; padding: 12px 18px; transition: all 0.3s;"
                                                       onfocus="this.style.borderColor='#808080'; this.style.boxShadow='0 0 0 4px rgba(128,128,128,0.1)'"
                                                       onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none'">
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-500" style="color: #4B5563;">Last Name</label>
                                                <input type="text" class="form-control form-control-lg" id="lastName" required 
                                                       style="border-radius: 16px; border: 2px solid #E5E7EB; padding: 12px 18px; transition: all 0.3s;"
                                                       onfocus="this.style.borderColor='#808080'; this.style.boxShadow='0 0 0 4px rgba(128,128,128,0.1)'"
                                                       onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none'">
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-500" style="color: #4B5563;">Email</label>
                                                <input type="email" class="form-control form-control-lg" id="email" required 
                                                       style="border-radius: 16px; border: 2px solid #E5E7EB; padding: 12px 18px; transition: all 0.3s;"
                                                       onfocus="this.style.borderColor='#808080'; this.style.boxShadow='0 0 0 4px rgba(128,128,128,0.1)'"
                                                       onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none'">
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-500" style="color: #4B5563;">Phone</label>
                                                <input type="tel" class="form-control form-control-lg" id="phone" required 
                                                       style="border-radius: 16px; border: 2px solid #E5E7EB; padding: 12px 18px; transition: all 0.3s;"
                                                       onfocus="this.style.borderColor='#808080'; this.style.boxShadow='0 0 0 4px rgba(128,128,128,0.1)'"
                                                       onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none'">
                                            </div>
                                            <div class="col-12">
                                                <label class="form-label fw-500" style="color: #4B5563;">Address</label>
                                                <textarea class="form-control form-control-lg" id="address" rows="2" required 
                                                          style="border-radius: 16px; border: 2px solid #E5E7EB; padding: 12px 18px; transition: all 0.3s;"
                                                          onfocus="this.style.borderColor='#808080'; this.style.boxShadow='0 0 0 4px rgba(128,128,128,0.1)'"
                                                          onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none'"></textarea>
                                            </div>
                                            <div class="col-md-4">
                                                <label class="form-label fw-500" style="color: #4B5563;">City</label>
                                                <input type="text" class="form-control form-control-lg" id="city" required 
                                                       style="border-radius: 16px; border: 2px solid #E5E7EB; padding: 12px 18px; transition: all 0.3s;"
                                                       onfocus="this.style.borderColor='#808080'; this.style.boxShadow='0 0 0 4px rgba(128,128,128,0.1)'"
                                                       onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none'">
                                            </div>
                                            <div class="col-md-4">
                                                <label class="form-label fw-500" style="color: #4B5563;">Postal Code</label>
                                                <input type="text" class="form-control form-control-lg" id="postalCode"
                                                       style="border-radius: 16px; border: 2px solid #E5E7EB; padding: 12px 18px; transition: all 0.3s;"
                                                       onfocus="this.style.borderColor='#808080'; this.style.boxShadow='0 0 0 4px rgba(128,128,128,0.1)'"
                                                       onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none'">
                                            </div>
                                            <div class="col-md-4">
                                                <label class="form-label fw-500" style="color: #4B5563;">Country</label>
                                                <select class="form-select form-select-lg" id="country" required 
                                                        style="border-radius: 16px; border: 2px solid #E5E7EB; padding: 12px 18px; transition: all 0.3s;"
                                                        onfocus="this.style.borderColor='#808080'; this.style.boxShadow='0 0 0 4px rgba(128,128,128,0.1)'"
                                                        onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none'">
                                                    <option value="">Select Country</option>
                                                    <option value="Pakistan" selected>🇵🇰 Pakistan</option>
                                                    <option value="UAE">🇦🇪 UAE</option>
                                                    <option value="USA">🇺🇸 USA</option>
                                                    <option value="UK">🇬🇧 United Kingdom</option>
                                                </select>
                                            </div>
                                        </div>
                                        
                                        <div class="d-flex justify-content-between mt-5">
                                            <button type="button" class="btn btn-lg" data-bs-dismiss="modal" 
                                                    style="background: white; color: #808080; border: 2px solid #808080; border-radius: 50px; padding: 12px 30px; font-weight: 600; transition: all 0.3s;"
                                                    onmouseover="this.style.background='#F3F4F6'"
                                                    onmouseout="this.style.background='white'">
                                                <i class="fas fa-times me-2"></i>Cancel
                                            </button>
                                            <button type="button" class="btn btn-lg next-step" data-next="2" 
                                                    style="background: linear-gradient(135deg, #808080 0%, #6B7280 100%); color: white; border: none; border-radius: 50px; padding: 12px 40px; font-weight: 600; box-shadow: 0 10px 20px -5px rgba(128,128,128,0.3); transition: all 0.3s;"
                                                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 15px 30px -5px rgba(128,128,128,0.4)'"
                                                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 20px -5px rgba(128,128,128,0.3)'">
                                                Continue to Payment <i class="fas fa-arrow-right ms-2"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <!-- Step 2: Payment -->
                                    <div id="step2" style="display: none;">
                                        <h5 class="mb-4" style="color: #2D3748; font-weight: 600;">
                                            <i class="fas fa-credit-card me-2" style="color: #808080;"></i>
                                            Payment Method
                                        </h5>
                                        <div class="payment-options">
                                            <div class="form-check mb-3 p-4 border rounded" style="border: 2px solid #E5E7EB; border-radius: 20px !important; transition: all 0.3s; cursor: pointer;"
                                                 onmouseover="this.style.borderColor='#808080'; this.style.backgroundColor='#F9FAFB'"
                                                 onmouseout="this.style.borderColor='#E5E7EB'; this.style.backgroundColor='white'">
                                                <input class="form-check-input" type="radio" name="paymentMethod" id="cod" value="cod" checked 
                                                       style="width: 20px; height: 20px; margin-top: 2px;">
                                                <label class="form-check-label" for="cod" style="cursor: pointer; width: 100%;">
                                                    <div class="d-flex align-items-center">
                                                        <div style="background: #F3F4F6; padding: 10px; border-radius: 12px; margin-right: 15px;">
                                                            <i class="fas fa-money-bill-wave fa-2x" style="color: #808080;"></i>
                                                        </div>
                                                        <div>
                                                            <h6 class="mb-1 fw-600" style="color: #2D3748;">Cash on Delivery</h6>
                                                            <p class="mb-0 text-muted small">Pay when you receive your order</p>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                            
                                            <div class="form-check mb-3 p-4 border rounded" style="border: 2px solid #E5E7EB; border-radius: 20px !important; transition: all 0.3s; cursor: pointer;"
                                                 onmouseover="this.style.borderColor='#808080'; this.style.backgroundColor='#F9FAFB'"
                                                 onmouseout="this.style.borderColor='#E5E7EB'; this.style.backgroundColor='white'">
                                                <input class="form-check-input" type="radio" name="paymentMethod" id="card" value="card" 
                                                       style="width: 20px; height: 20px; margin-top: 2px;">
                                                <label class="form-check-label" for="card" style="cursor: pointer; width: 100%;">
                                                    <div class="d-flex align-items-center">
                                                        <div style="background: #F3F4F6; padding: 10px; border-radius: 12px; margin-right: 15px;">
                                                            <i class="fas fa-credit-card fa-2x" style="color: #808080;"></i>
                                                        </div>
                                                        <div>
                                                            <h6 class="mb-1 fw-600" style="color: #2D3748;">Credit / Debit Card</h6>
                                                            <p class="mb-0 text-muted small">Visa, MasterCard, American Express</p>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                            
                                            <div class="form-check mb-3 p-4 border rounded" style="border: 2px solid #E5E7EB; border-radius: 20px !important; transition: all 0.3s; cursor: pointer;"
                                                 onmouseover="this.style.borderColor='#808080'; this.style.backgroundColor='#F9FAFB'"
                                                 onmouseout="this.style.borderColor='#E5E7EB'; this.style.backgroundColor='white'">
                                                <input class="form-check-input" type="radio" name="paymentMethod" id="jazzcash" value="jazzcash" 
                                                       style="width: 20px; height: 20px; margin-top: 2px;">
                                                <label class="form-check-label" for="jazzcash" style="cursor: pointer; width: 100%;">
                                                    <div class="d-flex align-items-center">
                                                        <div style="background: #F3F4F6; padding: 10px; border-radius: 12px; margin-right: 15px;">
                                                            <i class="fas fa-mobile-alt fa-2x" style="color: #808080;"></i>
                                                        </div>
                                                        <div>
                                                            <h6 class="mb-1 fw-600" style="color: #2D3748;">JazzCash</h6>
                                                            <p class="mb-0 text-muted small">Pay using JazzCash mobile account</p>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                        
                                        <div class="d-flex justify-content-between mt-5">
                                            <button type="button" class="btn btn-lg prev-step" data-prev="1" 
                                                    style="background: white; color: #808080; border: 2px solid #808080; border-radius: 50px; padding: 12px 30px; font-weight: 600; transition: all 0.3s;"
                                                    onmouseover="this.style.background='#F3F4F6'"
                                                    onmouseout="this.style.background='white'">
                                                <i class="fas fa-arrow-left me-2"></i>Back
                                            </button>
                                            <button type="button" class="btn btn-lg next-step" data-next="3" 
                                                    style="background: linear-gradient(135deg, #808080 0%, #6B7280 100%); color: white; border: none; border-radius: 50px; padding: 12px 40px; font-weight: 600; box-shadow: 0 10px 20px -5px rgba(128,128,128,0.3); transition: all 0.3s;"
                                                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 15px 30px -5px rgba(128,128,128,0.4)'"
                                                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 20px -5px rgba(128,128,128,0.3)'">
                                                Review Order <i class="fas fa-arrow-right ms-2"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <!-- Step 3: Confirm -->
                                    <div id="step3" style="display: none;">
                                        <h5 class="mb-4" style="color: #2D3748; font-weight: 600;">
                                            <i class="fas fa-check-circle me-2" style="color: #808080;"></i>
                                            Order Summary
                                        </h5>
                                        
                                        <!-- Order Items Card -->
                                        <div class="card mb-4" style="border: 2px solid #E5E7EB; border-radius: 24px; overflow: hidden;">
                                            <div class="card-header bg-light p-4" style="border-bottom: 2px solid #E5E7EB;">
                                                <h6 class="mb-0 d-flex align-items-center">
                                                    <i class="fas fa-shopping-bag me-2" style="color: #808080;"></i>
                                                    Items in Your Order
                                                </h6>
                                            </div>
                                            <div class="card-body p-0" id="orderSummary">
                                                <!-- Dynamic content -->
                                            </div>
                                        </div>
                                        
                                        <!-- Shipping Details Card -->
                                        <div class="card mb-4" style="border: 2px solid #E5E7EB; border-radius: 24px; overflow: hidden;">
                                            <div class="card-header bg-light p-4" style="border-bottom: 2px solid #E5E7EB;">
                                                <h6 class="mb-0 d-flex align-items-center">
                                                    <i class="fas fa-map-marker-alt me-2" style="color: #808080;"></i>
                                                    Shipping Details
                                                </h6>
                                            </div>
                                            <div class="card-body p-4" id="shippingSummary">
                                                <p class="mb-1">Loading...</p>
                                            </div>
                                        </div>
                                        
                                        <!-- Payment Method Card -->
                                        <div class="card mb-4" style="border: 2px solid #E5E7EB; border-radius: 24px; overflow: hidden;">
                                            <div class="card-header bg-light p-4" style="border-bottom: 2px solid #E5E7EB;">
                                                <h6 class="mb-0 d-flex align-items-center">
                                                    <i class="fas fa-credit-card me-2" style="color: #808080;"></i>
                                                    Payment Method
                                                </h6>
                                            </div>
                                            <div class="card-body p-4" id="paymentSummary">
                                                <p class="mb-1">Loading...</p>
                                            </div>
                                        </div>
                                        
                                        <!-- Total Card with #808080 -->
                                        <div class="card mb-4" style="border: 2px solid #808080; border-radius: 24px; overflow: hidden; background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);">
                                            <div class="card-body p-4">
                                                <div class="d-flex justify-content-between align-items-center">
                                                    <h4 class="mb-0" style="color: #2D3748; font-weight: 600;">Total Amount:</h4>
                                                    <h3 class="mb-0" style="color: #808080; font-weight: 700; font-size: 2rem;" id="confirmTotal">Rs 0</h3>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="form-check mb-4">
                                            <input class="form-check-input" type="checkbox" id="termsAgree" checked 
                                                   style="width: 18px; height: 18px; border: 2px solid #808080; border-radius: 5px;">
                                            <label class="form-check-label ms-2" for="termsAgree" style="color: #4B5563;">
                                                I agree to the <a href="#" style="color: #808080; font-weight: 600; text-decoration: none;">Terms & Conditions</a>
                                            </label>
                                        </div>
                                        
                                        <div class="d-flex justify-content-between mt-5">
                                            <button type="button" class="btn btn-lg prev-step" data-prev="2" 
                                                    style="background: white; color: #808080; border: 2px solid #808080; border-radius: 50px; padding: 12px 30px; font-weight: 600; transition: all 0.3s;"
                                                    onmouseover="this.style.background='#F3F4F6'"
                                                    onmouseout="this.style.background='white'">
                                                <i class="fas fa-arrow-left me-2"></i>Back
                                            </button>
                                            <button type="button" class="btn btn-lg" id="placeOrderBtn" 
                                                    style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; border: none; border-radius: 50px; padding: 12px 40px; font-weight: 600; box-shadow: 0 10px 20px -5px rgba(5,150,105,0.3); transition: all 0.3s;"
                                                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 15px 30px -5px rgba(5,150,105,0.4)'"
                                                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 20px -5px rgba(5,150,105,0.3)'">
                                                <i class="fas fa-check-circle me-2"></i>Place Order
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            
                            <div class="modal-footer bg-light p-4" style="border-top: 2px solid #E5E7EB;">
                                <div class="w-100">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="text-muted" style="font-size: 1rem;">Cart Total:</span>
                                        <span class="fw-bold" style="color: #808080; font-size: 1.5rem;" id="checkoutTotal">Rs 0</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            this.setupCheckoutEvents();
        }
    }

    // ===============================
    // SETUP ORDER SUCCESS MODAL
    // ===============================
    setupOrderSuccessModal() {
        if (!document.getElementById('orderSuccessModal')) {
            const modalHTML = `
                <div class="modal fade" id="orderSuccessModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content" style="border-radius: 28px; overflow: hidden; border: none; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
                            <!-- Success Header with Gradient -->
                            <div class="modal-header" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; border: none; padding: 30px; text-align: center; display: block; position: relative;">
                                <div style="position: absolute; top: 20px; right: 20px;">
                                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" style="opacity: 0.8; transition: all 0.3s;" 
                                            onmouseover="this.style.opacity='1'; this.style.transform='rotate(90deg)'" 
                                            onmouseout="this.style.opacity='0.8'; this.style.transform='rotate(0)'"></button>
                                </div>
                                <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; border: 4px solid rgba(255,255,255,0.3);">
                                    <i class="fas fa-check-circle fa-4x"></i>
                                </div>
                                <h3 style="font-weight: 700; margin-bottom: 10px;">Order Placed Successfully!</h3>
                                <p style="opacity: 0.9; margin: 0; font-size: 1.1rem;">Thank you for your purchase</p>
                            </div>
                            
                            <div class="modal-body p-4" style="background: #F9FAFB;">
                                <!-- Order ID Card -->
                                <div class="text-center mb-4">
                                    <p style="color: #6B7280; margin-bottom: 5px;">Your Order ID</p>
                                    <h2 style="color: #2D3748; font-weight: 700; letter-spacing: 1px; background: white; padding: 15px; border-radius: 50px; display: inline-block; box-shadow: 0 5px 15px rgba(0,0,0,0.05);" id="successOrderId">#ORD12345678</h2>
                                </div>
                                
                                <!-- Order Summary Card -->
                                <div class="card mb-4" style="border: 2px solid #E5E7EB; border-radius: 20px; overflow: hidden;">
                                    <div class="card-header bg-light p-3" style="border-bottom: 2px solid #E5E7EB;">
                                        <h6 class="mb-0 d-flex align-items-center">
                                            <i class="fas fa-shopping-bag me-2" style="color: #808080;"></i>
                                            Order Summary
                                        </h6>
                                    </div>
                                    <div class="card-body p-0">
                                        <div class="p-3" id="successOrderItems">
                                            <!-- Items will be inserted here -->
                                        </div>
                                        <div class="bg-light p-3 d-flex justify-content-between" style="border-top: 2px solid #E5E7EB;">
                                            <span class="fw-bold">Total Amount:</span>
                                            <span class="fw-bold" style="color: #808080; font-size: 1.2rem;" id="successOrderTotal">Rs 0</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Delivery Info Card -->
                                <div class="card mb-4" style="border: 2px solid #E5E7EB; border-radius: 20px; overflow: hidden;">
                                    <div class="card-header bg-light p-3" style="border-bottom: 2px solid #E5E7EB;">
                                        <h6 class="mb-0 d-flex align-items-center">
                                            <i class="fas fa-truck me-2" style="color: #808080;"></i>
                                            Delivery Information
                                        </h6>
                                    </div>
                                    <div class="card-body p-3" id="successDeliveryInfo">
                                        <!-- Delivery info will be inserted here -->
                                    </div>
                                </div>
                                
                                <!-- What's Next Section -->
                                <div class="bg-white p-4 rounded-4 mb-3" style="border: 2px solid #E5E7EB;">
                                    <h6 class="d-flex align-items-center mb-3">
                                        <i class="fas fa-clock me-2" style="color: #808080;"></i>
                                        What's Next?
                                    </h6>
                                    <div class="d-flex align-items-center mb-3">
                                        <div style="width: 40px; height: 40px; background: #F3F4F6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                                            <span style="color: #808080; font-weight: 700;">1</span>
                                        </div>
                                        <div>
                                            <p class="mb-0 fw-500">Order Confirmation</p>
                                            <small class="text-muted">We've sent a confirmation to your email</small>
                                        </div>
                                    </div>
                                    <div class="d-flex align-items-center mb-3">
                                        <div style="width: 40px; height: 40px; background: #F3F4F6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                                            <span style="color: #808080; font-weight: 700;">2</span>
                                        </div>
                                        <div>
                                            <p class="mb-0 fw-500">Processing</p>
                                            <small class="text-muted">Your order is being prepared</small>
                                        </div>
                                    </div>
                                    <div class="d-flex align-items-center">
                                        <div style="width: 40px; height: 40px; background: #F3F4F6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                                            <span style="color: #808080; font-weight: 700;">3</span>
                                        </div>
                                        <div>
                                            <p class="mb-0 fw-500">Delivery</p>
                                            <small class="text-muted">Your items will be delivered soon</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="modal-footer p-4" style="border-top: 2px solid #E5E7EB; background: white;">
                                <div class="d-flex gap-3 w-100">
                                    <button type="button" class="btn btn-lg flex-grow-1" id="viewOrdersBtn" 
                                            style="background: linear-gradient(135deg, #808080 0%, #6B7280 100%); color: white; border: none; border-radius: 50px; font-weight: 600; box-shadow: 0 10px 20px -5px rgba(128,128,128,0.3); transition: all 0.3s;font-size:15px;"
                                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 15px 30px -5px rgba(128,128,128,0.4)'"
                                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 20px -5px rgba(128,128,128,0.3)'">
                                        <i class="fas fa-history me-2"></i>View My Orders
                                    </button>
                                    <button type="button" class="btn btn-lg flex-grow-1" data-bs-dismiss="modal" 
                                            style="background: white; color: #808080; border: 2px solid #808080; border-radius: 50px;  font-weight: 600; transition: all 0.3s;font-size:15px; "
                                            onmouseover="this.style.background='#F3F4F6'"
                                            onmouseout="this.style.background='white'">
                                        <i class="fas fa-home me-2"></i>Continue Shopping
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Add event listener for view orders button
            const viewOrdersBtn = document.getElementById('viewOrdersBtn');
            if (viewOrdersBtn) {
                viewOrdersBtn.addEventListener('click', () => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('orderSuccessModal'));
                    if (modal) modal.hide();
                    window.location.href = 'order-history.html';
                });
            }
        }
    }

    setupCheckoutEvents() {
        // Next step buttons
        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const nextStep = parseInt(btn.dataset.next);
                this.goToStep(nextStep);
            });
        });

        // Previous step buttons
        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const prevStep = parseInt(btn.dataset.prev);
                this.goToStep(prevStep);
            });
        });

        // Place order button
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.placeOrder();
            });
        }
    }

    goToStep(stepNumber) {
        this.currentStep = stepNumber;
        
        // Hide all steps
        document.querySelectorAll('[id^="step"]').forEach(step => {
            step.style.display = 'none';
        });

        // Show current step
        const currentStep = document.getElementById(`step${stepNumber}`);
        if (currentStep) {
            currentStep.style.display = 'block';
        }

        // Update step indicators with animation
        document.querySelectorAll('.step').forEach((step, index) => {
            const circle = step.querySelector('.step-circle');
            const stepNum = index + 1;
            
            if (stepNum <= this.currentStep) {
                circle.style.background = '#808080';
                circle.style.color = 'white';
                circle.style.borderColor = '#808080';
            } else {
                circle.style.background = 'white';
                circle.style.color = '#9CA3AF';
                circle.style.borderColor = '#E5E7EB';
            }
        });

        // Update progress line
        const progressLine = document.getElementById('progressLine');
        if (progressLine) {
            progressLine.style.width = `${(this.currentStep - 1) * 38}%`;
        }

        // Update summaries for step 3
        if (stepNumber === 3) {
            this.updateOrderSummary();
            this.updateShippingSummary();
            this.updatePaymentSummary();
        }

        this.updateCheckoutTotal();
    }

    updateOrderSummary() {
        const cart = this.getCart();
        const container = document.getElementById('orderSummary');
        
        if (!container) return;
        
        if (cart.length === 0) {
            container.innerHTML = '<p class="text-muted p-4">No items in cart</p>';
            return;
        }

        let html = '<div class="list-group list-group-flush">';
        let subtotal = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            html += `
                <div class="list-group-item d-flex justify-content-between align-items-center p-4" style="border-bottom: 1px solid #E5E7EB;">
                    <div class="d-flex align-items-center">
                        <img src="assets/imgs2/${item.img}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 12px; margin-right: 15px;">
                        <div>
                            <h6 class="mb-1 fw-600" style="color: #2D3748;">${item.name}</h6>
                            <small class="text-muted">Qty: ${item.quantity} × Rs ${item.price.toLocaleString()}</small>
                        </div>
                    </div>
                    <span class="fw-bold" style="color: #808080; font-size: 1.1rem;">Rs ${itemTotal.toLocaleString()}</span>
                </div>
            `;
        });
        
        const shipping = 200;
        const total = subtotal + shipping;
        
        html += `
            <div class="list-group-item bg-light p-4">
                <div class="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span class="fw-500">Rs ${subtotal.toLocaleString()}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Shipping:</span>
                    <span class="fw-500">Rs ${shipping.toLocaleString()}</span>
                </div>
                <hr class="my-3">
                <div class="d-flex justify-content-between fw-bold">
                    <span style="font-size: 1.1rem;">Total:</span>
                    <span style="color: #808080; font-size: 1.2rem;">Rs ${total.toLocaleString()}</span>
                </div>
            </div>
        `;
        
        html += '</div>';
        container.innerHTML = html;
        
        // Update confirm total
        const confirmTotal = document.getElementById('confirmTotal');
        if (confirmTotal) {
            confirmTotal.textContent = `Rs ${total.toLocaleString()}`;
        }
    }

    updateShippingSummary() {
        const container = document.getElementById('shippingSummary');
        if (!container) return;
        
        const firstName = document.getElementById('firstName')?.value || '';
        const lastName = document.getElementById('lastName')?.value || '';
        const email = document.getElementById('email')?.value || '';
        const phone = document.getElementById('phone')?.value || '';
        const address = document.getElementById('address')?.value || '';
        const city = document.getElementById('city')?.value || '';
        const country = document.getElementById('country')?.value || '';

        container.innerHTML = `
            <div class="d-flex align-items-center mb-3">
                <div style="background: #F3F4F6; padding: 10px; border-radius: 12px; margin-right: 15px;">
                    <i class="fas fa-user fa-2x" style="color: #808080;"></i>
                </div>
                <div>
                    <p class="mb-1 fw-600" style="color: #2D3748;">${firstName} ${lastName}</p>
                    <p class="mb-1 small text-muted">${email}</p>
                    <p class="mb-0 small text-muted">${phone}</p>
                </div>
            </div>
            <div class="d-flex align-items-center">
                <div style="background: #F3F4F6; padding: 10px; border-radius: 12px; margin-right: 15px;">
                    <i class="fas fa-map-marker-alt fa-2x" style="color: #808080;"></i>
                </div>
                <div>
                    <p class="mb-0" style="color: #2D3748;">${address}</p>
                    <p class="mb-0 small text-muted">${city}, ${country}</p>
                </div>
            </div>
        `;
    }

    updatePaymentSummary() {
        const container = document.getElementById('paymentSummary');
        if (!container) return;
        
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        let methodText = 'Cash on Delivery';
        let methodIcon = 'fa-money-bill-wave';
        let methodColor = '#808080';
        
        if (paymentMethod) {
            if (paymentMethod.value === 'card') {
                methodText = 'Credit/Debit Card';
                methodIcon = 'fa-credit-card';
            } else if (paymentMethod.value === 'jazzcash') {
                methodText = 'JazzCash';
                methodIcon = 'fa-mobile-alt';
            }
        }

        container.innerHTML = `
            <div class="d-flex align-items-center">
                <div style="background: #F3F4F6; padding: 12px; border-radius: 12px; margin-right: 15px;">
                    <i class="fas ${methodIcon} fa-2x" style="color: ${methodColor};"></i>
                </div>
                <div>
                    <h6 class="mb-1 fw-600" style="color: #2D3748;">${methodText}</h6>
                    <p class="mb-0 small text-muted">Secure payment method</p>
                </div>
            </div>
        `;
    }

    updateCheckoutTotal() {
        const cart = this.getCart();
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal + 200;
        
        const totalElement = document.getElementById('checkoutTotal');
        if (totalElement) {
            totalElement.textContent = `Rs ${total.toLocaleString()}`;
        }
    }

    getCart() {
        return this.cartSystem ? this.cartSystem.cart : JSON.parse(localStorage.getItem('cart')) || [];
    }

    validateShipping() {
        const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'country'];
        for (let field of required) {
            const element = document.getElementById(field);
            if (!element || !element.value.trim()) {
                return false;
            }
        }
        return true;
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
        
        // Show checkout with slight delay
        setTimeout(() => {
            if (window.checkoutSystem) {
                console.log('Showing checkout modal');
                window.checkoutSystem.showCheckout();
            } else {
                console.error('Checkout system not initialized');
                this.showToast('Checkout system error. Please try again.', 'error');
            }
        }, 300);
    }

    // ===============================
    // PLACE ORDER
    // ===============================
    placeOrder() {
        // Validate shipping
        if (!this.validateShipping()) {
            if (window.authSystem) {
                window.authSystem.showToast('Please fill all shipping information', 'error');
            }
            
            // Highlight missing fields
            const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'country'];
            required.forEach(field => {
                const element = document.getElementById(field);
                if (!element || !element.value.trim()) {
                    element.style.borderColor = '#EF4444';
                    element.style.animation = 'shake 0.3s';
                    setTimeout(() => {
                        element.style.animation = '';
                    }, 300);
                }
            });
            return;
        }

        const cart = this.getCart();
        if (cart.length === 0) {
            if (window.authSystem) {
                window.authSystem.showToast('Your cart is empty!', 'error');
            }
            return;
        }

        // Check if user is logged in
        if (!window.authSystem || !window.authSystem.isLoggedIn()) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
            if (modal) modal.hide();
            
            setTimeout(() => {
                if (window.authSystem) window.authSystem.showLoginRequired(true);
            }, 300);
            return;
        }

        // Get current user
        const currentUser = window.authSystem.getCurrentUser();
        if (!currentUser) {
            window.authSystem.showToast('User not found. Please login again.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        // Calculate totals
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = 200;
        const total = subtotal + shipping;

        // Get payment method
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cod';

        // Create order
        const order = {
            id: 'ORD' + Date.now(),
            date: new Date().toISOString(),
            userEmail: currentUser.email,
            customer: {
                name: document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value,
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                postalCode: document.getElementById('postalCode').value,
                country: document.getElementById('country').value
            },
            payment: {
                method: paymentMethod
            },
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                img: item.img,
                quantity: item.quantity,
                total: item.price * item.quantity
            })),
            subtotal: subtotal,
            shipping: shipping,
            total: total,
            status: 'processing'
        };

        // Save order to orders array
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.orders.push(order);
        localStorage.setItem('orders', JSON.stringify(this.orders));

        // Add order ID to user's orders
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            if (!users[userIndex].orders) {
                users[userIndex].orders = [];
            }
            users[userIndex].orders.push(order.id);
            localStorage.setItem('users', JSON.stringify(users));
        }

        // Clear cart
        if (this.cartSystem) {
            this.cartSystem.cart = [];
            this.cartSystem.saveCart();
            this.cartSystem.updateCartCount();
        } else {
            localStorage.removeItem('cart');
        }

        // Close checkout modal
        const checkoutModal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
        if (checkoutModal) {
            checkoutModal.hide();
        }

        // Show success message
        if (window.authSystem) {
            window.authSystem.showToast('Order placed successfully!', 'success');
        }

        // Show beautiful success modal
        this.showOrderSuccessModal(order);
    }

    // ===============================
    // SHOW ORDER SUCCESS MODAL
    // ===============================
    showOrderSuccessModal(order) {
        // Update modal with order details
        const orderIdElement = document.getElementById('successOrderId');
        if (orderIdElement) {
            orderIdElement.textContent = `#${order.id}`;
        }

        const orderTotalElement = document.getElementById('successOrderTotal');
        if (orderTotalElement) {
            orderTotalElement.textContent = `Rs ${order.total.toLocaleString()}`;
        }

        // Update items list
        const itemsContainer = document.getElementById('successOrderItems');
        if (itemsContainer) {
            let itemsHtml = '';
            order.items.slice(0, 3).forEach(item => {
                itemsHtml += `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="d-flex align-items-center">
                            <span style="color: #2D3748;">${item.name}</span>
                            <span class="badge ms-2" style="background: #808080; color: white;">x${item.quantity}</span>
                        </div>
                        <span style="color: #808080;">Rs ${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                `;
            });
            if (order.items.length > 3) {
                itemsHtml += `<small class="text-muted">+${order.items.length - 3} more items</small>`;
            }
            itemsContainer.innerHTML = itemsHtml;
        }

        // Update delivery info
        const deliveryInfo = document.getElementById('successDeliveryInfo');
        if (deliveryInfo) {
            deliveryInfo.innerHTML = `
                <div class="d-flex align-items-center mb-2">
                    <i class="fas fa-user me-2" style="color: #808080; width: 20px;"></i>
                    <span>${order.customer.name}</span>
                </div>
                <div class="d-flex align-items-center mb-2">
                    <i class="fas fa-phone me-2" style="color: #808080; width: 20px;"></i>
                    <span>${order.customer.phone}</span>
                </div>
                <div class="d-flex align-items-center">
                    <i class="fas fa-map-marker-alt me-2" style="color: #808080; width: 20px;"></i>
                    <span>${order.customer.address}, ${order.customer.city}, ${order.customer.country}</span>
                </div>
            `;
        }

        // Show the modal
        const successModal = new bootstrap.Modal(document.getElementById('orderSuccessModal'));
        successModal.show();
    }

    // ===============================
    // SHOW CHECKOUT
    // ===============================
    showCheckout() {
        const cart = this.getCart();
        if (cart.length === 0) {
            if (window.authSystem) {
                window.authSystem.showToast('Your cart is empty!', 'error');
            }
            return;
        }

        // Reset to step 1
        this.currentStep = 1;
        
        // Show modal
        const modalEl = document.getElementById('checkoutModal');
        if (modalEl) {
            this.goToStep(1);
            this.updateCheckoutTotal();
            
            // Pre-fill email if logged in
            if (window.authSystem && window.authSystem.isLoggedIn()) {
                const emailField = document.getElementById('email');
                const user = window.authSystem.getCurrentUser();
                if (emailField && user) {
                    emailField.value = user.email || '';
                }
            }
            
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }
    }

    // ===============================
    // SHOW TOAST
    // ===============================
    showToast(message, type = 'success') {
        if (window.authSystem) {
            window.authSystem.showToast(message, type);
        }
    }
}

// Initialize checkout system
document.addEventListener('DOMContentLoaded', function() {
    if (!window.checkoutSystem && window.cartSystem) {
        window.checkoutSystem = new CheckoutSystem(window.cartSystem);
    }
});

// Make checkoutSystem available globally
window.CheckoutSystem = CheckoutSystem;

// Add shake animation for error feedback
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);