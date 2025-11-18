// Main application functionality with error handling
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Main JS loaded - CodeWithTechDev");
    
    // Wait for Supabase to initialize
    setTimeout(() => {
        if (document.getElementById('categories-section')) {
            loadCategories();
            loadProducts();
        }
        
        if (document.getElementById('product-details')) {
            loadProductDetails();
        }
        
        updateCartCount();
    }, 1000);
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
            <div class="loading">🔄 Loading products...</div>
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

// Load products from Supabase with comprehensive error handling
async function loadProducts() {
    try {
        console.log("🔍 Loading products for category:", currentCategory, "subcategory:", currentSubcategory);
        
        // Check if Supabase is available
        if (!window.supabase) {
            console.error("❌ Supabase client not available");
            throw new Error("Supabase client not initialized");
        }
        
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
        
        console.log("🔍 Query completed - Products:", products, "Error:", error);
        
        if (error) {
            // Handle navigatorLock error specifically
            if (error.message.includes('navigatorLock') || error.message.includes('LockManager')) {
                console.log("🔧 Detected navigatorLock error, using fallback...");
                await loadProductsFallback();
                return;
            }
            throw error;
        }
        
        if (!products || products.length === 0) {
            console.log("📭 No products found in database");
            showDemoProducts(); // Show demo products if no real products
            return;
        }
        
        console.log(`✅ Successfully loaded ${products.length} products`);
        displayProductsByCategory(products);
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        await loadProductsFallback();
    }
}

// Fallback loading method for navigatorLock errors
async function loadProductsFallback() {
    console.log("🔄 Using fallback product loading method...");
    
    try {
        // Try direct REST API call to bypass Supabase client issues
        const SUPABASE_URL = 'https://eubneyjjdjjxztdmitky.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1Ym5leWpqZGpqeHp0ZG1pdGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkyNjgxMjcsImV4cCI6MjAyNDg0NDEyN30.0K7AEXkr1hA3VXdHd9eC6dAVoV8s6v0kH6eL5q9q8kE'; // Your actual key
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?status=eq.active&select=*`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const products = await response.json();
            console.log("🔧 Fallback loaded products:", products);
            
            if (products && products.length > 0) {
                // Apply local filtering
                let filteredProducts = products;
                
                if (currentCategory !== 'all') {
                    filteredProducts = filteredProducts.filter(p => p.main_category === currentCategory);
                }
                
                if (currentSubcategory !== 'All') {
                    filteredProducts = filteredProducts.filter(p => p.subcategory === currentSubcategory);
                }
                
                if (filteredProducts.length > 0) {
                    console.log("✅ Fallback successful, products loaded via REST API");
                    displayProductsByCategory(filteredProducts);
                    return;
                }
            }
        }
        
        // If fallback API fails, show demo products
        console.log("🎨 Showing demo products");
        showDemoProducts();
        
    } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        showDemoProducts();
    }
}

// Show demo products when everything else fails
function showDemoProducts() {
    console.log("🎨 Loading demo products for display");
    
    const demoProducts = [
        {
            id: 1,
            name: "Premium Portfolio Template",
            description: "Beautiful responsive portfolio website template with modern design and mobile-first approach.",
            price: 29.99,
            main_category: "html-css-js",
            subcategory: "Portfolio",
            images: ["https://via.placeholder.com/400x300/4a6cf7/ffffff?text=Portfolio+Template"],
            download_url: "https://example.com/portfolio-template.zip",
            is_opensource: false,
            status: "active",
            live_demo_url: "https://example.com/demo"
        },
        {
            id: 2,
            name: "Python Calculator App",
            description: "Simple calculator application perfect for Python beginners with GUI interface.",
            price: 0,
            main_category: "python",
            subcategory: "Beginner",
            images: ["https://via.placeholder.com/400x300/28a745/ffffff?text=Python+App"],
            download_url: "https://example.com/python-calculator.zip",
            is_opensource: true,
            status: "active",
            live_demo_url: "https://example.com/python-demo"
        },
        {
            id: 3,
            name: "E-commerce Dashboard",
            description: "Complete admin dashboard for e-commerce applications with analytics and user management.",
            price: 49.99,
            main_category: "html-css-js", 
            subcategory: "E-commerce",
            images: ["https://via.placeholder.com/400x300/ff6b35/ffffff?text=E-commerce+Dash"],
            download_url: "https://example.com/ecommerce-dashboard.zip",
            is_opensource: false,
            status: "active"
        },
        {
            id: 4,
            name: "Data Analysis Toolkit",
            description: "Python scripts for data analysis and visualization using Pandas and Matplotlib.",
            price: 39.99,
            main_category: "python",
            subcategory: "Data & Analytics",
            images: ["https://via.placeholder.com/400x300/9c27b0/ffffff?text=Data+Tools"],
            download_url: "https://example.com/data-toolkit.zip",
            is_opensource: false,
            status: "active"
        },
        {
            id: 5,
            name: "Free UI Components Library",
            description: "Collection of reusable UI components for modern web applications.",
            price: 0,
            main_category: "opensource",
            subcategory: "UI Components",
            images: ["https://via.placeholder.com/400x300/ff9800/ffffff?text=UI+Library"],
            download_url: "https://example.com/ui-components.zip",
            is_opensource: true,
            status: "active"
        }
    ];
    
    // Filter demo products by current category/subcategory
    let filteredDemoProducts = demoProducts;
    
    if (currentCategory !== 'all') {
        filteredDemoProducts = filteredDemoProducts.filter(p => p.main_category === currentCategory);
    }
    
    if (currentSubcategory !== 'All') {
        filteredDemoProducts = filteredDemoProducts.filter(p => p.subcategory === currentSubcategory);
    }
    
    if (filteredDemoProducts.length === 0) {
        // If no demo products match current filter, show all demo products
        filteredDemoProducts = demoProducts;
    }
    
    displayProductsByCategory(filteredDemoProducts);
    
    // Add development notice
    const categorySections = document.getElementById('category-sections');
    if (categorySections) {
        const notice = document.createElement('div');
        notice.className = 'dev-notice';
        notice.innerHTML = `
            <h3>🔧 Development Mode Active</h3>
            <p>Showing demo products. Real products will load automatically when database connection is established.</p>
            <p><small>You can add real products through the admin panel.</small></p>
        `;
        categorySections.insertBefore(notice, categorySections.firstChild);
    }
}

// Display products organized by category
function displayProductsByCategory(products) {
    const categorySections = document.getElementById('category-sections');
    
    if (!products || products.length === 0) {
        categorySections.innerHTML = `
            <div class="no-products">
                <h3>📭 No Products Found</h3>
                <p>No products available in "${categories[currentCategory].name}" - "${currentSubcategory}" yet.</p>
                <p>Try selecting a different category or check back later.</p>
                <div class="no-products-actions">
                    <button onclick="loadProducts()" class="btn-secondary">Refresh</button>
                    <a href="admin/products.html" class="btn-primary">Add Products</a>
                </div>
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
                                 alt="${product.name}" class="product-image"
                                 onerror="this.src='assets/images/placeholder.jpg'">
                            <div class="product-info">
                                <h3 class="product-name">${product.name}</h3>
                                <p class="product-description">${product.description}</p>
                                <div class="product-meta">
                                    <span class="product-category">${product.subcategory}</span>
                                    ${product.is_opensource ? '<span class="free-badge">FREE</span>' : ''}
                                    ${product.live_demo_url ? '<span class="demo-badge">Live Demo</span>' : ''}
                                </div>
                                ${!product.is_opensource ? `
                                    <div class="product-price">$${product.price ? product.price.toFixed(2) : '0.00'}</div>
                                ` : ''}
                                <div class="product-actions">
                                    <button class="btn-primary view-product" data-id="${product.id}">
                                        <i class="fas fa-eye"></i> View Details
                                    </button>
                                    ${!product.is_opensource ? `
                                        <button class="btn-buy-now buy-now-product" data-id="${product.id}">
                                            <i class="fas fa-bolt"></i> Buy Now
                                        </button>
                                    ` : `
                                        <button class="btn-buy-now download-free" data-id="${product.id}">
                                            <i class="fas fa-download"></i> Download Free
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
        // Try to get product from Supabase first
        let product;
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();
            
            if (error) throw error;
            product = data;
        } catch (dbError) {
            console.log("🔧 Database error, using demo product data");
            // Use demo product data if database fails
            product = getDemoProductById(productId);
        }
        
        if (!product) {
            throw new Error("Product not found");
        }
        
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
        // Try to get product from Supabase first
        let product;
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();
            
            if (error) throw error;
            product = data;
        } catch (dbError) {
            console.log("🔧 Database error, using demo product data");
            // Use demo product data if database fails
            product = getDemoProductById(productId);
        }
        
        if (!product) {
            throw new Error("Product not found");
        }
        
        // Save download record if Supabase is working
        if (window.supabase) {
            try {
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
            } catch (saveError) {
                console.log("🔧 Could not save download record:", saveError);
            }
        }
        
        // Start download
        if (product.download_url && product.download_url !== 'https://example.com/template.zip') {
            window.open(product.download_url, '_blank');
        } else {
            alert('This is a demo product. In a real scenario, the download would start automatically.');
        }
        
    } catch (error) {
        console.error('Error downloading product:', error);
        alert('Error downloading product. Please try again.');
    }
}

// Helper function to get demo product by ID
function getDemoProductById(productId) {
    const demoProducts = [
        { id: 1, name: "Premium Portfolio Template", price: 29.99, images: ["https://via.placeholder.com/400x300/4a6cf7/ffffff?text=Portfolio+Template"], download_url: "https://example.com/portfolio-template.zip" },
        { id: 2, name: "Python Calculator App", price: 0, images: ["https://via.placeholder.com/400x300/28a745/ffffff?text=Python+App"], download_url: "https://example.com/python-calculator.zip" },
        { id: 3, name: "E-commerce Dashboard", price: 49.99, images: ["https://via.placeholder.com/400x300/ff6b35/ffffff?text=E-commerce+Dash"], download_url: "https://example.com/ecommerce-dashboard.zip" },
        { id: 4, name: "Data Analysis Toolkit", price: 39.99, images: ["https://via.placeholder.com/400x300/9c27b0/ffffff?text=Data+Tools"], download_url: "https://example.com/data-toolkit.zip" },
        { id: 5, name: "Free UI Components Library", price: 0, images: ["https://via.placeholder.com/400x300/ff9800/ffffff?text=UI+Library"], download_url: "https://example.com/ui-components.zip" }
    ];
    
    return demoProducts.find(p => p.id == productId);
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
    alert(`✅ ${product.name} added to cart!`);
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

// Load and display product details
async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        document.getElementById('product-details').innerHTML = '<p class="error">Product not found.</p>';
        return;
    }
    
    try {
        let product;
        
        // Try to load from Supabase first
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();
            
            if (error) throw error;
            product = data;
        } catch (dbError) {
            console.log("🔧 Database error, using demo product data");
            // Use demo product data if database fails
            product = getDemoProductById(productId);
            
            if (!product) {
                throw new Error("Product not found");
            }
            
            // Add additional demo data
            product.description = "This is a demo product description. In a real scenario, this would be loaded from the database.";
            product.main_category = "html-css-js";
            product.subcategory = "Portfolio";
            product.is_opensource = product.price === 0;
            product.live_demo_url = "https://example.com/demo";
        }
        
        displayProductDetails(product);
        
    } catch (error) {
        console.error('Error loading product details:', error);
        document.getElementById('product-details').innerHTML = 
            '<p class="error">Error loading product details.</p>';
    }
}

// Display product details with new features
function displayProductDetails(product) {
    const productDetails = document.getElementById('product-details');
    
    productDetails.innerHTML = `
        <div class="product-details-container">
            <div class="product-gallery">
                ${product.images && product.images.length > 0 ? `
                    <div class="main-image">
                        <img src="${product.images[0]}" alt="${product.name}" 
                             onerror="this.src='assets/images/placeholder.jpg'">
                    </div>
                    ${product.images.length > 1 ? `
                        <div class="image-thumbnails">
                            ${product.images.map((img, index) => `
                                <img src="${img}" alt="${product.name} ${index + 1}" 
                                     onclick="changeMainImage('${img}')"
                                     onerror="this.src='assets/images/placeholder.jpg'">
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
                        ${product.live_demo_url ? '<span class="demo-badge">Live Demo Available</span>' : ''}
                    </div>
                </div>
                
                <div class="product-price-section">
                    ${!product.is_opensource ? `
                        <div class="product-price">$${product.price ? product.price.toFixed(2) : '0.00'}</div>
                    ` : `
                        <div class="product-price free">FREE</div>
                    `}
                </div>
                
                <div class="product-description">
                    <h3>📋 Description</h3>
                    <p>${product.description || 'No description available.'}</p>
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
                    <h3>🎁 What's Included</h3>
                    <ul>
                        <li>✅ Complete source code</li>
                        <li>✅ Documentation & instructions</li>
                        <li>✅ Regular updates</li>
                        <li>✅ Technical support</li>
                        <li>✅ Mobile responsive design</li>
                        <li>✅ Cross-browser compatible</li>
                    </ul>
                </div>
                
                <div class="product-tech">
                    <h3>🛠️ Technology Stack</h3>
                    <div class="tech-tags">
                        ${product.main_category === 'html-css-js' ? `
                            <span class="tech-tag">HTML5</span>
                            <span class="tech-tag">CSS3</span>
                            <span class="tech-tag">JavaScript</span>
                            <span class="tech-tag">Responsive Design</span>
                        ` : ''}
                        ${product.main_category === 'python' ? `
                            <span class="tech-tag">Python</span>
                            <span class="tech-tag">Pip</span>
                            <span class="tech-tag">Virtual Environment</span>
                        ` : ''}
                        ${product.main_category === 'opensource' ? `
                            <span class="tech-tag">Open Source</span>
                            <span class="tech-tag">MIT License</span>
                            <span class="tech-tag">Community Support</span>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="development-notice">
            <p><strong>🔧 Development Notice:</strong> This is a demo store. Products will load from your Supabase database when you add them through the admin panel.</p>
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

// Make functions globally available for HTML onclick attributes
window.changeMainImage = changeMainImage;
window.loadProducts = loadProducts;
