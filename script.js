// =============================================
// 0. CONFIGURATION
// =============================================
const ADMIN_USERNAME = 'Aghaz';
const ADMIN_PASSWORD = 'Zaroon4455@';

// 🔑 YOUR SUPABASE KEYS
const SUPABASE_URL = 'https://fbdecpnteeoiwmimscj.supabase.co';  // ✅ No /rest/v1/
const SUPABASE_ANON_KEY = 'sb_publishable_iN8fmdNFzaUZCNHw2H09Jw_1dqX0_';

console.log('🔗 Connecting to Supabase...');
console.log('📡 URL:', SUPABASE_URL);

// Create the Supabase client
let supabaseClient;
try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client created');
} catch (e) {
    console.warn('⚠️ Could not create Supabase client:', e);
    supabaseClient = null;
}

// =============================================
// 1. DATA HELPERS
// =============================================

// Fetch products – try Supabase first
async function getProducts() {
    if (!supabaseClient) {
        console.warn('⚠️ No Supabase client, returning empty');
        return [];
    }

    try {
        console.log('📦 Fetching products from Supabase...');
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.error('❌ Supabase error:', error);
            return [];
        }

        console.log(`✅ Found ${data ? data.length : 0} products`);
        return data || [];
    } catch (e) {
        console.error('❌ Failed to fetch:', e);
        return [];
    }
}

// Add product to Supabase
async function addProductToDB(category, brand, model, specs, price, image, inStock) {
    if (!supabaseClient) {
        alert('❌ Supabase not connected. Check your internet and try again.');
        return null;
    }

    const newProduct = { category, brand, model, specs, price, image, inStock };

    try {
        console.log('➕ Adding product to Supabase...', newProduct);
        const { data, error } = await supabaseClient
            .from('products')
            .insert([newProduct])
            .select();

        if (error) {
            console.error('❌ Insert error:', error);
            alert('❌ Error: ' + error.message);
            return null;
        }

        console.log('✅ Product added to Supabase!', data);
        return data;
    } catch (e) {
        console.error('❌ Failed to add:', e);
        alert('❌ Network error: ' + e.message);
        return null;
    }
}

// Update product
async function updateProductInDB(id, category, brand, model, specs, price, image, inStock) {
    if (!supabaseClient) {
        alert('❌ Supabase not connected.');
        return null;
    }

    try {
        const { data, error } = await supabaseClient
            .from('products')
            .update({ category, brand, model, specs, price, image, inStock })
            .eq('id', id)
            .select();

        if (error) {
            console.error('❌ Update error:', error);
            alert('❌ Error: ' + error.message);
            return null;
        }
        return data;
    } catch (e) {
        console.error('❌ Failed to update:', e);
        alert('❌ Network error: ' + e.message);
        return null;
    }
}

// Delete product
async function deleteProductFromDB(id) {
    if (!supabaseClient) {
        alert('❌ Supabase not connected.');
        return false;
    }

    try {
        const { error } = await supabaseClient
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('❌ Delete error:', error);
            alert('❌ Error: ' + error.message);
            return false;
        }
        return true;
    } catch (e) {
        console.error('❌ Failed to delete:', e);
        alert('❌ Network error: ' + e.message);
        return false;
    }
}

// =============================================
// 2. TAB SWITCHING
// =============================================
let currentTab = 'laptops';
let searchTerms = {
    laptops: '',
    accessories: '',
    storage: ''
};

const tabToCategory = {
    'laptops': 'laptop',
    'accessories': 'accessory',
    'storage': 'storage'
};

window.switchTab = function(tab, btn) {
    console.log('🔄 Switching to tab:', tab);
    currentTab = tab;

    document.querySelectorAll('.tab-nav button').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');

    renderTabProducts(tab);
};

// =============================================
// 3. SEARCH FUNCTIONS
// =============================================
window.handleSearch = function(tab, term) {
    searchTerms[tab] = term.toLowerCase().trim();
    const clearBtn = document.getElementById(`clear-${tab}`);
    if (searchTerms[tab]) {
        clearBtn.classList.add('visible');
    } else {
        clearBtn.classList.remove('visible');
    }
    renderTabProducts(tab);
};

window.clearSearch = function(tab) {
    document.getElementById(`search-${tab}`).value = '';
    searchTerms[tab] = '';
    document.getElementById(`clear-${tab}`).classList.remove('visible');
    renderTabProducts(tab);
    document.getElementById(`search-${tab}`).focus();
};

// =============================================
// 4. RENDER PRODUCTS BY TAB
// =============================================
async function renderTabProducts(tab) {
    const products = await getProducts();
    const searchTerm = searchTerms[tab] || '';
    
    const category = tabToCategory[tab] || tab;
    let filtered = products.filter(p => p.category === category);

    if (searchTerm) {
        filtered = filtered.filter(p => {
            const searchable = [
                p.brand,
                p.model,
                p.specs,
                p.price,
                p.brand + ' ' + p.model
            ].join(' ').toLowerCase();
            return searchable.includes(searchTerm);
        });
    }

    const container = document.getElementById(`product-list-${tab}`);
    const statsEl = document.getElementById(`stats-${tab}`);
    const countEl = document.getElementById(`count-${tab}`);

    if (!container) return;

    if (searchTerm) {
        statsEl.textContent = `🔍 Found ${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${searchTerm}"`;
    } else {
        const categoryNames = {
            laptops: 'laptops',
            accessories: 'accessories',
            storage: 'storage devices'
        };
        statsEl.textContent = `Showing all ${filtered.length} ${categoryNames[tab] || 'products'}`;
    }

    if (filtered.length === 0 && searchTerm) {
        container.innerHTML = `
            <div class="no-results">
                <span class="emoji">🔍</span>
                <h3>No products found</h3>
                <p>We couldn't find any products matching "<strong>${searchTerm}</strong>"</p>
                <button onclick="window.clearSearch('${tab}')" style="margin-top:15px; padding:8px 24px; background:#2a7de1; color:white; border:none; border-radius:30px; cursor:pointer;">Clear Search</button>
            </div>
        `;
        countEl.textContent = '';
        return;
    }

    if (filtered.length === 0) {
        const messages = {
            laptops: 'No laptops available right now. Check back soon!',
            accessories: 'No accessories available right now. Check back soon!',
            storage: 'No storage devices available right now. Check back soon!'
        };
        container.innerHTML = `
            <div class="no-results">
                <span class="emoji">📦</span>
                <h3>No Products Yet</h3>
                <p>${messages[tab] || 'No products available.'}</p>
            </div>
        `;
        countEl.textContent = '';
        return;
    }

    countEl.textContent = `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`;

    const highlight = (text) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    };

    const categoryEmojis = {
        laptop: '💻',
        accessory: '🖱️',
        storage: '💾'
    };

    container.innerHTML = filtered.map(p => `
        <div class="product-card">
            ${p.image ? 
                `<img src="${p.image}" alt="${p.brand} ${p.model}" class="product-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />` :
                ''
            }
            <div class="product-image-placeholder" style="${p.image ? 'display:none;' : ''}">${categoryEmojis[p.category] || '📦'}</div>
            <div class="product-info">
                <div class="product-category">${categoryEmojis[p.category] || ''} ${p.category}</div>
                <h3>${highlight(p.brand)} ${highlight(p.model)}</h3>
                <div class="specs">${highlight(p.specs)}</div>
                <div class="price">${highlight(p.price)}</div>
                <span class="stock-badge ${p.inStock === false ? 'out-of-stock-badge' : ''}">
                    ${p.inStock !== false ? '✅ In Stock' : '❌ Out of Stock'}
                </span>
            </div>
        </div>
    `).join('');
}

// =============================================
// 5. RENDER ADMIN PRODUCT LIST
// =============================================
async function renderAdminProducts() {
    const products = await getProducts();
    const container = document.getElementById('admin-product-list');

    if (products.length === 0) {
        container.innerHTML = '<p style="color:#888; padding:20px;">No products added yet. Add your first product above!</p>';
        return;
    }

    const categoryEmojis = {
        laptop: '💻',
        accessory: '🖱️',
        storage: '💾'
    };

    container.innerHTML = products.map(p => `
        <div class="admin-product-item">
            ${p.image ? 
                `<img src="${p.image}" alt="${p.brand} ${p.model}" onerror="this.style.display='none';" />` :
                `<div style="width:60px;height:60px;background:#e8ecf1;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">${categoryEmojis[p.category] || '📦'}</div>`
            }
            <div class="item-info">
                <strong>${p.brand} ${p.model}</strong>
                <span class="category-badge">${p.category}</span>
                <span class="item-specs">${p.specs} – ${p.price}</span>
                <span style="font-size:0.8rem; color:${p.inStock !== false ? '#27ae60' : '#e74c3c'};">
                    ${p.inStock !== false ? '✅ In Stock' : '❌ Out of Stock'}
                </span>
            </div>
            <div class="item-actions">
                <button class="btn btn-primary btn-sm" onclick="window.editProduct(${p.id})">✏️ Edit</button>
                <button class="btn btn-danger btn-sm" onclick="window.deleteProduct(${p.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

// =============================================
// 6. CRUD OPERATIONS
// =============================================

document.getElementById('product-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const id = document.getElementById('product-edit-id').value;
    const category = document.getElementById('product-category').value;
    const brand = document.getElementById('product-brand').value.trim();
    const model = document.getElementById('product-model').value.trim();
    const specs = document.getElementById('product-specs').value.trim();
    const price = document.getElementById('product-price').value.trim();
    const image = document.getElementById('product-image').value.trim();
    const inStock = document.getElementById('product-instock').checked;

    if (!brand || !model || !specs || !price) {
        alert('Please fill in all required fields (*).');
        return;
    }

    let result;
    if (id) {
        result = await updateProductInDB(parseInt(id), category, brand, model, specs, price, image, inStock);
    } else {
        result = await addProductToDB(category, brand, model, specs, price, image, inStock);
    }

    if (result) {
        window.resetForm();
        renderAll();
        alert(id ? '✅ Product updated successfully!' : '✅ Product added successfully!');
    }
});

window.deleteProduct = async function(id) {
    if (!confirm('Delete this product?')) return;
    const success = await deleteProductFromDB(id);
    if (success) renderAll();
};

window.editProduct = async function(id) {
    const products = await getProducts();
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('product-edit-id').value = product.id;
    document.getElementById('product-category').value = product.category || 'laptop';
    document.getElementById('product-brand').value = product.brand;
    document.getElementById('product-model').value = product.model;
    document.getElementById('product-specs').value = product.specs;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-image').value = product.image || '';
    document.getElementById('product-instock').checked = product.inStock !== false;

    document.querySelector('#product-form button[type="submit"]').textContent = '✏️ Update Product';
    document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });
};

window.resetForm = function() {
    document.getElementById('product-edit-id').value = '';
    document.getElementById('product-category').value = 'laptop';
    document.getElementById('product-brand').value = '';
    document.getElementById('product-model').value = '';
    document.getElementById('product-specs').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-image').value = '';
    document.getElementById('product-instock').checked = true;
    document.querySelector('#product-form button[type="submit"]').textContent = '➕ Add Product';
};

// =============================================
// 7. ADMIN AUTHENTICATION
// =============================================

window.showAdminLogin = function() {
    document.getElementById('admin-login-overlay').classList.add('active');
    document.getElementById('admin-username').value = '';
    document.getElementById('admin-password').value = '';
    document.getElementById('admin-login-error').textContent = '';
    setTimeout(() => document.getElementById('admin-username').focus(), 100);
};

window.closeAdminLogin = function() {
    document.getElementById('admin-login-overlay').classList.remove('active');
};

window.adminLogin = function() {
    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value.trim();
    const errorEl = document.getElementById('admin-login-error');

    if (!username || !password) {
        errorEl.textContent = '❌ Please enter username and password.';
        return;
    }

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        errorEl.textContent = '';
        window.closeAdminLogin();
        openAdminPanel();
    } else {
        errorEl.textContent = '❌ Wrong username or password!';
        document.getElementById('admin-password').value = '';
        document.getElementById('admin-password').focus();
    }
};

document.getElementById('admin-password').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') window.adminLogin();
});
document.getElementById('admin-username').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') window.adminLogin();
});

function openAdminPanel() {
    document.getElementById('admin-panel').classList.add('active');
    document.getElementById('public-shop').style.display = 'none';
    document.getElementById('admin-username-display').textContent = ADMIN_USERNAME;
    renderAdminProducts();
    window.resetForm();
}

window.closeAdminPanel = function() {
    document.getElementById('admin-panel').classList.remove('active');
    document.getElementById('public-shop').style.display = 'block';
    renderTabProducts(currentTab);
};

window.adminLogout = function() {
    if (confirm('Logout from admin panel?')) {
        window.closeAdminPanel();
    }
};

// =============================================
// 8. RENDER ALL
// =============================================
function renderAll() {
    renderTabProducts(currentTab);
    if (document.getElementById('admin-panel').classList.contains('active')) {
        renderAdminProducts();
    }
}

// =============================================
// 9. SECRET ADMIN TRIGGERS & INIT
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Aghaz Laptops starting...');

    // Secret Trigger: Press "A" 3 times quickly
    let adminPressCount = 0;
    let adminPressTimer = null;
    
    document.addEventListener('keydown', function(e) {
        const tag = document.activeElement.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        
        if (e.key === 'a' || e.key === 'A') {
            adminPressCount++;
            clearTimeout(adminPressTimer);
            adminPressTimer = setTimeout(() => { adminPressCount = 0; }, 1000);
            if (adminPressCount >= 3) {
                adminPressCount = 0;
                window.showAdminLogin();
                console.log('🔑 Admin login triggered!');
            }
        }
    });

    if (window.location.search.includes('admin=true')) {
        window.showAdminLogin();
    }

    renderTabProducts('laptops');

    document.getElementById('admin-login-overlay').addEventListener('click', function(e) {
        if (e.target === this) window.closeAdminLogin();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') window.closeAdminLogin();
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            const searchInput = document.getElementById(`search-${currentTab}`);
            if (searchInput) { searchInput.focus(); searchInput.select(); }
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const tag = document.activeElement.tagName;
            if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
                e.preventDefault();
                const searchInput = document.getElementById(`search-${currentTab}`);
                if (searchInput) { searchInput.focus(); searchInput.select(); }
            }
        }
    });

    console.log('💻 Aghaz Laptops');
    console.log('🔑 Press "A" 3 times for admin');
    console.log('📞 Phone: 0344-1614488');
    console.log('🔑 Admin: ' + ADMIN_USERNAME + ' / ' + ADMIN_PASSWORD);
});