// Main application functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log("Main JS loaded");
    
    // Check if we're on the products page
    if (document.getElementById('categories-section')) {
        loadCategories();
        loadProducts();
    }
    
    // Check if we're on the product details page
    if (document.getElementById('product-details')) {
        loadProductDetails();
    }
    
    // Update cart count on all pages
    updateCartCount();
});

// Categories configuration
const categories = {
    "html-css-js": {
        name: "HTML/CSS/JS Projects",
        subcategories: ["All", "Portfolio", "UI/UX & Design", "Web Apps", "Games & Fun", "E-commerce", "Tools & Utilities", "Trending"]
    },
    "python": {
        name: "Python Projects", 
        subcategories: ["All", "Beginner", "Web/Backend", "Data & Analytics", "AI/ML", "Games", "Automation"]
    },
    "opensource": {
        name: "Open Source Projects",
        subcategories: ["All", "Web Templates", "Python Scripts", "UI Components", "Tools & Utilities"]
    }
};

let currentCategory = 'html-css-js';
let currentSubcategory = 'All';

// Load categories navigation
function loadCategories() {
    const categoriesSection = document.getElementById('categories-section');
    
    categoriesSection.innerHTML = `
        <h2 class="section-title">🚀 Browse Our Projects</h2>
        <div class="category-tabs" id="category-tabs">
            ${Object.keys(categories).map(catId => `
                <div class="category-tab ${catId === currentCategory ? 'active' : ''}" 
                     data-category="${catId}">
                    ${categories[catId].name}
                </div>
            `).join('')}
        </div>
        
        <div class="subcategory-filters" id="subcategory-filters">
            ${categories[currentCategory].subcategories.map(sub => `
                <div class="subcategory-filter ${sub === currentSubcategory ? 'active' : ''}" 
                     data-subcategory="${sub}">
                    ${sub}
                </div>
            `).join('')}
        </div>
        
        <div class="category-sections" id="category-sections">
            <div class="loading">Loading products...</div>
        </div>
    `;
    
    // Add event listeners for category tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            currentCategory = this.getAttribute('data-category');
            currentSubcategory = 'All';
            loadCategories();
            loadProducts();
        });
    });
    
    // Add event listeners for subcategory filters
    document.querySelectorAll('.subcategory-filter').forEach(filter => {
        filter.addEventListener('click', function() {
            currentSubcategory = this.getAttribute('data-subcategory');
            loadCategories();
            loadProducts();
        });
    });
}

// Load products from Supabase with category filtering
async function loadProducts() {
    try {
        console.log("Loading products for category:", currentCategory, "subcategory:", currentSubcategory);
        
        let query = supabase
            .from('products')
            .select('*')
            .eq('status', 'active');
        
        // Apply category filter
        if (currentCategory !== 'all') {
            query = query.eq('main_category', currentCategory);
        }
        
        // Apply subcategory filter
        if (currentSubcategory !== 'All') {
            query = query.eq('subcategory', currentSubcategory);
        }
        
        const { data: products, error } = await query;
        
        if (error) throw error;
        
        console.log("Products loaded:", products);
        displayProductsByCategory(products);
        
    } catch (error) {
        console.error('Error loading products:', error);
        const categorySections = document.getElementById('category-sections');
        if (categorySections) {
            categorySections.innerHTML = `
                <div class="error-message">
                    <h3>⚠️ Error Loading Products</h3>
                    <p>Unable to load products from database.</p>
                    <p><small>Error: ${error.message}</small></p>
                    <button onclick="loadProducts()" class="btn-primary">Try Again</button>
                </div>
            `;
        }
    }
}

// Display products organized by category
function displayProductsByCategory(products) {
    const categorySections = document.getElementById('category-sections');
    
    if (!products || products.length === 0) {
        categorySections.innerHTML = `
            <div class="no-products">
                <h3>No products found</h3>
                <p>No products available in this category yet.</p>
                <p>Check back soon or browse other categories!</p>
            </div>
        `;
        return;
    }
    
    // Group products by category
    const groupedProducts = {};
    Object.keys(categories).forEach(catId => {
        groupedProducts[catId] = products.filter(p => p.main_category === catId);
    });
    
    categorySections.innerHTML = Object.keys(categories).map(catId => {
        const categoryProducts = groupedProducts[catId];
        if (categoryProducts.length === 0 && currentCategory !== 'all') return '';
        
        return `
            <section class="category-section" id="${catId}">
                <h3 class="category-title">${categories[catId].name}</h3>
                <div class="products-grid">
                    ${categoryProducts.map(product => `
                        <div class="product-card" data-product-id="${product.id}">
                            <img src="${product.images && product.images.length > 0 ? product.images[0] : 'assets/images/placeholder.jpg'}" 
                                 alt="${product.name}" class="product-image">
                            <div class="product-info">
                                <h3 class="product-name">${product.name}</h3>
                                <p class="product-description">${product.description}</p>
                                <div class="product-meta">
                                    <span class="product-category">${product.subcategory}</span>
                                    ${product.is_opensource ? '<span class="free-badge">FREE</span>' : ''}
                                </div>
                                ${!product.is_opensource ? `
                                    <div class="product-price">$${product.price.toFixed(2)}</div>
                                ` : ''}
                                <div class="product-actions">
                                    <button class="btn-primary view-product" data-id="${product.id}">
                                        View Details
                                    </button>
                                    ${!product.is_opensource ? `
                                        <button class="btn-buy-now buy-now-product" data-id="${product.id}">
                                            Buy Now
                                        </button>
                                    ` : `
                                        <button class="btn-buy-now download-free" data-id="${product.id}">
                                            Download Free
                                        </button>
                                    `}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    }).join('');
    
    // Add event listeners
    setupProductEventListeners();
}

// Setup product event listeners
function setupProductEventListeners() {
    // View product details
    document.querySelectorAll('.view-product').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            window.location.href = `product-details.html?id=${productId}`;
        });
    });
    
    // Buy now functionality
    document.querySelectorAll('.buy-now-product').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            buyNowProduct(productId);
        });
    });
    
    // Download free products
    document.querySelectorAll('.download-free').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            downloadFreeProduct(productId);
        });
    });
}

// Buy now - direct to checkout with single product
async function buyNowProduct(productId) {
    try {
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();
        
        if (error) throw error;
        
        // Clear cart and add only this product
        const cart = [{
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.images && product.images.length > 0 ? product.images[0] : '',
            download_url: product.download_url,
            quantity: 1
        }];
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        window.location.href = 'checkout.html';
        
    } catch (error) {
        console.error('Error buying product:', error);
        alert('Error processing your request. Please try again.');
    }
}

// Download free product immediately
async function downloadFreeProduct(productId) {
    try {
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();
        
        if (error) throw error;
        
        // Save download record
        const downloadData = {
            product_id: productId,
            product_name: product.name,
            downloaded_at: new Date().toISOString(),
            type: 'free_download'
        };
        
        const { error: downloadError } = await supabase
            .from('downloads')
            .insert([downloadData]);
        
        if (downloadError) console.error('Error saving download:', downloadError);
        
        // Start download
        window.open(product.download_url, '_blank');
        
    } catch (error) {
        console.error('Error downloading product:', error);
        alert('Error downloading product. Please try again.');
    }
}

// Add to cart functionality
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.images && product.images.length > 0 ? product.images[0] : '',
            download_url: product.download_url,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Show confirmation
    alert(`${product.name} added to cart!`);
}

// Update cart count in navigation
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cart-count');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}


// Display product details with new features
function displayProductDetails(product) {
    const productDetails = document.getElementById('product-details');
    
    productDetails.innerHTML = `
        <div class="product-details-container">
            <div class="product-gallery">
                ${product.images && product.images.length > 0 ? `
                    <div class="main-image">
                        <img src="${product.images[0]}" alt="${product.name}">
                    </div>
                    ${product.images.length > 1 ? `
                        <div class="image-thumbnails">
                            ${product.images.map((img, index) => `
                                <img src="${img}" alt="${product.name} ${index + 1}" 
                                     onclick="changeMainImage('${img}')">
                            `).join('')}
                        </div>
                    ` : ''}
                ` : `
                    <div class="main-image">
                        <img src="assets/images/placeholder.jpg" alt="${product.name}">
                    </div>
                `}
            </div>
            
            <div class="product-details-info">
                <div class="product-header">
                    <h1>${product.name}</h1>
                    <div class="product-meta">
                        <span class="product-category">${product.main_category} • ${product.subcategory}</span>
                        ${product.is_opensource ? '<span class="free-badge">FREE</span>' : ''}
                    </div>
                </div>
                
                <div class="product-price-section">
                    ${!product.is_opensource ? `
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                    ` : `
                        <div class="product-price free">FREE</div>
                    `}
                </div>
                
                <div class="product-description">
                    <h3>Description</h3>
                    <p>${product.description}</p>
                </div>
                
                ${product.live_demo_url ? `
                    <div class="live-demo-section">
                        <a href="${product.live_demo_url}" target="_blank" class="btn-live-demo">
                            <i class="fas fa-external-link-alt"></i>
                            View Live Demo
                        </a>
                    </div>
                ` : ''}
                
                <div class="product-actions">
                    ${!product.is_opensource ? `
                        <button class="btn-primary" id="add-to-cart-btn" data-id="${product.id}">
                            <i class="fas fa-cart-plus"></i>
                            Add to Cart
                        </button>
                        <button class="btn-buy-now" id="buy-now-btn" data-id="${product.id}">
                            <i class="fas fa-bolt"></i>
                            Buy Now
                        </button>
                    ` : `
                        <button class="btn-buy-now" id="download-free-btn" data-id="${product.id}">
                            <i class="fas fa-download"></i>
                            Download Free
                        </button>
                    `}
                </div>
                
                <div class="product-features">
                    <h3>What's Included</h3>
                    <ul>
                        <li>✅ Complete source code</li>
                        <li>✅ Documentation</li>
                        <li>✅ Regular updates</li>
                        <li>✅ Technical support</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    if (!product.is_opensource) {
        document.getElementById('add-to-cart-btn').addEventListener('click', function() {
            addToCart(product);
        });
        document.getElementById('buy-now-btn').addEventListener('click', function() {
            buyNowProduct(product.id);
        });
    } else {
        document.getElementById('download-free-btn').addEventListener('click', function() {
            downloadFreeProduct(product.id);
        });
    }
}

// Change main image in gallery
function changeMainImage(src) {
    const mainImage = document.querySelector('.main-image img');
    if (mainImage) {
        mainImage.src = src;
    }
}