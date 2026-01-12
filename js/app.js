/* ============================================
   NALA AIRCON - MAIN APPLICATION
   Aplikasi utama dan inisialisasi
   ============================================ */

class App {
    constructor() {
        this.isInitialized = false;
        this.currentModule = null;
        this.init();
    }

    async init() {
        try {
            console.log(`🚀 Initializing ${CONFIG.app.name} v${CONFIG.app.version}`);
            
            // Wait for DOM
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.onReady());
            } else {
                this.onReady();
            }
        } catch (error) {
            console.error('App initialization error:', error);
        }
    }

    onReady() {
        // Initialize components
        this.initializeComponents();
        
        // Bind global events
        this.bindGlobalEvents();
        
        // Load initial data
        this.loadDashboardData();
        
        // Mark as initialized
        this.isInitialized = true;
        
        console.log('✅ App initialized successfully');
    }

    initializeComponents() {
        // Components are auto-initialized via their own DOMContentLoaded events
        // This is for any additional setup
    }

    bindGlobalEvents() {
        // Module change event
        window.addEventListener('moduleChange', (e) => {
            this.handleModuleChange(e.detail.module);
        });

        // Global search event
        window.addEventListener('globalSearch', (e) => {
            this.handleGlobalSearch(e.detail.query);
        });

        // Quick action event
        window.addEventListener('quickAction', (e) => {
            this.handleQuickAction(e.detail.action);
        });

        // Online/offline status
        window.addEventListener('online', () => {
            toast.success('Koneksi internet kembali');
            header?.setSyncStatus('synced');
        });

        window.addEventListener('offline', () => {
            toast.warning('Tidak ada koneksi internet');
            header?.setSyncStatus('error');
        });

        // Before unload warning (if needed)
        window.addEventListener('beforeunload', (e) => {
            // Check if there are unsaved changes
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    handleModuleChange(module) {
        this.currentModule = module;
        console.log('Module changed:', module.name);
        
        // Update page title
        header?.setPageTitle(module.name, module.description);
    }

    handleGlobalSearch(query) {
        console.log('Global search:', query);
        
        // Implement global search across all modules
        toast.info(`Mencari: "${query}"`, 'Pencarian');
    }

    handleQuickAction(action) {
        console.log('Quick action:', action);

        switch (action) {
            case 'add-expense':
                this.showAddExpenseModal();
                break;
            case 'add-income':
                this.showAddIncomeModal();
                break;
            case 'add-material':
                this.showAddMaterialModal();
                break;
            case 'add-project':
                this.showAddProjectModal();
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    // ========== DASHBOARD DATA ==========
    async loadDashboardData() {
        try {
            // Check if db is available
            if (typeof db === 'undefined') {
                console.warn('Database not available, using default values');
                this.updateStatCards({
                    totalIncome: 0,
                    totalExpense: 0,
                    activeProjects: 0,
                    pendingTasks: 0
                });
                return;
            }

            // Load data from database in parallel
            const [employees, projects, expenses, inventory] = await Promise.all([
                db.employees.getAll().catch(() => []),
                db.projects.getAll().catch(() => []),
                db.expenses.getAll().catch(() => []),
                db.inventory.getAll().catch(() => [])
            ]);
            
            // Calculate stats
            const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
            const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'in_progress').length;
            const lowStockItems = inventory.filter(i => i.quantity <= (i.min_stock || 5)).length;
            
            // Update stat cards
            this.updateStatCards({
                totalIncome: 0, // Will be calculated from completed projects
                totalExpense: totalExpense,
                activeProjects: activeProjects,
                pendingTasks: lowStockItems
            });

            // Create recent activities from latest data
            const recentActivities = [];
            
            // Add recent expenses
            const recentExpenses = expenses.slice(0, 2);
            recentExpenses.forEach(exp => {
                recentActivities.push({
                    type: 'expense',
                    text: exp.description || 'Pengeluaran ' + formatCurrency(exp.amount),
                    time: formatDate(exp.date)
                });
            });
            
            // Add active projects info
            const latestProjects = projects.filter(p => p.status === 'active').slice(0, 2);
            latestProjects.forEach(proj => {
                recentActivities.push({
                    type: 'project',
                    text: `Proyek ${proj.name} aktif`,
                    time: formatDate(proj.start_date)
                });
            });

            this.updateRecentActivities(recentActivities.length > 0 ? recentActivities : [
                { type: 'info', text: 'Belum ada aktivitas terbaru', time: 'Hari ini' }
            ]);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Don't show toast for dashboard errors, just log them
        }
    }

    updateStatCards(data) {
        // Update income card
        const incomeValue = document.querySelector('[data-stat="income"] .stat-card-value');
        if (incomeValue) {
            incomeValue.textContent = formatCurrency(data.totalIncome);
        }

        // Update expense card
        const expenseValue = document.querySelector('[data-stat="expense"] .stat-card-value');
        if (expenseValue) {
            expenseValue.textContent = formatCurrency(data.totalExpense);
        }

        // Update projects card
        const projectsValue = document.querySelector('[data-stat="projects"] .stat-card-value');
        if (projectsValue) {
            projectsValue.textContent = data.activeProjects;
        }

        // Update tasks card
        const tasksValue = document.querySelector('[data-stat="tasks"] .stat-card-value');
        if (tasksValue) {
            tasksValue.textContent = data.pendingTasks;
        }
    }

    updateRecentActivities(activities) {
        const container = document.getElementById('recentActivities');
        if (!container) return;

        const icons = {
            expense: 'wallet',
            income: 'money',
            project: 'package',
            attendance: 'clock'
        };

        const colors = {
            expense: 'danger',
            income: 'success',
            project: 'primary',
            attendance: 'info'
        };

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${colors[activity.type]}">
                    ${Cards.getIcon(icons[activity.type])}
                </div>
                <div class="activity-content">
                    <p class="activity-text">${activity.text}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }

    // ========== MODAL HANDLERS ==========
    async showAddExpenseModal() {
        const result = await modal.form({
            title: 'Tambah Pengeluaran',
            size: 'md',
            fields: [
                {
                    name: 'category',
                    label: 'Kategori',
                    type: 'select',
                    required: true,
                    options: CONFIG.expenseCategories.map(cat => ({
                        value: cat.id,
                        label: cat.name
                    }))
                },
                {
                    name: 'amount',
                    label: 'Jumlah (Rp)',
                    type: 'number',
                    required: true,
                    placeholder: '0'
                },
                {
                    name: 'description',
                    label: 'Keterangan',
                    type: 'textarea',
                    placeholder: 'Deskripsi pengeluaran...'
                },
                {
                    name: 'date',
                    label: 'Tanggal',
                    type: 'date',
                    required: true,
                    value: new Date().toISOString().split('T')[0]
                }
            ]
        });

        if (result) {
            console.log('Add expense:', result);
            toast.success('Pengeluaran berhasil ditambahkan');
            // TODO: Save to database
        }
    }

    async showAddIncomeModal() {
        toast.info('Pemasukan otomatis dari modul KPI');
    }

    async showAddMaterialModal() {
        const materialTypes = Object.keys(CONFIG.materials).map(key => ({
            value: key,
            label: CONFIG.materials[key].name
        }));

        const result = await modal.form({
            title: 'Tambah Material',
            size: 'md',
            fields: [
                {
                    name: 'type',
                    label: 'Jenis Material',
                    type: 'select',
                    required: true,
                    options: materialTypes
                },
                {
                    name: 'quantity',
                    label: 'Jumlah',
                    type: 'number',
                    required: true,
                    placeholder: '0'
                },
                {
                    name: 'price',
                    label: 'Harga (Rp)',
                    type: 'number',
                    required: true,
                    placeholder: '0'
                },
                {
                    name: 'supplier',
                    label: 'Supplier/Toko',
                    type: 'text',
                    placeholder: 'Nama supplier...'
                }
            ]
        });

        if (result) {
            console.log('Add material:', result);
            toast.success('Material berhasil ditambahkan ke inventory');
        }
    }

    async showAddProjectModal() {
        const result = await modal.form({
            title: 'Tambah Proyek Baru',
            size: 'lg',
            fields: [
                {
                    name: 'name',
                    label: 'Nama Proyek',
                    type: 'text',
                    required: true,
                    placeholder: 'Contoh: Instalasi AC Hotel Empress'
                },
                {
                    name: 'customer',
                    label: 'Customer',
                    type: 'text',
                    required: true,
                    placeholder: 'Nama customer...'
                },
                {
                    name: 'location',
                    label: 'Lokasi',
                    type: 'text',
                    required: true,
                    placeholder: 'Alamat proyek...'
                },
                {
                    name: 'value',
                    label: 'Nilai Proyek (Rp)',
                    type: 'number',
                    required: true,
                    placeholder: '0'
                },
                {
                    name: 'startDate',
                    label: 'Tanggal Mulai',
                    type: 'date',
                    required: true
                },
                {
                    name: 'description',
                    label: 'Deskripsi',
                    type: 'textarea',
                    placeholder: 'Detail proyek...'
                }
            ]
        });

        if (result) {
            console.log('Add project:', result);
            toast.success('Proyek berhasil ditambahkan');
        }
    }

    // ========== UTILITY METHODS ==========
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    get hasUnsavedChanges() {
        // Check for unsaved changes
        return false;
    }
}

// Initialize app
const app = new App();
