/* ============================================
   NALA AIRCON - CONFIGURATION
   Konfigurasi aplikasi, Supabase, dan settings
   ============================================ */

const CONFIG = {
    // ========== APP INFO ==========
    app: {
        name: 'Nala Aircon',
        version: '1.0.0',
        description: 'Sistem Manajemen Terpadu',
        company: 'CV Nala Karya',
        logo: 'assets/logo.svg'
    },

    // ========== SUPABASE CONFIG ==========
    // Ganti dengan kredensial Supabase Anda
    supabase: {
        url: 'YOUR_SUPABASE_URL',
        anonKey: 'YOUR_SUPABASE_ANON_KEY'
    },

    // ========== BRANCHES / CABANG ==========
    branches: [
        { id: 'makassar', name: 'Makassar', isMain: true },
        { id: 'denpasar', name: 'Denpasar', isMain: false },
        { id: 'palu', name: 'Palu', isMain: false }
    ],

    // ========== USER ROLES ==========
    roles: {
        admin: {
            id: 'admin',
            name: 'Administrator',
            permissions: ['all']
        },
        manager: {
            id: 'manager',
            name: 'Manager',
            permissions: ['read', 'write', 'approve']
        },
        teknisi: {
            id: 'teknisi',
            name: 'Teknisi',
            permissions: ['read', 'checkin', 'checkout']
        },
        finance: {
            id: 'finance',
            name: 'Finance',
            permissions: ['read', 'write_finance']
        }
    },

    // ========== MODULES ==========
    modules: {
        financing: {
            id: 'financing',
            name: 'Financing',
            icon: 'wallet',
            color: '#2563eb',
            path: '/pages/financing.html',
            description: 'Manajemen keuangan, pengeluaran & pemasukan'
        },
        inventory: {
            id: 'inventory',
            name: 'Inventory',
            icon: 'package',
            color: '#0891b2',
            path: '/pages/inventory.html',
            description: 'Stok material & unit AC'
        },
        absensi: {
            id: 'absensi',
            name: 'Absensi',
            icon: 'clock',
            color: '#7c3aed',
            path: '/pages/absensi.html',
            description: 'Kehadiran & aktivitas teknisi'
        },
        database: {
            id: 'database',
            name: 'Database',
            icon: 'database',
            color: '#059669',
            path: '/pages/database.html',
            description: 'Data customer, proyek & teknisi'
        },
        kpi: {
            id: 'kpi',
            name: 'KPI',
            icon: 'chart',
            color: '#dc2626',
            path: '/pages/kpi.html',
            description: 'Performa & tracking proyek'
        },
        marketplace: {
            id: 'marketplace',
            name: 'Marketplace',
            icon: 'cart',
            color: '#ea580c',
            path: '/pages/marketplace.html',
            description: 'Penjualan ke customer (Coming Soon)'
        }
    },

    // ========== EXPENSE CATEGORIES ==========
    expenseCategories: [
        { 
            id: 'uang_makan', 
            name: 'Uang Makan', 
            subCategories: [
                { id: 'operasional', name: 'Operasional' },
                { id: 'lembur', name: 'Lembur' }
            ],
            syncTo: null,
            icon: 'utensils'
        },
        { 
            id: 'servis_kendaraan', 
            name: 'Servis Kendaraan', 
            subCategories: [],
            syncTo: null,
            icon: 'car'
        },
        { 
            id: 'toko', 
            name: 'Toko', 
            subCategories: [],
            syncTo: null,
            description: 'Pembelian non-material',
            icon: 'store'
        },
        { 
            id: 'material', 
            name: 'Material', 
            subCategories: [
                { id: 'pipa', name: 'Pipa' },
                { id: 'kabel', name: 'Kabel' },
                { id: 'freon', name: 'Freon' },
                { id: 'bracket', name: 'Bracket' },
                { id: 'ducktape', name: 'Ducktape' },
                { id: 'isolasi', name: 'Isolasi Listrik' }
            ],
            syncTo: 'inventory',
            icon: 'package'
        },
        { 
            id: 'unit_ac', 
            name: 'Unit AC', 
            subCategories: [],
            syncTo: 'inventory',
            icon: 'snowflake'
        },
        { 
            id: 'kasbon', 
            name: 'Kasbon', 
            subCategories: [],
            syncTo: 'kpi',
            selectEmployee: true,  // Pilih pegawai dari database
            icon: 'wallet'
        },
        { 
            id: 'bbm_transport', 
            name: 'BBM/Transport', 
            subCategories: [
                { id: 'solar', name: 'Solar' },
                { id: 'bensin', name: 'Bensin' }
            ],
            syncTo: null,
            icon: 'fuel'
        },
        { 
            id: 'parkir_tol', 
            name: 'Parkir & Tol', 
            subCategories: [],
            syncTo: null,
            icon: 'parking'
        },
        { 
            id: 'gaji_upah', 
            name: 'Gaji/Upah', 
            subCategories: [
                { id: 'teknisi', name: 'Gaji Teknisi' },
                { id: 'helper', name: 'Gaji Helper' }
            ],
            syncTo: 'kpi',
            icon: 'banknote'
        },
        { 
            id: 'bonus_insentif', 
            name: 'Bonus/Insentif', 
            subCategories: [],
            syncTo: 'kpi',
            icon: 'gift'
        }
    ],

    // ========== MATERIAL TYPES ==========
    materials: {
        pipa: {
            id: 'pipa',
            name: 'Pipa',
            types: ['1/4 1/2', '1/4 3/8', '3/8 5/8', '1/4 5/8'],
            brands: ['Saeki', 'Tateyama', 'Toyoda', 'Hoda', 'Scool', 'Lainnya'],
            unit: 'meter',
            icon: 'pipa'
        },
        kabel: {
            id: 'kabel',
            name: 'Kabel',
            types: ['2x1.5', '3x1.5', '4x1.5', '2x2.5', '3x2.5', '4x2.5'],
            brands: ['Eterna', 'Supreme', 'Lainnya'],
            unit: 'meter',
            icon: 'kabel'
        },
        freon: {
            id: 'freon',
            name: 'Freon',
            types: ['R22', 'R32', 'R410'],
            sizes: ['1kg', '2kg', '3kg', '10kg'],
            brands: [],
            unit: 'kg',
            icon: 'freon'
        },
        bracket: {
            id: 'bracket',
            name: 'Bracket',
            types: ['1 PK', '2 PK'],
            brands: [],
            unit: 'pcs',
            icon: 'bracket'
        },
        ducktape: {
            id: 'ducktape',
            name: 'Ducktape',
            types: ['Lem', 'Non-lem'],
            brands: [],
            unit: 'roll',
            icon: 'ducktape'
        },
        isolasi: {
            id: 'isolasi',
            name: 'Isolasi Listrik',
            types: ['Hitam', 'Merah', 'Kuning', 'Biru', 'Hijau', 'Putih'],
            brands: ['3M', 'Nitto', 'Lainnya'],
            unit: 'roll',
            icon: 'isolasi'
        }
    },

    // ========== AC UNITS ==========
    acUnits: {
        brands: ['Daikin', 'Panasonic', 'LG', 'Midea', 'Gree', 'Hisense', 'Samsung', 'Lainnya'],
        types: ['Split Wall', 'Cassette', 'Floor Standing'],
        capacities: ['0.5 PK', '0.75 PK', '1 PK', '1.5 PK', '2 PK', '2.5 PK', '3 PK', '5 PK'],
        trackFields: ['brand', 'type', 'capacity', 'purchasePrice', 'serialNumber']
    },

    // ========== ATTENDANCE SETTINGS ==========
    attendance: {
        workHours: {
            start: '08:30',
            end: '17:30'
        },
        lateToleranceMinutes: 15,
        latePenaltyPerHour: 10000, // Rp 10.000 per jam telat
        gpsRequired: true,
        photoRequired: false,
        radiusFromOffice: 100, // meter
        payrollDate: 1 // Tanggal 1 setiap bulan
    },

    // ========== EMPLOYEE LEVELS & SALARY ==========
    employeeLevels: {
        teknisi: {
            id: 'teknisi',
            name: 'Teknisi',
            dailyRate: 150000,      // Rp 150.000/hari
            overtimeRate: 20000     // Rp 20.000/jam lembur
        },
        junior_teknisi: {
            id: 'junior_teknisi',
            name: 'Junior Teknisi',
            dailyRate: 125000,      // Rp 125.000/hari
            overtimeRate: 15000     // Rp 15.000/jam lembur
        },
        helper: {
            id: 'helper',
            name: 'Helper',
            dailyRate: 100000,      // Rp 100.000/hari
            overtimeRate: 15000     // Rp 15.000/jam lembur
        }
    },

    // ========== KPI TARGETS (Per Bulan) ==========
    kpiTargets: {
        cuci_ac: {
            id: 'cuci_ac',
            name: 'Cuci AC',
            target: 7,
            unit: 'unit'
        },
        pasang_ac: {
            id: 'pasang_ac',
            name: 'Pasang AC',
            target: 3,
            unit: 'unit'
        },
        bongkar_pasang: {
            id: 'bongkar_pasang',
            name: 'Bongkar Pasang',
            target: 2,
            unit: 'unit'
        },
        service_berat: {
            id: 'service_berat',
            name: 'Service Berat',
            target: 2,
            unit: 'unit'
        }
    },

    // ========== KASBON RULES ==========
    kasbon: {
        allowInstallment: false,    // Tidak bisa dicicil
        deductFromSalary: true,     // Langsung potong saat gajian
        limitPercentage: 50         // Max 50% dari pencapaian KPI
    },

    // ========== LEAVE TYPES ==========
    leaveTypes: [
        { id: 'sakit', name: 'Sakit', requireProof: true },
        { id: 'izin_pribadi', name: 'Izin Pribadi', requireProof: false },
        { id: 'pelatihan', name: 'Pelatihan', requireProof: true }
    ],

    // ========== DATE & TIME FORMAT ==========
    dateFormat: {
        display: 'DD MMMM YYYY',
        input: 'YYYY-MM-DD',
        time: 'HH:mm',
        datetime: 'DD/MM/YYYY HH:mm'
    },

    // ========== CURRENCY ==========
    currency: {
        code: 'IDR',
        symbol: 'Rp',
        locale: 'id-ID',
        decimalPlaces: 0
    },

    // ========== API ENDPOINTS (jika ada) ==========
    api: {
        baseUrl: '/api',
        timeout: 30000
    },

    // ========== LOCAL STORAGE KEYS ==========
    storageKeys: {
        user: 'nala_user',
        token: 'nala_token',
        theme: 'nala_theme',
        sidebarState: 'nala_sidebar',
        lastSync: 'nala_last_sync'
    },

    // ========== NOTIFICATION SETTINGS ==========
    notifications: {
        enabled: true,
        sound: true,
        desktop: true
    }
};

// ========== HELPER FUNCTIONS ==========

/**
 * Format currency ke Rupiah
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat(CONFIG.currency.locale, {
        style: 'currency',
        currency: CONFIG.currency.code,
        minimumFractionDigits: CONFIG.currency.decimalPlaces,
        maximumFractionDigits: CONFIG.currency.decimalPlaces
    }).format(amount);
}

/**
 * Format number dengan separator
 */
function formatNumber(num) {
    return new Intl.NumberFormat(CONFIG.currency.locale).format(num);
}

/**
 * Format tanggal
 */
function formatDate(date, format = 'display') {
    const d = new Date(date);
    const options = {
        display: { day: 'numeric', month: 'long', year: 'numeric' },
        short: { day: 'numeric', month: 'short', year: 'numeric' },
        input: { year: 'numeric', month: '2-digit', day: '2-digit' }
    };
    return d.toLocaleDateString('id-ID', options[format] || options.display);
}

/**
 * Format waktu
 */
function formatTime(date) {
    const d = new Date(date);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Get current datetime formatted
 */
function getCurrentDateTime() {
    const now = new Date();
    return {
        date: formatDate(now),
        time: formatTime(now),
        timestamp: now.toISOString()
    };
}

/**
 * Generate unique ID
 */
function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

/**
 * Deep clone object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Get initials from name
 */
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Check if user has permission
 */
function hasPermission(userRole, permission) {
    const role = CONFIG.roles[userRole];
    if (!role) return false;
    return role.permissions.includes('all') || role.permissions.includes(permission);
}

/**
 * Get module by ID
 */
function getModule(moduleId) {
    return CONFIG.modules[moduleId] || null;
}

/**
 * Get expense category by ID
 */
function getExpenseCategory(categoryId) {
    return CONFIG.expenseCategories.find(cat => cat.id === categoryId) || null;
}

/**
 * Get employee level by ID
 */
function getEmployeeLevel(levelId) {
    return CONFIG.employeeLevels[levelId] || null;
}

/**
 * Calculate KPI achievement percentage
 * @param {number} achieved - Jumlah tercapai
 * @param {number} target - Target
 * @returns {number} Percentage (max 100%)
 */
function calculateKpiPercentage(achieved, target) {
    if (target <= 0) return 0;
    const percentage = (achieved / target) * 100;
    return Math.min(percentage, 100); // Max 100%
}

/**
 * Calculate KPI deduction
 * @param {Object} achievements - { cuci_ac: 5, pasang_ac: 2, ... }
 * @param {number} baseSalary - Gaji pokok
 * @returns {Object} { averagePercentage, deductionPercentage, deductionAmount }
 */
function calculateKpiDeduction(achievements, baseSalary) {
    const targets = CONFIG.kpiTargets;
    let totalPercentage = 0;
    let count = 0;

    for (const [key, targetConfig] of Object.entries(targets)) {
        const achieved = achievements[key] || 0;
        const percentage = calculateKpiPercentage(achieved, targetConfig.target);
        totalPercentage += percentage;
        count++;
    }

    const averagePercentage = count > 0 ? totalPercentage / count : 0;
    const deductionPercentage = Math.max(0, 100 - averagePercentage);
    const deductionAmount = Math.round(baseSalary * (deductionPercentage / 100));

    return {
        averagePercentage: Math.round(averagePercentage * 100) / 100,
        deductionPercentage: Math.round(deductionPercentage * 100) / 100,
        deductionAmount
    };
}

/**
 * Calculate late penalty
 * @param {number} lateMinutes - Total menit telat
 * @returns {number} Penalty amount in Rupiah
 */
function calculateLatePenalty(lateMinutes) {
    if (lateMinutes <= CONFIG.attendance.lateToleranceMinutes) return 0;
    const billableMinutes = lateMinutes - CONFIG.attendance.lateToleranceMinutes;
    const hours = Math.ceil(billableMinutes / 60);
    return hours * CONFIG.attendance.latePenaltyPerHour;
}

/**
 * Calculate overtime pay
 * @param {number} overtimeHours - Jam lembur
 * @param {string} employeeLevel - Level pegawai (teknisi, junior_teknisi, helper)
 * @returns {number} Overtime pay in Rupiah
 */
function calculateOvertimePay(overtimeHours, employeeLevel) {
    const level = CONFIG.employeeLevels[employeeLevel];
    if (!level) return 0;
    return overtimeHours * level.overtimeRate;
}

/**
 * Calculate base salary
 * @param {number} workDays - Hari kerja
 * @param {string} employeeLevel - Level pegawai
 * @returns {number} Base salary in Rupiah
 */
function calculateBaseSalary(workDays, employeeLevel) {
    const level = CONFIG.employeeLevels[employeeLevel];
    if (!level) return 0;
    return workDays * level.dailyRate;
}

/**
 * Calculate kasbon limit based on KPI achievement
 * @param {number} kpiPercentage - KPI achievement percentage
 * @param {number} baseSalary - Gaji pokok
 * @returns {number} Maximum kasbon allowed
 */
function calculateKasbonLimit(kpiPercentage, baseSalary) {
    const effectivePercentage = Math.min(kpiPercentage, 100) / 100;
    return Math.round(baseSalary * effectivePercentage * (CONFIG.kasbon.limitPercentage / 100));
}

/**
 * Generate salary slip calculation
 * @param {Object} data - Employee salary data
 * @returns {Object} Complete salary slip breakdown
 */
function generateSalarySlip(data) {
    const {
        employeeLevel,
        workDays,
        overtimeHours = 0,
        lateMinutes = 0,
        uangMakan = 0,
        kasbon = 0,
        kpiAchievements = {}
    } = data;

    // PENDAPATAN
    const gajiPokok = calculateBaseSalary(workDays, employeeLevel);
    const lembur = calculateOvertimePay(overtimeHours, employeeLevel);
    const totalPendapatan = gajiPokok + lembur + uangMakan;

    // POTONGAN
    const dendaTelat = calculateLatePenalty(lateMinutes);
    const kpiResult = calculateKpiDeduction(kpiAchievements, gajiPokok);
    const potonganKpi = kpiResult.deductionAmount;
    const totalPotongan = kasbon + dendaTelat + potonganKpi;

    // GAJI BERSIH
    const gajiBersih = totalPendapatan - totalPotongan;

    return {
        pendapatan: {
            gajiPokok,
            lembur,
            uangMakan,
            total: totalPendapatan
        },
        potongan: {
            kasbon,
            dendaTelat,
            potonganKpi,
            total: totalPotongan
        },
        kpiDetail: kpiResult,
        gajiBersih,
        periode: getCurrentDateTime().date
    };
}

/**
 * Local storage helpers
 */
const storage = {
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Storage get error:', e);
            return null;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },
    clear() {
        localStorage.clear();
    }
};

// Export for ES modules (jika diperlukan)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, formatCurrency, formatNumber, formatDate, formatTime, generateId, storage };
}
