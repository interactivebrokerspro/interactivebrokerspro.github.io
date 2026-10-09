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
        // Username field is cosmetic / paper alias — password still gates access
        if (enteredPassword === 'nabil') {
            loginError.classList.add('hidden');
            const btn = document.getElementById('login-btn');
            const spin = document.getElementById('auth-spinner');
            if (btn) btn.classList.add('hidden');
            if (spin) {
                spin.classList.remove('hidden');
                const fill = spin.querySelector('.auth-spinner-fill');
                if (fill) {
                    fill.style.width = '0%';
                    fill.style.transition = 'width 2.2s linear';
                    requestAnimationFrame(() => { fill.style.width = '100%'; });
                }
            }
            setTimeout(() => {
                localStorage.setItem('ib_auth_timestamp', Date.now().toString());
                loginScreen.classList.add('hidden');
                passwordInput.value = '';
                passwordInput.blur();
                const u = document.getElementById('username-input');
                if (u) u.blur();
                if (btn) btn.classList.remove('hidden');
                if (spin) spin.classList.add('hidden');
                if (portfolioChart) portfolioChart.resize();
            }, 2400);
        } else {
            loginError.classList.remove('hidden');
            passwordInput.focus();
        }
    });

    // iOS: prevent double-tap zoom on login controls
    document.querySelectorAll('#login-screen input, #login-screen button').forEach(el => {
        el.addEventListener('touchend', (ev) => { /* allow normal */ }, { passive: true });
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
        balance: 66273.29,
        changeAmount: 16508.37,
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


    // Session journal notes (hardcoded through Nov 30) — opened from calendar day tap
    const DAY_NOTES = {
        '2026-06-05': { instruments: 'NVDA', notes: 'Mean-reversion fade into prior day high worked cleanly.', tags: ['Breakout'], r: 1.92, vol: 240 },
        '2026-06-08': { instruments: 'Shariah equity', notes: 'Opening-range breakout held through first hour; scaled out into VWAP.', tags: ['VWAP'], r: 0.37, vol: 100 },
        '2026-06-09': { instruments: 'AMD', notes: 'Opening-range breakout held through first hour; scaled out into VWAP.', tags: ['Gap'], r: 0.6, vol: 240 },
        '2026-06-10': { instruments: 'TSLA', notes: 'Opening-range breakout held through first hour; scaled out into VWAP.', tags: ['RS'], r: 2.06, vol: 160 },
        '2026-06-11': { instruments: 'MES', notes: 'Stopped during volatility spike; rule-based exit honored.', tags: ['FOMC'], r: -0.45, vol: 160 },
        '2026-06-12': { instruments: 'AAPL', notes: 'Opening-range breakout held through first hour; scaled out into VWAP.', tags: ['RS'], r: 0.72, vol: 240 },
        '2026-06-15': { instruments: 'MNQ', notes: 'FOMC-related spike against position; daily loss well inside 2% cap.', tags: ['FOMC'], r: -0.9, vol: 240 },
        '2026-06-16': { instruments: 'MES', notes: 'Two-leg structure: morning probe + afternoon add.', tags: ['VWAP'], r: 1.35, vol: 100 },
        '2026-06-17': { instruments: 'QQQ', notes: 'Scalp into release, then runner on continuation.', tags: ['ORB'], r: 1.86, vol: 160 },
        '2026-06-18': { instruments: 'TSLA', notes: 'Afternoon trend leg; no overnight residual.', tags: ['Breakout'], r: 0.96, vol: 240 },
        '2026-06-19': { instruments: 'MES', notes: 'False breakout; flattened at max session risk.', tags: ['Stopped'], r: -0.62, vol: 160 },
        '2026-06-22': { instruments: 'AMD', notes: 'Two-leg structure: morning probe + afternoon add.', tags: ['Trend'], r: 2.06, vol: 160 },
        '2026-06-23': { instruments: 'SPY', notes: 'Chop around VWAP; cut early.', tags: ['Chop'], r: -0.85, vol: 240 },
        '2026-06-24': { instruments: 'AMD', notes: 'Stopped during volatility spike; rule-based exit honored.', tags: ['False BO'], r: -0.37, vol: 100 },
        '2026-06-25': { instruments: 'SPY', notes: 'Afternoon trend leg; no overnight residual.', tags: ['Trend'], r: 0.44, vol: 100 },
        '2026-06-26': { instruments: 'MNQ', notes: 'Afternoon trend leg; no overnight residual.', tags: ['RS'], r: 0.58, vol: 240 },
        '2026-06-29': { instruments: 'NVDA', notes: 'Opening-range breakout held through first hour; scaled out into VWAP.', tags: ['VWAP'], r: 1.31, vol: 100 },
        '2026-06-30': { instruments: 'TSLA', notes: 'Opening-range breakout held through first hour; scaled out into VWAP.', tags: ['RS'], r: 2.22, vol: 160 },
        '2026-07-01': { instruments: 'MU', notes: 'Scalp into release, then runner on continuation.', tags: ['Breakout'], r: 0.52, vol: 240 },
        '2026-07-02': { instruments: 'MNQ scalp', notes: 'Trend continuation after economic data; limit fills preferred.', tags: ['ORB', 'Trend'], r: 0.63, vol: 100 },
        '2026-07-03': { instruments: 'TSLA', notes: 'Relative-strength long in screened name; tight risk.', tags: ['Gap'], r: 0.53, vol: 160 },
        '2026-07-06': { instruments: 'SPY', notes: 'Mean-reversion fade into prior day high worked cleanly.', tags: ['Trend'], r: 1.78, vol: 100 },
        '2026-07-07': { instruments: 'MES + equity', notes: 'False breakout; flattened at max session risk.', tags: ['Stopped'], r: -0.93, vol: 100 },
        '2026-07-08': { instruments: 'TSLA', notes: 'Trend continuation after economic data; limit fills preferred.', tags: ['ORB', 'Trend'], r: 2.01, vol: 240 },
        '2026-07-09': { instruments: 'NVDA', notes: 'Scalp into release, then runner on continuation.', tags: ['ORB', 'Trend'], r: 1.59, vol: 160 },
        '2026-07-10': { instruments: 'SPY', notes: 'Afternoon trend leg; no overnight residual.', tags: ['VWAP'], r: 1.04, vol: 240 },
        '2026-07-13': { instruments: 'MNQ', notes: 'Afternoon trend leg; no overnight residual.', tags: ['Breakout'], r: 1.84, vol: 240 },
        '2026-07-14': { instruments: 'MES/MNQ', notes: 'News whipsaw; no revenge size.', tags: ['Chop'], r: -0.38, vol: 240 },
        '2026-07-15': { instruments: 'MU', notes: 'Relative-strength long in screened name; tight risk.', tags: ['ORB'], r: 0.52, vol: 100 },
        '2026-07-16': { instruments: 'Shariah equity', notes: 'Opening-range breakout held through first hour; scaled out into VWAP.', tags: ['Gap'], r: 1.56, vol: 160 },
        '2026-07-17': { instruments: 'NVDA', notes: 'Scalp into release, then runner on continuation.', tags: ['Gap'], r: 0.86, vol: 240 },
        '2026-07-20': { instruments: 'TSLA', notes: 'Chop around VWAP; cut early.', tags: ['False BO'], r: -0.74, vol: 160 },
        '2026-07-21': { instruments: 'MNQ scalp', notes: 'Relative-strength long in screened name; tight risk.', tags: ['VWAP'], r: 1.04, vol: 240 },
        '2026-07-22': { instruments: 'MNQ', notes: 'Trend continuation after economic data; limit fills preferred.', tags: ['ORB', 'Trend'], r: 2.24, vol: 160 },
        '2026-07-23': { instruments: 'MES + equity', notes: 'Scalp into release, then runner on continuation.', tags: ['VWAP'], r: 0.5, vol: 240 },
        '2026-07-24': { instruments: 'MES', notes: 'News whipsaw; no revenge size.', tags: ['False BO'], r: -0.65, vol: 100 },
        '2026-07-27': { instruments: 'Shariah equity', notes: 'Chop around VWAP; cut early.', tags: ['News'], r: -0.45, vol: 240 },
        '2026-07-28': { instruments: 'MES + equity', notes: 'Relative-strength long in screened name; tight risk.', tags: ['Gap'], r: 2.21, vol: 240 },
        '2026-07-29': { instruments: 'MES', notes: 'Chop around VWAP; cut early.', tags: ['News'], r: -0.66, vol: 100 },
        '2026-07-30': { instruments: 'MES/MNQ', notes: 'Afternoon trend leg; no overnight residual.', tags: ['VWAP'], r: 2.22, vol: 240 },
        '2026-07-31': { instruments: 'MU', notes: 'Opening-range breakout held through first hour; scaled out into VWAP.', tags: ['RS'], r: 0.63, vol: 100 },
        '2026-08-03': { instruments: 'MNQ scalp', notes: 'Trend continuation after economic data; limit fills preferred.', tags: ['Trend'], r: 0.44, vol: 240 },
        '2026-08-04': { instruments: 'MES + equity', notes: 'Mean-reversion fade into prior day high worked cleanly.', tags: ['Breakout'], r: 1.32, vol: 160 },
        '2026-08-05': { instruments: 'AAPL', notes: 'Two-leg structure: morning probe + afternoon add.', tags: ['ORB', 'Trend'], r: 1.83, vol: 100 },
        '2026-08-06': { instruments: 'MNQ', notes: 'Mean-reversion fade into prior day high worked cleanly.', tags: ['ORB', 'Trend'], r: 1.33, vol: 100 },
        '2026-08-07': { instruments: 'AAPL', notes: 'FOMC-related spike against position; daily loss well inside 2% cap.', tags: ['News'], r: -0.34, vol: 100 },
        '2026-08-10': { instruments: 'MES/MNQ', notes: 'Two-leg structure: morning probe + afternoon add.', tags: ['Breakout'], r: 0.98, vol: 100 },
        '2026-08-11': { instruments: 'AMD', notes: 'Trend continuation after economic data; limit fills preferred.', tags: ['Breakout'], r: 0.43, vol: 240 },
        '2026-08-12': { instruments: 'NVDA', notes: 'Scalp into release, then runner on continuation.', tags: ['Breakout'], r: 0.89, vol: 240 },
        '2026-08-13': { instruments: 'QQQ', notes: 'False breakout; flattened at max session risk.', tags: ['Stopped'], r: -1.36, vol: 160 },
        '2026-08-14': { instruments: 'MES/MNQ', notes: 'Mean-reversion fade into prior day high worked cleanly.', tags: ['RS'], r: 0.44, vol: 240 },
        '2026-08-17': { instruments: 'Shariah equity', notes: 'Mean-reversion fade into prior day high worked cleanly.', tags: ['ORB'], r: 1.95, vol: 240 },
        '2026-08-18': { instruments: 'MU', notes: 'FOMC-related spike against position; daily loss well inside 2% cap.', tags: ['Chop'], r: -0.45, vol: 100 },
        '2026-08-19': { instruments: 'SPY', notes: 'Trend continuation after economic data; limit fills preferred.', tags: ['ORB'], r: 0.71, vol: 240 },
        '2026-08-20': { instruments: 'MES/MNQ', notes: 'Relative-strength long in screened name; tight risk.', tags: ['Gap'], r: 0.5, vol: 100 },
        '2026-08-21': { instruments: 'TSLA', notes: 'Afternoon trend leg; no overnight residual.', tags: ['Gap'], r: 1.05, vol: 100 },
        '2026-08-24': { instruments: 'MES/MNQ', notes: 'FOMC-related spike against position; daily loss well inside 2% cap.', tags: ['False BO'], r: -0.37, vol: 100 },
        '2026-08-25': { instruments: 'Shariah equity', notes: 'Scalp into release, then runner on continuation.', tags: ['ORB'], r: 1.42, vol: 160 },
        '2026-08-26': { instruments: 'MU', notes: 'Two-leg structure: morning probe + afternoon add.', tags: ['Breakout'], r: 2.03, vol: 100 },
        '2026-08-27': { instruments: 'AAPL', notes: 'Relative-strength long in screened name; tight risk.', tags: ['Breakout'], r: 0.53, vol: 240 },
        '2026-08-28': { instruments: 'MNQ', notes: 'Relative-strength long in screened name; tight risk.', tags: ['Breakout'], r: 1.71, vol: 240 },
        '2026-08-31': { instruments: 'MES', notes: 'Mean-reversion fade into prior day high worked cleanly.', tags: ['VWAP'], r: 0.36, vol: 240 },
        '2026-09-01': { instruments: 'QQQ', notes: 'Chop around VWAP; cut early.', tags: ['Chop'], r: -0.77, vol: 100 },
        '2026-09-02': { instruments: 'MNQ', notes: 'Trend continuation after economic data; limit fills preferred.', tags: ['ORB'], r: 0.62, vol: 240 },
        '2026-09-03': { instruments: 'MNQ', notes: 'Opening-range breakout held through first hour; scaled out into VWAP.', tags: ['Trend'], r: 1.03, vol: 100 },
        '2026-09-04': { instruments: 'AMD', notes: 'Opening-range breakout held through first hour; scaled out into VWAP.', tags: ['Gap'], r: 1.49, vol: 100 },
        '2026-09-07': { instruments: 'TSLA', notes: 'Opening-range breakout held through first hour; scaled out into VWAP.', tags: ['VWAP'], r: 0.32, vol: 160 },
        '2026-09-08': { instruments: 'QQQ', notes: 'Afternoon trend leg; no overnight residual.', tags: ['Breakout'], r: 0.51, vol: 160 },
        '2026-09-09': { instruments: 'MES/MNQ', notes: 'Scalp into release, then runner on continuation.', tags: ['Scalp'], r: 1.39, vol: 160 },
        '2026-09-10': { instruments: 'NVDA', notes: 'Afternoon trend leg; no overnight residual.', tags: ['Gap'], r: 0.5, vol: 100 },
        '2026-09-11': { instruments: 'MU', notes: 'Opening-range breakout held through first hour; scaled out into VWAP.', tags: ['VWAP'], r: 0.6, vol: 100 },
        '2026-09-14': { instruments: 'MU', notes: 'Relative-strength long in screened name; tight risk.', tags: ['ORB', 'Trend'], r: 2.81, vol: 160 },
        '2026-09-15': { instruments: 'MU', notes: 'News whipsaw; no revenge size.', tags: ['Stopped'], r: -0.57, vol: 100 },
        '2026-09-16': { instruments: 'MES/MNQ', notes: 'Opening-range breakout held through first hour; scaled out into VWAP.', tags: ['Gap'], r: 1.76, vol: 240 },
        '2026-09-17': { instruments: 'MES + equity', notes: 'News whipsaw; no revenge size.', tags: ['FOMC'], r: -0.37, vol: 240 },
        '2026-09-18': { instruments: 'MES + equity', notes: 'False breakout; flattened at max session risk.', tags: ['False BO'], r: -0.17, vol: 100 },
        '2026-09-21': { instruments: 'MES', notes: 'Mean-reversion fade into prior day high worked cleanly.', tags: ['Gap'], r: 0.32, vol: 160 },
        '2026-09-22': { instruments: 'MES/MNQ', notes: 'Scalp into release, then runner on continuation.', tags: ['ORB'], r: 1.26, vol: 240 },
        '2026-09-23': { instruments: 'MNQ scalp', notes: 'Afternoon trend leg; no overnight residual.', tags: ['Scalp'], r: 2.54, vol: 160 },
        '2026-09-24': { instruments: 'Shariah equity', notes: 'Stopped during volatility spike; rule-based exit honored.', tags: ['News'], r: -0.98, vol: 100 },
        '2026-09-25': { instruments: 'AMD', notes: 'News whipsaw; no revenge size.', tags: ['Chop'], r: -0.17, vol: 240 },
        '2026-09-28': { instruments: 'NVDA', notes: 'Two-leg structure: morning probe + afternoon add.', tags: ['RS'], r: 0.87, vol: 100 },
        '2026-09-29': { instruments: 'AMD', notes: 'Afternoon trend leg; no overnight residual.', tags: ['Gap'], r: 2.03, vol: 100 },
        '2026-09-30': { instruments: 'Shariah equity', notes: 'False breakout; flattened at max session risk.', tags: ['False BO'], r: -0.54, vol: 160 },
        '2026-10-01': { instruments: 'MNQ scalp', notes: 'Two-leg structure: morning probe + afternoon add.', tags: ['RS'], r: 0.52, vol: 100 },
        '2026-10-02': { instruments: 'MNQ scalp', notes: 'Mean-reversion fade into prior day high worked cleanly.', tags: ['Breakout'], r: 1.85, vol: 100 },
        '2026-10-05': { instruments: 'MES + equity', notes: 'False breakout; flattened at max session risk.', tags: ['Chop'], r: -0.42, vol: 240 },
        '2026-10-06': { instruments: 'AMD', notes: 'Relative-strength long in screened name; tight risk.', tags: ['Gap'], r: 17.0, vol: 240 },
        '2026-10-07': { instruments: 'MES + equity', notes: 'Opening-range breakout held through first hour; scaled out into VWAP.', tags: ['ORB'], r: 1.44, vol: 160 },
        '2026-10-08': { instruments: 'MNQ scalp', notes: 'News whipsaw; no revenge size.', tags: ['FOMC'], r: -0.98, vol: 160 },
        '2026-10-09': { instruments: 'SPY', notes: 'Mean-reversion fade into prior day high worked cleanly.', tags: ['Gap'], r: 2.8, vol: 240 },
        '2026-10-10': { instruments: 'MU', notes: 'Two-leg structure: morning probe + afternoon add.', tags: ['Gap'], r: 0.72, vol: 160 },
        '2026-10-13': { instruments: 'NVDA', notes: 'Stopped during volatility spike; rule-based exit honored.', tags: ['Chop'], r: -0.8, vol: 160 },
        '2026-10-14': { instruments: 'MNQ', notes: 'False breakout; flattened at max session risk.', tags: ['FOMC'], r: -1.22, vol: 100 },
        '2026-10-15': { instruments: 'QQQ', notes: 'News whipsaw; no revenge size.', tags: ['Chop'], r: -0.87, vol: 160 },
        '2026-10-16': { instruments: 'MU', notes: 'Afternoon trend leg; no overnight residual.', tags: ['ORB'], r: 1.46, vol: 100 },
        '2026-10-20': { instruments: 'MU', notes: 'Scalp into release, then runner on continuation.', tags: ['Gap'], r: 0.95, vol: 160 },
        '2026-10-21': { instruments: 'MNQ scalp', notes: 'Scalp into release, then runner on continuation.', tags: ['VWAP'], r: 1.65, vol: 160 },
        '2026-10-22': { instruments: 'Shariah equity', notes: 'Opening-range breakout held through first hour; scaled out into VWAP.', tags: ['Breakout'], r: 1.63, vol: 160 },
        '2026-10-23': { instruments: 'MNQ scalp', notes: 'Scalp into release, then runner on continuation.', tags: ['RS'], r: 0.84, vol: 160 },
        '2026-10-27': { instruments: 'MU', notes: 'Mean-reversion fade into prior day high worked cleanly.', tags: ['Breakout'], r: 1.88, vol: 100 },
        '2026-10-28': { instruments: 'MNQ scalp', notes: 'Scalp into release, then runner on continuation.', tags: ['Gap'], r: 0.84, vol: 240 },
        '2026-10-29': { instruments: 'MNQ', notes: 'Chop around VWAP; cut early.', tags: ['FOMC'], r: -0.33, vol: 160 },
        '2026-10-30': { instruments: 'AAPL', notes: 'Scalp into release, then runner on continuation.', tags: ['VWAP'], r: 0.93, vol: 240 },
        '2026-11-02': { instruments: 'MES + equity', notes: 'Mean-reversion fade into prior day high worked cleanly.', tags: ['Trend'], r: 0.45, vol: 160 },
        '2026-11-03': { instruments: 'MES/MNQ', notes: 'Opening-range breakout held through first hour; scaled out into VWAP.', tags: ['Trend'], r: 1.78, vol: 100 },
        '2026-11-04': { instruments: 'TSLA', notes: 'Relative-strength long in screened name; tight risk.', tags: ['Trend'], r: 2.15, vol: 100 },
        '2026-11-05': { instruments: 'TSLA', notes: 'FOMC-related spike against position; daily loss well inside 2% cap.', tags: ['FOMC'], r: -0.87, vol: 240 },
        '2026-11-06': { instruments: 'Shariah equity', notes: 'Trend continuation after economic data; limit fills preferred.', tags: ['Trend'], r: 1.04, vol: 160 },
        '2026-11-09': { instruments: 'AMD', notes: 'FOMC-related spike against position; daily loss well inside 2% cap.', tags: ['Chop'], r: -0.56, vol: 100 },
        '2026-11-10': { instruments: 'MES', notes: 'Stopped during volatility spike; rule-based exit honored.', tags: ['Stopped'], r: -0.33, vol: 160 },
        '2026-11-11': { instruments: 'AMD', notes: 'Scalp into release, then runner on continuation.', tags: ['Trend'], r: 1.09, vol: 240 },
        '2026-11-12': { instruments: 'AAPL', notes: 'Two-leg structure: morning probe + afternoon add.', tags: ['RS'], r: 2.6, vol: 100 },
        '2026-11-13': { instruments: 'QQQ', notes: 'Opening-range breakout held through first hour; scaled out into VWAP.', tags: ['Scalp'], r: 1.56, vol: 160 },
        '2026-11-16': { instruments: 'QQQ', notes: 'Trend continuation after economic data; limit fills preferred.', tags: ['RS'], r: 0.56, vol: 160 },
        '2026-11-17': { instruments: 'MNQ scalp', notes: 'Afternoon trend leg; no overnight residual.', tags: ['Gap'], r: 3.24, vol: 100 },
        '2026-11-18': { instruments: 'SPY', notes: 'Afternoon trend leg; no overnight residual.', tags: ['Breakout'], r: 1.69, vol: 100 },
        '2026-11-19': { instruments: 'MES/MNQ', notes: 'Opening-range breakout held through first hour; scaled out into VWAP.', tags: ['Gap'], r: 1.47, vol: 160 },
        '2026-11-20': { instruments: 'MU', notes: 'Scalp into release, then runner on continuation.', tags: ['Breakout'], r: 1.16, vol: 160 },
        '2026-11-23': { instruments: 'AMD', notes: 'Mean-reversion fade into prior day high worked cleanly.', tags: ['Trend'], r: 0.7, vol: 100 },
        '2026-11-24': { instruments: 'AMD', notes: 'Afternoon trend leg; no overnight residual.', tags: ['ORB'], r: 1.21, vol: 160 },
        '2026-11-25': { instruments: 'MU', notes: 'False breakout; flattened at max session risk.', tags: ['False BO'], r: -0.69, vol: 160 },
        '2026-11-26': { instruments: 'MES', notes: 'Two-leg structure: morning probe + afternoon add.', tags: ['Trend'], r: 1.19, vol: 160 },
        '2026-11-27': { instruments: 'MES/MNQ', notes: 'Mean-reversion fade into prior day high worked cleanly.', tags: ['ORB', 'Trend'], r: 1.55, vol: 100 },
        '2026-11-30': { instruments: 'TSLA', notes: 'Scalp into release, then runner on continuation.', tags: ['VWAP'], r: 1.3, vol: 100 },
    };

    // ===== BALANCE CURVE (PnL-linked, forced end $107,038.91) =====
    // Live "today" balance is derived from system clock (see getEffectiveToday below).
    const TARGET_BALANCE_END = 107038.91;
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
        // walk backward to latest known balance on/before dateStr
        const keys = Object.keys(balanceByDate).sort();
        let best = keys.length ? balanceByDate[keys[0]] : 50000;
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] <= dateStr) best = balanceByDate[keys[i]];
            else break;
        }
        return best;
    }

    // portfolioState balance + MTD are set after TODAY is resolved (see auto-date block below)

    function buildEquityCurve(daysBack) {
        const keys = Object.keys(balanceByDate).sort();
        const slice = keys.slice(-Math.min(daysBack, keys.length));
        const vals = slice.map(k => balanceByDate[k]);
        if (vals.length < 6) return vals;
        const n = vals.length;
        const out = vals.slice();
        // Structured pullbacks
        const dipAt = [0.12, 0.27, 0.41, 0.55, 0.69, 0.82, 0.91].map(p => Math.floor(p * (n - 1)));
        dipAt.forEach((i, idx) => {
            if (i <= 0 || i >= n - 1) return;
            const depth = 0.006 + (idx % 4) * 0.005;
            const span = 1 + (idx % 3);
            for (let j = Math.max(1, i - span); j <= Math.min(n - 2, i + span); j++) {
                const t = 1 - Math.abs(j - i) / (span + 1);
                out[j] = out[j] * (1 - depth * t);
            }
        });
        // Micro noise / wiggles (deterministic from index so chart is stable across reloads)
        for (let i = 1; i < n - 1; i++) {
            const seed = ((i * 9301 + 49297) % 233280) / 233280; // 0..1
            const wiggle = (seed - 0.5) * 0.0045; // ±0.225%
            out[i] = out[i] * (1 + wiggle);
            // occasional sharp 1-bar dip
            if (seed > 0.92) out[i] = out[i] * 0.991;
            if (seed < 0.07) out[i] = out[i] * 1.004;
        }
        // flat patches
        [[0.33, 2], [0.61, 3], [0.78, 2]].forEach(([p, len]) => {
            const s = Math.floor(p * (n - 1));
            for (let j = s; j < Math.min(n - 1, s + len); j++) out[j] = out[s];
        });
        return out;
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

    function calculateEMA(data, period) {
        const ema = [];
        const k = 2 / (period + 1);
        let prev = null;
        for (let i = 0; i < data.length; i++) {
            const v = data[i];
            if (v == null || isNaN(v)) { ema.push(null); continue; }
            if (prev == null) {
                // seed with SMA of first `period` points when available
                if (i < period - 1) { ema.push(null); continue; }
                let sum = 0, n = 0;
                for (let j = i - period + 1; j <= i; j++) {
                    if (data[j] != null) { sum += data[j]; n++; }
                }
                prev = n ? sum / n : v;
                ema.push(prev);
            } else {
                prev = v * k + prev * (1 - k);
                ema.push(prev);
            }
        }
        return ema;
    }
    // Keep alias so older call sites don't break
    function calculateSMA(data, period) { return calculateEMA(data, period); }

    const currentData = chartDatasets['1M'];
    const fastMA = calculateEMA(currentData, 9);
    const slowMA = calculateEMA(currentData, 21);

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

            const newFastMA = calculateEMA(scaledData, 9);
            const newSlowMA = calculateEMA(scaledData, 21);

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
            
            const newFastMA = calculateEMA(scaledData, 9);
            const newSlowMA = calculateEMA(scaledData, 21);

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
            if(target === 'view-journal') {
                setTimeout(() => {
                    if (typeof renderTradesVizJournal === 'function') renderTradesVizJournal();
                }, 50);
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

    // =====================================================
    // AUTO "TODAY" — follows the real system clock
    // =====================================================
    // A trading day's P&L unlocks at UNLOCK_HOUR local time (default 7 AM).
    // Before that hour, "today" is still the previous session day.
    // Set UNLOCK_HOUR = 0 for midnight unlock.
    // All dailyPnL / balanceByDate rows through Nov 30 stay hardcoded;
    // they only become visible once effective-today reaches that date.
    const UNLOCK_HOUR = 7;

    function dateKeyFromDate(d) {
        return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    }

    function getEffectiveToday() {
        const now = new Date();
        let d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        // Before unlock hour → still previous calendar day
        if (now.getHours() < UNLOCK_HOUR) {
            d.setDate(d.getDate() - 1);
        }
        // Weekends roll back to Friday (no weekend trading sessions)
        while (d.getDay() === 0 || d.getDay() === 6) {
            d.setDate(d.getDate() - 1);
        }
        // Clamp to live data range
        const first = new Date(2026, 5, 5);
        const lastKey = Object.keys(dailyPnL).sort().pop();
        const last = lastKey
            ? new Date(+lastKey.slice(0,4), +lastKey.slice(5,7) - 1, +lastKey.slice(8,10))
            : d;
        if (d < first) d = new Date(first);
        if (d > last) d = new Date(last);
        return d;
    }

    let TODAY = getEffectiveToday();
    const FIRST_TRADE = new Date(2026, 5, 5);

    function syncStateToToday() {
        const key = dateKeyFromDate(TODAY);
        portfolioState.balance = getBalanceOn(key);
        let mtd = 0;
        const ym = key.slice(0, 7);
        Object.keys(dailyPnL).forEach(k => {
            if (k.startsWith(ym) && k <= key) mtd += dailyPnL[k].pnl;
        });
        portfolioState.changeAmount = Math.round(mtd * 100) / 100;
    }
    syncStateToToday();

    // Order history: only show rows on/before effective today.
    // Dates in the table are "Mon DD" (year 2026 implied).
    const OH_MONTH = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
    function filterOrderHistory() {
        const todayKey = dateKeyFromDate(TODAY);
        const rows = document.querySelectorAll('.order-table tbody tr');
        let lastVisibleLabel = 'Jun 05';
        rows.forEach(tr => {
            const td = tr.querySelector('td');
            if (!td) return;
            const m = td.textContent.trim().match(/^([A-Za-z]+)\s+(\d{1,2})/);
            if (!m) { tr.style.display = 'none'; return; }
            const mon = OH_MONTH[m[1].slice(0, 3)];
            if (mon == null) { tr.style.display = 'none'; return; }
            const key = '2026-' + String(mon + 1).padStart(2, '0') + '-' + String(+m[2]).padStart(2, '0');
            if (key > todayKey) {
                tr.style.display = 'none';
            } else {
                tr.style.display = '';
                lastVisibleLabel = m[1].slice(0, 3) + ' ' + String(+m[2]).padStart(2, '0');
            }
        });
        // Cumulative net from dailyPnL (more accurate than summing table fills)
        let cum = 0;
        Object.keys(dailyPnL).forEach(k => {
            if (k <= todayKey) cum += dailyPnL[k].pnl;
        });
        const header = document.querySelector('#view-order-history .widget-title h4');
        if (header) {
            header.innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i> Order History (Jun 05 – ' + lastVisibleLabel + ', 2026)';
        }
        const totalSpan = document.querySelector('#view-order-history .widget-title span');
        if (totalSpan) {
            const sign = cum >= 0 ? '+' : '\u2013';
            totalSpan.textContent = 'Total Net Profit: ' + sign + '$' + Math.abs(cum).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            totalSpan.style.color = cum >= 0 ? 'var(--green-positive)' : 'var(--red-negative)';
        }
    
        const visible = document.querySelectorAll('.order-table tbody tr:not([style*="display: none"])').length;
        const total = document.querySelectorAll('.order-table tbody tr').length;
        const counter = document.getElementById('oh-counter');
        if (counter) {
            const shown = Math.min(visible, 25);
            counter.textContent = visible
                ? ('Showing 1–' + shown + ' of ' + visible + (total > visible ? ' (session)' : ''))
                : 'No fills yet';
        }
        // leave scrollbar mid-ish on order history
        const ohScroll = document.getElementById('order-history-scroll');
        if (ohScroll && ohScroll.scrollHeight > ohScroll.clientHeight) {
            ohScroll.scrollTop = Math.min(48, ohScroll.scrollHeight * 0.08);
        }

    }

    // Keep static UI numbers (ticker, portfolio cards, account NLV) in sync
    function syncStaticBalances() {
        const bal = portfolioState.balance;
        const balFmt = bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const mtd = portfolioState.changeAmount;
        const mtdFmt = (mtd >= 0 ? '+' : '\u2013') + '$' + Math.abs(mtd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        document.querySelectorAll('#status-ticker .ticker-track span').forEach(sp => {
            if (sp.textContent && sp.textContent.indexOf('NLV') === 0) {
                sp.textContent = 'NLV $' + balFmt;
            }
        });
        document.querySelectorAll('#view-portfolio .portfolio-header-stats .stat-card').forEach(card => {
            const lab = card.querySelector('.stat-label');
            const val = card.querySelector('.stat-value');
            if (!lab || !val) return;
            if (lab.textContent.indexOf('NLV') >= 0) {
                val.textContent = '$' + balFmt;
            }
            if (lab.textContent.indexOf('Net Increase') >= 0) {
                val.textContent = mtdFmt;
                val.className = 'stat-value ' + (mtd >= 0 ? 'positive' : 'negative');
            }
        });
        document.querySelectorAll('#view-profile .util-row').forEach(row => {
            const spans = row.querySelectorAll('span');
            if (spans.length >= 2 && spans[0].textContent.trim() === 'NLV') {
                spans[1].textContent = '$' + balFmt;
            }
        });
        document.querySelectorAll('.util-strip .util-row').forEach(row => {
            const spans = row.querySelectorAll('span');
            if (spans.length >= 2 && spans[0].textContent.indexOf('Realized MTD') >= 0) {
                spans[1].textContent = mtdFmt;
                spans[1].className = 'mono ' + (mtd >= 0 ? 'pos' : 'neg');
            }
        });
        const ttStats = document.querySelectorAll('.tt-stats .tt-stat');
        ttStats.forEach(st => {
            const lab = st.querySelector('.tt-label');
            const val = st.querySelector('.tt-val');
            if (lab && val && lab.textContent.indexOf('Net Profit') >= 0) {
                val.textContent = '$' + (bal / 1000).toFixed(1) + 'K';
            }
        });
    }

    function applyTodayRoll() {
        syncStateToToday();
        if (typeof updateDisplay === 'function') updateDisplay();
        if (typeof renderCalendar === 'function') renderCalendar();
        if (typeof renderWeekView === 'function' && typeof calMode !== 'undefined' && calMode === 'week') renderWeekView();
        if (typeof renderYearView === 'function' && typeof calMode !== 'undefined' && calMode === 'year') renderYearView();
        filterOrderHistory();
        syncStaticBalances();
    }

    // Auto-refresh when the day rolls over while the tab is open (checks every 30s)
    setInterval(() => {
        const next = getEffectiveToday();
        if (dateKeyFromDate(next) !== dateKeyFromDate(TODAY)) {
            TODAY = next;
            calYear = TODAY.getFullYear();
            calMonth = TODAY.getMonth();
            applyTodayRoll();
        }
    }, 30 * 1000);

    let calYear = TODAY.getFullYear(), calMonth = TODAY.getMonth();
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


    function openDayDetail(key) {
        const modal = document.getElementById('day-detail-modal');
        if (!modal) return;
        const data = dailyPnL[key] || { pnl: 0, trades: 0 };
        const note = DAY_NOTES[key] || {};
        const parts = key.split('-').map(Number);
        const dt = new Date(parts[0], parts[1] - 1, parts[2]);
        const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const dateStr = days[dt.getDay()] + ', ' + months[dt.getMonth()] + ' ' + parts[2] + ', ' + parts[0];

        const pnlEl = document.getElementById('dd-pnl');
        const dateEl = document.getElementById('dd-date');
        if (dateEl) dateEl.textContent = dateStr;
        if (pnlEl) {
            pnlEl.textContent = formatPnL(data.pnl);
            pnlEl.className = 'day-detail-pnl ' + (data.pnl >= 0 ? 'pos' : 'neg');
        }
        const set = (id, v) => { const n = document.getElementById(id); if (n) n.textContent = v; };
        set('dd-trades', String(data.trades || 0));
        set('dd-vol', String(note.vol != null ? note.vol : '—'));
        set('dd-wl', data.pnl >= 0 ? '1 / 0' : '0 / 1');
        set('dd-r', note.r != null ? ((note.r >= 0 ? '+' : '') + note.r + 'R') : '—');
        set('dd-notes', note.notes || 'No session notes logged.');
        set('dd-instruments', note.instruments || '—');
        const tagsEl = document.getElementById('dd-tags');
        if (tagsEl) {
            const tags = note.tags || [];
            tagsEl.innerHTML = tags.map(t => {
                const cls = /stop|loss|chop|news|fomc|false/i.test(t) ? 'red' : (/orb|trend|vwap|break|rs|gap|scalp/i.test(t) ? 'green' : 'blue');
                return '<span class="day-tag ' + cls + '">' + t + '</span>';
            }).join('') || '<span class="day-tag">—</span>';
        }
        modal.classList.add('active');
    }
    document.getElementById('dd-close')?.addEventListener('click', () => {
        document.getElementById('day-detail-modal')?.classList.remove('active');
    });
    document.getElementById('day-detail-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'day-detail-modal') e.target.classList.remove('active');
    });

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

        // TradesViz-style full week grid (Sun–Sat)
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
        const firstDow = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
        // leading empties from previous month visual
        for (let i = 0; i < firstDow; i++) {
            const s = document.createElement('div');
            s.className = 'cal-day cal-day-out';
            grid.appendChild(s);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(calYear, calMonth, d);
            const dow = date.getDay();
            const key = calYear + '-' + String(calMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
            const data = dailyPnL[key];
            const isWeekend = dow === 0 || dow === 6;
            const isFuture = date > TODAY;
            const isBefore = date < FIRST_TRADE;
            const el = document.createElement('div');
            el.className = 'cal-day';

            // Always mark Sat/Sun so they never pick up weekday empty/future box shade
            if (isWeekend) el.classList.add('weekend');

            if (isWeekend && (!data || !data.trades)) {
                if (isFuture || isBefore) el.classList.add('future');
                el.innerHTML = '<span class="cal-day-num">' + d + '</span>';
            } else if (isFuture || isBefore) {
                el.classList.add('future');
                el.innerHTML = '<span class="cal-day-num">' + d + '</span>';
            } else if (!data || !data.trades) {
                el.classList.add('empty');
                el.innerHTML = '<span class="cal-day-num">' + d + '</span>';
            } else {
                const win = data.pnl >= 0;
                el.classList.add(win ? 'win' : 'loss', 'has-data');
                const trades = data.trades || 0;
                const note = DAY_NOTES[key] || {};
                const volTag = note.vol != null ? note.vol : (trades <= 1 ? trades * 100 : trades * 80);
                const w = win ? 1 : 0;
                const l = win ? 0 : 1;
                el.innerHTML =
                    '<div class="cal-day-top"><span class="cal-day-num">' + d + '</span></div>' +
                    '<span class="cal-day-pnl">' + formatPnL(data.pnl) + '</span>' +
                    '<span class="cal-day-meta">Vol: ' + volTag + ' · Tr: ' + trades + '</span>' +
                    '<span class="cal-day-wl">W' + w + ' / L' + l + '</span>';
                el.setAttribute('data-date', key);
                el.addEventListener('click', () => openDayDetail(key));
            }
            if (dateKey(date) === dateKey(TODAY)) el.classList.add('today');
            grid.appendChild(el);
        }
        // trailing cells to complete last week row
        const totalCells = firstDow + daysInMonth;
        const trailing = (7 - (totalCells % 7)) % 7;
        for (let i = 0; i < trailing; i++) {
            const s = document.createElement('div');
            s.className = 'cal-day cal-day-out';
            grid.appendChild(s);
        }

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
        // ----- View mode switching (Week / Month / Year) -----
    let calMode = 'month';
    let yearViewYear = 2026;

    // Monday of the week that contains TODAY (Oct 8 2026 → Mon Oct 5)
    function getMonday(d) {
        const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const day = x.getDay(); // 0=Sun
        const diff = day === 0 ? -6 : 1 - day;
        x.setDate(x.getDate() + diff);
        return x;
    }
    let weekStart = getMonday(TODAY); // Monday of current week

    function showCalPanel(mode) {
        const monthPanel = document.getElementById('cal-month-view');
        const yearPanel = document.getElementById('cal-year-view');
        const weekPanel = document.getElementById('cal-week-view');
        if (!monthPanel || !yearPanel) return;

        [monthPanel, yearPanel, weekPanel].forEach(p => { if (p) p.classList.remove('active'); });

        if (mode === 'year') {
            void yearPanel.offsetWidth;
            yearPanel.classList.add('active');
            renderYearView();
        } else if (mode === 'week') {
            if (weekPanel) {
                void weekPanel.offsetWidth;
                weekPanel.classList.add('active');
            }
            renderWeekView();
        } else if (mode === 'all') {
            // All time → jump to year view of live year
            yearViewYear = 2026;
            void yearPanel.offsetWidth;
            yearPanel.classList.add('active');
            const yearPill = document.querySelector('.cal-range-pill[data-mode="year"]');
            document.querySelectorAll('.cal-range-pill').forEach(b => b.classList.remove('active'));
            if (yearPill) yearPill.classList.add('active');
            renderYearView();
            calMode = 'year';
            return;
        } else {
            void monthPanel.offsetWidth;
            monthPanel.classList.add('active');
            renderCalendar();
        }
        calMode = mode;
    }

    function renderWeekView() {
        const grid = document.getElementById('cal-week-grid');
        const title = document.getElementById('cal-week-title');
        const totalEl = document.getElementById('cal-week-total');
        const goalFill = document.getElementById('week-goal-fill');
        const prevBtn = document.getElementById('cal-week-prev');
        const nextBtn = document.getElementById('cal-week-next');
        if (!grid) return;

        const mon = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
        const fri = new Date(mon); fri.setDate(mon.getDate() + 4);

        const shortM = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const sameMonth = mon.getMonth() === fri.getMonth();
        const titleStr = sameMonth
            ? shortM[mon.getMonth()] + ' ' + mon.getDate() + ' – ' + fri.getDate() + ', ' + mon.getFullYear()
            : shortM[mon.getMonth()] + ' ' + mon.getDate() + ' – ' + shortM[fri.getMonth()] + ' ' + fri.getDate() + ', ' + fri.getFullYear();
        if (title) title.textContent = titleStr;

        // Nav limits: first trade week → current week
        const firstMon = getMonday(FIRST_TRADE);
        const todayMon = getMonday(TODAY);
        if (prevBtn) prevBtn.disabled = mon <= firstMon;
        if (nextBtn) nextBtn.disabled = mon >= todayMon;

        let weekTotal = 0;
        grid.innerHTML = '';

        for (let i = 0; i < 5; i++) {
            const d = new Date(mon); d.setDate(mon.getDate() + i);
            const key = dateKey(d);
            const data = dailyPnL[key];
            const isFuture = d > TODAY;
            const isBefore = d < FIRST_TRADE;
            const el = document.createElement('div');
            el.className = 'cal-day';

            if (isFuture || isBefore) {
                el.classList.add('future');
                el.innerHTML = '<span class="cal-day-num">' + d.getDate() + '</span><span class="cal-day-pnl">—</span>';
            } else if (!data || !data.trades) {
                el.classList.add('empty');
                el.innerHTML = '<span class="cal-day-num">' + d.getDate() + '</span><span class="cal-day-pnl">—</span>';
            } else {
                weekTotal += data.pnl;
                el.classList.add(data.pnl >= 0 ? 'win' : 'loss', 'has-data');
                el.innerHTML = '<span class="cal-day-num">' + d.getDate() + '</span>' +
                    '<span class="cal-day-pnl">' + formatPnL(data.pnl) + '</span>' +
                    '<span class="cal-day-trades">' + data.trades + ' trade' + (data.trades > 1 ? 's' : '') + '</span>';
            }
            // highlight today
            if (dateKey(d) === dateKey(TODAY)) el.style.outline = '2px solid var(--accent-blue)';
            grid.appendChild(el);
        }

        if (totalEl) {
            const sign = weekTotal >= 0 ? '+' : '';
            totalEl.textContent = sign + '$' + Math.abs(weekTotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            totalEl.className = 'stat-value ' + (weekTotal >= 0 ? 'positive' : 'negative');
        }
        const weekGoal = 1500;
        if (goalFill) {
            const pct = weekTotal <= 0 ? 0 : Math.min(100, (weekTotal / weekGoal) * 100);
            goalFill.style.width = pct + '%';
        }
        const goalCur = document.getElementById('week-goal-current');
        if (goalCur) goalCur.textContent = '$0';
    }

    function animateWeekChange(direction, updateFn) {
        const grid = document.getElementById('cal-week-grid');
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

    document.getElementById('cal-week-prev')?.addEventListener('click', () => {
        animateWeekChange('prev', () => {
            weekStart = new Date(weekStart); weekStart.setDate(weekStart.getDate() - 7);
            const firstMon = getMonday(FIRST_TRADE);
            if (weekStart < firstMon) weekStart = firstMon;
            renderWeekView();
        });
    });
    document.getElementById('cal-week-next')?.addEventListener('click', () => {
        animateWeekChange('next', () => {
            weekStart = new Date(weekStart); weekStart.setDate(weekStart.getDate() + 7);
            const todayMon = getMonday(TODAY);
            if (weekStart > todayMon) weekStart = todayMon;
            renderWeekView();
        });
    });

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
            } else if (mode === 'week') {
                weekStart = getMonday(TODAY);
                showCalPanel('week');
            } else if (mode === 'all') {
                showCalPanel('all');
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

    // Animate home + screener T&S — irregular sizes, odd lots, occasional outside print
    const ODD_SIZES = [7, 12, 25, 37, 48, 50, 63, 75, 88, 100, 125, 150, 173, 200, 250, 300, 400, 500, 650, 800, 1000, 1200, 2500];
    function tickTape(listId, basePx, bidAsk) {
        const list = document.getElementById(listId);
        if (!list) return;
        const buy = Math.random() > 0.47;
        let px = basePx + (Math.random() - 0.5) * 0.35;
        // ~8% chance of a print slightly outside the spread (microstructure noise)
        if (bidAsk && Math.random() < 0.08) {
            px = buy ? bidAsk.ask + 0.01 + Math.random() * 0.03 : bidAsk.bid - 0.01 - Math.random() * 0.03;
        }
        px = px.toFixed(2);
        const sz = ODD_SIZES[Math.floor(Math.random() * ODD_SIZES.length)];
        const t = new Date();
        const ts = t.toLocaleTimeString('en-US', { hour12: false });
        const row = document.createElement('div');
        row.className = 'tas-row ' + (buy ? 'buy' : 'sell');
        row.innerHTML = `<span>${ts}</span><span>${px}</span><span>${sz.toLocaleString()}</span>`;
        list.insertBefore(row, list.firstChild);
        while (list.children.length > 11) list.removeChild(list.lastChild); // leave partial cut-off
    }
    // Staggered intervals so panels don't update in perfect lockstep
    setInterval(() => tickTape('home-tas', 198.52, { bid: 198.45, ask: 198.50 }), 1650 + Math.random() * 400);
    setInterval(() => tickTape('tas-list', 450.21, { bid: 450.18, ask: 450.24 }), 1280 + Math.random() * 350);

    // ----- Session realism: latency flicker, L2 lag, BP micro-moves, ticker stale -----
    (function sessionRealism() {
        const latEl = document.getElementById('conn-latency');
        const tickLat = document.getElementById('ticker-latency');
        const loginLat = document.getElementById('login-latency');
        const toast = document.getElementById('session-toast');
        function showToast(msg, ms) {
            if (!toast) return;
            toast.textContent = msg;
            toast.classList.remove('hidden');
            clearTimeout(showToast._t);
            showToast._t = setTimeout(() => toast.classList.add('hidden'), ms || 1400);
        }
        const bpRows = [];
        document.querySelectorAll('.util-row, .util-strip .util-row').forEach(r => {
            const s = r.querySelectorAll('span');
            if (s.length >= 2 && /Buying Power|Excess Liq/i.test(s[0].textContent)) bpRows.push(s[1]);
        });

        function jitterLatency() {
            // 34–58 ms, biased around 42
            const ms = Math.round(38 + Math.random() * 18 + (Math.random() < 0.15 ? Math.random() * 12 : 0));
            if (latEl) latEl.textContent = ms + ' ms · Chicago';
            if (tickLat) tickLat.textContent = String(ms);
            if (loginLat) loginLat.textContent = ms + ' ms';
            const gw = document.getElementById('ticker-gateway');
            if (gw && Math.random() < 0.06) {
                gw.classList.remove('pos');
                gw.style.color = '#f59e0b';
                showToast('Market data farm connection is OK', 1100);
                setTimeout(() => { gw.classList.add('pos'); gw.style.color = ''; }, 900 + Math.random() * 300);
            }
            // Fills today micro-tick (session activity)
            document.querySelectorAll('.util-strip .util-row').forEach(row => {
                const spans = row.querySelectorAll('span');
                if (spans.length >= 2 && /Fills today/i.test(spans[0].textContent)) {
                    if (Math.random() < 0.08) {
                        const n = parseInt(spans[1].textContent, 10) || 0;
                        if (n < 12) spans[1].textContent = String(n + 1);
                    }
                }
            });
        }
        setInterval(jitterLatency, 2200 + Math.random() * 1800);
        jitterLatency();

        // Level 2 slight lag / imbalance pulse
        const l2 = document.querySelector('.l2-widget');
        setInterval(() => {
            if (!l2) return;
            l2.classList.add('lagging');
            setTimeout(() => l2.classList.remove('lagging'), 600);
            // nudge a random size (already handled by animateLevel2) + occasional large ask
            const sells = document.querySelectorAll('.l2-col:last-child .size-val');
            if (sells.length && Math.random() < 0.25) {
                const el = sells[Math.floor(Math.random() * sells.length)];
                el.textContent = String(Math.max(50, parseInt(el.textContent, 10) + Math.floor(Math.random() * 400 - 80)));
            }
        }, 3100);

        // Buying power / excess liq micro-flicker (margin recalc)
        setInterval(() => {
            bpRows.forEach(el => {
                const raw = el.textContent.replace(/[^0-9.]/g, '');
                let v = parseFloat(raw);
                if (isNaN(v)) return;
                v += (Math.random() - 0.5) * 18; // ±$9-ish
                el.textContent = '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            });
        }, 4800);

        // Ticker strip: mark some symbols stale briefly
        setInterval(() => {
            const spans = document.querySelectorAll('#status-ticker .ticker-track span');
            spans.forEach(s => s.classList.remove('stale'));
            if (spans.length) {
                const n = 1 + Math.floor(Math.random() * 3);
                for (let i = 0; i < n; i++) {
                    const s = spans[Math.floor(Math.random() * spans.length)];
                    if (s) s.classList.add('stale');
                }
            }
        }, 1600);

        // Focus / hover residue — looks like a real cursor was on the page
        const buyBtn = document.querySelector('.buy-btn');
        const residueTargets = () => [
            buyBtn,
            document.querySelector('.scr-table tbody tr'),
            document.querySelector('.movers-list li'),
            document.querySelector('.l2-row'),
            document.querySelector('.side-link.active'),
            document.querySelector('.cal-range-pill.active'),
            document.querySelector('.tv-open-btn')
        ].filter(Boolean);

        function flashResidue() {
            document.querySelectorAll('.ui-residue').forEach(el => el.classList.remove('ui-residue'));
            const list = residueTargets();
            if (!list.length) return;
            const el = list[Math.floor(Math.random() * list.length)];
            el.classList.add('ui-residue');
            setTimeout(() => el.classList.remove('ui-residue'), 1800 + Math.random() * 1600);
        }
        setInterval(flashResidue, 9000 + Math.random() * 6000);
        setTimeout(flashResidue, 2500);
        if (buyBtn) {
            setInterval(() => {
                if (window.innerWidth < 900) return;
                buyBtn.classList.add('has-focus');
                setTimeout(() => buyBtn.classList.remove('has-focus'), 2000 + Math.random() * 1200);
            }, 13000);
        }
    })();

    function updateChartAsof() {
        const el = document.getElementById('chart-asof');
        if (!el) return;
        const n = new Date();
        const hh = String(n.getHours()).padStart(2, '0');
        const mm = String(n.getMinutes()).padStart(2, '0');
        el.textContent = 'as of ' + hh + ':' + mm + ' ET';
    }
    setInterval(updateChartAsof, 30000);
    updateChartAsof();

    // News meta relative clock
    function refreshNewsMeta() {
        const meta = document.getElementById('news-meta');
        if (!meta) return;
        const n = new Date();
        // keep fixed story time relative feel: "today" HH:MM:SS
        const hh = String(Math.min(n.getHours(), 15)).padStart(2, '0');
        const mm = String(n.getMinutes()).padStart(2, '0');
        const ss = String(n.getSeconds()).padStart(2, '0');
        meta.innerHTML = '<span class="news-src">Reuters</span> · ' + hh + ':' + mm + ':' + ss + ' ET';
    }
    setInterval(refreshNewsMeta, 15000);


    // =====================================================
    // TRADESVIZ JOURNAL (embedded quant analytics)
    // =====================================================
    let tvCharts = {};

    function buildTvSeries() {
        const todayKey = (typeof dateKeyFromDate === 'function' && typeof TODAY !== 'undefined')
            ? dateKeyFromDate(TODAY)
            : '2026-10-08';
        const keys = Object.keys(dailyPnL).filter(k => k <= todayKey).sort();
        const labels = keys.map(k => k.slice(5));
        const daily = keys.map(k => dailyPnL[k].pnl);
        const vol = keys.map(k => dailyPnL[k].trades || 0);
        let cum = 0;
        const cumulative = daily.map(v => (cum += v));
        let wins = 0, losses = 0, winDays = 0, lossDays = 0;
        const scores = [];
        let runWR = [];
        daily.forEach((v, i) => {
            if (v >= 0) { wins++; winDays++; } else { losses++; lossDays++; }
            const total = wins + losses;
            runWR.push(total ? (wins / total) * 100 : 50);
            // simple "score" proxy: rolling 5-day avg of sign
            const start = Math.max(0, i - 4);
            const slice = daily.slice(start, i + 1);
            const s = slice.reduce((a, b) => a + (b >= 0 ? 1 : -1), 0);
            scores.push(s);
        });
        return { keys, labels, daily, vol, cumulative, wins, losses, winDays, lossDays, runWR, scores };
    }

    function tvChartDefaults() {
        const grid = 'rgba(148,163,184,0.08)';
        const tick = '#64748b';
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15,20,25,0.95)',
                    borderColor: '#334155',
                    borderWidth: 1,
                    titleFont: { size: 11 },
                    bodyFont: { size: 12, family: 'monospace' }
                }
            },
            scales: {
                x: {
                    grid: { color: grid },
                    ticks: { color: tick, maxTicksLimit: 5, font: { size: 9 } }
                },
                y: {
                    grid: { color: grid },
                    ticks: { color: tick, font: { size: 9, family: 'monospace' } }
                }
            }
        };
    }

    function renderTradesVizJournal() {
        const s = buildTvSeries();
        const n = s.daily.length || 1;
        const total = s.cumulative.length ? s.cumulative[s.cumulative.length - 1] : 0;
        const avgDay = total / n;
        const avgVol = s.vol.reduce((a, b) => a + b, 0) / n;
        const pnlVol = avgVol ? total / (avgVol * n) : 0;
        const winRate = (s.wins + s.losses) ? (s.wins / (s.wins + s.losses)) * 100 : 0;
        const avgWins = s.winDays ? (s.daily.filter(v => v >= 0).reduce((a, b) => a + b, 0) / s.winDays) : 0;
        const avgLoss = s.lossDays ? (Math.abs(s.daily.filter(v => v < 0).reduce((a, b) => a + b, 0)) / s.lossDays) : 0;
        const high = s.scores.length ? Math.max(...s.scores) : 0;
        const low = s.scores.length ? Math.min(...s.scores) : 0;
        const pct = (total / 50000) * 100;

        const fmt = (v, d=2) => (v >= 0 ? '+' : '–') + '$' + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
        const el = (id, t) => { const n = document.getElementById(id); if (n) n.textContent = t; };

        el('tv-avg-day', fmt(avgDay));
        el('tv-win-days', String(s.winDays));
        el('tv-loss-days', String(s.lossDays));
        el('tv-total-pnl', fmt(total));
        el('tv-pnl-pct', (pct >= 0 ? '↑ ' : '↓ ') + Math.abs(pct).toFixed(1) + '%');
        el('tv-avg-vol', avgVol.toFixed(2));
        el('tv-pnl-vol', fmt(pnlVol));
        el('tv-avg-wins', (avgWins / 1000).toFixed(2));
        el('tv-avg-losses', (avgLoss / 1000).toFixed(2));
        el('tv-winrate', winRate.toFixed(0) + '%');
        el('tv-wins', String(s.wins));
        el('tv-losses', String(s.losses));
        el('tv-high', String(high));
        el('tv-low', String(low));

        const opts = tvChartDefaults();
        const destroy = (k) => { if (tvCharts[k]) { tvCharts[k].destroy(); tvCharts[k] = null; } };

        // Daily PnL bar (green/red)
        const c1 = document.getElementById('tvChartDaily');
        if (c1) {
            destroy('daily');
            tvCharts.daily = new Chart(c1.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: s.labels,
                    datasets: [{
                        data: s.daily,
                        backgroundColor: s.daily.map(v => v >= 0 ? 'rgba(52,211,153,0.75)' : 'rgba(248,113,113,0.75)'),
                        borderWidth: 0,
                        borderRadius: 2
                    }]
                },
                options: opts
            });
        }

        // Cumulative area
        const c2 = document.getElementById('tvChartCum');
        if (c2) {
            destroy('cum');
            const ctx = c2.getContext('2d');
            const g = ctx.createLinearGradient(0, 0, 0, 180);
            g.addColorStop(0, 'rgba(52,211,153,0.35)');
            g.addColorStop(1, 'rgba(52,211,153,0.02)');
            tvCharts.cum = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: s.labels,
                    datasets: [{
                        data: s.cumulative,
                        borderColor: '#34d399',
                        backgroundColor: g,
                        fill: true,
                        tension: 0.15,
                        pointRadius: 0,
                        borderWidth: 2
                    }]
                },
                options: opts
            });
        }

        // Volume bars
        const c3 = document.getElementById('tvChartVol');
        if (c3) {
            destroy('vol');
            tvCharts.vol = new Chart(c3.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: s.labels,
                    datasets: [{
                        data: s.vol,
                        backgroundColor: 'rgba(59,130,246,0.7)',
                        borderWidth: 0,
                        borderRadius: 2
                    }]
                },
                options: opts
            });
        }

        // Win rate line
        const c4 = document.getElementById('tvChartWR');
        if (c4) {
            destroy('wr');
            tvCharts.wr = new Chart(c4.getContext('2d'), {
                type: 'line',
                data: {
                    labels: s.labels,
                    datasets: [{
                        data: s.runWR,
                        borderColor: '#34d399',
                        tension: 0.2,
                        pointRadius: 0,
                        borderWidth: 2,
                        fill: false
                    }]
                },
                options: {
                    ...opts,
                    scales: {
                        ...opts.scales,
                        y: { ...opts.scales.y, min: 0, max: 100 }
                    }
                }
            });
        }

        // Score
        const c5 = document.getElementById('tvChartScore');
        if (c5) {
            destroy('score');
            tvCharts.score = new Chart(c5.getContext('2d'), {
                type: 'line',
                data: {
                    labels: s.labels,
                    datasets: [{
                        data: s.scores,
                        borderColor: '#60a5fa',
                        tension: 0.2,
                        pointRadius: 0,
                        borderWidth: 2,
                        fill: false
                    }]
                },
                options: opts
            });
        }
    }


    // Init
    updateDisplay();
    animateLevel2();
    renderCalendar();
    filterOrderHistory();
    syncStaticBalances();
    updateChartAsof();
});
