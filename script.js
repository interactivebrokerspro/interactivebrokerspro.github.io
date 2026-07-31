document.addEventListener('DOMContentLoaded', () => {

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
    // The base balance is reverse engineered from your original data: $1,055,235.74 - $17,553.98
    const basePrincipal = 23000; 
    
    let portfolioState = {
        balance: 33435.74,
        changeAmount: 2453.98,
        activeTimeframe: '1M'
    };

    // --- CHART INITIALIZATION (Main Portfolio) ---
    const ctx = document.getElementById('portfolioChart').getContext('2d');

    const chartDatasets = {
        '1W':  [1050000, 1052000, 1048000, 1053000, 1055235.74],
        'MTD': [1040000, 1045000, 1042000, 1050000, 1055235.74],
        '1M':  [1037500, 1051000, 1045000, 1058000, 1055000, 1068000, 1061000, 1058000, 1048000, 1043000, 1053000, 1050000, 1053000, 1054000, 1058000, 1050000, 1050000, 1046000, 1052000, 1055235.74],
        '3M':  [1010000, 1025000, 1040000, 1030000, 1055235.74],
        'YTD': [980000, 1010000, 1035000, 1040000, 1055235.74],
        '1Y':  [920000, 960000, 1010000, 1025000, 1055235.74],
        'ALL': [750000, 850000, 920000, 990000, 1055235.74]
    };

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
            labels: chartDatasets['1M'].map((_, i) => i),
            datasets: [{
                data: chartDatasets['1M'],
                borderColor: '#0066cc',
                borderWidth: 2.5,
                pointRadius: 0,
                pointHoverRadius: 5,
                tension: 0.25,
                fill: true,
                backgroundColor: (context) => getGradient(context)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: (context) => `$${context.raw.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    }
                }
            },
            scales: {
                x: { display: false },
                y: {
                    position: 'right',
                    grid: { color: () => document.documentElement.getAttribute('data-theme') === 'dark' ? '#232d3f' : '#f0f3f7' },
                    ticks: {
                        color: () => document.documentElement.getAttribute('data-theme') === 'dark' ? '#64748b' : '#8d97a5',
                        font: { size: 11 },
                        callback: (val) => (val / 1000000).toFixed(2) + 'M'
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
                data: [45, 52, 68, 74, 55, 48, 61],
                borderColor: '#d32f2f',
                borderWidth: 2,
                yAxisID: 'y1',
                tension: 0.3
            }, {
                type: 'bar',
                label: 'Delta Volume',
                data: [1200, -800, 2500, 3100, -1500, -500, 1800],
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
                data: [80, 40, 90, 75, 60, 85],
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

            portfolioChart.data.labels = scaledData.map((_, i) => i);
            portfolioChart.data.datasets[0].data = scaledData;
            portfolioChart.update();
        });
    });

    // --- STEALTH EDIT BALANCE (Double Click on Balance) ---
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
            
            // Calculates gain mathematically off our base principal
            portfolioState.changeAmount = newBal - basePrincipal; 
            
            updateDisplay();

            const activeRange = portfolioState.activeTimeframe;
            const baseData = chartDatasets[activeRange] || chartDatasets['1M'];
            const scaleFactor = newBal / baseData[baseData.length - 1];
            
            portfolioChart.data.datasets[0].data = baseData.map(val => val * scaleFactor);
            portfolioChart.update();
        }
        modal.classList.remove('active');
    });

    // --- LEVEL 2 MARKET DATA ANIMATOR (Desktop Only) ---
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
        
        // Save to local storage for persistence
        localStorage.setItem('theme', newTheme);
        
        darkToggle.querySelector('i').className = newTheme === 'dark' ? 'fa-regular fa-sun' : 'fa-regular fa-moon';
        portfolioChart.update();
        complexChart1.update();
        complexChart2.update();
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

    // --- NAVIGATION (Including Profile) ---
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
        });
    });

    // --- MOBILE PULL TO REFRESH (Top Area Only) ---
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
    
    document.addEventListener('touchend', (e) => {
        if (!isPulling) return;
        
        if (p2rIndicator.style.transform.includes('10px') || p2rIndicator.style.transform.includes('translateY(0px)')) {
            p2rIndicator.innerHTML = '<i class="fa-solid fa-arrow-rotate-right fa-spin"></i> Reloading...';
            setTimeout(() => { location.reload(); }, 500);
        } else {
            p2rIndicator.style.transform = `translateY(-100%)`;
        }
        isPulling = false;
    });

    // Init
    updateDisplay();
    animateLevel2();
});