// Main application functionality with error handling
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Main JS loaded - Error Handling Version");
    
    // Wait a bit for Supabase to initialize
    setTimeout(() => {
        if (document.getElementById('categories-section')) {
            loadCategories();
            loadProducts();
        }
        updateCartCount();
    }, 500);
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
    
    // Add event listeners
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            currentCategory = this.getAttribute('data-category');
            currentSubcategory = 'All';
            loadCategories();
            loadProducts();
        });
    });
    
    document.querySelectorAll('.subcategory-filter').forEach(filter => {
        filter.addEventListener('click', function() {
            currentSubcategory = this.getAttribute('data-subcategory');
            loadCategories();
            loadProducts();
        });
    });
}

// Main products loading with comprehensive error handling
async function loadProducts() {
    const categorySections = document.getElementById('category-sections');
    
    try {
        console.log("🔍 Attempting to load products from Supabase...");
        
        // Check if Supabase is available
        if (!window.supabase) {
            throw new Error("Supabase client not available");
        }
        
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'active');
        
        console.log("🔍 Supabase response - Products:", products, "Error:", error);
        
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
            displayNoProducts();
            return;
        }
        
        console.log(`✅ Successfully loaded ${products.length} products`);
        displayProductsByCategory(products);
        
    } catch (error) {
        console.error('❌ Main load failed:', error);
        await loadProductsFallback();
    }
}

// Fallback loading method
async function loadProductsFallback() {
    console.log("🔄 Using fallback product loading method...");
    
    try {
        // Method 1: Direct REST API call
        const response = await fetch('https://eubneyjjdjjxztdmitky.supabase.co/rest/v1/products?status=eq.active&select=*', {
            method: 'GET',
            headers: {
                'apikey': 'your-anon-key-here', // REPLACE WITH YOUR KEY
                'Authorization': 'Bearer your-anon-key-here', // REPLACE WITH YOUR KEY
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const products = await response.json();
            if (products.length > 0) {
                console.log("✅ Fallback successful, products loaded via REST API");
                displayProductsByCategory(products);
                return;
            }
        }
        
        // Method 2: Show demo products
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
            description: "Beautiful responsive portfolio website template with modern design",
            price: 29.99,
            main_category: "html-css-js",
            subcategory: "Portfolio",
            images: ["https://via.placeholder.com/400x300/4a6cf7/ffffff?text=Portfolio+Template"],
            is_opensource: false,
            status: "active"
        },
        {
            id: 2,
            name: "Python Calculator App",
            description: "Simple calculator application perfect for Python beginners",
            price: 0,
            main_category: "python",
            subcategory: "Beginner",
            images: ["https://via.placeholder.com/400x300/28a745/ffffff?text=Python+App"],
            is_opensource: true,
            status: "active"
        },
        {
            id: 3,
            name: "E-commerce Dashboard",
            description: "Complete admin dashboard for e-commerce applications",
            price: 49.99,
            main_category: "html-css-js", 
            subcategory: "E-commerce",
            images: ["https://via.placeholder.com/400x300/ff6b35/ffffff?text=E-commerce+Dash"],
            is_opensource: false,
            status: "active"
        }
    ];
    
    displayProductsByCategory(demoProducts);
    
    // Add development notice
    const categorySections = document.getElementById('category-sections');
    if (categorySections) {
        const notice = document.createElement('div');
        notice.className = 'dev-notice';
        notice.innerHTML = `
            <h3>🔧 Development Mode Active</h3>
            <p>Showing demo products. Real products will load when database connection is established.</p>
        `;
        categorySections.insertBefore(notice, categorySections.firstChild);
    }
}

// Display functions (keep your existing ones)
function displayProductsByCategory(products) {
    const categorySections = document.getElementById('category-sections');
    
    if (!products || products.length === 0) {
        categorySections.innerHTML = '<div class="no-products">No products available</div>';
        return;
    }
    
    // Your existing display logic here
    // ... [keep your existing displayProductsByCategory function]
}

function displayNoProducts() {
    const categorySections = document.getElementById('category-sections');
    categorySections.innerHTML = `
        <div class="no-products">
            <h3>📭 No Products Found</h3>
            <p>No products available in the database yet.</p>
            <a href="admin/products.html" class="btn-primary">Add Your First Product</a>
        </div>
    `;
}

function displayError(error) {
    const categorySections = document.getElementById('category-sections');
    categorySections.innerHTML = `
        <div class="error-message">
            <h3>⚠️ Connection Issue</h3>
            <p>Unable to load products from database.</p>
            <p><small>Error: ${error.message}</small></p>
            <button onclick="loadProducts()" class="btn-primary">Try Again</button>
        </div>
    `;
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
