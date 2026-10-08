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
    const basePrincipal = 18500.0; 
    
    let portfolioState = {
        balance: 67490.78,
        changeAmount: 15661.08,
        activeTimeframe: '1M'
    };

    // --- CHART INITIALIZATION (Main Portfolio) ---
    const ctx = document.getElementById('portfolioChart').getContext('2d');

    const dailyPnL = {
        '2026-06-05': { pnl: 1630.11, trades: 3 },
        '2026-06-08': { pnl: 311.18, trades: 1 },
        '2026-06-09': { pnl: 511.07, trades: 3 },
        '2026-06-10': { pnl: 1748.98, trades: 2 },
        '2026-06-11': { pnl: -385.68, trades: 2 },
        '2026-06-12': { pnl: 612.52, trades: 3 },
        '2026-06-15': { pnl: -766.26, trades: 3 },
        '2026-06-16': { pnl: 1145.54, trades: 1 },
        '2026-06-17': { pnl: 1578.62, trades: 2 },
        '2026-06-18': { pnl: 818.46, trades: 3 },
        '2026-06-19': { pnl: -526.4, trades: 2 },
        '2026-06-22': { pnl: 1748.98, trades: 2 },
        '2026-06-23': { pnl: -723.33, trades: 3 },
        '2026-06-24': { pnl: -314.48, trades: 1 },
        '2026-06-25': { pnl: 371.75, trades: 1 },
        '2026-06-26': { pnl: 492.14, trades: 3 },
        '2026-06-29': { pnl: 1113.74, trades: 1 },
        '2026-06-30': { pnl: 1882.99, trades: 2 },
        '2026-07-01': { pnl: 443.68, trades: 3 },
        '2026-07-02': { pnl: 538.32, trades: 1 },
        '2026-07-03': { pnl: 446.71, trades: 2 },
        '2026-07-06': { pnl: 1511.24, trades: 1 },
        '2026-07-07': { pnl: -792.15, trades: 1 },
        '2026-07-08': { pnl: 1709.61, trades: 3 },
        '2026-07-09': { pnl: 1350.73, trades: 2 },
        '2026-07-10': { pnl: 880.55, trades: 3 },
        '2026-07-13': { pnl: 1560.45, trades: 3 },
        '2026-07-14': { pnl: -323.33, trades: 3 },
        '2026-07-15': { pnl: 442.17, trades: 1 },
        '2026-07-16': { pnl: 1327.26, trades: 2 },
        '2026-07-17': { pnl: 726.85, trades: 3 },
        '2026-07-20': { pnl: -627.93, trades: 2 },
        '2026-07-21': { pnl: 882.82, trades: 3 },
        '2026-07-22': { pnl: 1901.16, trades: 2 },
        '2026-07-23': { pnl: 424.75, trades: 3 },
        '2026-07-24': { pnl: -556.04, trades: 1 },
        '2026-07-27': { pnl: -380.91, trades: 3 },
        '2026-07-28': { pnl: 1876.94, trades: 3 },
        '2026-07-29': { pnl: -558.08, trades: 1 },
        '2026-07-30': { pnl: 1887.54, trades: 3 },
        '2026-07-31': { pnl: 533.02, trades: 1 },
        '2026-08-03': { pnl: 371.0, trades: 3 },
        '2026-08-04': { pnl: 1125.1, trades: 2 },
        '2026-08-05': { pnl: 1559.7, trades: 1 },
        '2026-08-06': { pnl: 1128.89, trades: 1 },
        '2026-08-07': { pnl: -285.86, trades: 1 },
        '2026-08-10': { pnl: 829.06, trades: 1 },
        '2026-08-11': { pnl: 363.42, trades: 3 },
        '2026-08-12': { pnl: 754.11, trades: 3 },
        '2026-08-13': { pnl: -1155.69, trades: 2 },
        '2026-08-14': { pnl: 377.05, trades: 3 },
        '2026-08-17': { pnl: 1655.1, trades: 3 },
        '2026-08-18': { pnl: -385.68, trades: 1 },
        '2026-08-19': { pnl: 601.16, trades: 3 },
        '2026-08-20': { pnl: 427.02, trades: 1 },
        '2026-08-21': { pnl: 888.88, trades: 1 },
        '2026-08-24': { pnl: -318.56, trades: 1 },
        '2026-08-25': { pnl: 1209.9, trades: 2 },
        '2026-08-26': { pnl: 1723.99, trades: 1 },
        '2026-08-27': { pnl: 453.52, trades: 3 },
        '2026-08-28': { pnl: 1450.67, trades: 3 },
        '2026-08-31': { pnl: 305.88, trades: 3 },
        '2026-09-01': { pnl: -658.25, trades: 1 },
        '2026-09-02': { pnl: 526.21, trades: 3 },
        '2026-09-03': { pnl: 878.28, trades: 1 },
        '2026-09-04': { pnl: 1267.44, trades: 1 },
        '2026-09-07': { pnl: 274.84, trades: 2 },
        '2026-09-08': { pnl: 432.32, trades: 2 },
        '2026-09-09': { pnl: 1178.86, trades: 2 },
        '2026-09-10': { pnl: 426.27, trades: 1 },
        '2026-09-11': { pnl: 514.09, trades: 1 },
        '2026-09-14': { pnl: 2386.49, trades: 2 },
        '2026-09-15': { pnl: -486.88, trades: 1 },
        '2026-09-16': { pnl: 1496.85, trades: 3 },
        '2026-09-17': { pnl: -318.22, trades: 3 },
        '2026-09-18': { pnl: -146.85, trades: 1 },
        '2026-09-21': { pnl: 272.57, trades: 2 },
        '2026-09-22': { pnl: 1066.8, trades: 3 },
        '2026-09-23': { pnl: 2157.08, trades: 2 },
        '2026-09-24': { pnl: -833.72, trades: 1 },
        '2026-09-25': { pnl: -144.8, trades: 3 },
        '2026-09-28': { pnl: 738.21, trades: 1 },
        '2026-09-29': { pnl: 1727.78, trades: 1 },
        '2026-09-30': { pnl: -459.62, trades: 2 },
        '2026-10-01': { pnl: 439.14, trades: 1 },
        '2026-10-02': { pnl: 1575.6, trades: 1 },
        '2026-10-05': { pnl: -353.66, trades: 3 },
        '2026-10-06': { pnl: 14453.23, trades: 3 },
        '2026-10-07': { pnl: 1225.9, trades: 2 },
        '2026-10-08': { pnl: -831.84, trades: 2 },
        '2026-10-09': { pnl: 2380.93, trades: 3 },
        '2026-10-10': { pnl: 612.40, trades: 2 },
        '2026-10-13': { pnl: -677.5, trades: 2 },
        '2026-10-14': { pnl: -1041.0, trades: 1 },
        '2026-10-15': { pnl: -739.0, trades: 2 },
        '2026-10-16': { pnl: 1241, trades: 1 },
        '2026-10-20': { pnl: 805, trades: 2 },
        '2026-10-21': { pnl: 1401, trades: 2 },
        '2026-10-22': { pnl: 1389, trades: 2 },
        '2026-10-23': { pnl: 712, trades: 2 },
        '2026-10-27': { pnl: 1599, trades: 1 },
        '2026-10-28': { pnl: 711, trades: 3 },
        '2026-10-29': { pnl: -282.5, trades: 2 },
        '2026-10-30': { pnl: 791, trades: 3 },
        '2026-11-02': { pnl: 386, trades: 2 },
        '2026-11-03': { pnl: 1514, trades: 1 },
        '2026-11-04': { pnl: 1824, trades: 1 },
        '2026-11-05': { pnl: -738.0, trades: 3 },
        '2026-11-06': { pnl: 881, trades: 2 },
        '2026-11-09': { pnl: -480.0, trades: 1 },
        '2026-11-10': { pnl: -279.0, trades: 2 },
        '2026-11-11': { pnl: 923, trades: 3 },
        '2026-11-12': { pnl: 2214, trades: 1 },
        '2026-11-13': { pnl: 1327, trades: 2 },
        '2026-11-16': { pnl: 480, trades: 2 },
        '2026-11-17': { pnl: 2757, trades: 1 },
        '2026-11-18': { pnl: 1433, trades: 1 },
        '2026-11-19': { pnl: 1247, trades: 2 },
        '2026-11-20': { pnl: 990, trades: 2 },
        '2026-11-23': { pnl: 598, trades: 1 },
        '2026-11-24': { pnl: 1028, trades: 2 },
        '2026-11-25': { pnl: -586.5, trades: 2 },
        '2026-11-26': { pnl: 1015, trades: 2 },
        '2026-11-27': { pnl: 1314, trades: 1 },
        '2026-11-30': { pnl: 1103, trades: 1 }
    };

    // ===== BALANCE CURVE (PnL-linked, forced end $107,038.91) =====
    const TARGET_BALANCE_TODAY = 67490.78;
    const TARGET_BALANCE_END = 107038.91;
    const BALANCE_TODAY_KEY = '2026-10-07';
    const balanceByDate = {
        '2026-06-05': 19654.55,
        '2026-06-08': 19874.95,
        '2026-06-09': 20236.93,
        '2026-06-10': 21475.67,
        '2026-06-11': 21202.51,
        '2026-06-12': 21636.33,
        '2026-06-15': 21093.62,
        '2026-06-16': 21904.97,
        '2026-06-17': 23023.05,
        '2026-06-18': 23602.74,
        '2026-06-19': 23229.91,
        '2026-06-22': 24468.65,
        '2026-06-23': 23956.34,
        '2026-06-24': 23733.61,
        '2026-06-25': 23996.9,
        '2026-06-26': 24345.47,
        '2026-06-29': 25134.3,
        '2026-06-30': 26467.96,
        '2026-07-01': 26782.2,
        '2026-07-02': 27163.48,
        '2026-07-03': 27479.87,
        '2026-07-06': 28550.23,
        '2026-07-07': 27989.17,
        '2026-07-08': 29200.03,
        '2026-07-09': 30156.71,
        '2026-07-10': 30780.38,
        '2026-07-13': 31885.59,
        '2026-07-14': 31656.59,
        '2026-07-15': 31969.76,
        '2026-07-16': 32909.82,
        '2026-07-17': 33424.62,
        '2026-07-20': 32979.88,
        '2026-07-21': 33605.15,
        '2026-07-22': 34951.68,
        '2026-07-23': 35252.52,
        '2026-07-24': 34858.69,
        '2026-07-27': 34588.91,
        '2026-07-28': 35918.28,
        '2026-07-29': 35523.01,
        '2026-07-30': 36859.89,
        '2026-07-31': 37237.41,
        '2026-08-03': 37500.18,
        '2026-08-04': 38297.05,
        '2026-08-05': 39401.74,
        '2026-08-06': 40201.29,
        '2026-08-07': 39998.83,
        '2026-08-10': 40586.02,
        '2026-08-11': 40843.42,
        '2026-08-12': 41377.53,
        '2026-08-13': 40559.0,
        '2026-08-14': 40826.05,
        '2026-08-17': 41998.3,
        '2026-08-18': 41725.14,
        '2026-08-19': 42150.92,
        '2026-08-20': 42453.36,
        '2026-08-21': 43082.93,
        '2026-08-24': 42857.3,
        '2026-08-25': 43714.24,
        '2026-08-26': 44935.28,
        '2026-08-27': 45256.49,
        '2026-08-28': 46283.96,
        '2026-08-31': 46500.6,
        '2026-09-01': 46034.38,
        '2026-09-02': 46407.08,
        '2026-09-03': 47029.14,
        '2026-09-04': 47926.82,
        '2026-09-07': 48121.48,
        '2026-09-08': 48427.68,
        '2026-09-09': 49262.63,
        '2026-09-10': 49564.54,
        '2026-09-11': 49928.66,
        '2026-09-14': 51618.93,
        '2026-09-15': 51274.09,
        '2026-09-16': 52334.26,
        '2026-09-17': 52108.87,
        '2026-09-18': 52004.86,
        '2026-09-21': 52197.92,
        '2026-09-22': 52953.5,
        '2026-09-23': 54481.29,
        '2026-09-24': 53890.79,
        '2026-09-25': 53788.23,
        '2026-09-28': 54311.08,
        '2026-09-29': 55534.81,
        '2026-09-30': 55209.28,
        '2026-10-01': 55520.31,
        '2026-10-02': 56636.25,
        '2026-10-05': 56385.77,
        '2026-10-06': 66622.52,
        '2026-10-07': 67490.78,
        '2026-10-08': 66273.29,
        '2026-10-09': 69758.04,
        '2026-10-10': 70654.35,
        '2026-10-13': 69662.76,
        '2026-10-14': 68139.14,
        '2026-10-15': 67057.54,
        '2026-10-16': 68873.87,
        '2026-10-20': 70052.08,
        '2026-10-21': 72102.59,
        '2026-10-22': 74135.54,
        '2026-10-23': 75177.63,
        '2026-10-27': 77517.94,
        '2026-10-28': 78558.57,
        '2026-10-29': 78145.1,
        '2026-10-30': 79302.81,
        '2026-11-02': 79867.76,
        '2026-11-03': 82083.67,
        '2026-11-04': 84753.29,
        '2026-11-05': 83673.14,
        '2026-11-06': 84962.58,
        '2026-11-09': 84260.05,
        '2026-11-10': 83851.7,
        '2026-11-11': 85202.61,
        '2026-11-12': 88443.04,
        '2026-11-13': 90385.25,
        '2026-11-16': 91087.78,
        '2026-11-17': 95122.95,
        '2026-11-18': 97220.3,
        '2026-11-19': 99045.42,
        '2026-11-20': 100494.39,
        '2026-11-23': 101369.63,
        '2026-11-24': 102874.21,
        '2026-11-25': 102015.81,
        '2026-11-26': 103501.37,
        '2026-11-27': 105424.55,
        '2026-11-30': 107038.91
    };

    function getBalanceOn(dateStr) {
        if (balanceByDate[dateStr] != null) return balanceByDate[dateStr];
        let best = TARGET_BALANCE_TODAY;
        Object.keys(balanceByDate).forEach(k => {
            if (k <= dateStr) best = balanceByDate[k];
        });
        return best;
    }

    portfolioState.balance = TARGET_BALANCE_TODAY;
    (function() {
        let mtd = 0;
        Object.keys(dailyPnL).forEach(k => {
            if (k.startsWith('2026-10-') && k <= BALANCE_TODAY_KEY) mtd += dailyPnL[k].pnl;
        });
        portfolioState.changeAmount = Math.round(mtd * 100) / 100;
    })();

    function buildEquityCurve(daysBack) {
        const keys = Object.keys(balanceByDate).sort();
        const slice = keys.slice(-Math.min(daysBack, keys.length));
        return slice.map(k => balanceByDate[k]);
    }

    const chartDatasets = {
        '1W':  buildEquityCurve(5),
        'MTD': buildEquityCurve(7),
        '1M':  buildEquityCurve(22),
        '3M':  buildEquityCurve(66),
        'YTD': buildEquityCurve(100),
        '1Y':  buildEquityCurve(120),
        'ALL': buildEquityCurve(200)
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
    let equityChart = null;
    const equityCtxEl = document.getElementById('equityChart');
    if (equityCtxEl) {
        const allKeys = Object.keys(balanceByDate).sort();
        const eqData = allKeys.map(k => balanceByDate[k]);
        const eqLabels = allKeys.map(k => k.slice(5));
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

    function formatPnL(v) {
        const sign = v >= 0 ? '+' : '-';
        const num = Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return sign + '$' + num;
    }
    function dateKey(d) {
        return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    }

    function getMonthPnL(year, month) {
        // Only realized days: on or before TODAY (future hardcoded rows ignored)
        const todayKey = dateKey(TODAY);
        let total = 0, trades = 0, days = 0;
        Object.keys(dailyPnL).forEach(k => {
            if (k > todayKey) return;
            const p = k.split('-').map(Number);
            if (p[0] === year && p[1] === month + 1) {
                total += dailyPnL[k].pnl;
                trades += dailyPnL[k].trades || 0;
                days += 1;
            }
        });
        return { total, trades, days };
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
        // Goal bar: $0 → goal. Fill tracks progress (caps at 100%). Left label stays $0.
        const monthGoal = 3000;
        if (goalFill) {
            const pct = m.total <= 0 ? 0 : Math.min(100, (m.total / monthGoal) * 100);
            goalFill.style.width = pct + '%';
        }
        if (goalCurrent) goalCurrent.textContent = '$0';
    }

    function animateMonthChange(direction, updateFn) {
        // direction: 'next' = slide left (content goes left, new from right)
        //            'prev' = slide right
        const grid = document.getElementById('cal-grid');
        const title = document.getElementById('cal-month-title');
        if (!grid) { updateFn(); return; }

        const outClass = direction === 'next' ? 'cal-slide-out-left' : 'cal-slide-out-right';
        const inClass = direction === 'next' ? 'cal-slide-in-left' : 'cal-slide-in-right';

        if (title) title.classList.add('cal-title-out');
        grid.classList.remove('cal-slide-in-left', 'cal-slide-in-right');
        grid.classList.add(outClass);

        setTimeout(() => {
            updateFn();
            grid.classList.remove(outClass);
            void grid.offsetWidth;
            grid.classList.add(inClass);
            if (title) title.classList.remove('cal-title-out');
            setTimeout(() => grid.classList.remove(inClass), 300);
        }, 160);
    }

    function animateYearChange(direction, updateFn) {
        const grid = document.getElementById('year-months-grid');
        if (!grid) { updateFn(); return; }
        const outClass = direction === 'next' ? 'cal-slide-out-left' : 'cal-slide-out-right';
        const inClass = direction === 'next' ? 'cal-slide-in-left' : 'cal-slide-in-right';
        grid.classList.remove('cal-slide-in-left', 'cal-slide-in-right');
        grid.classList.add(outClass);
        setTimeout(() => {
            updateFn();
            grid.classList.remove(outClass);
            void grid.offsetWidth;
            grid.classList.add(inClass);
            setTimeout(() => grid.classList.remove(inClass), 300);
        }, 160);
    }

    document.getElementById('cal-prev')?.addEventListener('click', () => {
        animateMonthChange('prev', () => {
            if (calMonth === 0) { calMonth = 11; calYear--; } else calMonth--;
            if (calYear < 2026 || (calYear === 2026 && calMonth < 5)) { calYear = 2026; calMonth = 5; }
            renderCalendar();
        });
    });
    document.getElementById('cal-next')?.addEventListener('click', () => {
        animateMonthChange('next', () => {
            if (calMonth === 11) { calMonth = 0; calYear++; } else calMonth++;
            if (calYear > TODAY.getFullYear() || (calYear === TODAY.getFullYear() && calMonth > TODAY.getMonth())) {
                calYear = TODAY.getFullYear(); calMonth = TODAY.getMonth();
            }
            renderCalendar();
        });
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
        const todayKey = dateKey(TODAY);
        let total = 0;
        Object.keys(dailyPnL).forEach(k => {
            if (k > todayKey) return;
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
        const yearGoal = 100000;
        if (goalFill) {
            const pct = yearTotal <= 0 ? 0 : Math.min(100, (yearTotal / yearGoal) * 100);
            goalFill.style.width = pct + '%';
        }
        if (goalCur) goalCur.textContent = '$0';

        grid.innerHTML = '';
        const shortNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

        for (let m = 0; m < 12; m++) {
            const card = document.createElement('div');
            card.className = 'year-month-card';

            const mStats = getMonthPnL(yearViewYear, m);
            const todayKey = dateKey(TODAY);
            const hasData = Object.keys(dailyPnL).some(k => {
                if (k > todayKey) return false;
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
                pnlText = formatPnL(mStats.total);
                pnlClass = mStats.total >= 0 ? 'positive' : 'negative';
            }

            card.innerHTML = '<div class="year-month-name">' + shortNames[m] + '</div>' + miniHtml +
                '<div class="year-month-pnl ' + pnlClass + '">' + pnlText + '</div>';

            // Month is openable only if its first day has arrived (or earlier)
            const monthStart = new Date(yearViewYear, m, 1);
            const monthHasStarted = monthStart <= TODAY;
            const canOpen = monthHasStarted && (hasData || (yearViewYear === 2026 && m >= 5));
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
                // Hide inflated future totals
                if (!monthHasStarted) {
                    const pnlEl = card.querySelector('.year-month-pnl');
                    if (pnlEl) {
                        pnlEl.textContent = '—';
                        pnlEl.className = 'year-month-pnl zero';
                    }
                }
            }

            grid.appendChild(card);
        }
    }

    document.getElementById('cal-year-prev')?.addEventListener('click', () => {
        if (yearViewYear <= 2026) return;
        animateYearChange('prev', () => { yearViewYear--; renderYearView(); });
    });
    document.getElementById('cal-year-next')?.addEventListener('click', () => {
        if (yearViewYear >= TODAY.getFullYear()) return;
        animateYearChange('next', () => { yearViewYear++; renderYearView(); });
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


    // --- MESSAGES DROPDOWN ---
    const msgBtn = document.getElementById('msg-btn');
    const msgDropdown = document.getElementById('msg-dropdown');
    if (msgBtn && msgDropdown) {
        msgBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            msgDropdown.classList.toggle('hidden');
            if (notifDropdown) notifDropdown.classList.add('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!msgDropdown.contains(e.target) && !msgBtn.contains(e.target)) {
                msgDropdown.classList.add('hidden');
            }
        });
    }
    document.getElementById('side-msg-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        msgDropdown?.classList.remove('hidden');
    });

    // --- LIVE SCREENER ---
    const scrData = {
        gainers: null, // use DOM default
        losers: [
            {sym:'CRWV', last:'24.18', chg:'-3.20%', vol:'8.4M', bid:'24.15', ask:'24.22', spr:'0.07', rvol:'2.55x', neg:true},
            {sym:'AAPL', last:'182.44', chg:'-0.82%', vol:'39.5M', bid:'182.42', ask:'182.46', spr:'0.04', rvol:'1.05x', neg:true},
            {sym:'INTC', last:'22.10', chg:'-1.45%', vol:'41.2M', bid:'22.08', ask:'22.12', spr:'0.04', rvol:'1.60x', neg:true},
            {sym:'BA', last:'178.40', chg:'-0.95%', vol:'6.1M', bid:'178.35', ask:'178.48', spr:'0.13', rvol:'1.12x', neg:true},
            {sym:'PYPL', last:'64.22', chg:'-1.10%', vol:'9.8M', bid:'64.20', ask:'64.26', spr:'0.06', rvol:'1.33x', neg:true},
        ],
        volume: [
            {sym:'TSLA', last:'198.52', chg:'+1.12%', vol:'62.1M', bid:'198.50', ask:'198.55', spr:'0.05', rvol:'1.22x'},
            {sym:'NVDA', last:'450.21', chg:'+2.41%', vol:'48.2M', bid:'450.18', ask:'450.24', spr:'0.06', rvol:'1.84x'},
            {sym:'SPY', last:'445.12', chg:'+0.75%', vol:'41.0M', bid:'445.10', ask:'445.14', spr:'0.04', rvol:'0.91x'},
            {sym:'AAPL', last:'182.44', chg:'-0.82%', vol:'39.5M', bid:'182.42', ask:'182.46', spr:'0.04', rvol:'1.05x', neg:true},
            {sym:'AMD', last:'112.50', chg:'+1.25%', vol:'31.4M', bid:'112.48', ask:'112.53', spr:'0.05', rvol:'1.41x'},
        ],
        futures: [
            {sym:'MES', last:'5824.25', chg:'+0.18%', vol:'142k', bid:'5824.00', ask:'5824.50', spr:'0.50', rvol:'—'},
            {sym:'MNQ', last:'20148.50', chg:'+0.32%', vol:'98k', bid:'20148.00', ask:'20149.00', spr:'1.00', rvol:'—'},
            {sym:'ES', last:'5824.00', chg:'+0.18%', vol:'1.2M', bid:'5823.75', ask:'5824.25', spr:'0.50', rvol:'—'},
            {sym:'NQ', last:'20148.00', chg:'+0.32%', vol:'0.9M', bid:'20147.50', ask:'20148.50', spr:'1.00', rvol:'—'},
            {sym:'YM', last:'42210', chg:'+0.11%', vol:'85k', bid:'42208', ask:'42212', spr:'4', rvol:'—'},
        ],
        shariah: [
            {sym:'AAPL', last:'182.44', chg:'-0.82%', vol:'39.5M', bid:'182.42', ask:'182.46', spr:'0.04', rvol:'1.05x', neg:true},
            {sym:'MSFT', last:'428.15', chg:'+0.41%', vol:'15.3M', bid:'428.10', ask:'428.20', spr:'0.10', rvol:'0.79x'},
            {sym:'NVDA', last:'450.21', chg:'+2.41%', vol:'48.2M', bid:'450.18', ask:'450.24', spr:'0.06', rvol:'1.84x'},
            {sym:'MU', last:'98.74', chg:'+3.02%', vol:'22.8M', bid:'98.70', ask:'98.78', spr:'0.08', rvol:'2.10x'},
            {sym:'AMD', last:'112.50', chg:'+1.25%', vol:'31.4M', bid:'112.48', ask:'112.53', spr:'0.05', rvol:'1.41x'},
        ]
    };

    function renderScrRows(rows) {
        const body = document.getElementById('scr-body');
        if (!body || !rows) return;
        body.innerHTML = rows.map(r => {
            const cls = r.neg ? 'neg' : 'pos';
            return `<tr data-sym="${r.sym}"><td class="sym">${r.sym}</td><td>${r.last}</td><td class="${cls}">${r.chg}</td><td>${r.vol}</td><td>${r.bid}</td><td>${r.ask}</td><td>${r.spr}</td><td>${r.rvol}</td></tr>`;
        }).join('');
        bindScrRows();
    }

    function bindScrRows() {
        document.querySelectorAll('#scr-body tr').forEach(tr => {
            tr.addEventListener('click', () => {
                document.querySelectorAll('#scr-body tr').forEach(x => x.classList.remove('active-row'));
                tr.classList.add('active-row');
                const sym = tr.getAttribute('data-sym');
                const lab = document.getElementById('scr-sym-label');
                if (lab) lab.textContent = sym;
            });
        });
    }
    bindScrRows();

    document.querySelectorAll('.scr-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.scr-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const key = btn.getAttribute('data-scr');
            if (key === 'gainers') {
                // restore default from first paint — re-click loads losers data inverse
                location.hash = '';
                // keep existing gainers rows if present; else volume
                if (scrData.volume) renderScrRows([
                    {sym:'MU', last:'98.74', chg:'+3.02%', vol:'22.8M', bid:'98.70', ask:'98.78', spr:'0.08', rvol:'2.10x'},
                    {sym:'NVDA', last:'450.21', chg:'+2.41%', vol:'48.2M', bid:'450.18', ask:'450.24', spr:'0.06', rvol:'1.84x'},
                    {sym:'AMD', last:'112.50', chg:'+1.25%', vol:'31.4M', bid:'112.48', ask:'112.53', spr:'0.05', rvol:'1.41x'},
                    {sym:'TSLA', last:'198.52', chg:'+1.12%', vol:'62.1M', bid:'198.50', ask:'198.55', spr:'0.05', rvol:'1.22x'},
                    {sym:'QQQ', last:'370.10', chg:'+0.95%', vol:'28.6M', bid:'370.08', ask:'370.12', spr:'0.04', rvol:'0.98x'},
                    {sym:'SPY', last:'445.12', chg:'+0.75%', vol:'41.0M', bid:'445.10', ask:'445.14', spr:'0.04', rvol:'0.91x'},
                    {sym:'META', last:'512.30', chg:'+0.64%', vol:'12.1M', bid:'512.20', ask:'512.40', spr:'0.20', rvol:'0.88x'},
                    {sym:'MSFT', last:'428.15', chg:'+0.41%', vol:'15.3M', bid:'428.10', ask:'428.20', spr:'0.10', rvol:'0.79x'},
                ]);
            } else if (scrData[key]) {
                renderScrRows(scrData[key]);
            }
        });
    });

    // Screener clock
    setInterval(() => {
        const el = document.getElementById('scr-clock');
        if (!el) return;
        const n = new Date();
        // fake ET display
        el.textContent = n.toLocaleTimeString('en-US', { hour12: false }) + ' ET';
    }, 1000);

    // Animate home + screener T&S
    function tickTape(listId, basePx) {
        const list = document.getElementById(listId);
        if (!list) return;
        const buy = Math.random() > 0.45;
        const px = (basePx + (Math.random() - 0.5) * 0.4).toFixed(2);
        const sz = [50,75,100,150,200,300,500,1000][Math.floor(Math.random()*8)];
        const t = new Date();
        const ts = t.toLocaleTimeString('en-US', { hour12: false });
        const row = document.createElement('div');
        row.className = 'tas-row ' + (buy ? 'buy' : 'sell');
        row.innerHTML = `<span>${ts}</span><span>${px}</span><span>${sz.toLocaleString()}</span>`;
        list.insertBefore(row, list.firstChild);
        while (list.children.length > 12) list.removeChild(list.lastChild);
    }
    setInterval(() => tickTape('home-tas', 198.52), 1800);
    setInterval(() => tickTape('tas-list', 450.21), 1400);

    // Init
    updateDisplay();
    animateLevel2();
    renderCalendar();
});
