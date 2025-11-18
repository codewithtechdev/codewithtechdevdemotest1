// Checkout page functionality with Real Verifone Integration
document.addEventListener('DOMContentLoaded', function() {
    loadCheckoutItems();
    updateCartCount();
    setupVerifonePayment();
    
    // Add event listener to retry payment button
    document.getElementById('retry-payment').addEventListener('click', function() {
        document.getElementById('payment-failed').classList.add('hidden');
        document.querySelector('.checkout-container').classList.remove('hidden');
    });
});

// Load checkout items
function loadCheckoutItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');
    
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    // Display checkout items
    checkoutItems.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <div class="item-info">
                <span class="item-name">${item.name}</span>
                <span class="item-quantity">Qty: ${item.quantity}</span>
            </div>
            <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    checkoutTotal.textContent = total.toFixed(2);
    
    // Store total for payment processing
    window.orderTotal = total;
}

// Setup Verifone Payment
function setupVerifonePayment() {
    const verifonePayBtn = document.getElementById('verifone-pay-btn');
    const customerForm = document.getElementById('customer-form');
    
    verifonePayBtn.addEventListener('click', function() {
        // Validate customer form
        if (!validateCustomerForm()) {
            alert('Please fill in all required customer information.');
            return;
        }
        
        // Process payment with Verifone
        processVerifonePayment();
    });
}

// Validate customer form
function validateCustomerForm() {
    const name = document.getElementById('customer-name').value;
    const email = document.getElementById('customer-email').value;
    
    if (!name || !email) {
        return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }
    
    return true;
}

// Process payment with Verifone
async function processVerifonePayment() {
    const payButton = document.getElementById('verifone-pay-btn');
    const originalText = payButton.textContent;
    
    payButton.textContent = 'Processing...';
    payButton.disabled = true;
    
    try {
        // Get customer information
        const customerName = document.getElementById('customer-name').value;
        const customerEmail = document.getElementById('customer-email').value;
        const customerPhone = document.getElementById('customer-phone').value;
        
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const total = window.orderTotal;
        
        // Generate order ID
        const orderId = 'ORD_' + Date.now();
        
        // Initialize Verifone Checkout
        const verifoneConfig = {
            merchantId: '255781290131', // Replace with your actual merchant ID
            amount: total,
            currency: 'USD',
            orderId: orderId,
            customer: {
                name: customerName,
                email: customerEmail,
                phone: customerPhone
            },
            items: cart,
            onSuccess: function(paymentResult) {
                handlePaymentSuccess(paymentResult, orderId, customerEmail, cart, total);
            },
            onError: function(error) {
                handlePaymentError(error);
            },
            onCancel: function() {
                handlePaymentCancel();
            }
        };
        
        // Initialize Verifone Checkout
        if (typeof VerifoneCheckout !== 'undefined') {
            VerifoneCheckout.init(verifoneConfig);
            
            // Show Verifone payment modal
            document.getElementById('verifone-modal').classList.remove('hidden');
            
            // Render Verifone checkout
            VerifoneCheckout.render('verifone-checkout-container');
            
        } else {
            throw new Error('Verifone checkout library not loaded');
        }
        
    } catch (error) {
        console.error('Payment initialization error:', error);
        showPaymentError('Failed to initialize payment: ' + error.message);
        payButton.textContent = originalText;
        payButton.disabled = false;
    }
}

// Handle successful payment
async function handlePaymentSuccess(paymentResult, orderId, customerEmail, cart, total) {
    try {
        // Hide Verifone modal
        document.getElementById('verifone-modal').classList.add('hidden');
        
        // Save order to Supabase
        const orderData = {
            order_id: orderId,
            customer_name: document.getElementById('customer-name').value,
            customer_email: customerEmail,
            customer_phone: document.getElementById('customer-phone').value,
            total_amount: total,
            payment_status: 'completed',
            payment_reference: paymentResult.transactionId,
            transaction_id: paymentResult.transactionId,
            items: cart,
            created_at: new Date().toISOString()
        };
        
        const { data: order, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select();
        
        if (error) throw error;
        
        // Show success message with order details
        showPaymentSuccess(orderId, paymentResult.transactionId, total, cart);
        
        // Clear cart
        localStorage.removeItem('cart');
        updateCartCount();
        
    } catch (error) {
        console.error('Error saving order:', error);
        showPaymentError('Payment successful but order saving failed: ' + error.message);
    }
}

// Handle payment error
function handlePaymentError(error) {
    console.error('Verifone payment error:', error);
    document.getElementById('verifone-modal').classList.add('hidden');
    showPaymentError(error.message || 'Payment processing failed. Please try again.');
    
    // Re-enable payment button
    document.getElementById('verifone-pay-btn').disabled = false;
    document.getElementById('verifone-pay-btn').textContent = 'Pay with Verifone';
}

// Handle payment cancellation
function handlePaymentCancel() {
    document.getElementById('verifone-modal').classList.add('hidden');
    document.getElementById('verifone-pay-btn').disabled = false;
    document.getElementById('verifone-pay-btn').textContent = 'Pay with Verifone';
    alert('Payment was cancelled.');
}

// Show payment success
function showPaymentSuccess(orderId, transactionId, amount, cart) {
    document.querySelector('.checkout-container').classList.add('hidden');
    document.getElementById('payment-success').classList.remove('hidden');
    
    // Update order details
    document.getElementById('order-id').textContent = orderId;
    document.getElementById('transaction-id').textContent = transactionId;
    document.getElementById('amount-paid').textContent = amount.toFixed(2);
    
    // Generate download links
    const downloadLinks = document.getElementById('download-links');
    downloadLinks.innerHTML = `
        <h3>Your Digital Downloads</h3>
        <div class="downloads-list">
            ${cart.map(item => `
                <div class="download-item">
                    <h4>${item.name}</h4>
                    <a href="${item.download_url}" class="download-link" download target="_blank">
                        📥 Download File
                    </a>
                </div>
            `).join('')}
        </div>
    `;
    
    // Add print receipt functionality
    document.getElementById('print-receipt').addEventListener('click', function() {
        window.print();
    });
}

// Show payment error
function showPaymentError(message) {
    document.querySelector('.checkout-container').classList.add('hidden');
    document.getElementById('payment-failed').classList.remove('hidden');
    document.getElementById('error-message').textContent = message;
}

// Update cart count
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cart-count');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('verifone-modal');
    const closeBtn = document.querySelector('#verifone-modal .close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.classList.add('hidden');
        });
    }
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.classList.add('hidden');
        }
    });
});