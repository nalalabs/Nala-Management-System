/* ============================================
   NALA AIRCON - DATABASE LAYER
   Supabase connection with localStorage fallback
   Includes proper sync between modules
   ============================================ */

// ========== CONFIGURATION ==========
const SUPABASE_URL = 'https://kmgobitaptkyufepsovo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_AsU20RPtLj9UCMTxtegbxg_yFzKUAru';

// ========== INITIALIZATION ==========
let supabaseClient = null;
let useLocalStorage = true;

if (typeof window.supabase !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        useLocalStorage = false;
        console.log('✅ Supabase connected');
    } catch (e) {
        console.warn('⚠️ Supabase failed, using localStorage:', e.message);
    }
} else {
    console.log('📦 Using localStorage for data storage');
}

// ========== HELPER FUNCTIONS ==========

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount || 0);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getCurrentPeriod() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function generateId() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ========== LOCAL STORAGE HELPERS ==========

const localDB = {
    get(key) {
        try {
            const data = localStorage.getItem('nala_' + key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },
    
    set(key, data) {
        try {
            localStorage.setItem('nala_' + key, JSON.stringify(data));
            return true;
        } catch (e) {
            return false;
        }
    },
    
    add(key, item) {
        const data = this.get(key);
        item.id = item.id || generateId();
        item.created_at = item.created_at || new Date().toISOString();
        data.push(item);
        this.set(key, data);
        return item;
    },
    
    update(key, id, updates) {
        const data = this.get(key);
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates, updated_at: new Date().toISOString() };
            this.set(key, data);
            return data[index];
        }
        return null;
    },
    
    delete(key, id) {
        const data = this.get(key);
        const filtered = data.filter(item => item.id !== id);
        this.set(key, filtered);
        return true;
    },
    
    find(key, id) {
        const data = this.get(key);
        return data.find(item => item.id === id) || null;
    },
    
    filter(key, filterFn) {
        const data = this.get(key);
        return data.filter(filterFn);
    }
};

// ========== DATABASE OPERATIONS ==========

const db = {
    // ===== EMPLOYEES =====
    employees: {
        async getAll(branch = null) {
            if (useLocalStorage) {
                let data = localDB.get('employees');
                if (branch) data = data.filter(e => e.branch === branch);
                return data.filter(e => e.is_active !== false);
            }
            let query = supabaseClient.from('employees').select('*').eq('is_active', true);
            if (branch) query = query.eq('branch', branch);
            const { data, error } = await query.order('name');
            if (error) throw error;
            return data || [];
        },
        
        async getById(id) {
            if (useLocalStorage) return localDB.find('employees', id);
            const { data, error } = await supabaseClient.from('employees').select('*').eq('id', id).single();
            if (error) throw error;
            return data;
        },
        
        async create(employee) {
            if (useLocalStorage) return localDB.add('employees', { ...employee, is_active: true });
            const { data, error } = await supabaseClient.from('employees').insert([employee]).select().single();
            if (error) throw error;
            return data;
        },
        
        async update(id, updates) {
            if (useLocalStorage) return localDB.update('employees', id, updates);
            const { data, error } = await supabaseClient.from('employees').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return data;
        },
        
        async delete(id) {
            if (useLocalStorage) return localDB.update('employees', id, { is_active: false });
            const { error } = await supabaseClient.from('employees').update({ is_active: false }).eq('id', id);
            if (error) throw error;
        }
    },

    // ===== CUSTOMERS =====
    customers: {
        async getAll(type = null) {
            if (useLocalStorage) {
                let data = localDB.get('customers');
                if (type) data = data.filter(c => c.type === type);
                return data;
            }
            let query = supabaseClient.from('customers').select('*');
            if (type) query = query.eq('type', type);
            const { data, error } = await query.order('name');
            if (error) throw error;
            return data || [];
        },
        
        async create(customer) {
            if (useLocalStorage) return localDB.add('customers', customer);
            const { data, error } = await supabaseClient.from('customers').insert([customer]).select().single();
            if (error) throw error;
            return data;
        },
        
        async update(id, updates) {
            if (useLocalStorage) return localDB.update('customers', id, updates);
            const { data, error } = await supabaseClient.from('customers').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return data;
        },
        
        async delete(id) {
            if (useLocalStorage) return localDB.delete('customers', id);
            const { error } = await supabaseClient.from('customers').delete().eq('id', id);
            if (error) throw error;
        }
    },

    // ===== PROJECTS =====
    projects: {
        async getAll(status = null) {
            if (useLocalStorage) {
                let data = localDB.get('projects');
                if (status) data = data.filter(p => p.status === status);
                return data;
            }
            let query = supabaseClient.from('projects').select('*');
            if (status) query = query.eq('status', status);
            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        
        async create(project) {
            if (useLocalStorage) return localDB.add('projects', project);
            const { data, error } = await supabaseClient.from('projects').insert([project]).select().single();
            if (error) throw error;
            return data;
        },
        
        async update(id, updates) {
            if (useLocalStorage) return localDB.update('projects', id, updates);
            const { data, error } = await supabaseClient.from('projects').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return data;
        }
    },

    // ===== ATTENDANCE =====
    attendance: {
        async getByDate(date, branch = null) {
            if (useLocalStorage) {
                let data = localDB.filter('attendance', a => a.date === date);
                if (branch) data = data.filter(a => a.branch === branch);
                return data;
            }
            let query = supabaseClient.from('attendance').select('*, employee:employees(name, level, branch)').eq('date', date);
            if (branch) query = query.eq('branch', branch);
            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        
        async getByEmployee(employeeId, startDate, endDate) {
            if (useLocalStorage) {
                return localDB.filter('attendance', a => 
                    a.employee_id === employeeId && a.date >= startDate && a.date <= endDate
                );
            }
            const { data, error } = await supabaseClient.from('attendance')
                .select('*').eq('employee_id', employeeId).gte('date', startDate).lte('date', endDate);
            if (error) throw error;
            return data || [];
        },
        
        async create(record) {
            if (useLocalStorage) return localDB.add('attendance', record);
            const { data, error } = await supabaseClient.from('attendance').insert([record]).select().single();
            if (error) throw error;
            return data;
        },
        
        async update(id, updates) {
            if (useLocalStorage) return localDB.update('attendance', id, updates);
            const { data, error } = await supabaseClient.from('attendance').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return data;
        }
    },

    // ===== LEAVE REQUESTS =====
    leaveRequests: {
        async getPending() {
            if (useLocalStorage) return localDB.filter('leave_requests', r => r.status === 'pending');
            const { data, error } = await supabaseClient.from('leave_requests')
                .select('*, employee:employees(name, level, branch)').eq('status', 'pending');
            if (error) throw error;
            return data || [];
        },
        
        async create(request) {
            if (useLocalStorage) return localDB.add('leave_requests', { ...request, status: 'pending' });
            const { data, error } = await supabaseClient.from('leave_requests').insert([request]).select().single();
            if (error) throw error;
            return data;
        },
        
        async approve(id, approvedBy) {
            if (useLocalStorage) return localDB.update('leave_requests', id, { status: 'approved', approved_by: approvedBy });
            const { data, error } = await supabaseClient.from('leave_requests')
                .update({ status: 'approved', approved_by: approvedBy }).eq('id', id).select().single();
            if (error) throw error;
            return data;
        },
        
        async reject(id, approvedBy) {
            if (useLocalStorage) return localDB.update('leave_requests', id, { status: 'rejected', approved_by: approvedBy });
            const { data, error } = await supabaseClient.from('leave_requests')
                .update({ status: 'rejected', approved_by: approvedBy }).eq('id', id).select().single();
            if (error) throw error;
            return data;
        }
    },

    // ===== INVENTORY =====
    inventory: {
        async getAll(category = null) {
            if (useLocalStorage) {
                let data = localDB.get('inventory');
                if (category) data = data.filter(i => i.category === category);
                return data;
            }
            let query = supabaseClient.from('inventory').select('*');
            if (category) query = query.eq('category', category);
            const { data, error } = await query.order('name');
            if (error) throw error;
            return data || [];
        },
        
        async getById(id) {
            if (useLocalStorage) return localDB.find('inventory', id);
            const { data, error } = await supabaseClient.from('inventory').select('*').eq('id', id).single();
            if (error) throw error;
            return data;
        },
        
        async findMatch(criteria) {
            // Find inventory item by matching criteria
            const all = await this.getAll();
            return all.find(item => {
                if (criteria.category && item.category !== criteria.category) return false;
                if (criteria.type && item.type !== criteria.type) return false;
                if (criteria.brand && item.brand !== criteria.brand) return false;
                if (criteria.size && item.size !== criteria.size) return false;
                if (criteria.capacity && item.capacity !== criteria.capacity) return false;
                return true;
            });
        },
        
        async create(item) {
            if (useLocalStorage) return localDB.add('inventory', item);
            const { data, error } = await supabaseClient.from('inventory').insert([item]).select().single();
            if (error) throw error;
            return data;
        },
        
        async update(id, updates) {
            if (useLocalStorage) return localDB.update('inventory', id, updates);
            const { data, error } = await supabaseClient.from('inventory')
                .update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
            if (error) throw error;
            return data;
        },
        
        async delete(id) {
            if (useLocalStorage) return localDB.delete('inventory', id);
            const { error } = await supabaseClient.from('inventory').delete().eq('id', id);
            if (error) throw error;
        },
        
        // Add stock (from purchase) - simple version without movements
        async addStock(id, quantity, referenceType = '', referenceId = '', notes = '') {
            const item = await this.getById(id);
            if (!item) throw new Error('Item not found');
            
            const newQuantity = (item.quantity || 0) + quantity;
            await this.update(id, { quantity: newQuantity });
            
            // Try to record movement (optional - won't fail if table doesn't exist)
            try {
                if (db.inventoryMovements && db.inventoryMovements.create) {
                    await db.inventoryMovements.create({
                        inventory_id: id,
                        type: 'in',
                        quantity: quantity,
                        reference_type: referenceType,
                        reference_id: referenceId,
                        notes: notes
                    });
                }
            } catch (e) {
                console.warn('Inventory movement not recorded:', e.message);
            }
            
            return { ...item, quantity: newQuantity };
        },
        
        // Reduce stock (from project/sale) - simple version without movements
        async reduceStock(id, quantity, referenceType = '', referenceId = '', notes = '') {
            const item = await this.getById(id);
            if (!item) throw new Error('Item not found');
            
            const newQuantity = Math.max(0, (item.quantity || 0) - quantity);
            await this.update(id, { quantity: newQuantity });
            
            // Try to record movement (optional - won't fail if table doesn't exist)
            try {
                if (db.inventoryMovements && db.inventoryMovements.create) {
                    await db.inventoryMovements.create({
                        inventory_id: id,
                        type: 'out',
                        quantity: quantity,
                        reference_type: referenceType,
                        reference_id: referenceId,
                        notes: notes
                    });
                }
            } catch (e) {
                console.warn('Inventory movement not recorded:', e.message);
            }
            
            return { ...item, quantity: newQuantity };
        }
    },

    // ===== INVENTORY MOVEMENTS =====
    inventoryMovements: {
        async getAll(inventoryId = null) {
            if (useLocalStorage) {
                let data = localDB.get('inventory_movements');
                if (inventoryId) data = data.filter(m => m.inventory_id === inventoryId);
                return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            }
            let query = supabaseClient.from('inventory_movements').select('*, inventory:inventory(name)');
            if (inventoryId) query = query.eq('inventory_id', inventoryId);
            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        
        async getByReference(referenceType, referenceId) {
            if (useLocalStorage) {
                return localDB.filter('inventory_movements', m => 
                    m.reference_type === referenceType && m.reference_id === referenceId
                );
            }
            const { data, error } = await supabaseClient.from('inventory_movements')
                .select('*').eq('reference_type', referenceType).eq('reference_id', referenceId);
            if (error) throw error;
            return data || [];
        },
        
        async create(movement) {
            if (useLocalStorage) return localDB.add('inventory_movements', movement);
            const { data, error } = await supabaseClient.from('inventory_movements').insert([movement]).select().single();
            if (error) throw error;
            return data;
        },
        
        async delete(id) {
            if (useLocalStorage) return localDB.delete('inventory_movements', id);
            const { error } = await supabaseClient.from('inventory_movements').delete().eq('id', id);
            if (error) throw error;
        },
        
        async deleteByReference(referenceType, referenceId) {
            if (useLocalStorage) {
                const data = localDB.get('inventory_movements');
                const filtered = data.filter(m => 
                    !(m.reference_type === referenceType && m.reference_id === referenceId)
                );
                localDB.set('inventory_movements', filtered);
                return true;
            }
            const { error } = await supabaseClient.from('inventory_movements')
                .delete().eq('reference_type', referenceType).eq('reference_id', referenceId);
            if (error) throw error;
        }
    },

    // ===== EXPENSES =====
    expenses: {
        async getAll(category = null) {
            if (useLocalStorage) {
                let data = localDB.get('expenses');
                if (category) data = data.filter(e => e.category === category);
                return data.sort((a, b) => new Date(b.date) - new Date(a.date));
            }
            let query = supabaseClient.from('expenses').select('*');
            if (category) query = query.eq('category', category);
            const { data, error } = await query.order('date', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        
        async getById(id) {
            if (useLocalStorage) return localDB.find('expenses', id);
            const { data, error } = await supabaseClient.from('expenses').select('*').eq('id', id).single();
            if (error) throw error;
            return data;
        },
        
        async create(expense) {
            if (useLocalStorage) return localDB.add('expenses', expense);
            const { data, error } = await supabaseClient.from('expenses').insert([expense]).select().single();
            if (error) throw error;
            return data;
        },
        
        async update(id, updates) {
            if (useLocalStorage) return localDB.update('expenses', id, updates);
            const { data, error } = await supabaseClient.from('expenses').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return data;
        },
        
        async delete(id) {
            if (useLocalStorage) return localDB.delete('expenses', id);
            const { error } = await supabaseClient.from('expenses').delete().eq('id', id);
            if (error) throw error;
        },
        
        /**
         * Create expense with inventory sync
         * FLOW: FINANCING → INVENTORY (Stok Masuk)
         */
        async createWithInventorySync(expenseData) {
            // 1. Create expense record
            const expense = await this.create(expenseData);
            
            // 2. If material category, sync to inventory
            if (expenseData.category === 'material' && expenseData.material_type && expenseData.quantity) {
                const material = CONFIG.materials[expenseData.material_type] || {};
                const materialName = [
                    material.name || expenseData.material_type,
                    expenseData.material_brand,
                    expenseData.material_size
                ].filter(Boolean).join(' ');
                
                const unitPrice = expenseData.quantity > 0 ? 
                    expenseData.amount / expenseData.quantity : 0;
                
                // Find existing inventory item
                let inventoryItem = await db.inventory.findMatch({
                    category: 'material',
                    type: expenseData.material_type,
                    brand: expenseData.material_brand || null,
                    size: expenseData.material_size || null
                });
                
                if (inventoryItem) {
                    // Add stock to existing
                    await db.inventory.addStock(
                        inventoryItem.id,
                        parseFloat(expenseData.quantity),
                        'purchase',
                        expense.id,
                        `Pembelian dari Financing`
                    );
                    // Update unit price
                    await db.inventory.update(inventoryItem.id, { unit_price: unitPrice });
                } else {
                    // Create new inventory item
                    inventoryItem = await db.inventory.create({
                        name: materialName,
                        category: 'material',
                        type: expenseData.material_type,
                        brand: expenseData.material_brand || null,
                        size: expenseData.material_size || null,
                        quantity: 0, // Will be added via addStock
                        unit: material.unit || 'pcs',
                        min_stock: 10,
                        unit_price: unitPrice,
                        location: 'makassar'
                    });
                    // Add stock and record movement
                    await db.inventory.addStock(
                        inventoryItem.id,
                        parseFloat(expenseData.quantity),
                        'purchase',
                        expense.id,
                        `Pembelian baru dari Financing`
                    );
                }
                
                // Update expense with synced inventory ID
                await this.update(expense.id, { 
                    synced_to: 'inventory',
                    synced_id: inventoryItem.id 
                });
            }
            
            // 3. If AC unit category, sync to inventory
            if (expenseData.category === 'unit_ac' && expenseData.ac_brand && expenseData.quantity) {
                const acName = ['AC', expenseData.ac_brand, expenseData.ac_capacity, expenseData.ac_type]
                    .filter(Boolean).join(' ');
                
                const unitPrice = expenseData.quantity > 0 ? 
                    expenseData.amount / expenseData.quantity : 0;
                
                let inventoryItem = await db.inventory.findMatch({
                    category: 'ac_unit',
                    brand: expenseData.ac_brand,
                    type: expenseData.ac_type || null,
                    capacity: expenseData.ac_capacity || null
                });
                
                if (inventoryItem) {
                    await db.inventory.addStock(
                        inventoryItem.id,
                        parseFloat(expenseData.quantity),
                        'purchase',
                        expense.id,
                        `Pembelian Unit AC dari Financing`
                    );
                    await db.inventory.update(inventoryItem.id, { unit_price: unitPrice });
                } else {
                    inventoryItem = await db.inventory.create({
                        name: acName,
                        category: 'ac_unit',
                        brand: expenseData.ac_brand,
                        type: expenseData.ac_type || null,
                        capacity: expenseData.ac_capacity || null,
                        quantity: 0,
                        unit: 'unit',
                        min_stock: 2,
                        unit_price: unitPrice,
                        location: 'makassar'
                    });
                    await db.inventory.addStock(
                        inventoryItem.id,
                        parseFloat(expenseData.quantity),
                        'purchase',
                        expense.id,
                        `Pembelian Unit AC baru dari Financing`
                    );
                }
                
                await this.update(expense.id, { 
                    synced_to: 'inventory',
                    synced_id: inventoryItem.id 
                });
            }
            
            return expense;
        },
        
        /**
         * Delete expense and reverse inventory sync
         */
        async deleteWithInventorySync(id) {
            const expense = await this.getById(id);
            if (!expense) throw new Error('Expense not found');
            
            // If synced to inventory, reverse the stock addition
            if (expense.synced_to === 'inventory' && expense.synced_id) {
                // Get movements for this expense
                const movements = await db.inventoryMovements.getByReference('purchase', id);
                
                for (const movement of movements) {
                    if (movement.type === 'in') {
                        // Reduce stock
                        const item = await db.inventory.getById(movement.inventory_id);
                        if (item) {
                            const newQuantity = Math.max(0, (item.quantity || 0) - movement.quantity);
                            await db.inventory.update(movement.inventory_id, { quantity: newQuantity });
                        }
                    }
                }
                
                // Delete the movements
                await db.inventoryMovements.deleteByReference('purchase', id);
            }
            
            // Delete the expense
            await this.delete(id);
        }
    },

    // ===== KASBON =====
    kasbon: {
        async getAll() {
            if (useLocalStorage) return localDB.get('kasbon');
            const { data, error } = await supabaseClient.from('kasbon').select('*, employee:employees(name, level)');
            if (error) throw error;
            return data || [];
        },
        
        async getByEmployee(employeeId) {
            if (useLocalStorage) return localDB.filter('kasbon', k => k.employee_id === employeeId);
            const { data, error } = await supabaseClient.from('kasbon').select('*').eq('employee_id', employeeId);
            if (error) throw error;
            return data || [];
        },
        
        async getActive() {
            if (useLocalStorage) return localDB.filter('kasbon', k => k.status === 'active');
            const { data, error } = await supabaseClient.from('kasbon')
                .select('*, employee:employees(name, level)').eq('status', 'active');
            if (error) throw error;
            return data || [];
        },
        
        async create(kasbon) {
            if (useLocalStorage) return localDB.add('kasbon', { ...kasbon, status: 'active' });
            const { data, error } = await supabaseClient.from('kasbon').insert([kasbon]).select().single();
            if (error) throw error;
            return data;
        },
        
        async markPaid(id) {
            if (useLocalStorage) return localDB.update('kasbon', id, { status: 'paid', paid_at: new Date().toISOString() });
            const { data, error } = await supabaseClient.from('kasbon')
                .update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', id).select().single();
            if (error) throw error;
            return data;
        }
    },

    // ===== KPI RECORDS =====
    kpi: {
        async getAllByPeriod(period) {
            if (useLocalStorage) return localDB.filter('kpi_records', k => k.period === period);
            const { data, error } = await supabaseClient.from('kpi_records')
                .select('*, employee:employees(name, level, branch)').eq('period', period);
            if (error) throw error;
            return data || [];
        },
        
        async getByEmployee(employeeId, period = null) {
            if (useLocalStorage) {
                let data = localDB.filter('kpi_records', k => k.employee_id === employeeId);
                if (period) data = data.filter(k => k.period === period);
                return data;
            }
            let query = supabaseClient.from('kpi_records').select('*').eq('employee_id', employeeId);
            if (period) query = query.eq('period', period);
            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        
        async upsert(employeeId, period, kpiData) {
            if (useLocalStorage) {
                const existing = localDB.filter('kpi_records', k => 
                    k.employee_id === employeeId && k.period === period
                )[0];
                
                if (existing) {
                    return localDB.update('kpi_records', existing.id, kpiData);
                } else {
                    return localDB.add('kpi_records', { employee_id: employeeId, period, ...kpiData });
                }
            }
            
            // Check if record exists first
            const existing = await this.getByEmployee(employeeId, period);
            
            if (existing && existing.length > 0) {
                // Update existing record
                const { data, error } = await supabaseClient.from('kpi_records')
                    .update({ ...kpiData, updated_at: new Date().toISOString() })
                    .eq('employee_id', employeeId)
                    .eq('period', period)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            } else {
                // Insert new record
                const { data, error } = await supabaseClient.from('kpi_records')
                    .insert([{ employee_id: employeeId, period, ...kpiData }])
                    .select()
                    .single();
                if (error) throw error;
                return data;
            }
        },
        
        /**
         * Add KPI achievement and optionally deduct inventory
         * FLOW: KPI → INVENTORY (Stok Keluar)
         */
        async addAchievementWithInventory(employeeId, period, jobType, materials = []) {
            // 1. Update KPI record
            const existing = (await this.getByEmployee(employeeId, period))[0] || {
                cuci_ac: 0, pasang_ac: 0, bongkar_pasang: 0, service_berat: 0
            };
            existing[jobType] = (existing[jobType] || 0) + 1;
            await this.upsert(employeeId, period, existing);
            
            // 2. Deduct materials from inventory if specified
            for (const mat of materials) {
                if (mat.inventory_id && mat.quantity) {
                    await db.inventory.reduceStock(
                        mat.inventory_id,
                        mat.quantity,
                        'project',
                        `${employeeId}_${period}_${jobType}`,
                        `Penggunaan untuk ${jobType}`
                    );
                }
            }
        }
    },

    // ===== INCOME (Pemasukan) =====
    income: {
        async getAll() {
            if (useLocalStorage) return localDB.get('income').sort((a, b) => new Date(b.date) - new Date(a.date));
            const { data, error } = await supabaseClient.from('income').select('*').order('date', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        
        async create(income) {
            if (useLocalStorage) return localDB.add('income', income);
            const { data, error } = await supabaseClient.from('income').insert([income]).select().single();
            if (error) throw error;
            return data;
        },
        
        async delete(id) {
            if (useLocalStorage) return localDB.delete('income', id);
            const { error } = await supabaseClient.from('income').delete().eq('id', id);
            if (error) throw error;
        }
    },

    // ===== SALARY SLIPS =====
    salarySlips: {
        async getByPeriod(period) {
            if (useLocalStorage) return localDB.filter('salary_slips', s => s.period === period);
            const { data, error } = await supabaseClient.from('salary_slips')
                .select('*, employee:employees(name, level, branch)').eq('period', period);
            if (error) throw error;
            return data || [];
        },
        
        async getByEmployee(employeeId, period = null) {
            if (useLocalStorage) {
                let data = localDB.filter('salary_slips', s => s.employee_id === employeeId);
                if (period) data = data.filter(s => s.period === period);
                return data;
            }
            let query = supabaseClient.from('salary_slips').select('*').eq('employee_id', employeeId);
            if (period) query = query.eq('period', period);
            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        
        async create(slip) {
            if (useLocalStorage) return localDB.add('salary_slips', slip);
            const { data, error } = await supabaseClient.from('salary_slips').insert([slip]).select().single();
            if (error) throw error;
            return data;
        },
        
        async update(id, updates) {
            if (useLocalStorage) return localDB.update('salary_slips', id, updates);
            const { data, error } = await supabaseClient.from('salary_slips').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return data;
        }
    },

    // ===== BOOKINGS (FRESHMO) =====
    bookings: {
        async getAll(status = null) {
            if (useLocalStorage) {
                let data = localDB.get('bookings');
                if (status) data = data.filter(b => b.status === status);
                return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            }
            let query = supabaseClient.from('bookings').select('*');
            if (status) query = query.eq('status', status);
            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        
        async getByDate(date) {
            if (useLocalStorage) {
                return localDB.filter('bookings', b => b.service_date === date);
            }
            const { data, error } = await supabaseClient.from('bookings')
                .select('*').eq('service_date', date).order('service_time');
            if (error) throw error;
            return data || [];
        },
        
        async getById(id) {
            if (useLocalStorage) return localDB.find('bookings', id);
            const { data, error } = await supabaseClient.from('bookings').select('*').eq('id', id).single();
            if (error) throw error;
            return data;
        },
        
        async create(booking) {
            const newBooking = {
                ...booking,
                status: booking.status || 'pending',
                created_at: new Date().toISOString()
            };
            if (useLocalStorage) return localDB.add('bookings', newBooking);
            const { data, error } = await supabaseClient.from('bookings').insert([newBooking]).select().single();
            if (error) throw error;
            return data;
        },
        
        async update(id, updates) {
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString()
            };
            if (useLocalStorage) return localDB.update('bookings', id, updateData);
            const { data, error } = await supabaseClient.from('bookings')
                .update(updateData).eq('id', id).select().single();
            if (error) throw error;
            return data;
        },
        
        async delete(id) {
            if (useLocalStorage) return localDB.delete('bookings', id);
            const { error } = await supabaseClient.from('bookings').delete().eq('id', id);
            if (error) throw error;
        }
    }
};

// Export for global use
window.db = db;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.getCurrentPeriod = getCurrentPeriod;
window.generateId = generateId;

console.log('📦 Database layer ready (mode: ' + (useLocalStorage ? 'localStorage' : 'Supabase') + ')');
