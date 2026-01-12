/* ============================================
   NALA AIRCON - APLIKASI TEKNISI
   Main JavaScript Application
   ============================================ */

// ========== CONFIGURATION ==========
const CONFIG = {
    // Supabase (ganti dengan kredensial asli)
    supabase: {
        url: 'YOUR_SUPABASE_URL',
        anonKey: 'YOUR_SUPABASE_ANON_KEY'
    },
    
    // Lokasi Kantor (GPS Coordinates)
    offices: {
        makassar: {
            name: 'Kantor Makassar',
            lat: -5.135399,
            lng: 119.423790,
            radius: 100 // meter
        },
        denpasar: {
            name: 'Kantor Denpasar',
            lat: -8.670458,
            lng: 115.212629,
            radius: 100
        },
        palu: {
            name: 'Kantor Palu',
            lat: -0.900211,
            lng: 119.877888,
            radius: 100
        }
    },
    
    // Jam Kerja
    workHours: {
        start: '08:30',
        end: '17:30',
        toleranceMinutes: 15,
        lateFinePerHour: 10000 // Rp 10.000
    },
    
    // Rate per Level
    rates: {
        teknisi: { daily: 150000, overtime: 20000 },
        junior_teknisi: { daily: 125000, overtime: 15000 },
        helper: { daily: 100000, overtime: 15000 }
    },
    
    // Storage Keys
    storageKeys: {
        user: 'nala_teknisi_user',
        token: 'nala_teknisi_token'
    }
};

// ========== STATE MANAGEMENT ==========
const state = {
    currentPage: 'login',
    user: null,
    location: null,
    isInRadius: false,
    todayAttendance: null,
    isLoading: false
};

// ========== DOM ELEMENTS ==========
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ========== UTILITY FUNCTIONS ==========
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function formatDateShort(date) {
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'};
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========== GPS FUNCTIONS ==========
function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
}

function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation tidak didukung browser ini'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                let message = 'Gagal mendapatkan lokasi';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Izin lokasi ditolak. Aktifkan GPS.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Lokasi tidak tersedia';
                        break;
                    case error.TIMEOUT:
                        message = 'Request lokasi timeout';
                        break;
                }
                reject(new Error(message));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    });
}

function checkLocationRadius(userLat, userLng) {
    let nearestOffice = null;
    let minDistance = Infinity;

    for (const [key, office] of Object.entries(CONFIG.offices)) {
        const distance = getDistance(userLat, userLng, office.lat, office.lng);
        if (distance < minDistance) {
            minDistance = distance;
            nearestOffice = { ...office, key, distance };
        }
    }

    return {
        isInRadius: minDistance <= nearestOffice.radius,
        office: nearestOffice,
        distance: Math.round(minDistance)
    };
}

// ========== ATTENDANCE FUNCTIONS ==========
function calculateLateMinutes(checkInTime) {
    const [startHour, startMinute] = CONFIG.workHours.start.split(':').map(Number);
    const tolerance = CONFIG.workHours.toleranceMinutes;
    
    const checkIn = new Date(checkInTime);
    const workStart = new Date(checkIn);
    workStart.setHours(startHour, startMinute + tolerance, 0, 0);
    
    if (checkIn <= workStart) {
        return 0; // Tepat waktu
    }
    
    const diffMs = checkIn - workStart;
    return Math.ceil(diffMs / (1000 * 60)); // Menit telat
}

function calculateLateFine(lateMinutes) {
    if (lateMinutes <= 0) return 0;
    const lateHours = Math.ceil(lateMinutes / 60);
    return lateHours * CONFIG.workHours.lateFinePerHour;
}

function calculateOvertimeMinutes(checkOutTime) {
    const [endHour, endMinute] = CONFIG.workHours.end.split(':').map(Number);
    
    const checkOut = new Date(checkOutTime);
    const workEnd = new Date(checkOut);
    workEnd.setHours(endHour, endMinute, 0, 0);
    
    if (checkOut <= workEnd) {
        return 0;
    }
    
    const diffMs = checkOut - workEnd;
    return Math.floor(diffMs / (1000 * 60)); // Menit lembur
}

// ========== PAGE NAVIGATION ==========
function navigateTo(pageName, data = {}) {
    // Hide all pages
    $$('.page').forEach(page => page.classList.remove('active'));
    
    // Show target page
    const targetPage = $(`#page-${pageName}`);
    if (targetPage) {
        targetPage.classList.add('active');
        state.currentPage = pageName;
        
        // Call page init function if exists
        const initFn = window[`init${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Page`];
        if (typeof initFn === 'function') {
            initFn(data);
        }
    }
    
    // Update bottom nav
    updateBottomNav(pageName);
}

function updateBottomNav(activePage) {
    $$('.bottom-nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === activePage);
    });
}

// ========== PAGE INITIALIZERS ==========

// Login Page
function initLoginPage() {
    const form = $('#loginForm');
    if (form) {
        form.addEventListener('submit', handleLogin);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const phone = $('#loginPhone').value;
    const password = $('#loginPassword').value;
    
    if (!phone || !password) {
        showToast('Lengkapi semua field', 'error');
        return;
    }
    
    // Show loading
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></span>';
    
    // Simulate login (replace with actual API call)
    setTimeout(() => {
        // Demo user
        state.user = {
            id: 'user_001',
            name: 'Ahmad Teknisi',
            phone: phone,
            level: 'teknisi', // teknisi, junior_teknisi, helper
            branch: 'makassar',
            avatar: null
        };
        
        localStorage.setItem(CONFIG.storageKeys.user, JSON.stringify(state.user));
        
        showToast('Login berhasil!', 'success');
        navigateTo('home');
        
        btn.disabled = false;
        btn.innerHTML = 'Login';
    }, 1500);
}

// Home Page
function initHomePage() {
    if (!state.user) {
        navigateTo('login');
        return;
    }
    
    // Update greeting
    const greetingEl = $('#homeGreeting');
    if (greetingEl) {
        const hour = new Date().getHours();
        let greeting = 'Selamat Pagi';
        if (hour >= 12 && hour < 15) greeting = 'Selamat Siang';
        else if (hour >= 15 && hour < 18) greeting = 'Selamat Sore';
        else if (hour >= 18) greeting = 'Selamat Malam';
        
        greetingEl.textContent = `${greeting}, ${state.user.name.split(' ')[0]}!`;
    }
    
    // Update date
    const dateEl = $('#homeDate');
    if (dateEl) {
        dateEl.textContent = formatDate(new Date());
    }
    
    // Start clock
    updateClock();
    setInterval(updateClock, 1000);
    
    // Check location
    checkLocation();
    
    // Load today's attendance
    loadTodayAttendance();
}

function updateClock() {
    const clockEl = $('#checkinTime');
    if (clockEl) {
        clockEl.textContent = formatTime(new Date());
    }
}

async function checkLocation() {
    const locationEl = $('#checkinLocation');
    const checkinBtn = $('#checkinBtn');
    
    try {
        locationEl.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            <span>Mendeteksi lokasi...</span>
        `;
        locationEl.className = 'checkin-location';
        
        const location = await getCurrentLocation();
        state.location = location;
        
        const result = checkLocationRadius(location.lat, location.lng);
        state.isInRadius = result.isInRadius;
        
        if (result.isInRadius) {
            locationEl.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>${result.office.name} (${result.distance}m)</span>
            `;
            locationEl.className = 'checkin-location';
            checkinBtn.disabled = false;
        } else {
            locationEl.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="m15 9-6 6"/><path d="m9 9 6 6"/>
                </svg>
                <span>Di luar radius kantor (${result.distance}m dari ${result.office.name})</span>
            `;
            locationEl.className = 'checkin-location error';
            checkinBtn.disabled = true;
        }
    } catch (error) {
        locationEl.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="m15 9-6 6"/><path d="m9 9 6 6"/>
            </svg>
            <span>${error.message}</span>
        `;
        locationEl.className = 'checkin-location error';
        checkinBtn.disabled = true;
    }
}

function loadTodayAttendance() {
    // Simulate loading today's attendance (replace with actual API call)
    // For demo, check localStorage
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(`attendance_${today}`);
    
    if (stored) {
        state.todayAttendance = JSON.parse(stored);
        updateCheckinUI();
    }
}

function updateCheckinUI() {
    const btn = $('#checkinBtn');
    const statusEl = $('#checkinStatus');
    
    if (!state.todayAttendance) {
        // Belum check in
        btn.textContent = '⏰ CHECK IN';
        btn.className = 'checkin-btn btn btn-primary';
        btn.onclick = handleCheckIn;
        statusEl.innerHTML = '';
    } else if (!state.todayAttendance.checkOut) {
        // Sudah check in, belum check out
        btn.textContent = '🏠 CHECK OUT';
        btn.className = 'checkin-btn btn btn-danger';
        btn.onclick = handleCheckOut;
        
        const lateMinutes = state.todayAttendance.lateMinutes || 0;
        if (lateMinutes > 0) {
            const fine = calculateLateFine(lateMinutes);
            statusEl.innerHTML = `
                <div class="checkin-status warning">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                        <path d="M12 9v4"/><path d="M12 17h.01"/>
                    </svg>
                    <span>Check in ${formatTime(state.todayAttendance.checkIn)} • Telat ${lateMinutes} menit (denda ${formatCurrency(fine)})</span>
                </div>
            `;
        } else {
            statusEl.innerHTML = `
                <div class="checkin-status success">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <path d="m9 11 3 3L22 4"/>
                    </svg>
                    <span>Check in ${formatTime(state.todayAttendance.checkIn)} • Tepat waktu ✓</span>
                </div>
            `;
        }
    } else {
        // Sudah check in dan check out
        btn.textContent = '✅ SELESAI';
        btn.className = 'checkin-btn btn btn-secondary';
        btn.disabled = true;
        
        const overtimeMinutes = state.todayAttendance.overtimeMinutes || 0;
        const hours = Math.floor(overtimeMinutes / 60);
        const mins = overtimeMinutes % 60;
        
        statusEl.innerHTML = `
            <div class="checkin-status success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <path d="m9 11 3 3L22 4"/>
                </svg>
                <span>
                    IN: ${formatTime(state.todayAttendance.checkIn)} • 
                    OUT: ${formatTime(state.todayAttendance.checkOut)}
                    ${overtimeMinutes > 0 ? ` • Lembur ${hours}j ${mins}m` : ''}
                </span>
            </div>
        `;
    }
}

async function handleCheckIn() {
    if (!state.isInRadius) {
        showToast('Anda harus berada di kantor untuk check in', 'error');
        return;
    }
    
    const now = new Date();
    const lateMinutes = calculateLateMinutes(now);
    
    state.todayAttendance = {
        date: now.toISOString().split('T')[0],
        checkIn: now.toISOString(),
        checkOut: null,
        lateMinutes: lateMinutes,
        overtimeMinutes: 0,
        location: state.location
    };
    
    // Save to localStorage (replace with API call)
    const today = now.toISOString().split('T')[0];
    localStorage.setItem(`attendance_${today}`, JSON.stringify(state.todayAttendance));
    
    updateCheckinUI();
    
    if (lateMinutes > 0) {
        showToast(`Check in berhasil. Telat ${lateMinutes} menit`, 'warning');
    } else {
        showToast('Check in berhasil!', 'success');
    }
}

async function handleCheckOut() {
    const now = new Date();
    const overtimeMinutes = calculateOvertimeMinutes(now);
    
    state.todayAttendance.checkOut = now.toISOString();
    state.todayAttendance.overtimeMinutes = overtimeMinutes;
    
    // Save to localStorage (replace with API call)
    const today = now.toISOString().split('T')[0];
    localStorage.setItem(`attendance_${today}`, JSON.stringify(state.todayAttendance));
    
    updateCheckinUI();
    
    if (overtimeMinutes > 0) {
        const hours = Math.floor(overtimeMinutes / 60);
        const mins = overtimeMinutes % 60;
        showToast(`Check out berhasil. Lembur ${hours} jam ${mins} menit`, 'success');
    } else {
        showToast('Check out berhasil!', 'success');
    }
}

// Gaji Page
function initGajiPage() {
    // Load salary data (simulate)
    const data = calculateMonthlySalary();
    renderGajiPage(data);
}

function calculateMonthlySalary() {
    const level = state.user?.level || 'teknisi';
    const rate = CONFIG.rates[level];
    
    // Demo data (replace with actual calculation from attendance records)
    const workDays = 20;
    const overtimeHours = 12;
    const lateFines = 30000; // 3 jam telat
    const kasbon = 500000;
    const uangMakan = 500000;
    const kpiDeduction = 0; // Dari modul KPI
    
    const gajiPokok = workDays * rate.daily;
    const lembur = overtimeHours * rate.overtime;
    const totalPendapatan = gajiPokok + lembur + uangMakan;
    const totalPotongan = lateFines + kasbon + kpiDeduction;
    const gajiBersih = totalPendapatan - totalPotongan;
    
    return {
        period: 'Januari 2025',
        gajiPokok,
        workDays,
        dailyRate: rate.daily,
        lembur,
        overtimeHours,
        overtimeRate: rate.overtime,
        uangMakan,
        totalPendapatan,
        lateFines,
        kasbon,
        kpiDeduction,
        totalPotongan,
        gajiBersih
    };
}

function renderGajiPage(data) {
    const summaryValue = $('#gajiSummaryValue');
    if (summaryValue) {
        summaryValue.textContent = formatCurrency(data.gajiBersih);
    }
    
    const breakdown = $('#gajiBreakdown');
    if (breakdown) {
        breakdown.innerHTML = `
            <div class="detail-card animate-slide-up">
                <div class="detail-card-title">📈 Pendapatan</div>
                <div class="gaji-breakdown">
                    <div class="gaji-item">
                        <span class="gaji-item-label">Gaji Pokok (${data.workDays} hari × ${formatCurrency(data.dailyRate)})</span>
                        <span class="gaji-item-value">${formatCurrency(data.gajiPokok)}</span>
                    </div>
                    <div class="gaji-item">
                        <span class="gaji-item-label">Lembur (${data.overtimeHours} jam × ${formatCurrency(data.overtimeRate)})</span>
                        <span class="gaji-item-value">${formatCurrency(data.lembur)}</span>
                    </div>
                    <div class="gaji-item">
                        <span class="gaji-item-label">Uang Makan</span>
                        <span class="gaji-item-value">${formatCurrency(data.uangMakan)}</span>
                    </div>
                </div>
                <div class="gaji-total">
                    <span class="gaji-total-label">Total Pendapatan</span>
                    <span class="gaji-total-value">${formatCurrency(data.totalPendapatan)}</span>
                </div>
            </div>
            
            <div class="detail-card animate-slide-up" style="animation-delay: 0.1s">
                <div class="detail-card-title">📉 Potongan</div>
                <div class="gaji-breakdown">
                    <div class="gaji-item">
                        <span class="gaji-item-label">Denda Telat</span>
                        <span class="gaji-item-value danger">- ${formatCurrency(data.lateFines)}</span>
                    </div>
                    <div class="gaji-item">
                        <span class="gaji-item-label">Kasbon</span>
                        <span class="gaji-item-value danger">- ${formatCurrency(data.kasbon)}</span>
                    </div>
                    ${data.kpiDeduction > 0 ? `
                    <div class="gaji-item">
                        <span class="gaji-item-label">Potongan KPI</span>
                        <span class="gaji-item-value danger">- ${formatCurrency(data.kpiDeduction)}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="gaji-total" style="background: var(--danger-bg);">
                    <span class="gaji-total-label" style="color: #991b1b;">Total Potongan</span>
                    <span class="gaji-total-value" style="color: var(--danger);">- ${formatCurrency(data.totalPotongan)}</span>
                </div>
            </div>
            
            <div class="detail-card animate-slide-up" style="animation-delay: 0.2s; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white;">
                <div class="gaji-total" style="background: rgba(255,255,255,0.15);">
                    <span class="gaji-total-label" style="color: white;">Gaji Bersih</span>
                    <span class="gaji-total-value" style="color: white; font-size: 24px;">${formatCurrency(data.gajiBersih)}</span>
                </div>
            </div>
        `;
    }
}

// Kasbon Page
function initKasbonPage() {
    const data = {
        sisaKasbon: 500000,
        history: [
            { date: '2025-01-05', amount: 500000, status: 'pending', note: 'Keperluan mendadak' },
            { date: '2024-12-15', amount: 300000, status: 'paid', note: 'Biaya kesehatan' },
            { date: '2024-11-20', amount: 200000, status: 'paid', note: 'Keperluan keluarga' }
        ]
    };
    
    renderKasbonPage(data);
}

function renderKasbonPage(data) {
    const summaryValue = $('#kasbonSummaryValue');
    if (summaryValue) {
        summaryValue.textContent = formatCurrency(data.sisaKasbon);
    }
    
    const content = $('#kasbonContent');
    if (content) {
        content.innerHTML = `
            <div class="detail-card">
                <div class="detail-card-title">📋 Riwayat Kasbon</div>
                <div class="list-items" style="box-shadow: none;">
                    ${data.history.map(item => `
                        <div class="list-item">
                            <div class="list-item-icon" style="background: ${item.status === 'pending' ? 'var(--warning-bg)' : 'var(--success-bg)'}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="${item.status === 'pending' ? 'var(--warning)' : 'var(--success)'}" stroke-width="2">
                                    ${item.status === 'pending' 
                                        ? '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
                                        : '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>'
                                    }
                                </svg>
                            </div>
                            <div class="list-item-content">
                                <div class="list-item-title">${item.note}</div>
                                <div class="list-item-subtitle">${formatDateShort(item.date)}</div>
                            </div>
                            <div>
                                <div class="list-item-value">${formatCurrency(item.amount)}</div>
                                <span class="badge badge-${item.status === 'pending' ? 'warning' : 'success'}">${item.status === 'pending' ? 'Belum Lunas' : 'Lunas'}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

// Lembur Page
function initLemburPage() {
    const data = {
        totalJam: 12,
        totalNominal: 240000,
        history: [
            { date: '2025-01-10', hours: 2, amount: 40000 },
            { date: '2025-01-08', hours: 3, amount: 60000 },
            { date: '2025-01-05', hours: 4, amount: 80000 },
            { date: '2025-01-03', hours: 3, amount: 60000 }
        ]
    };
    
    renderLemburPage(data);
}

function renderLemburPage(data) {
    const summaryValue = $('#lemburSummaryValue');
    if (summaryValue) {
        summaryValue.innerHTML = `${data.totalJam} <span style="font-size: 20px;">Jam</span>`;
    }
    
    const content = $('#lemburContent');
    if (content) {
        content.innerHTML = `
            <div class="info-cards">
                <div class="info-card">
                    <div class="info-card-label">Total Jam Lembur</div>
                    <div class="info-card-value">${data.totalJam} Jam</div>
                </div>
                <div class="info-card">
                    <div class="info-card-label">Total Nominal</div>
                    <div class="info-card-value success">${formatCurrency(data.totalNominal)}</div>
                </div>
            </div>
            
            <div class="detail-card mt-4">
                <div class="detail-card-title">📋 Riwayat Lembur</div>
                <div class="list-items" style="box-shadow: none;">
                    ${data.history.map(item => `
                        <div class="list-item">
                            <div class="list-item-icon" style="background: var(--primary-bg)">
                                <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                                </svg>
                            </div>
                            <div class="list-item-content">
                                <div class="list-item-title">${item.hours} Jam Lembur</div>
                                <div class="list-item-subtitle">${formatDateShort(item.date)}</div>
                            </div>
                            <div class="list-item-value success">+ ${formatCurrency(item.amount)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

// Absensi Page
function initAbsensiPage() {
    renderCalendar();
}

function renderCalendar() {
    const calendarEl = $('#calendarDays');
    if (!calendarEl) return;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Update title
    const titleEl = $('#calendarTitle');
    if (titleEl) {
        titleEl.textContent = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    }
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay(); // 0 = Sunday
    
    let html = '';
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
        html += `<div class="calendar-day other-month">${prevMonthLastDay - i}</div>`;
    }
    
    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const stored = localStorage.getItem(`attendance_${dateStr}`);
        let status = '';
        
        if (stored) {
            const attendance = JSON.parse(stored);
            if (attendance.lateMinutes > 0) {
                status = 'telat';
            } else {
                status = 'hadir';
            }
        }
        
        const isToday = day === now.getDate();
        html += `<div class="calendar-day ${isToday ? 'today' : status}">${day}</div>`;
    }
    
    // Next month days
    const remainingDays = 42 - (startDay + lastDay.getDate());
    for (let i = 1; i <= remainingDays; i++) {
        html += `<div class="calendar-day other-month">${i}</div>`;
    }
    
    calendarEl.innerHTML = html;
}

// Profil Page
function initProfilPage() {
    if (!state.user) return;
    
    const nameEl = $('#profilName');
    const levelEl = $('#profilLevel');
    const avatarEl = $('#profilAvatar');
    
    if (nameEl) nameEl.textContent = state.user.name;
    if (levelEl) levelEl.textContent = state.user.level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (avatarEl) avatarEl.textContent = getInitials(state.user.name);
}

function handleLogout() {
    localStorage.removeItem(CONFIG.storageKeys.user);
    state.user = null;
    navigateTo('login');
    showToast('Logout berhasil', 'success');
}

// ========== APP INITIALIZATION ==========
function initApp() {
    // Check if user is logged in
    const storedUser = localStorage.getItem(CONFIG.storageKeys.user);
    if (storedUser) {
        state.user = JSON.parse(storedUser);
        navigateTo('home');
    } else {
        navigateTo('login');
    }
    
    // Bind bottom nav
    $$('.bottom-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            if (page) navigateTo(page);
        });
    });
    
    // Bind menu items
    $$('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            if (page) navigateTo(page);
        });
    });
    
    // Bind back buttons
    $$('.app-header-back').forEach(btn => {
        btn.addEventListener('click', () => navigateTo('home'));
    });
    
    // Bind logout
    const logoutBtn = $('#logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Add keyboard style for animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            to { opacity: 0; transform: translateX(-50%) translateY(20px); }
        }
    `;
    document.head.appendChild(style);
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
