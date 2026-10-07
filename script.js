document.addEventListener('DOMContentLoaded', () => {

    // --- AUTHENTICATION & SESSION EXPIRATION SYSTEM ---
    const loginScreen = document.getElementById('login-screen');
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('password-input');
    const loginError = document.getElementById('login-error');
    
    // Session timeout duration: 4 hours (in milliseconds)
    const SESSION_TIMEOUT_MS = 4 * 60 * 60 * 1000;

    function checkAuthSession() {
        const authTimestamp = localStorage.getItem('ib_auth_timestamp');
        if (authTimestamp) {
            const timeElapsed = Date.now() - parseInt(authTimestamp, 10);
            if (timeElapsed < SESSION_TIMEOUT_MS) {
                // Session valid -> hide login overlay
                loginScreen.classList.add('hidden');
                return true;
            }
        }
        // Session expired or missing -> show login overlay
        loginScreen.classList.remove('hidden');
        return false;
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredPassword = passwordInput.value.trim();

        if (enteredPassword === 'nabil') {
            // Save current timestamp to enable persistent session
            localStorage.setItem('ib_auth_timestamp', Date.now().toString());
            
            loginError.classList.add('hidden');
            loginScreen.classList.add('hidden');
            passwordInput.value = '';
            
            // Resize active chart after login display
            if (portfolioChart) portfolioChart.resize();
        } else {
            loginError.classList.remove('hidden');
            passwordInput.focus();
        }
    });

    passwordInput.addEventListener('input', () => {
        loginError.classList.add('hidden');
    });

    // Run auth check on initial load
    checkAuthSession();

    // --- DARK MODE PERSISTENCE ---
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        const icon = document.querySelector('#dark-mode-toggle i');
        if (icon) {
            icon.className = savedTheme === 'dark' ? 'fa-regular fa-sun' : 'fa-regular fa-moon';
        }
    }
    
    // --- STATE MANAGEMENT ---
    const basePrincipal = 360000; 
    
    let portfolioState = {
        balance: 427390,
        changeAmount: 67390,
        activeTimeframe: '1M'
    };

    // --- CHART INITIALIZATION (Main Portfolio) ---
    const ctx = document.getElementById('portfolioChart').getContext('2d');

    const chartDatasets = {
        '1W':  [33200, 32900, 33400, 33100, 427390],
        'MTD': [32000, 33200, 32500, 33500, 427390],
        '1M':  [31200, 32400, 31500, 32800, 31900, 33100, 32300, 33600, 32200, 33000, 32100, 33400, 32500, 33700, 32600, 33200, 32000, 33500, 32800, 427390],
        '3M':  [29500, 31800, 30200, 32600, 31000, 427390],
        'YTD': [27500, 30500, 29000, 32200, 30800, 427390],
        '1Y':  [24000, 29000, 26000, 31500, 28500, 427390],
        'ALL': [19000, 26000, 22000, 30000, 27000, 427390]
    };

    function calculateSMA(data, period) {
        let sma = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                sma.push(null);
            } else {
                let sum = 0;
                for (let j = 0; j < period; j++) {
                    sum += data[i - j];
                }
                sma.push(sum / period);
            }
        }
        return sma;
    }

    const currentData = chartDatasets['1M'];
    const fastMA = calculateSMA(currentData, 3);
    const slowMA = calculateSMA(currentData, 6);

    function getGradient(context) {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return null;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, isDark ? 'rgba(0, 102, 204, 0.35)' : 'rgba(0, 102, 204, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 102, 204, 0.0)');
        return gradient;
    }

    const portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: currentData.map((_, i) => i),
            datasets: [
                {
                    label: 'Price Action',
                    data: currentData,
                    borderColor: '#0066cc',
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    tension: 0,
                    fill: true,
                    backgroundColor: (context) => getGradient(context),
                    order: 2
                },
                {
                    label: 'EMA 9',
                    data: fastMA,
                    borderColor: '#ff9800',
                    borderWidth: 1.5,
                    pointRadius: 0,
                    tension: 0.2,
                    fill: false,
                    order: 1
                },
                {
                    label: 'EMA 21',
                    data: slowMA,
                    borderColor: '#9c27b0',
                    borderWidth: 1.5,
                    pointRadius: 0,
                    tension: 0.2,
                    fill: false,
                    order: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        font: { size: 10, family: 'monospace' },
                        color: () => document.documentElement.getAttribute('data-theme') === 'dark' ? '#9cb0c9' : '#656f7d'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(18, 22, 25, 0.9)',
                    titleFont: { size: 11 },
                    bodyFont: { size: 12, family: 'monospace' },
                    borderColor: '#333',
                    borderWidth: 1,
                    callbacks: {
                        label: (context) => `${context.dataset.label}: $${context.raw ? context.raw.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}`
                    }
                }
            },
            scales: {
                x: { 
                    display: true,
                    grid: { 
                        color: () => document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' 
                    },
                    ticks: { display: false }
                },
                y: {
                    position: 'right',
                    grid: { color: () => document.documentElement.getAttribute('data-theme') === 'dark' ? '#232d3f' : '#f0f3f7' },
                    ticks: {
                        color: () => document.documentElement.getAttribute('data-theme') === 'dark' ? '#64748b' : '#8d97a5',
                        font: { size: 11, family: 'monospace' },
                        callback: (val) => '$' + val.toLocaleString()
                    }
                }
            }
        }
    });

    // --- COMPLEX PROFILE CHARTS ---
    const ctxComplex1 = document.getElementById('complexChart1').getContext('2d');
    const ctxComplex2 = document.getElementById('complexChart2').getContext('2d');
    
    const complexChart1 = new Chart(ctxComplex1, {
        type: 'bar',
        data: {
            labels: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00'],
            datasets: [{
                type: 'line',
                label: 'RSI',
                data: [35, 75, 45, 85, 30, 90, 50],
                borderColor: '#d32f2f',
                borderWidth: 2,
                yAxisID: 'y1',
                tension: 0
            }, {
                type: 'bar',
                label: 'Delta Volume',
                data: [1500, -2200, 3100, -1800, 2500, -900, 2100],
                backgroundColor: (ctx) => ctx.raw > 0 ? 'rgba(15, 157, 88, 0.6)' : 'rgba(211, 47, 47, 0.6)',
                yAxisID: 'y'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: { type: 'linear', position: 'left' },
                y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false } }
            }
        }
    });

    const complexChart2 = new Chart(ctxComplex2, {
        type: 'radar',
        data: {
            labels: ['Volatility', 'Drawdown', 'Sharpe Ratio', 'Alpha', 'Beta', 'Liquidity'],
            datasets: [{
                label: 'Current Strategy',
                data: [85, 45, 95, 70, 65, 90],
                fill: true,
                backgroundColor: 'rgba(0, 102, 204, 0.2)',
                borderColor: 'rgba(0, 102, 204, 1)',
                pointBackgroundColor: 'rgba(0, 102, 204, 1)',
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { r: { angleLines: { color: 'rgba(128, 128, 128, 0.2)' }, grid: { color: 'rgba(128, 128, 128, 0.2)' } } }
        }
    });

    // --- RENDER & UPDATE ---
    function updateDisplay() {
        const balStr = portfolioState.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const [dollars, cents] = balStr.split('.');
        document.getElementById('balance-value').innerHTML = `$${dollars}<span class="cents">.${cents}</span>`;

        const changeVal = portfolioState.changeAmount;
        const previousVal = portfolioState.balance - changeVal;
        const changePercent = ((changeVal / previousVal) * 100).toFixed(2);
        
        const changeContainer = document.getElementById('change-container');
        const sign = changeVal >= 0 ? '+' : '';
        document.getElementById('change-value').textContent = `${sign}$${Math.abs(changeVal).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        document.getElementById('change-percent').textContent = `${sign}${changePercent}%`;
        changeContainer.className = changeVal >= 0 ? 'balance-change positive' : 'balance-change negative';
    }

    // --- TIME RANGE PILLS ---
    const pills = document.querySelectorAll('.pill');
    pills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            pills.forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            
            const range = e.target.getAttribute('data-range');
            portfolioState.activeTimeframe = range;

            const baseData = chartDatasets[range] || chartDatasets['1M'];
            const scaleFactor = portfolioState.balance / baseData[baseData.length - 1];
            const scaledData = baseData.map(val => val * scaleFactor);

            const newFastMA = calculateSMA(scaledData, 3);
            const newSlowMA = calculateSMA(scaledData, 6);

            portfolioChart.data.labels = scaledData.map((_, i) => i);
            portfolioChart.data.datasets[0].data = scaledData;
            portfolioChart.data.datasets[1].data = newFastMA;
            portfolioChart.data.datasets[2].data = newSlowMA;
            portfolioChart.update();
        });
    });

    // --- STEALTH EDIT BALANCE ---
    const balanceDisplay = document.getElementById('balance-value');
    const modal = document.getElementById('edit-modal');
    const cancelBtn = document.getElementById('cancel-modal-btn');
    const saveBtn = document.getElementById('save-modal-btn');
    const inputBalance = document.getElementById('input-balance');

    balanceDisplay.addEventListener('dblclick', () => {
        inputBalance.value = portfolioState.balance;
        modal.classList.add('active');
    });

    cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

    saveBtn.addEventListener('click', () => {
        const newBal = parseFloat(inputBalance.value);

        if (!isNaN(newBal)) {
            portfolioState.balance = newBal;
            portfolioState.changeAmount = newBal - basePrincipal; 
            
            updateDisplay();

            const activeRange = portfolioState.activeTimeframe;
            const baseData = chartDatasets[activeRange] || chartDatasets['1M'];
            const scaleFactor = newBal / baseData[baseData.length - 1];
            const scaledData = baseData.map(val => val * scaleFactor);
            
            const newFastMA = calculateSMA(scaledData, 3);
            const newSlowMA = calculateSMA(scaledData, 6);

            portfolioChart.data.datasets[0].data = scaledData;
            portfolioChart.data.datasets[1].data = newFastMA;
            portfolioChart.data.datasets[2].data = newSlowMA;
            portfolioChart.update();
        }
        modal.classList.remove('active');
    });

    // --- LEVEL 2 MARKET DATA ANIMATOR ---
    function animateLevel2() {
        const sizeElements = document.querySelectorAll('.size-val');
        if(sizeElements.length === 0) return;

        setInterval(() => {
            const randomIdx = Math.floor(Math.random() * sizeElements.length);
            const el = sizeElements[randomIdx];
            const currentSize = parseInt(el.innerText);
            const change = Math.floor(Math.random() * 200) - 100; 
            const newSize = Math.max(10, currentSize + change);
            
            el.innerText = newSize;
            
            const row = el.parentElement;
            row.style.backgroundColor = 'var(--flash-bg)';
            setTimeout(() => {
                row.style.backgroundColor = 'transparent';
            }, 250);
        }, 800);
    }

    // --- DARK MODE TOGGLE ---
    const darkToggle = document.getElementById('dark-mode-toggle');
    darkToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        
        localStorage.setItem('theme', newTheme);
        
        darkToggle.querySelector('i').className = newTheme === 'dark' ? 'fa-regular fa-sun' : 'fa-regular fa-moon';
        portfolioChart.update();
        complexChart1.update();
        complexChart2.update();
        if (typeof equityChart !== "undefined" && equityChart) equityChart.update();
    });

    // --- NOTIFICATIONS TOGGLE ---
    const notifBtn = document.getElementById('notif-btn');
    const notifDropdown = document.getElementById('notif-dropdown');
    
    notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
            notifDropdown.classList.add('hidden');
        }
    });

    // --- NAVIGATION ---
    const navItems = document.querySelectorAll('.view-trigger, .side-link:not(.desktop-only)');
    const views = document.querySelectorAll('.tab-view');
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');
    const sideNavItems = document.querySelectorAll('.sidebar-nav .side-link');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if(item.tagName === 'A') e.preventDefault();
            
            const target = item.getAttribute('data-target');
            if(!target) return;
            
            bottomNavItems.forEach(i => i.classList.remove('active'));
            sideNavItems.forEach(i => i.classList.remove('active'));
            
            document.querySelectorAll(`[data-target="${target}"]`).forEach(i => {
                if(i.classList.contains('nav-item') || i.classList.contains('side-link')) {
                    i.classList.add('active');
                }
            });
            
            views.forEach(v => v.classList.remove('active'));
            document.getElementById(target).classList.add('active');
            
            if(target === 'view-home') portfolioChart.resize();
            if(target === 'view-profile') {
                complexChart1.resize();
                complexChart2.resize();
            }
            if(target === 'view-portfolio') {
                if (typeof equityChart !== 'undefined' && equityChart) equityChart.resize();
                if (typeof renderCalendar === 'function') renderCalendar();
            }
        });
    });

    // --- MOBILE PULL TO REFRESH ---
    let startY = 0;
    let isPulling = false;
    const p2rIndicator = document.getElementById('p2r-indicator');
    
    document.addEventListener('touchstart', (e) => {
        if (window.scrollY <= 0 && e.touches[0].clientY < 120) {
            startY = e.touches[0].clientY;
            isPulling = true;
        }
    }, {passive: true});
    
    document.addEventListener('touchmove', (e) => {
        if (!isPulling) return;
        const currentY = e.touches[0].clientY;
        const pullDistance = currentY - startY;
        
        if (pullDistance > 10) {
             p2rIndicator.style.transform = `translateY(${Math.min(pullDistance - 60, 10)}px)`;
        }
    }, {passive: true});
    
    document.addEventListener('touchend', () => {
        if (!isPulling) return;
        
        if (p2rIndicator.style.transform.includes('10px') || p2rIndicator.style.transform.includes('translateY(0px)')) {
            p2rIndicator.innerHTML = '<i class="fa-solid fa-arrow-rotate-right fa-spin"></i> Reloading...';
            setTimeout(() => { location.reload(); }, 500);
        } else {
            p2rIndicator.style.transform = `translateY(-100%)`;
        }
        isPulling = false;
    });


    // =====================================================
    // DAILY P&L + CALENDAR
    // =====================================================
    const dailyPnL = {
        '2026-06-05': { pnl: 1529.26, trades: 3 },
        '2026-06-08': { pnl: 4019.76, trades: 2 },
        '2026-06-09': { pnl: 2194.64, trades: 1 },
        '2026-06-10': { pnl: -4581.71, trades: 1 },
        '2026-06-11': { pnl: 3275.73, trades: 2 },
        '2026-06-12': { pnl: -1224.22, trades: 3 },
        '2026-06-15': { pnl: -1091.7, trades: 2 },
        '2026-06-16': { pnl: 4314.37, trades: 1 },
        '2026-06-17': { pnl: -670.81, trades: 3 },
        '2026-06-18': { pnl: -1557.91, trades: 1 },
        '2026-06-19': { pnl: 3653.99, trades: 3 },
        '2026-06-22': { pnl: 897.58, trades: 1 },
        '2026-06-23': { pnl: -2879.62, trades: 2 },
        '2026-06-24': { pnl: 3018.56, trades: 1 },
        '2026-06-25': { pnl: 2254.56, trades: 3 },
        '2026-06-26': { pnl: 1921.24, trades: 2 },
        '2026-06-29': { pnl: -1426.08, trades: 3 },
        '2026-06-30': { pnl: 5311.82, trades: 3 },
        '2026-07-01': { pnl: 4556.56, trades: 3 },
        '2026-07-02': { pnl: -535.55, trades: 2 },
        '2026-07-03': { pnl: 1798.9, trades: 3 },
        '2026-07-06': { pnl: 2813.83, trades: 2 },
        '2026-07-07': { pnl: -1575.76, trades: 1 },
        '2026-07-08': { pnl: 2519.22, trades: 2 },
        '2026-07-09': { pnl: 1921.24, trades: 2 },
        '2026-07-10': { pnl: -2125.04, trades: 1 },
        '2026-07-13': { pnl: -3474.91, trades: 3 },
        '2026-07-14': { pnl: 3514.17, trades: 2 },
        '2026-07-15': { pnl: -1705.53, trades: 2 },
        '2026-07-16': { pnl: -2243.14, trades: 1 },
        '2026-07-17': { pnl: -2383.2, trades: 3 },
        '2026-07-20': { pnl: 4037.24, trades: 1 },
        '2026-07-21': { pnl: 1170.97, trades: 3 },
        '2026-07-22': { pnl: 1881.3, trades: 1 },
        '2026-07-23': { pnl: -613.82, trades: 2 },
        '2026-07-24': { pnl: -1350.55, trades: 1 },
        '2026-07-27': { pnl: 2371.91, trades: 2 },
        '2026-07-28': { pnl: -948.2, trades: 3 },
        '2026-07-29': { pnl: 1384.44, trades: 1 },
        '2026-07-30': { pnl: -1850.4, trades: 3 },
        '2026-07-31': { pnl: 5310.58, trades: 2 },
        '2026-08-03': { pnl: -944.77, trades: 3 },
        '2026-08-04': { pnl: -1566.83, trades: 3 },
        '2026-08-05': { pnl: 2389.38, trades: 2 },
        '2026-08-06': { pnl: 5311.82, trades: 3 },
        '2026-08-07': { pnl: -801.95, trades: 2 },
        '2026-08-10': { pnl: -2881.68, trades: 3 },
        '2026-08-11': { pnl: -2512.97, trades: 3 },
        '2026-08-12': { pnl: 2435.57, trades: 1 },
        '2026-08-13': { pnl: -1353.3, trades: 1 },
        '2026-08-14': { pnl: 1314.54, trades: 3 },
        '2026-08-17': { pnl: 3877.44, trades: 1 },
        '2026-08-18': { pnl: -682.49, trades: 2 },
        '2026-08-19': { pnl: -523.88, trades: 1 },
        '2026-08-20': { pnl: 4932.32, trades: 2 },
        '2026-08-21': { pnl: 791.47, trades: 2 },
        '2026-08-24': { pnl: 5677.6, trades: 2 },
        '2026-08-25': { pnl: 5678.84, trades: 3 },
        '2026-08-26': { pnl: -2856.28, trades: 2 },
        '2026-08-27': { pnl: -2469.03, trades: 2 },
        '2026-08-28': { pnl: -1833.92, trades: 1 },
        '2026-08-31': { pnl: 4168.31, trades: 3 },
        '2026-09-01': { pnl: 3668.97, trades: 3 },
        '2026-09-02': { pnl: 1429.39, trades: 2 },
        '2026-09-03': { pnl: -1281.89, trades: 1 },
        '2026-09-04': { pnl: 754.02, trades: 3 },
        '2026-09-07': { pnl: -400.29, trades: 3 },
        '2026-09-08': { pnl: -2395.56, trades: 2 },
        '2026-09-09': { pnl: -1971.24, trades: 1 },
        '2026-09-10': { pnl: -2873.44, trades: 2 },
        '2026-09-11': { pnl: -1851.77, trades: 2 },
        '2026-09-14': { pnl: 2254.56, trades: 1 },
        '2026-09-15': { pnl: -3683.63, trades: 1 },
        '2026-09-16': { pnl: 2640.31, trades: 3 },
        '2026-09-17': { pnl: -1505.72, trades: 3 },
        '2026-09-18': { pnl: -1774.87, trades: 3 },
        '2026-09-21': { pnl: 4385.53, trades: 1 },
        '2026-09-22': { pnl: 4502.88, trades: 1 },
        '2026-09-23': { pnl: -941.34, trades: 1 },
        '2026-09-24': { pnl: -735.35, trades: 1 },
        '2026-09-25': { pnl: 2436.82, trades: 3 },
        '2026-09-28': { pnl: 7043.32, trades: 2 },
        '2026-09-29': { pnl: 2917.45, trades: 1 },
        '2026-09-30': { pnl: -2376.34, trades: 3 },
        '2026-10-01': { pnl: -1912.19, trades: 1 },
        '2026-10-02': { pnl: 2194.64, trades: 1 },
        '2026-10-05': { pnl: 2008.63, trades: 2 },
        '2026-10-06': { pnl: 3273.23, trades: 2 }
    };
    // dailyPnL already scaled to +67390

    let equityChart = null;
    const equityCtxEl = document.getElementById('equityChart');
    if (equityCtxEl) {
        const allKeys = Object.keys(dailyPnL).sort();
        let eq = 360000; const eqData = [], eqLabels = [];
        allKeys.forEach(k => { eq += dailyPnL[k].pnl; eqData.push(Math.round(eq)); eqLabels.push(k.slice(5)); });
        equityChart = new Chart(equityCtxEl.getContext('2d'), {
            type: 'line',
            data: { labels: eqLabels, datasets: [{ label: 'NLV', data: eqData, borderColor: '#0066cc', borderWidth: 2, pointRadius: 0, tension: 0.1, fill: true,
                backgroundColor: (context) => {
                    const chart = context.chart; const { ctx, chartArea } = chart; if (!chartArea) return null;
                    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                    const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    g.addColorStop(0, isDark ? 'rgba(0,102,204,0.3)' : 'rgba(0,102,204,0.15)');
                    g.addColorStop(1, 'rgba(0,102,204,0)'); return g;
                }}]},
            options: { responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => 'NLV: $' + c.raw.toLocaleString() } } },
                scales: { x: { display: false }, y: { position: 'right', ticks: { callback: v => '$' + (v/1000).toFixed(0) + 'k', font: { size: 10, family: 'monospace' },
                    color: () => document.documentElement.getAttribute('data-theme') === 'dark' ? '#64748b' : '#8d97a5' },
                    grid: { color: () => document.documentElement.getAttribute('data-theme') === 'dark' ? '#232d3f' : '#f0f3f7' } } } }
        });
    }

    const TODAY = new Date(2026, 9, 7);
    const FIRST_TRADE = new Date(2026, 5, 5);
    let calYear = 2026, calMonth = 9;
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    function formatPnL(v) { return (v >= 0 ? '+' : '') + '$' + Math.abs(v).toFixed(0); }
    function getMonthPnL(year, month) {
        let total = 0;
        Object.keys(dailyPnL).forEach(k => {
            const p = k.split('-').map(Number);
            if (p[0] === year && p[1] === month + 1) total += dailyPnL[k].pnl;
        });
        return { total };
    }

    function renderCalendar() {
        const grid = document.getElementById('cal-grid');
        const title = document.getElementById('cal-month-title');
        const prevBtn = document.getElementById('cal-prev');
        const nextBtn = document.getElementById('cal-next');
        if (!grid) return;
        title.textContent = monthNames[calMonth] + ' ' + calYear;
        prevBtn.disabled = (calYear === 2026 && calMonth <= 5);
        nextBtn.disabled = (calYear === TODAY.getFullYear() && calMonth >= TODAY.getMonth());
        grid.innerHTML = '';
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
        const cells = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(calYear, calMonth, d);
            const dow = date.getDay();
            if (dow === 0 || dow === 6) continue;
            const key = calYear + '-' + String(calMonth+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
            cells.push({ day: d, data: dailyPnL[key], isFuture: date > TODAY, isBeforeStart: date < FIRST_TRADE });
        }
        if (cells.length) {
            const firstDow = new Date(calYear, calMonth, cells[0].day).getDay();
            const pad = firstDow === 0 ? 0 : firstDow - 1;
            for (let i = 0; i < pad; i++) {
                const s = document.createElement('div'); s.className = 'cal-day weekend-spacer'; grid.appendChild(s);
            }
        }
        cells.forEach(c => {
            const el = document.createElement('div'); el.className = 'cal-day';
            if (c.isFuture || c.isBeforeStart) {
                el.classList.add('future');
                el.innerHTML = '<span class="cal-day-num">' + c.day + '</span><span class="cal-day-pnl">—</span>';
            } else if (!c.data || !c.data.trades) {
                el.classList.add('empty');
                el.innerHTML = '<span class="cal-day-num">' + c.day + '</span><span class="cal-day-pnl">—</span>';
            } else {
                el.classList.add(c.data.pnl >= 0 ? 'win' : 'loss', 'has-data');
                el.innerHTML = '<span class="cal-day-num">' + c.day + '</span><span class="cal-day-pnl">' + formatPnL(c.data.pnl) + '</span><span class="cal-day-trades">' + c.data.trades + ' trade' + (c.data.trades > 1 ? 's' : '') + '</span>';
            }
            grid.appendChild(el);
        });
        const m = getMonthPnL(calYear, calMonth);
        const totalEl = document.getElementById('cal-total-pnl');
        const goalFill = document.getElementById('goal-bar-fill');
        const goalCurrent = document.getElementById('goal-current');
        if (totalEl) {
            totalEl.textContent = (m.total >= 0 ? '+' : '') + '$' + Math.abs(m.total).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
            totalEl.className = 'stat-value ' + (m.total >= 0 ? 'positive' : 'negative');
        }
        if (goalFill) goalFill.style.width = Math.min(100, Math.max(0, (m.total / 3000) * 100)) + '%';
        if (goalCurrent) goalCurrent.textContent = '$' + Math.abs(Math.round(m.total));
    }

    document.getElementById('cal-prev')?.addEventListener('click', () => {
        if (calMonth === 0) { calMonth = 11; calYear--; } else calMonth--;
        if (calYear < 2026 || (calYear === 2026 && calMonth < 5)) { calYear = 2026; calMonth = 5; }
        renderCalendar();
    });
    document.getElementById('cal-next')?.addEventListener('click', () => {
        if (calMonth === 11) { calMonth = 0; calYear++; } else calMonth++;
        if (calYear > TODAY.getFullYear() || (calYear === TODAY.getFullYear() && calMonth > TODAY.getMonth())) {
            calYear = TODAY.getFullYear(); calMonth = TODAY.getMonth();
        }
        renderCalendar();
    });
        // ----- View mode switching (Month / Year) -----
    let calMode = 'month';
    let yearViewYear = 2026;

    function showCalPanel(mode) {
        const monthPanel = document.getElementById('cal-month-view');
        const yearPanel = document.getElementById('cal-year-view');
        if (!monthPanel || !yearPanel) return;

        if (mode === 'year') {
            monthPanel.classList.remove('active');
            void yearPanel.offsetWidth;
            yearPanel.classList.add('active');
            renderYearView();
        } else {
            yearPanel.classList.remove('active');
            void monthPanel.offsetWidth;
            monthPanel.classList.add('active');
            renderCalendar();
        }
        calMode = mode;
    }

    function getYearPnL(year) {
        let total = 0;
        Object.keys(dailyPnL).forEach(k => {
            if (k.startsWith(String(year) + '-')) total += dailyPnL[k].pnl;
        });
        return total;
    }

    function renderYearView() {
        const grid = document.getElementById('year-months-grid');
        const title = document.getElementById('cal-year-title');
        const totalEl = document.getElementById('cal-year-total');
        const subEl = document.getElementById('cal-year-sub');
        const goalFill = document.getElementById('year-goal-fill');
        const goalCur = document.getElementById('year-goal-current');
        const prevBtn = document.getElementById('cal-year-prev');
        const nextBtn = document.getElementById('cal-year-next');
        if (!grid) return;

        title.textContent = String(yearViewYear);
        if (prevBtn) prevBtn.disabled = yearViewYear <= 2026;
        if (nextBtn) nextBtn.disabled = yearViewYear >= TODAY.getFullYear();

        const yearTotal = getYearPnL(yearViewYear);
        if (totalEl) {
            const sign = yearTotal >= 0 ? '+' : '';
            totalEl.textContent = sign + '$' + Math.abs(yearTotal).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
            totalEl.className = 'stat-value ' + (yearTotal >= 0 ? 'positive' : 'negative');
        }
        if (subEl) subEl.textContent = 'in ' + yearViewYear;
        if (goalFill) goalFill.style.width = Math.min(100, Math.max(0, (yearTotal / 100000) * 100)) + '%';
        if (goalCur) goalCur.textContent = '$' + Math.abs(Math.round(yearTotal)).toLocaleString();

        grid.innerHTML = '';
        const shortNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

        for (let m = 0; m < 12; m++) {
            const card = document.createElement('div');
            card.className = 'year-month-card';

            const mStats = getMonthPnL(yearViewYear, m);
            const hasData = Object.keys(dailyPnL).some(k => {
                const p = k.split('-').map(Number);
                return p[0] === yearViewYear && p[1] === m + 1 && dailyPnL[k].trades > 0;
            });

            const daysInMonth = new Date(yearViewYear, m + 1, 0).getDate();
            const dots = [];
            for (let d = 1; d <= daysInMonth; d++) {
                const dt = new Date(yearViewYear, m, d);
                const dow = dt.getDay();
                if (dow === 0 || dow === 6) continue;
                const key = yearViewYear + '-' + String(m+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
                const isFuture = dt > TODAY;
                const data = dailyPnL[key];
                if (isFuture) dots.push('future');
                else if (!data || !data.trades) dots.push('empty');
                else if (data.pnl >= 0) dots.push('win');
                else dots.push('loss');
            }

            let miniHtml = '<div class="year-mini-cal">';
            dots.forEach(cls => { miniHtml += '<div class="year-mini-dot ' + cls + '"></div>'; });
            miniHtml += '</div>';

            let pnlClass = 'zero';
            let pnlText = '$0.00';
            if (hasData) {
                pnlText = (mStats.total >= 0 ? '$' : '-$') + Math.abs(mStats.total).toFixed(2);
                pnlClass = mStats.total >= 0 ? 'positive' : 'negative';
            }

            card.innerHTML = '<div class="year-month-name">' + shortNames[m] + '</div>' + miniHtml +
                '<div class="year-month-pnl ' + pnlClass + '">' + pnlText + '</div>';

            const canOpen = hasData || (yearViewYear === 2026 && m >= 5 && m <= TODAY.getMonth());
            if (canOpen) {
                card.addEventListener('click', () => {
                    calMonth = m;
                    calYear = yearViewYear;
                    document.querySelectorAll('.cal-range-pill').forEach(b => b.classList.remove('active'));
                    const monthPill = document.querySelector('.cal-range-pill[data-mode="month"]');
                    if (monthPill) monthPill.classList.add('active');
                    showCalPanel('month');
                });
            } else {
                card.classList.add('empty-month');
            }

            grid.appendChild(card);
        }
    }

    document.getElementById('cal-year-prev')?.addEventListener('click', () => {
        if (yearViewYear > 2026) { yearViewYear--; renderYearView(); }
    });
    document.getElementById('cal-year-next')?.addEventListener('click', () => {
        if (yearViewYear < TODAY.getFullYear()) { yearViewYear++; renderYearView(); }
    });

    document.querySelectorAll('.cal-range-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cal-range-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mode = btn.getAttribute('data-mode') || 'month';
            if (mode === 'year') {
                yearViewYear = calYear;
                showCalPanel('year');
            } else {
                showCalPanel('month');
            }
        });
    });

    // Init
    updateDisplay();
    animateLevel2();
    renderCalendar();
});
