// Admin Panel JavaScript - Simplified Working Version
console.log("Admin JS loaded!");

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
    // Initialize product management
    initProductManagement();
    
    // Setup logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('adminAuthenticated');
            window.location.href = '../index.html';
        });
    }
});

// Product Management
function initProductManagement() {
    console.log("Initializing product management...");
    
    const addProductBtn = document.getElementById('add-product-btn');
    const modal = document.getElementById('product-modal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancel-btn');
    const productForm = document.getElementById('product-form');
    
    // Debug: Check if elements exist
    console.log("Add button:", addProductBtn);
    console.log("Modal:", modal);
    console.log("Close button:", closeBtn);
    
    // Show modal when Add Product button is clicked
    if (addProductBtn && modal) {
        addProductBtn.addEventListener('click', function() {
            console.log("Add Product button clicked!");
            showModal();
        });
    } else {
        console.error("Required elements not found!");
    }
    
    // Close modal events
    if (closeBtn) {
        closeBtn.addEventListener('click', hideModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideModal);
    }
    
    // Close modal when clicking outside
    if (modal) {
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                hideModal();
            }
        });
    }
    
    // Form submission
    if (productForm) {
        productForm.addEventListener('submit', function(event) {
            event.preventDefault();
            saveProduct();
        });
    }
    
    // Load existing products
    loadProducts();
}

// Modal functions
function showModal() {
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    
    if (modal && modalTitle) {
        modalTitle.textContent = 'Add New Product';
        document.getElementById('product-form').reset();
        document.getElementById('product-id').value = '';
        modal.classList.remove('hidden');
        console.log("Modal shown!");
    }
}

function hideModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.add('hidden');
        console.log("Modal hidden!");
    }
}

// Load products from Supabase
async function loadProducts() {
    try {
        console.log("Loading products...");
        
        if (!window.supabase) {
            console.error("Supabase not loaded!");
            showMessage("Error: Database connection failed", "error");
            return;
        }
        
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error("Supabase error:", error);
            throw error;
        }
        
        console.log("Products loaded:", products);
        displayProducts(products);
        
    } catch (error) {
        console.error('Error loading products:', error);
        showMessage('Error loading products: ' + error.message, "error");
    }
}

// Display products in table
function displayProducts(products) {
    const tableBody = document.getElementById('products-table-body');
    
    if (!tableBody) {
        console.error("Products table body not found!");
        return;
    }
    
    if (!products || products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No products found. Add your first product!</td></tr>';
        return;
    }
    
    tableBody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>$${product.price ? product.price.toFixed(2) : '0.00'}</td>
            <td>
                <span class="status-${product.status}">
                    ${product.status === 'active' ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <button class="btn-edit" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Save product function
async function saveProduct() {
    console.log("Saving product...");
    
    const productId = document.getElementById('product-id').value;
    const productName = document.getElementById('product-name').value;
    const productPrice = document.getElementById('product-price').value;
    
    if (!productName || !productPrice) {
        showMessage("Please fill in all required fields", "error");
        return;
    }
    
    const productData = {
        name: productName,
        description: document.getElementById('product-description').value,
        price: parseFloat(productPrice),
        image_url: document.getElementById('product-image').value,
        download_url: document.getElementById('product-file').value,
        status: document.getElementById('product-status').value,
        updated_at: new Date().toISOString()
    };
    
    try {
        if (productId) {
            // Update existing product
            const { data, error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', productId);
            
            if (error) throw error;
            showMessage("Product updated successfully!", "success");
        } else {
            // Create new product
            productData.created_at = new Date().toISOString();
            const { data, error } = await supabase
                .from('products')
                .insert([productData]);
            
            if (error) throw error;
            showMessage("Product created successfully!", "success");
        }
        
        hideModal();
        loadProducts(); // Reload the products list
        
    } catch (error) {
        console.error('Error saving product:', error);
        showMessage('Error saving product: ' + error.message, "error");
    }
}

// Edit product
async function editProduct(productId) {
    try {
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();
        
        if (error) throw error;
        
        document.getElementById('modal-title').textContent = 'Edit Product';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-image').value = product.image_url || '';
        document.getElementById('product-file').value = product.download_url || '';
        document.getElementById('product-status').value = product.status;
        
        showModal();
        
    } catch (error) {
        console.error('Error loading product for edit:', error);
        showMessage('Error loading product details', "error");
    }
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);
        
        if (error) throw error;
        
        showMessage("Product deleted successfully!", "success");
        loadProducts();
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showMessage('Error deleting product: ' + error.message, "error");
    }
}

// Show message function
function showMessage(message, type) {
    const messageDiv = document.getElementById('admin-message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
        messageDiv.style.background = type === 'success' ? '#d4edda' : '#f8d7da';
        messageDiv.style.color = type === 'success' ? '#155724' : '#721c24';
        messageDiv.style.border = type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

// Make functions global for onclick attributes
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;

// Admin product management with categories
const adminCategories = {
    "html-css-js": {
        name: "HTML/CSS/JS Projects",
        subcategories: ["Portfolio", "UI/UX & Design", "Web Apps", "Games & Fun", "E-commerce", "Tools & Utilities", "Trending"]
    },
    "python": {
        name: "Python Projects",
        subcategories: ["Beginner", "Web/Backend", "Data & Analytics", "AI/ML", "Games", "Automation"]
    },
    "opensource": {
        name: "Open Source Projects", 
        subcategories: ["Web Templates", "Python Scripts", "UI Components", "Tools & Utilities"]
    }
};

// Initialize product management with categories
function initProductManagement() {
    console.log("Initializing product management with categories...");
    
    const addProductBtn = document.getElementById('add-product-btn');
    const modal = document.getElementById('product-modal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancel-btn');
    const productForm = document.getElementById('product-form');
    const mainCategorySelect = document.getElementById('main-category');
    const isOpensourceCheckbox = document.getElementById('is-opensource');
    const priceInput = document.getElementById('product-price');
    
    // Setup main category change event
    if (mainCategorySelect) {
        mainCategorySelect.addEventListener('change', function() {
            updateSubcategories(this.value);
            
            // Auto-set opensource for Open Source category
            if (this.value === 'opensource') {
                isOpensourceCheckbox.checked = true;
                priceInput.value = '0';
                priceInput.disabled = true;
            } else {
                isOpensourceCheckbox.checked = false;
                priceInput.disabled = false;
            }
        });
    }
    
    // Setup opensource checkbox event
    if (isOpensourceCheckbox) {
        isOpensourceCheckbox.addEventListener('change', function() {
            if (this.checked) {
                priceInput.value = '0';
                priceInput.disabled = true;
            } else {
                priceInput.disabled = false;
            }
        });
    }
    
    // Show modal when Add Product button is clicked
    if (addProductBtn && modal) {
        addProductBtn.addEventListener('click', function() {
            showModal();
        });
    }
    
    // Close modal events
    if (closeBtn) closeBtn.addEventListener('click', hideModal);
    if (cancelBtn) cancelBtn.addEventListener('click', hideModal);
    
    // Close modal when clicking outside
    if (modal) {
        window.addEventListener('click', function(event) {
            if (event.target === modal) hideModal();
        });
    }
    
    // Form submission
    if (productForm) {
        productForm.addEventListener('submit', function(event) {
            event.preventDefault();
            saveProduct();
        });
    }
    
    // Load existing products
    loadProducts();
}

// Update subcategories based on main category
function updateSubcategories(mainCategory) {
    const subcategorySelect = document.getElementById('subcategory');
    subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
    
    if (mainCategory && adminCategories[mainCategory]) {
        adminCategories[mainCategory].subcategories.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub;
            option.textContent = sub;
            subcategorySelect.appendChild(option);
        });
    }
}

// Save product with category data
async function saveProduct() {
    console.log("Saving product...");
    
    const productId = document.getElementById('product-id').value;
    const productName = document.getElementById('product-name').value;
    const mainCategory = document.getElementById('main-category').value;
    const subcategory = document.getElementById('subcategory').value;
    const isOpensource = document.getElementById('is-opensource').checked;
    
    if (!productName || !mainCategory || !subcategory) {
        showMessage("Please fill in all required fields", "error");
        return;
    }
    
    const productData = {
        name: productName,
        description: document.getElementById('product-description').value,
        main_category: mainCategory,
        subcategory: subcategory,
        // Convert images textarea to array
        images: document.getElementById('product-images').value.split('\n').filter(url => url.trim() !== ''),
        download_url: document.getElementById('product-file').value,
        live_demo_url: document.getElementById('live-demo-url').value || null,
        is_opensource: isOpensource,
        price: isOpensource ? 0 : parseFloat(document.getElementById('product-price').value),
        status: document.getElementById('product-status').value,
        updated_at: new Date().toISOString()
    };
    
    try {
        if (productId) {
            // Update existing product
            const { data, error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', productId);
            
            if (error) throw error;
            showMessage("Product updated successfully!", "success");
        } else {
            // Create new product
            productData.created_at = new Date().toISOString();
            const { data, error } = await supabase
                .from('products')
                .insert([productData]);
            
            if (error) throw error;
            showMessage("Product created successfully!", "success");
        }
        
        hideModal();
        loadProducts(); // Reload the products list
        
    } catch (error) {
        console.error('Error saving product:', error);
        showMessage('Error saving product: ' + error.message, "error");
    }
}

// Edit product - load category data
async function editProduct(productId) {
    try {
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();
        
        if (error) throw error;
        
        document.getElementById('modal-title').textContent = 'Edit Product';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description || '';
        
        // Set main category and update subcategories
        document.getElementById('main-category').value = product.main_category || '';
        updateSubcategories(product.main_category);
        
        // Set subcategory after a short delay to ensure options are loaded
        setTimeout(() => {
            document.getElementById('subcategory').value = product.subcategory || '';
        }, 100);
        
        // Set images (array to text)
        document.getElementById('product-images').value = (product.images || []).join('\n');
        document.getElementById('product-file').value = product.download_url || '';
        document.getElementById('live-demo-url').value = product.live_demo_url || '';
        document.getElementById('is-opensource').checked = product.is_opensource || false;
        document.getElementById('product-price').value = product.price || 0;
        document.getElementById('product-status').value = product.status;
        
        // Handle price field for opensource products
        if (product.is_opensource) {
            document.getElementById('product-price').disabled = true;
        }
        
        showModal();
        
    } catch (error) {
        console.error('Error loading product for edit:', error);
        showMessage('Error loading product details', "error");
    }
}