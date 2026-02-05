// Immediate test to ensure script is loading - iOS Safari compatible
(function() {
    'use strict';
    try {
        console.log('Script loaded successfully');
        
        // Hide JS failure indicator if script loads successfully
        function hideFailureIndicator() {
            var indicator = document.getElementById('jsFailureIndicator');
            if (indicator) {
                indicator.style.display = 'none';
            }
        }
        
        // Hide indicator immediately if script loaded
        hideFailureIndicator();
        
        // Also hide after DOM is ready
        if (document.body) {
            hideFailureIndicator();
        } else {
            if (document.addEventListener) {
                document.addEventListener('DOMContentLoaded', hideFailureIndicator);
            }
        }
    } catch (e) {
        console.error('Script initialization error:', e);
        showJSFailureIndicator('Script initialization failed');
    }
})();

// Show JavaScript failure indicator - iOS Safari compatible
function showJSFailureIndicator(message) {
    'use strict';
    try {
        var indicator = document.getElementById('jsFailureIndicator');
        if (!indicator) {
            // Create indicator if it doesn't exist
            indicator = document.createElement('div');
            indicator.id = 'jsFailureIndicator';
            indicator.setAttribute('aria-live', 'polite');
            indicator.setAttribute('role', 'alert');
            if (document.body) {
                document.body.insertBefore(indicator, document.body.firstChild);
            } else {
                // Wait for body
                if (document.addEventListener) {
                    document.addEventListener('DOMContentLoaded', function() {
                        document.body.insertBefore(indicator, document.body.firstChild);
                    });
                }
            }
        }
        
        var errorMessage = message || 'Unknown error';
        var errorHTML = '<div style="position: fixed; top: 0; left: 0; right: 0; background-color: #ff0000; color: #ffffff; padding: 1rem; text-align: center; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.875rem; z-index: 10000; border-bottom: 2px solid #000; line-height: 1.5;">⚠️ JavaScript Error: ' + errorMessage + '. Some features may not work.</div>';
        indicator.innerHTML = errorHTML;
        indicator.style.display = 'block';
    } catch (e) {
        console.error('Failed to show failure indicator:', e);
        // Last resort - try alert
        try {
            alert('JavaScript Error: ' + (message || 'Unknown error'));
        } catch (alertErr) {
            console.error('Could not show error:', alertErr);
        }
    }
}

// Component loader - loads reusable HTML components
// Safari iOS compatible version with fallback
async function loadComponent(componentName, insertMethod, options) {
    // iOS Safari compatibility - handle default parameter and destructuring
    if (typeof options === 'undefined' || options === null) {
        options = {};
    }
    var basePath = '';
    if (options && options.basePath) {
        basePath = options.basePath;
    }
    // iOS Safari compatibility - avoid template literals in some cases
    var componentPath = basePath + 'components/' + componentName + '.html';
    
    console.log(`Attempting to load component: ${componentPath}`);
    
    try {
        // Use fetch with error handling for Safari iOS
        let response;
        try {
            response = await fetch(componentPath, {
                method: 'GET',
                cache: 'default', // Allow browser/service worker caching
                credentials: 'same-origin'
            });
        } catch (fetchError) {
            console.error('Fetch error:', fetchError);
            // Fallback to XMLHttpRequest for older Safari
            return loadComponentXHR(componentName, insertMethod, options);
        }
        
        console.log('Fetch response for ' + componentName + ':', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error('Failed to load component: ' + componentName + ' - ' + response.status + ' ' + response.statusText);
        }
        var html = await response.text();
        console.log('Successfully fetched ' + componentName + ', HTML length:', html.length);
        
        // Insert component based on method
        if (insertMethod === 'beforeMain') {
            const main = document.querySelector('main');
            if (main) {
                main.insertAdjacentHTML('beforebegin', html);
                console.log('Inserted ' + componentName + ' before main');
            } else {
                throw new Error('Main element not found');
            }
        } else if (insertMethod === 'afterBegin') {
            const body = document.body;
            if (body) {
                body.insertAdjacentHTML('afterbegin', html);
                console.log(`Inserted ${componentName} at beginning of body`);
            } else {
                throw new Error('Body element not found');
            }
        }
        
        // Fix relative paths based on page location
        if (componentName === 'sidebar') {
            fixSidebarPaths(basePath);
        }
        
        // Initialize Lucide icons after component loads
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Re-initialize sidebar features after sidebar loads
        if (componentName === 'sidebar') {
            // Get sidebar element and mark as loaded to prevent flash
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                // Small delay to ensure DOM is ready, then show sidebar
                setTimeout(() => {
                    try {
                        initializeFiltering();
                        initializeSorting();
                        initializeFilterToggle();
                        initializeLogoScrambling();
                        initializeDateDisplay();
                        initializeWeatherDisplay();
                        // Initialize sidebar toggle (mobile)
                        const sidebarToggle = document.getElementById('sidebarToggle');
                        if (sidebarToggle) {
                            initializeSidebarToggle();
                        }
                        
                        // Show sidebar after initialization is complete
                        sidebar.classList.add('loaded');
                        
                        // Calculate and set header height for mobile carousel
                        function updateMobileLayout() {
                            if (window.innerWidth <= 768) {
                                const homeHeader = document.querySelector('.home-header');
                                const featuredWorkCta = document.getElementById('featuredWorkCta');
                                if (homeHeader) {
                                    const headerHeight = homeHeader.offsetHeight;
                                    // Get exact CTA height
                                    const ctaHeight = featuredWorkCta ? featuredWorkCta.offsetHeight : 72; // 4.5rem fallback
                                    
                                    document.documentElement.style.setProperty('--header-height', headerHeight + 'px');
                                    document.documentElement.style.setProperty('--cta-height', ctaHeight + 'px');
                                    
                                    // Update featured work section margin
                                    const featuredWork = document.querySelector('.featured-work');
                                    if (featuredWork) {
                                        featuredWork.style.marginTop = headerHeight + 'px';
                                        featuredWork.style.height = `calc(100vh - ${headerHeight}px)`;
                                        featuredWork.style.maxHeight = `calc(100vh - ${headerHeight}px)`;
                                    }
                                    
                                    // Update card heights with exact CTA height
                                    const cards = document.querySelectorAll('.featured-project-card');
                                    const cardHeight = window.innerHeight - headerHeight - ctaHeight;
                                    cards.forEach(function(card) {
                                        card.style.height = cardHeight + 'px';
                                        card.style.minHeight = cardHeight + 'px';
                                        card.style.maxHeight = cardHeight + 'px';
                                    });
                                    
                                    // Don't set padding-bottom here - it creates extra scrollable space
                                    // The carousel setup function handles spacing
                                    
                                    // Trigger carousel recalculation if it exists
                                    if (window.recalculateCarousel) {
                                        setTimeout(function() {
                                            window.recalculateCarousel();
                                        }, 50);
                                    }
                                }
                            }
                        }
                        
                        // Initial calculation
                        setTimeout(updateMobileLayout, 100);
                        
                        // Update on resize
                        window.addEventListener('resize', function() {
                            clearTimeout(window.mobileLayoutTimeout);
                            window.mobileLayoutTimeout = setTimeout(updateMobileLayout, 100);
                        });
                        
                        // Show main content slightly after sidebar starts (for naturalistic, calming entrance)
                        const mainContent = document.querySelector('.content');
                        if (mainContent) {
                            setTimeout(function() {
                                mainContent.classList.add('loaded');
                            }, 100); // Small delay to create naturalistic sequence
                        }
                    } catch (error) {
                        console.error('Error initializing sidebar features:', error);
                        // Still show sidebar even if initialization fails
                        if (sidebar) {
                            sidebar.classList.add('loaded');
                        }
                        // Show content even if sidebar initialization fails
                        const mainContent = document.querySelector('.content');
                        if (mainContent) {
                            setTimeout(function() {
                                mainContent.classList.add('loaded');
                            }, 200);
                        }
                    }
                }, 50); // Reduced delay for faster appearance
            }
        }
        
        
        return true;
    } catch (error) {
        console.error('Component ' + componentName + ' failed to load:', error);
        console.error('Attempted path: ' + componentPath);
        console.error('Current URL: ' + window.location.href);
        // Try XHR fallback
        try {
            return await loadComponentXHR(componentName, insertMethod, options);
        } catch (xhrError) {
            console.error('XHR fallback also failed:', xhrError);
            return false;
        }
    }
}

// XHR fallback for Safari iOS compatibility
function loadComponentXHR(componentName, insertMethod, options) {
    return new Promise(function(resolve, reject) {
        // iOS Safari compatibility - handle destructuring
        var basePath = '';
        if (options && options.basePath) {
            basePath = options.basePath;
        }
        const componentPath = basePath + 'components/' + componentName + '.html';
        
        console.log('Using XHR fallback for:', componentPath);
        
        var xhr = new XMLHttpRequest();
        xhr.open('GET', componentPath, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 0) {
                    var html = xhr.responseText;
                    
                    // Insert component based on method
                    if (insertMethod === 'beforeMain') {
                        var main = document.querySelector('main');
                        if (main) {
                            main.insertAdjacentHTML('beforebegin', html);
                        } else {
                            reject(new Error('Main element not found'));
                            return;
                        }
                    } else if (insertMethod === 'afterBegin') {
                        var body = document.body;
                        if (body) {
                            body.insertAdjacentHTML('afterbegin', html);
                        } else {
                            reject(new Error('Body element not found'));
                            return;
                        }
                    }
                    
                    // Fix relative paths
                    if (componentName === 'sidebar') {
                        fixSidebarPaths(basePath);
                    }
                    
                    // Initialize Lucide icons
                    if (typeof lucide !== 'undefined') {
                        try {
                            lucide.createIcons();
                        } catch (e) {
                            console.warn('Lucide icons initialization failed:', e);
                        }
                    }
                    
                    resolve(true);
                } else {
                    reject(new Error('XHR failed with status: ' + xhr.status));
                }
            }
        };
        xhr.onerror = function() {
            reject(new Error('XHR network error'));
        };
        xhr.send();
    });
}

// Fix relative paths in sidebar based on page depth
function fixSidebarPaths(basePath) {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    
    // Fix logo link
    const logoLink = sidebar.querySelector('.logo-header a');
    if (logoLink) {
        logoLink.href = `${basePath}index.html`;
    }
    
    // Fix works link
    const worksLink = sidebar.querySelector('.nav-section-link');
    if (worksLink) {
        worksLink.href = `${basePath}index.html`;
    }
    
    // Fix project links
    const projectLinks = sidebar.querySelectorAll('.works-list a');
    projectLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#')) {
            // If it's a works/ path, keep it relative to base
            if (href.startsWith('works/')) {
                link.href = `${basePath}${href}`;
            } else if (!href.startsWith('/')) {
                link.href = `${basePath}${href}`;
            }
        }
    });
}

// Initialize Lucide icons - multiple initialization methods for iOS compatibility
(function() {
    'use strict';
    function initLucide() {
        if (typeof lucide !== 'undefined') {
            try {
                lucide.createIcons();
            } catch (e) {
                console.error('Lucide initialization error:', e);
            }
        }
    }
    
    // Try immediately
    initLucide();
    
    // Also on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLucide);
    }
    
    // And after a delay
    setTimeout(initLucide, 100);
})();

// Sidebar toggle - simplified single component approach
function initializeSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    
    if (!sidebarToggle || !sidebar) return;
    
    // Skip if already initialized
    if (sidebarToggle.dataset.initialized === 'true') {
        return;
    }
    sidebarToggle.dataset.initialized = 'true';
    
    // Show toggle on mobile
    if (window.innerWidth <= 768) {
        sidebarToggle.style.display = 'flex';
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    // Update toggle visibility on resize
    function updateToggleDisplay() {
        if (window.innerWidth <= 768) {
            sidebarToggle.style.display = 'flex';
        } else {
            sidebarToggle.style.display = 'none';
        }
    }
    window.addEventListener('resize', updateToggleDisplay);
    
    // Toggle sidebar
    function toggleSidebar() {
        const isOpen = sidebar.classList.contains('open');
        if (isOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }
    
    function openSidebar() {
        // Add open class to instantly show sidebar
        sidebar.classList.add('open');
        document.body.classList.add('sidebar-open');
        
        // Instantly show backdrop
        if (sidebarBackdrop) {
            sidebarBackdrop.classList.add('active');
        }
        
        // Update icon visibility
        const openIcon = sidebarToggle.querySelector('.sidebar-toggle-icon-open');
        const closeIcon = sidebarToggle.querySelector('.sidebar-toggle-icon-close');
        if (openIcon) openIcon.style.display = 'none';
        if (closeIcon) closeIcon.style.display = 'block';
        
        // Trigger haptic feedback if available
        if (window.triggerHapticFeedback) {
            window.triggerHapticFeedback('light');
        }
    }
    
    function closeSidebar() {
        // Remove open class to instantly hide sidebar
        sidebar.classList.remove('open');
        document.body.classList.remove('sidebar-open');
        
        // Instantly hide backdrop
        if (sidebarBackdrop) {
            sidebarBackdrop.classList.remove('active');
        }
        
        // Update icon visibility
        const openIcon = sidebarToggle.querySelector('.sidebar-toggle-icon-open');
        const closeIcon = sidebarToggle.querySelector('.sidebar-toggle-icon-close');
        if (openIcon) openIcon.style.display = 'block';
        if (closeIcon) closeIcon.style.display = 'none';
        
        // Trigger haptic feedback if available
        if (window.triggerHapticFeedback) {
            window.triggerHapticFeedback('light');
        }
    }
    
    // Haptic feedback function - available globally
    if (!window.triggerHapticFeedback) {
        window.triggerHapticFeedback = function(intensity) {
            // iOS Safari compatibility - handle default parameter
            if (typeof intensity === 'undefined' || intensity === null) {
                intensity = 'light';
            }
            // Check if Vibration API is available
            if ('vibrate' in navigator) {
                const patterns = {
                    light: 5,
                    medium: 10,
                    heavy: 20
                };
                navigator.vibrate(patterns[intensity] || 5);
            }
        };
    }
    
    // Attach click handler
    sidebarToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        toggleSidebar();
        return false;
    }, true); // Use capture phase to ensure it fires
    
    // Also handle touchstart for mobile
    sidebarToggle.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
        return false;
    });
    
    // Background color detection disabled for performance
    // The toggle uses a semi-transparent background with backdrop blur which works on both light and dark backgrounds
    
    // Swipe gesture handling for sidebar (global)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    const minSwipeDistance = 50;
    
    // Track touch start
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    // Handle swipe end
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        // Only process horizontal swipes (more horizontal than vertical)
        if (absDeltaX > absDeltaY && absDeltaX > minSwipeDistance) {
            const isSidebarOpen = sidebar.classList.contains('open');
            
            // Swipe right to open (start further from edge to avoid Safari back gesture)
            // Safari's back gesture uses the leftmost 20-30px, so we start at 40px
            if (deltaX > 0 && !isSidebarOpen && touchStartX >= 40 && touchStartX < 120) {
                e.preventDefault();
                e.stopPropagation();
                openSidebar();
            }
            // Swipe left to close (when sidebar is open - can swipe from anywhere)
            else if (deltaX < 0 && isSidebarOpen) {
                e.preventDefault();
                e.stopPropagation();
                closeSidebar();
            }
        }
    }, { passive: true });
    
    // Close sidebar when clicking backdrop
    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', closeSidebar);
    }
    
    // Close sidebar when clicking nav links (but not filter tags, sort buttons, or works filter toggle)
    const navLinks = sidebar.querySelectorAll('a, button:not(.filter-tag):not(.sort-button):not(.works-filter-toggle)');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });
    
}

// Set today's date below logo - can be called multiple times
function initializeDateDisplay() {
    const logoDate = document.getElementById('logoDate');
    if (!logoDate) return;
    
    const today = new Date();
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', options);
    logoDate.textContent = `Today is ${formattedDate}`;
}

// Note: initializeDateDisplay is called after sidebar component loads
// No need to initialize on DOMContentLoaded since sidebar is always loaded dynamically

// Weather display with Open Meteo API - can be called multiple times
function initializeWeatherDisplay() {
    console.log('Weather script initialized');
    const logoWeather = document.getElementById('logoWeather');
    if (!logoWeather) {
        console.error('logoWeather element not found!');
        return;
    }
    console.log('logoWeather element found');
    
    // Skip if already initialized (check for existing event listeners)
    if (logoWeather.dataset.initialized === 'true') {
        return;
    }
    logoWeather.dataset.initialized = 'true';
    
    // Reserve space immediately to prevent header expansion
    // Set height before any content is added (use !important via setProperty)
    logoWeather.style.setProperty('height', '2rem', 'important');
    logoWeather.style.setProperty('min-height', '2rem', 'important');
    logoWeather.style.setProperty('flex-shrink', '0', 'important');
    
    const CACHE_KEY = 'weather_cache';
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    const ST_LOUIS_LAT = 38.6270;
    const ST_LOUIS_LON = -90.1994;
    const ST_LOUIS_TIMEZONE = 'America/Chicago';
    
    // Check if it's currently day or night in St. Louis
    function isDaytimeInStLouis() {
        const now = new Date();
        // Get current time in St. Louis timezone
        const stLouisTime = new Date(now.toLocaleString('en-US', { timeZone: ST_LOUIS_TIMEZONE }));
        const hour = stLouisTime.getHours();
        // Daytime is roughly 6am to 8pm
        return hour >= 6 && hour < 20;
    }
    
    // Get icon name based on weather code and time of day
    // Using static climacons from christiannaths/Climacons-Font
    function getIconName(weatherCode) {
        const isDay = isDaytimeInStLouis();
        
        // Map to static climacon icon names (kebab-case)
        const baseMap = {
            0: isDay ? 'Sun' : 'Moon',                    // Clear sky
            1: isDay ? 'Sun' : 'Moon',                    // Mainly clear
            2: isDay ? 'Cloud-Sun' : 'Cloud-Moon',        // Partly cloudy
            3: 'Cloud',                                   // Overcast
            45: 'Cloud-Fog',                              // Fog
            48: 'Cloud-Fog',                              // Depositing rime fog
            51: isDay ? 'Cloud-Drizzle-Sun' : 'Cloud-Drizzle-Moon',  // Light drizzle
            53: isDay ? 'Cloud-Drizzle-Sun' : 'Cloud-Drizzle-Moon',  // Moderate drizzle
            55: isDay ? 'Cloud-Drizzle-Sun' : 'Cloud-Drizzle-Moon',  // Dense drizzle
            56: isDay ? 'Cloud-Drizzle-Sun' : 'Cloud-Drizzle-Moon',  // Light freezing drizzle
            57: isDay ? 'Cloud-Drizzle-Sun' : 'Cloud-Drizzle-Moon',  // Dense freezing drizzle
            61: isDay ? 'Cloud-Rain-Sun' : 'Cloud-Rain-Moon',        // Slight rain
            63: isDay ? 'Cloud-Rain-Sun' : 'Cloud-Rain-Moon',        // Moderate rain
            65: isDay ? 'Cloud-Rain-Sun' : 'Cloud-Rain-Moon',        // Heavy rain
            66: isDay ? 'Cloud-Rain-Sun' : 'Cloud-Rain-Moon',        // Light freezing rain
            67: isDay ? 'Cloud-Rain-Sun' : 'Cloud-Rain-Moon',        // Heavy freezing rain
            71: isDay ? 'Cloud-Sun' : 'Cloud-Moon',       // Slight snow fall (using cloud)
            73: isDay ? 'Cloud-Sun' : 'Cloud-Moon',       // Moderate snow fall
            75: isDay ? 'Cloud-Sun' : 'Cloud-Moon',       // Heavy snow fall
            77: isDay ? 'Cloud-Sun' : 'Cloud-Moon',       // Snow grains
            80: isDay ? 'Cloud-Rain-Sun' : 'Cloud-Rain-Moon',        // Slight rain showers
            81: isDay ? 'Cloud-Rain-Sun' : 'Cloud-Rain-Moon',        // Moderate rain showers
            82: isDay ? 'Cloud-Rain-Sun' : 'Cloud-Rain-Moon',        // Violent rain showers
            85: isDay ? 'Cloud-Sun' : 'Cloud-Moon',       // Slight snow showers
            86: isDay ? 'Cloud-Sun' : 'Cloud-Moon',       // Heavy snow showers
            95: isDay ? 'Cloud-Lightning-Sun' : 'Cloud-Lightning-Moon',  // Thunderstorm
            96: isDay ? 'Cloud-Lightning-Sun' : 'Cloud-Lightning-Moon',  // Thunderstorm with slight hail
            99: isDay ? 'Cloud-Lightning-Sun' : 'Cloud-Lightning-Moon'   // Thunderstorm with heavy hail
        };
        
        return baseMap[weatherCode] || (isDay ? 'Sun' : 'Moon');
    }
    
    // Get cached weather data
    function getCachedWeather() {
        // DISABLED FOR TESTING - always fetch fresh
        console.log('Cache check disabled - always fetching fresh');
        return null;
        
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;
        
        const data = JSON.parse(cached);
        const now = Date.now();
        
        if (now - data.timestamp < CACHE_DURATION) {
            return data.weather;
        }
        
        return null;
    }
    
    // Cache weather data
    function cacheWeather(weather) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            weather: weather,
            timestamp: Date.now()
        }));
    }
    
    // Fetch weather from Open Meteo
    async function fetchWeather() {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${ST_LOUIS_LAT}&longitude=${ST_LOUIS_LON}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.current) {
                const weatherCode = data.current.weather_code;
                const tempF = Math.round(data.current.temperature_2m);
                const iconName = getIconName(weatherCode);
                const isDay = isDaytimeInStLouis();
                
                // Debug: log weather info to console
                console.log('Weather Code:', weatherCode);
                console.log('Icon Name:', iconName);
                console.log('Temperature:', tempF + 'F');
                console.log('Is Daytime:', isDay);
                
                return {
                    tempF: tempF,
                    tempC: Math.round((tempF - 32) * 5 / 9),
                    icon: iconName,
                    code: weatherCode
                };
            }
            return null;
        } catch (error) {
            console.error('Weather fetch error:', error);
            return null;
        }
    }
    
    // Load static climacon SVG from christiannaths/Climacons-Font
    async function loadClimaconIcon(iconName) {
        console.log('Loading static icon:', iconName);
        try {
            const url = `https://raw.githubusercontent.com/christiannaths/Climacons-Font/master/SVG/${iconName}.svg`;
            console.log('Fetching from:', url);
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`Icon ${iconName} not found (${response.status}), falling back to Sun`);
                // Fallback to Sun if icon not found
                const fallbackName = isDaytimeInStLouis() ? 'Sun' : 'Moon';
                return await fetch(`https://raw.githubusercontent.com/christiannaths/Climacons-Font/master/SVG/${fallbackName}.svg`).then(r => r.text());
            }
            const svgText = await response.text();
            console.log('Icon loaded successfully, SVG length:', svgText.length);
            return svgText;
        } catch (error) {
            console.error('Icon load error:', error);
            return null;
        }
    }
    
    // Display weather
    async function displayWeather(weather) {
        console.log('displayWeather called with:', weather);
        if (!weather) {
            logoWeather.style.display = 'none';
            return;
        }
        
        console.log('About to load icon:', weather.icon);
        const iconSvg = await loadClimaconIcon(weather.icon);
        if (!iconSvg) {
            logoWeather.style.display = 'none';
            return;
        }
        
        // Create "It is" text
        const prefixSpan = document.createElement('span');
        prefixSpan.className = 'logo-weather-text';
        prefixSpan.textContent = 'It is ';
        
        // Create icon container
        const iconContainer = document.createElement('span');
        iconContainer.className = 'logo-weather-icon';
        iconContainer.innerHTML = iconSvg;
        console.log('Icon container created, SVG inserted. Container classes:', iconContainer.className);
        
        // Create temperature text
        const tempSpan = document.createElement('span');
        tempSpan.className = 'logo-weather-text';
        tempSpan.textContent = ` ${weather.tempF}F in St. Louis`;
        tempSpan.setAttribute('data-temp-f', weather.tempF);
        tempSpan.setAttribute('data-temp-c', weather.tempC);
        
        // Maintain height to prevent layout shift
        logoWeather.style.setProperty('height', '2rem', 'important');
        logoWeather.style.setProperty('min-height', '2rem', 'important');
        
        // Find placeholder
        const placeholder = logoWeather.querySelector('.logo-weather-placeholder');
        
        // Create content wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'logo-weather-content';
        contentWrapper.appendChild(prefixSpan);
        contentWrapper.appendChild(iconContainer);
        contentWrapper.appendChild(tempSpan);
        
        // Add content wrapper (will overlay placeholder)
        logoWeather.appendChild(contentWrapper);
        
        // Fade in the content, then remove placeholder after transition completes
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                contentWrapper.style.opacity = '1';
                // Remove placeholder after fade-in completes (400ms)
                setTimeout(function() {
                    if (placeholder && placeholder.parentNode) {
                        placeholder.style.display = 'none'; // Hide instead of remove to prevent reflow
                    }
                }, 400);
            });
        });
        
        // Add glitch effect on hover (F to C conversion)
        let isHovering = false;
        let scrambleInterval = null;
        const codeChars = '0123456789FC';
        const originalTempText = ` ${weather.tempF}F in St. Louis`;
        
        function getRandomChar() {
            return codeChars[Math.floor(Math.random() * codeChars.length)];
        }
        
        function scrambleText() {
            if (!isHovering) return;
            const tempPart = weather.tempF + 'F';
            const scrambled = tempPart.split('').map(char => {
                return Math.random() > 0.3 ? getRandomChar() : char;
            }).join('');
            tempSpan.textContent = ` ${scrambled} in St. Louis`;
        }
        
        function startScrambling() {
            isHovering = true;
            scrambleText();
            scrambleInterval = setInterval(scrambleText, 50);
            
            // After brief scramble, show Celsius
            setTimeout(() => {
                if (isHovering) {
                    clearInterval(scrambleInterval);
                    const tempC = tempSpan.getAttribute('data-temp-c');
                    tempSpan.textContent = ` ${tempC}C in St. Louis`;
                }
            }, 300);
        }
        
        function stopScrambling() {
            isHovering = false;
            if (scrambleInterval) {
                clearInterval(scrambleInterval);
            }
            tempSpan.textContent = originalTempText;
        }
        
        // Add hover to entire weather container
        logoWeather.addEventListener('mouseenter', startScrambling);
        logoWeather.addEventListener('mouseleave', stopScrambling);
    }
    
    // Initialize weather display
    async function initWeather() {
        console.log('initWeather called');
        // Clear cache first
        localStorage.removeItem(CACHE_KEY);
        console.log('Cache cleared');
        
        // Reserve space immediately to prevent header expansion
        // Set fixed height - space is already reserved by placeholder in HTML
        logoWeather.style.setProperty('height', '2rem', 'important');
        logoWeather.style.setProperty('min-height', '2rem', 'important');
        logoWeather.style.setProperty('flex-shrink', '0', 'important');
        
        // Always fetch fresh (cache disabled for testing)
        console.log('Fetching fresh weather data');
        
        // Fetch fresh data
        const weather = await fetchWeather();
        if (weather) {
            cacheWeather(weather);
            await displayWeather(weather);
            // Content wrapper will handle its own fade-in via CSS transition
        } else {
            // Error - hide completely but maintain space to prevent layout shift
            logoWeather.style.display = 'none';
        }
    }
    
    initWeather();
}

// Note: initializeWeatherDisplay is called after sidebar component loads
// No need to initialize on DOMContentLoaded since sidebar is always loaded dynamically

// Logo text scrambling effect - can be called multiple times
function initializeLogoScrambling() {
    const logoBox = document.getElementById('logoBox');
    const logoText = document.getElementById('logoText');
    
    if (!logoBox || !logoText) return; // Exit if elements don't exist
    
    // Skip if already initialized
    if (logoBox.dataset.initialized === 'true') {
        return;
    }
    logoBox.dataset.initialized = 'true';
    
    const originalText = 'PANDJICO';
    const easterEggText = 'P4NDJICO';
    const codeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    // ASCII block characters for terminal aesthetic
    const blockChars = ['█', '▓', '▒', '░', '▄', '▀'];
    // Special characters prioritized
    const specialChars = ['%', '$', '@', '#', '&', '*', '+', '=', '-', '_', '|', '\\', '/', '<', '>', '?', '!', '~', '`'];

    let scrambleInterval = null;
    let isHovering = false;
    let currentText = originalText; // Track which version is currently displayed

    function getRandomChar() {
        const rand = Math.random();
        // 50% chance for blocks
        if (rand < 0.5) {
            return blockChars[Math.floor(Math.random() * blockChars.length)];
        }
        // 30% chance for special characters
        else if (rand < 0.8) {
            return specialChars[Math.floor(Math.random() * specialChars.length)];
        }
        // 20% chance for regular alphanumeric
        return codeChars[Math.floor(Math.random() * codeChars.length)];
    }

    function slowGlitch() {
        if (!isHovering) return;
        
        // Occasionally show P4NDJICO during glitching (15% chance)
        if (Math.random() < 0.15) {
            logoText.textContent = easterEggText;
            currentText = easterEggText;
            return;
        }
        
        const textArray = logoText.textContent.split('');
        let changed = 0;
        const maxChanges = 2; // Only change 1-2 characters at a time for calming effect
        
        // Gradually morph characters
        for (let i = 0; i < textArray.length && changed < maxChanges; i++) {
            // Skip spaces
            if (textArray[i] === ' ') continue;
            
            // 25% chance to change this character (slower, more deliberate)
            if (Math.random() < 0.25) {
                textArray[i] = getRandomChar();
                changed++;
            }
        }
        
        logoText.textContent = textArray.join('');
    }

    function startScrambling() {
        isHovering = true;
        currentText = originalText;
        // Start slow glitch - 200ms interval (much slower than 50ms)
        slowGlitch();
        // Continue glitching at intervals
        scrambleInterval = setInterval(slowGlitch, 200);
    }

    function stopScrambling() {
        isHovering = false;
        if (scrambleInterval) {
            clearInterval(scrambleInterval);
            scrambleInterval = null;
        }
        
        // Smoothly reassemble instead of harsh reset
        var reassembleInterval = null;
        var reassembleFrameCount = 0;
        var targetText = currentText;
        
        function reassemble() {
            const currentArray = logoText.textContent.split('');
            const targetArray = targetText.split('');
            let changed = 0;
            const maxChanges = 2;
            
            // Gradually reveal correct characters
            for (let i = 0; i < currentArray.length && changed < maxChanges; i++) {
                if (currentArray[i] === ' ') continue;
                
                // If character doesn't match target, gradually reveal it
                if (currentArray[i] !== targetArray[i]) {
                    // 50% chance to reveal correct character, 30% chance for random char, 20% stay same
                    var rand = Math.random();
                    if (rand < 0.5) {
                        currentArray[i] = targetArray[i];
                        changed++;
                    } else if (rand < 0.8) {
                        currentArray[i] = getRandomChar();
                        changed++;
                    }
                }
            }
            
            logoText.textContent = currentArray.join('');
            reassembleFrameCount++;
            
            // Check if fully reassembled
            if (currentArray.join('') === targetText) {
                if (reassembleInterval) {
                    clearInterval(reassembleInterval);
                    reassembleInterval = null;
                }
                logoText.textContent = targetText;
                return;
            }
            
            // Safety: ensure we show target text after enough frames
            if (reassembleFrameCount > 15) {
                if (reassembleInterval) {
                    clearInterval(reassembleInterval);
                    reassembleInterval = null;
                }
                logoText.textContent = targetText;
                return;
            }
        }
        
        // Start reassembly animation
        reassemble();
        reassembleInterval = setInterval(reassemble, 200);
    }

    function showEasterEgg() {
        // 15% chance to show easter egg
        if (Math.random() < 0.15) {
            currentText = easterEggText;
            logoText.textContent = easterEggText;
        } else {
            currentText = originalText;
            logoText.textContent = originalText;
        }
    }

    // Initialize: show easter egg occasionally on page load
    showEasterEgg();

    // Trigger glitch animation on page load/refresh
    function triggerLoadGlitch() {
        var loadIsHovering = true;
        var loadCurrentText = originalText;
        var loadFrameCount = 0;
        var loadGlitchInterval = null;
        var isReassembling = false;
        var reassembleFrameCount = 0;
        
        function loadGlitch() {
            // Phase 1: Glitch out (first ~2 seconds)
            if (loadFrameCount < 10 && !isReassembling) {
                const textArray = logoText.textContent.split('');
                let changed = 0;
                const maxChanges = 2;
                
                // Gradually morph characters
                for (let i = 0; i < textArray.length && changed < maxChanges; i++) {
                    if (textArray[i] === ' ') continue;
                    
                    if (Math.random() < 0.25) {
                        textArray[i] = getRandomChar();
                        changed++;
                    }
                }
                
                logoText.textContent = textArray.join('');
                loadFrameCount++;
            }
            // Phase 2: Smoothly reassemble (after ~2 seconds)
            else {
                if (!isReassembling) {
                    isReassembling = true;
                    reassembleFrameCount = 0;
                }
                
                const currentArray = logoText.textContent.split('');
                const targetArray = originalText.split('');
                let changed = 0;
                const maxChanges = 2;
                
                // Gradually reveal correct characters
                for (let i = 0; i < currentArray.length && changed < maxChanges; i++) {
                    if (currentArray[i] === ' ') continue;
                    
                    // If character doesn't match target, gradually reveal it
                    if (currentArray[i] !== targetArray[i]) {
                        // 40% chance to reveal correct character, 30% chance for random char, 30% stay same
                        var rand = Math.random();
                        if (rand < 0.4) {
                            currentArray[i] = targetArray[i];
                            changed++;
                        } else if (rand < 0.7) {
                            currentArray[i] = getRandomChar();
                            changed++;
                        }
                    }
                }
                
                logoText.textContent = currentArray.join('');
                reassembleFrameCount++;
                
                // Check if fully reassembled
                if (currentArray.join('') === originalText) {
                    if (loadGlitchInterval) {
                        clearInterval(loadGlitchInterval);
                        loadGlitchInterval = null;
                    }
                    logoText.textContent = originalText;
                    loadCurrentText = originalText;
                    loadIsHovering = false;
                    return;
                }
                
                // Safety: ensure we show original text after enough frames
                if (reassembleFrameCount > 20) {
                    if (loadGlitchInterval) {
                        clearInterval(loadGlitchInterval);
                        loadGlitchInterval = null;
                    }
                    logoText.textContent = originalText;
                    loadCurrentText = originalText;
                    loadIsHovering = false;
                    return;
                }
            }
        }
        
        // Start glitch animation
        loadGlitch();
        loadGlitchInterval = setInterval(loadGlitch, 200);
    }
    
    // Trigger glitch on page load with small delay
    setTimeout(function() {
        triggerLoadGlitch();
    }, 300);

    // Also occasionally change it while user is on the page (every 30-60 seconds)
    setInterval(() => {
        if (!isHovering) {
            showEasterEgg();
        }
    }, 30000 + Math.random() * 30000); // Random interval between 30-60 seconds

    // Find the parent link element
    const logoLink = logoBox.closest('a');
    
    if (!logoLink) return; // Exit if no link found
    
    // Event listeners on the link (not the box) so clicks work properly
    logoLink.addEventListener('mouseenter', startScrambling);
    logoLink.addEventListener('mouseleave', stopScrambling);
    
    // Ensure clicking the logo navigates (don't interfere with link)
    // The link will work naturally - we just ensure scrambling stops on click
    logoLink.addEventListener('click', (e) => {
        // Don't prevent default - let the link work naturally
        // Just ensure text is restored before navigation
        if (isHovering) {
            stopScrambling();
        }
    });
}

// Note: initializeLogoScrambling is called after sidebar component loads
// No need to initialize on DOMContentLoaded since sidebar is always loaded dynamically

// Update scroll shadows for works list
function updateWorksListScrollShadows() {
    'use strict';
    var worksList = document.querySelector('.works-list');
    if (!worksList) return;
    
    var scrollTop = worksList.scrollTop;
    var scrollHeight = worksList.scrollHeight;
    var clientHeight = worksList.clientHeight;
    var isScrollable = scrollHeight > clientHeight;
    
    if (isScrollable) {
        if (scrollTop > 0) {
            worksList.classList.add('scrollable-top');
        } else {
            worksList.classList.remove('scrollable-top');
        }
        
        if (scrollTop < scrollHeight - clientHeight - 1) {
            worksList.classList.add('scrollable-bottom');
        } else {
            worksList.classList.remove('scrollable-bottom');
        }
    } else {
        worksList.classList.remove('scrollable-top', 'scrollable-bottom');
    }
}

// Project filtering system - can be called multiple times for dynamic components
function initializeFiltering() {
    // Check if elements exist
    const filterTags = document.querySelectorAll('.filter-tag');
    const projectItems = document.querySelectorAll('.works-list li[data-tags]');
    
    if (filterTags.length === 0) {
        // No filter tags found, skip initialization
        return;
    }
    
    // Remove existing event listeners by cloning and replacing (clean slate)
    const filterTagArray = Array.from(filterTags);
    filterTagArray.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });
    
    // Re-query after cloning
    const freshFilterTags = document.querySelectorAll('.filter-tag');
    const freshProjectItems = document.querySelectorAll('.works-list li[data-tags]');
    
    let activeFilters = [];

    function updateFilters() {
        const worksList = document.querySelector('.works-list');
        
        // Update URL without page reload
        if (activeFilters.length === 0) {
            window.history.replaceState({}, '', window.location.pathname);
        } else {
            const filterString = activeFilters.join(',');
            window.history.replaceState({}, '', `?tags=${filterString}`);
        }

        // Filter projects
        let visibleCount = 0;
        freshProjectItems.forEach(item => {
            const itemTags = item.getAttribute('data-tags').split(' ');
            const hasAllTags = activeFilters.length === 0 || 
                activeFilters.every(filter => itemTags.includes(filter));
            
            if (hasAllTags) {
                item.style.display = '';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        // If no projects match, show all (ensure something always shows)
        if (visibleCount === 0 && activeFilters.length > 0) {
            freshProjectItems.forEach(item => {
                item.style.display = '';
            });
            // Add fallback mode class for visual indication
            if (worksList) {
                worksList.classList.add('fallback-mode');
            }
        } else {
            // Remove fallback mode class when there are matches
            if (worksList) {
                worksList.classList.remove('fallback-mode');
            }
        }
        
        // Re-apply sort after filtering (projectsData will be available globally)
        if (typeof applySort === 'function') {
            applySort(currentSort, currentDirection);
        }
    }

    function toggleFilter(filterValue) {
        if (filterValue === 'all') {
            activeFilters = [];
        } else {
            // Remove "all" from active filters if selecting a specific tag
            const index = activeFilters.indexOf(filterValue);
            if (index > -1) {
                activeFilters.splice(index, 1);
            } else {
                activeFilters.push(filterValue);
            }
        }
        updateFilterButtons();
        updateProjectTags();
        updateFilters();
    }

    function updateFilterButtons() {
        freshFilterTags.forEach(btn => {
            const filterValue = btn.getAttribute('data-filter');
            if (filterValue === 'all') {
                if (activeFilters.length === 0) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            } else {
                if (activeFilters.includes(filterValue)) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        });
        
        // Update filter badge
        updateFilterBadge();
    }
    
    function updateFilterBadge() {
        const filterBadge = document.getElementById('filterBadge');
        if (!filterBadge) return;
        
        // Count active filters (including "all" as 1)
        const filterCount = activeFilters.length === 0 ? 1 : activeFilters.length;
        
        if (filterCount > 0) {
            filterBadge.textContent = filterCount.toString();
            filterBadge.classList.add('show');
        } else {
            filterBadge.classList.remove('show');
        }
    }
    
    function updateProjectTags() {
        const projectTags = document.querySelectorAll('.project-tags .tag');
        projectTags.forEach(tag => {
            const tagValue = tag.getAttribute('data-tag');
            if (activeFilters.includes(tagValue)) {
                tag.classList.add('active');
            } else {
                tag.classList.remove('active');
            }
        });
    }

    // Initialize from URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlTags = urlParams.get('tags');
    if (urlTags) {
        activeFilters = urlTags.split(',');
        updateFilterButtons();
    } else {
        if (freshFilterTags.length > 0) {
            freshFilterTags[0].classList.add('active'); // "all" is active by default
        }
    }
    
    // Initial badge update
    updateFilterBadge();

    // Event listeners for sidebar filter buttons
    freshFilterTags.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            const filterValue = btn.getAttribute('data-filter');
            
            // Add subtle scale animation
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);
            
            toggleFilter(filterValue);
            
            // Trigger haptic feedback
            triggerHapticFeedback('light');
        });
    });
    
    // Event listeners for project page tags
    const projectTags = document.querySelectorAll('.project-tags .tag');
    projectTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            const tagValue = tag.getAttribute('data-tag');
            // Filter sidebar but stay on project page
            toggleFilter(tagValue);
        });
    });

    // Initial filter
    updateFilters();
    updateProjectTags();
    
    // Add scroll listener to update shadows
    var worksList = document.querySelector('.works-list');
    if (worksList) {
        worksList.addEventListener('scroll', updateWorksListScrollShadows, { passive: true });
        
        // Initial check
        setTimeout(function() {
            updateWorksListScrollShadows();
        }, 100);
        
        // Also check on resize and filter changes
        window.addEventListener('resize', updateWorksListScrollShadows, { passive: true });
    }
    
    // Set active project in sidebar based on current page
    function setActiveProject() {
        const currentPath = window.location.pathname;
        const currentFilename = currentPath.split('/').pop(); // Get just the filename
        const sidebarLinks = document.querySelectorAll('.works-list li a');
        let activeLink = null;
        
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            
            if (!href || href === '#' || href === '/') return;
            
            // Get the filename from the href (handle both relative and absolute paths)
            const hrefFilename = href.split('/').pop();
            
            // Check if this link's filename matches the current page filename
            if (hrefFilename === currentFilename || currentPath.includes(hrefFilename)) {
                link.classList.add('active');
                activeLink = link;
                // Also add class to wrapper for easier CSS targeting
                const wrapper = link.closest('.project-link-wrapper');
                if (wrapper) {
                    wrapper.classList.add('has-active-link');
                }
            } else {
                // Remove active class if not active
                link.classList.remove('active');
                const wrapper = link.closest('.project-link-wrapper');
                if (wrapper) {
                    wrapper.classList.remove('has-active-link');
                }
            }
        });
        
        // Auto-scroll active project into view
        if (activeLink) {
            setTimeout(() => {
                const listItem = activeLink.closest('li');
                if (listItem) {
                    listItem.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });
                }
            }, 100);
        }
    }
    
    setActiveProject();
}

// Note: initializeFiltering is called after sidebar component loads
// No need to initialize on DOMContentLoaded since sidebar is always loaded dynamically

// Filter toggle integrated into WORKS header - can be called multiple times
function initializeFilterToggle() {
    const worksFilterToggle = document.getElementById('worksFilterToggle');
    const worksSection = document.querySelector('.works-section');
    
    if (!worksFilterToggle || !worksSection) return;
    
    // Skip if already initialized
    if (worksFilterToggle.dataset.initialized === 'true') {
        return;
    }
    worksFilterToggle.dataset.initialized = 'true';
    
    // Check localStorage for saved filter state
    const savedFilterState = localStorage.getItem('worksFilterCollapsed');
    const isMobile = window.innerWidth <= 768;
    
    // Helper function to update fixed sections (condense when filter panel is open)
    const updateFixedSections = () => {
        if (window.innerWidth <= 768) {
            const worksSection = document.querySelector('.works-section');
            const fixedSections = document.querySelectorAll('.fixed-section');
            const sidebar = document.querySelector('.sidebar');
            
            if (worksSection && fixedSections.length > 0) {
                const isCollapsed = worksSection.classList.contains('filter-collapsed');
                
                if (!isCollapsed) {
                    // Filter panel is open - condense fixed sections
                    sidebar.classList.add('filter-panel-open');
                } else {
                    // Filter panel is closed - expand fixed sections
                    sidebar.classList.remove('filter-panel-open');
                }
            }
        } else {
            // Desktop - always expanded
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.remove('filter-panel-open');
            }
        }
    };
    
    if (savedFilterState !== null) {
        // Use saved state
        if (savedFilterState === 'true') {
            worksSection.classList.add('filter-collapsed');
        } else {
            worksSection.classList.remove('filter-collapsed');
        }
    } else {
        // Default: collapsed on mobile, expanded on desktop
        if (isMobile) {
            worksSection.classList.add('filter-collapsed');
        } else {
            worksSection.classList.remove('filter-collapsed');
        }
    }
    
    // Update fixed sections based on initial state
    updateFixedSections();
    
        worksFilterToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        worksSection.classList.toggle('filter-collapsed');
        
        // Save state to localStorage
        const isCollapsed = worksSection.classList.contains('filter-collapsed');
        localStorage.setItem('worksFilterCollapsed', isCollapsed.toString());
        
        // Update fixed sections based on new state
        updateFixedSections();
        
        // Trigger haptic feedback
        if (window.triggerHapticFeedback) {
            window.triggerHapticFeedback('light');
        }
        
        // Icon styling is handled by CSS based on filter-collapsed class
    });
    
    // Handle resize - expand on desktop, collapse on mobile
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth <= 768) {
                // Mobile - keep current state or collapse if not set
                if (!worksSection.classList.contains('filter-collapsed') && 
                    !worksSection.classList.contains('filter-expanded')) {
                    worksSection.classList.add('filter-collapsed');
                }
            } else {
                // Desktop - always expanded
                worksSection.classList.remove('filter-collapsed');
            }
            // Update fixed sections on resize
            updateFixedSections();
        }, 100);
    });
}

// Project sorting system
let currentSort = 'alphabetical'; // default sort
let currentDirection = 'asc'; // default direction (asc or desc)
// Note: projectsData is declared in the Project Data System section below

function initializeSorting() {
    const sortButtons = document.querySelectorAll('.sort-button');
    if (sortButtons.length === 0) return;
    
    // Initialize Lucide icons for sort buttons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Set up event listeners for sort buttons
    sortButtons.forEach(button => {
        // Remove any existing listeners by cloning the button
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation(); // Prevent sidebar from closing on mobile
            
            const sortType = newButton.getAttribute('data-sort');
            
            // If clicking the currently active button, toggle its direction
            if (currentSort === sortType) {
                const currentDir = newButton.getAttribute('data-direction');
                const newDirection = currentDir === 'asc' ? 'desc' : 'asc';
                newButton.setAttribute('data-direction', newDirection);
                currentDirection = newDirection;
                updateSortButtonIcon(newButton, sortType, currentDirection);
            } else {
                // Switch to different sort type - immediately activate
                currentSort = sortType;
                currentDirection = newButton.getAttribute('data-direction');
                // Update button states immediately
                updateSortButtons(sortType);
                updateAllSortButtonIcons();
            }
            
            // Always apply the sort immediately (no delay, no conditions)
            applySort(currentSort, currentDirection);
            
            return false; // Additional prevention
        });
        
        // Keyboard handler
        newButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation(); // Prevent sidebar from closing on mobile
                
                const sortType = newButton.getAttribute('data-sort');
                
                // If pressing the currently active button, toggle its direction
                if (currentSort === sortType) {
                    const currentDir = newButton.getAttribute('data-direction');
                    const newDirection = currentDir === 'asc' ? 'desc' : 'asc';
                    newButton.setAttribute('data-direction', newDirection);
                    currentDirection = newDirection;
                    updateSortButtonIcon(newButton, sortType, currentDirection);
                } else {
                    // Switch to different sort type - immediately activate
                    currentSort = sortType;
                    currentDirection = newButton.getAttribute('data-direction');
                    // Update button states immediately
                    updateSortButtons(sortType);
                    updateAllSortButtonIcons();
                }
                
                // Always apply the sort immediately
                applySort(currentSort, currentDirection);
                
                return false; // Additional prevention
            }
        });
    });
    
    // Set initial button states
    updateAllSortButtonIcons();
    
    // Apply initial sort if projects list exists (skip animation on initial load)
    const worksList = document.querySelector('.works-list');
    if (worksList && worksList.children.length > 0) {
        // Load projects data if not already loaded
        loadProjectsData().then(data => {
            if (data && data.projects) {
                // projectsData is a global variable from Project Data System
                const worksProjects = data.projects.filter(p => p.category === 'works');
                // Skip animation on initial load to prevent jarring rearrangement
                applySort(currentSort, currentDirection, worksProjects, true);
                updateSortButtons(currentSort);
            }
        }).catch(err => {
            console.warn('Failed to load projects data for sorting:', err);
        });
    }
}

function updateSortButtonIcon(button, sortType, direction) {
    const icon = button.querySelector('.sort-icon');
    const label = button.querySelector('.sort-label');
    
    if (!icon) return;
    
    // Remove old icon
    icon.remove();
    
    // Create new icon based on sort type and direction
    const newIcon = document.createElement('i');
    newIcon.className = 'sort-icon';
    
    if (sortType === 'alphabetical') {
        if (direction === 'asc') {
            newIcon.setAttribute('data-lucide', 'arrow-up-a-z');
            if (label) label.textContent = 'A-Z';
        } else {
            newIcon.setAttribute('data-lucide', 'arrow-down-z-a');
            if (label) label.textContent = 'Z-A';
        }
    } else if (sortType === 'year') {
        if (direction === 'desc') {
            newIcon.setAttribute('data-lucide', 'arrow-down-wide-narrow');
            if (label) label.textContent = 'New→Past';
        } else {
            newIcon.setAttribute('data-lucide', 'arrow-down-narrow-wide');
            if (label) label.textContent = 'Past→New';
        }
    }
    
    button.insertBefore(newIcon, label);
    
    // Re-initialize Lucide icon
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function updateAllSortButtonIcons() {
    const sortButtons = document.querySelectorAll('.sort-button');
    sortButtons.forEach(button => {
        const sortType = button.getAttribute('data-sort');
        const direction = button.getAttribute('data-direction');
        updateSortButtonIcon(button, sortType, direction);
    });
}

function updateSortButtons(activeSort) {
    const sortButtons = document.querySelectorAll('.sort-button');
    sortButtons.forEach(button => {
        const sortType = button.getAttribute('data-sort');
        if (sortType === activeSort) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function applySort(sortType, direction = 'asc', projectsArray = null, skipAnimation = false) {
    const worksList = document.querySelector('.works-list');
    if (!worksList) return;
    
    // Get all visible list items (respecting filters)
    const items = Array.from(worksList.querySelectorAll('li'));
    const visibleItems = items.filter(item => {
        const computedStyle = window.getComputedStyle(item);
        return computedStyle.display !== 'none';
    });
    
    if (visibleItems.length === 0) return;
    
    // Use provided projects array or try to get from global projectsData
    let projectsToUse = projectsArray;
    if (!projectsToUse) {
        // Check if projectsData is loaded (it's an object with .projects array)
        if (typeof projectsData !== 'undefined' && projectsData && projectsData.projects) {
            projectsToUse = projectsData.projects.filter(p => p.category === 'works');
        }
    }
    
    // Create array with item and its sort value
    const itemsWithSortValue = visibleItems.map(item => {
        const link = item.querySelector('a');
        const href = link ? link.getAttribute('href') : '';
        const slug = href ? href.replace('works/', '').replace('.html', '') : '';
        const project = projectsToUse ? projectsToUse.find(p => p.slug === slug) : null;
        
        let sortValue = '';
        if (sortType === 'alphabetical') {
            sortValue = slug.toLowerCase();
        } else if (sortType === 'year') {
            if (project && project.date) {
                sortValue = project.date;
            } else {
                // Try to get date from the sidebar date element
                const dateSpan = item.querySelector('.project-date-sidebar');
                sortValue = dateSpan ? dateSpan.textContent.trim() : '9999';
            }
        }
        
        return { item, sortValue, project };
    });
    
    // Sort based on type and direction
    if (sortType === 'alphabetical') {
        if (direction === 'asc') {
            itemsWithSortValue.sort((a, b) => a.sortValue.localeCompare(b.sortValue));
        } else {
            itemsWithSortValue.sort((a, b) => b.sortValue.localeCompare(a.sortValue));
        }
    } else if (sortType === 'year') {
        itemsWithSortValue.sort((a, b) => {
            const yearA = parseInt(a.sortValue) || 0;
            const yearB = parseInt(b.sortValue) || 0;
            if (direction === 'desc') {
                return yearB - yearA; // Newest first
            } else {
                return yearA - yearB; // Oldest first
            }
        });
    }
    
    // If skipping animation (initial load), just reorder without animation
    if (skipAnimation) {
        itemsWithSortValue.forEach(function({ item }) {
            worksList.appendChild(item);
        });
        // Update scroll shadows immediately
        setTimeout(function() {
            updateWorksListScrollShadows();
        }, 50);
        return;
    }
    
    // Re-append items in sorted order with smooth transition
    // First, add transition class to all items
    visibleItems.forEach(function(item) {
        item.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        item.style.opacity = '0.5';
        item.style.transform = 'translateY(-10px)';
    });
    
    // Small delay to allow fade-out
    setTimeout(function() {
        itemsWithSortValue.forEach(function({ item }, index) {
            // Stagger the animation slightly for calming effect
            setTimeout(function() {
                worksList.appendChild(item);
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 20); // 20ms delay between each item
        });
        
        // Update scroll shadows after sorting animation completes
        setTimeout(function() {
            updateWorksListScrollShadows();
        }, 100 + (itemsWithSortValue.length * 20));
    }, 50);
    
    // Note: Active project highlighting is handled by initializeFiltering
    // which calls setActiveProject after filtering
}


// Featured Work slow-motion calming glitch effect on hover
document.addEventListener('DOMContentLoaded', function() {
    const featuredWorkCta = document.getElementById('featuredWorkCta');
    const featuredWorkSpan = document.getElementById('featuredWorkText');
    
    if (!featuredWorkCta || !featuredWorkSpan) return;
    
    const originalText = 'SEE ALL WORK';
    const targetText = 'SEE ALL WORKS';
    const codeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    // ASCII block characters for terminal aesthetic
    const blockChars = ['█', '▓', '▒', '░', '▄', '▀'];
    // Special characters prioritized
    const specialChars = ['%', '$', '@', '#', '&', '*', '+', '=', '-', '_', '|', '\\', '/', '<', '>', '?', '!', '~', '`'];
    let currentText = originalText;
    let scrambleInterval = null;
    let isHovering = false;
    let charIndex = 0;
    let frameCount = 0;
    
    function getRandomChar() {
        const rand = Math.random();
        // 50% chance for blocks
        if (rand < 0.5) {
            return blockChars[Math.floor(Math.random() * blockChars.length)];
        }
        // 30% chance for special characters
        else if (rand < 0.8) {
            return specialChars[Math.floor(Math.random() * specialChars.length)];
        }
        // 20% chance for regular alphanumeric
        return codeChars[Math.floor(Math.random() * codeChars.length)];
    }
    
    function slowGlitch() {
        if (!isHovering) return;
        
        const targetArray = targetText.split('');
        const currentArray = currentText.split('');
        
        // Only change 1 character at a time for very calming effect
        let changed = 0;
        const maxChanges = 1;
        
        // Gradually reveal target text, character by character
        for (let i = 0; i < currentArray.length && changed < maxChanges; i++) {
            if (currentArray[i] !== targetArray[i] && targetArray[i] !== undefined) {
                // 20% chance to change this character (much slower, more deliberate)
                if (Math.random() < 0.2) {
                    // Sometimes show target char, sometimes random char
                    if (Math.random() < 0.65) {
                        currentArray[i] = targetArray[i];
                    } else {
                        currentArray[i] = getRandomChar();
                    }
                    changed++;
                }
            }
        }
        
        currentText = currentArray.join('');
        featuredWorkSpan.textContent = currentText;
        frameCount++;
        
        // After enough frames, ensure we show target text (slower reveal)
        if (frameCount > 25 && currentText !== targetText) {
            featuredWorkSpan.textContent = targetText;
            currentText = targetText;
            if (scrambleInterval) {
                clearInterval(scrambleInterval);
                scrambleInterval = null;
            }
        }
    }
    
    function startScrambling() {
        isHovering = true;
        currentText = originalText;
        frameCount = 0;
        charIndex = 0;
        
        // Start slow glitch - 300ms interval (slower, more calming)
        slowGlitch();
        scrambleInterval = setInterval(slowGlitch, 300);
        
        // After 1.2 seconds, ensure target text is shown (longer, more calming)
        setTimeout(() => {
            if (scrambleInterval) {
                clearInterval(scrambleInterval);
                scrambleInterval = null;
            }
            if (isHovering) {
                featuredWorkSpan.textContent = targetText;
                currentText = targetText;
            }
        }, 1200);
    }
    
    function stopScrambling() {
        isHovering = false;
        if (scrambleInterval) {
            clearInterval(scrambleInterval);
            scrambleInterval = null;
        }
        
        // Keep current state (target text), then slowly glitch back to original
        // First ensure we're showing the target text if we're not already
        var currentDisplayText = featuredWorkSpan.textContent;
        if (currentDisplayText !== targetText) {
            featuredWorkSpan.textContent = targetText;
            currentText = targetText;
        }
        
        // Small delay before starting glitch back
        setTimeout(function() {
            var glitchBackInterval = null;
            var glitchBackFrameCount = 0;
            
            function glitchBack() {
                const currentArray = featuredWorkSpan.textContent.split('');
                const targetArray = originalText.split('');
                let changed = 0;
                const maxChanges = 1; // Only 1 character at a time for calming effect
                
                // Gradually reveal original text characters
                for (let i = 0; i < currentArray.length && changed < maxChanges; i++) {
                    if (currentArray[i] === ' ') continue;
                    
                    // If character doesn't match original, gradually reveal it
                    if (currentArray[i] !== targetArray[i] && targetArray[i] !== undefined) {
                        // 20% chance to change this character (slow, deliberate)
                        if (Math.random() < 0.2) {
                            // Sometimes show original char, sometimes random char
                            if (Math.random() < 0.65) {
                                currentArray[i] = targetArray[i];
                            } else {
                                currentArray[i] = getRandomChar();
                            }
                            changed++;
                        }
                    }
                }
                
                featuredWorkSpan.textContent = currentArray.join('');
                glitchBackFrameCount++;
                
                // Check if fully reassembled to original
                if (currentArray.join('') === originalText) {
                    if (glitchBackInterval) {
                        clearInterval(glitchBackInterval);
                        glitchBackInterval = null;
                    }
                    featuredWorkSpan.textContent = originalText;
                    currentText = originalText;
                    frameCount = 0;
                    return;
                }
                
                // Safety: ensure we show original text after enough frames
                if (glitchBackFrameCount > 30) {
                    if (glitchBackInterval) {
                        clearInterval(glitchBackInterval);
                        glitchBackInterval = null;
                    }
                    featuredWorkSpan.textContent = originalText;
                    currentText = originalText;
                    frameCount = 0;
                    return;
                }
            }
            
            // Start glitch back animation (slower, more calming)
            glitchBack();
            glitchBackInterval = setInterval(glitchBack, 300);
        }, 200); // Small delay to keep target text visible
    }
    
    // Desktop: hover on CTA
    featuredWorkCta.addEventListener('mouseenter', startScrambling);
    featuredWorkCta.addEventListener('mouseleave', stopScrambling);
    featuredWorkCta.addEventListener('focus', startScrambling);
    featuredWorkCta.addEventListener('blur', stopScrambling);
    
    // Mobile: tap on CTA
    featuredWorkCta.addEventListener('touchstart', function(e) {
        e.preventDefault();
        startScrambling();
        setTimeout(function() {
            stopScrambling();
        }, 2000);
    }, { passive: false });
});

// About section slow-motion calming glitch effect on hover (removed - about section no longer in main content)
// This code is kept for potential future use but currently disabled
document.addEventListener('DOMContentLoaded', function() {
    const aboutSection = document.querySelector('.about-section .section-header');
    const aboutLink = document.querySelector('.about-section .section-link');
    const aboutSpan = document.getElementById('aboutText');
    
    // Skip if about section doesn't exist (removed from main content)
    if (!aboutSection || !aboutLink || !aboutSpan) return;
    
    const originalText = 'ABOUT ME';
    const targetText = 'READ MORE';
    const codeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    // ASCII block characters for terminal aesthetic
    const blockChars = ['█', '▓', '▒', '░', '▄', '▀'];
    // Special characters prioritized
    const specialChars = ['%', '$', '@', '#', '&', '*', '+', '=', '-', '_', '|', '\\', '/', '<', '>', '?', '!', '~', '`'];
    let currentText = originalText;
    let scrambleInterval = null;
    let isHovering = false;
    let charIndex = 0;
    let frameCount = 0;
    
    function getRandomChar() {
        const rand = Math.random();
        // 50% chance for blocks
        if (rand < 0.5) {
            return blockChars[Math.floor(Math.random() * blockChars.length)];
        }
        // 30% chance for special characters
        else if (rand < 0.8) {
            return specialChars[Math.floor(Math.random() * specialChars.length)];
        }
        // 20% chance for regular alphanumeric
        return codeChars[Math.floor(Math.random() * codeChars.length)];
    }
    
    function slowGlitch() {
        if (!isHovering) return;
        
        const targetArray = targetText.split('');
        const currentArray = currentText.split('');
        
        // Only change 1 character at a time for very calming effect
        let changed = 0;
        const maxChanges = 1;
        
        // Gradually reveal target text, character by character
        for (let i = 0; i < currentArray.length && changed < maxChanges; i++) {
            if (currentArray[i] !== targetArray[i] && targetArray[i] !== undefined) {
                // 20% chance to change this character (much slower, more deliberate)
                if (Math.random() < 0.2) {
                    // Sometimes show target char, sometimes random char
                    if (Math.random() < 0.65) {
                        currentArray[i] = targetArray[i];
                    } else {
                        currentArray[i] = getRandomChar();
                    }
                    changed++;
                }
            }
        }
        
        currentText = currentArray.join('');
        aboutSpan.textContent = currentText;
        frameCount++;
        
        // After enough frames, ensure we show target text (slower reveal)
        if (frameCount > 25 && currentText !== targetText) {
            aboutSpan.textContent = targetText;
            currentText = targetText;
            if (scrambleInterval) {
                clearInterval(scrambleInterval);
                scrambleInterval = null;
            }
        }
    }
    
    function startScrambling() {
        isHovering = true;
        currentText = originalText;
        frameCount = 0;
        charIndex = 0;
        
        // Start slow glitch - 300ms interval (slower, more calming)
        slowGlitch();
        scrambleInterval = setInterval(slowGlitch, 300);
        
        // After 1.2 seconds, ensure target text is shown (longer, more calming)
        setTimeout(() => {
            if (scrambleInterval) {
                clearInterval(scrambleInterval);
                scrambleInterval = null;
            }
            if (isHovering) {
                aboutSpan.textContent = targetText;
                currentText = targetText;
            }
        }, 1200);
    }
    
    function stopScrambling() {
        isHovering = false;
        if (scrambleInterval) {
            clearInterval(scrambleInterval);
            scrambleInterval = null;
        }
        
        // Keep current state (target text), then slowly glitch back to original
        // First ensure we're showing the target text if we're not already
        var currentDisplayText = aboutSpan.textContent;
        if (currentDisplayText !== targetText) {
            aboutSpan.textContent = targetText;
            currentText = targetText;
        }
        
        // Small delay before starting glitch back
        setTimeout(function() {
            var glitchBackInterval = null;
            var glitchBackFrameCount = 0;
            
            function glitchBack() {
                const currentArray = aboutSpan.textContent.split('');
                const targetArray = originalText.split('');
                let changed = 0;
                const maxChanges = 1; // Only 1 character at a time for calming effect
                
                // Gradually reveal original text characters
                for (let i = 0; i < currentArray.length && changed < maxChanges; i++) {
                    if (currentArray[i] === ' ') continue;
                    
                    // If character doesn't match original, gradually reveal it
                    if (currentArray[i] !== targetArray[i] && targetArray[i] !== undefined) {
                        // 20% chance to change this character (slow, deliberate)
                        if (Math.random() < 0.2) {
                            // Sometimes show original char, sometimes random char
                            if (Math.random() < 0.65) {
                                currentArray[i] = targetArray[i];
                            } else {
                                currentArray[i] = getRandomChar();
                            }
                            changed++;
                        }
                    }
                }
                
                aboutSpan.textContent = currentArray.join('');
                glitchBackFrameCount++;
                
                // Check if fully reassembled to original
                if (currentArray.join('') === originalText) {
                    if (glitchBackInterval) {
                        clearInterval(glitchBackInterval);
                        glitchBackInterval = null;
                    }
                    aboutSpan.textContent = originalText;
                    currentText = originalText;
                    frameCount = 0;
                    return;
                }
                
                // Safety: ensure we show original text after enough frames
                if (glitchBackFrameCount > 30) {
                    if (glitchBackInterval) {
                        clearInterval(glitchBackInterval);
                        glitchBackInterval = null;
                    }
                    aboutSpan.textContent = originalText;
                    currentText = originalText;
                    frameCount = 0;
                    return;
                }
            }
            
            // Start glitch back animation (slower, more calming)
            glitchBack();
            glitchBackInterval = setInterval(glitchBack, 300);
        }, 200); // Small delay to keep target text visible
    }
    
    // Add hover listeners to the entire section header
    aboutSection.addEventListener('mouseenter', startScrambling);
    aboutSection.addEventListener('mouseleave', stopScrambling);
    aboutLink.addEventListener('focus', startScrambling);
    aboutLink.addEventListener('blur', stopScrambling);
});

// Pandji name glitch effect - reveal "Andrew Pandji" on hover
document.addEventListener('DOMContentLoaded', function() {
    const pandjiNameSpan = document.getElementById('pandjiName');
    const homeHeader = document.querySelector('.home-header');
    
    if (!pandjiNameSpan || !homeHeader) return;
    
    const originalText = 'Pandji';
    const targetText = 'Andrew';
    const codeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    // ASCII block characters for terminal aesthetic
    const blockChars = ['█', '▓', '▒', '░', '▄', '▀'];
    // Special characters prioritized
    const specialChars = ['%', '$', '@', '#', '&', '*', '+', '=', '-', '_', '|', '\\', '/', '<', '>', '?', '!', '~', '`'];
    let currentText = originalText;
    let scrambleInterval = null;
    let isHovering = false;
    let frameCount = 0;
    
    function getRandomChar() {
        const rand = Math.random();
        // 50% chance for blocks
        if (rand < 0.5) {
            return blockChars[Math.floor(Math.random() * blockChars.length)];
        }
        // 30% chance for special characters
        else if (rand < 0.8) {
            return specialChars[Math.floor(Math.random() * specialChars.length)];
        }
        // 20% chance for regular alphanumeric
        return codeChars[Math.floor(Math.random() * codeChars.length)];
    }
    
    function slowGlitch() {
        if (!isHovering) return;
        
        const targetArray = targetText.split('');
        const currentArray = currentText.split('');
        
        // Change 1-2 characters at a time for snappier but still calming effect
        let changed = 0;
        const maxChanges = Math.random() < 0.4 ? 2 : 1; // 40% chance for 2 changes
        
        // Gradually reveal target text, character by character
        for (let i = 0; i < currentArray.length && changed < maxChanges; i++) {
            if (currentArray[i] !== targetArray[i] && targetArray[i] !== undefined) {
                // 35% chance to change this character (snappier but still deliberate)
                if (Math.random() < 0.35) {
                    // Sometimes show target char, sometimes random char
                    if (Math.random() < 0.7) {
                        currentArray[i] = targetArray[i];
                    } else {
                        currentArray[i] = getRandomChar();
                    }
                    changed++;
                }
            }
        }
        
        // Handle case where target is longer than current
        if (currentArray.length < targetArray.length && changed < maxChanges) {
            if (Math.random() < 0.35) {
                currentArray.push(targetArray[currentArray.length]);
                changed++;
            }
        }
        
        currentText = currentArray.join('');
        pandjiNameSpan.textContent = currentText;
        frameCount++;
        
        // After fewer frames, ensure we show target text (snappier reveal)
        if (frameCount > 15 && currentText !== targetText) {
            pandjiNameSpan.textContent = targetText;
            currentText = targetText;
            if (scrambleInterval) {
                clearInterval(scrambleInterval);
                scrambleInterval = null;
            }
        }
    }
    
    function startScrambling() {
        isHovering = true;
        frameCount = 0;
        currentText = pandjiNameSpan.textContent;
        
        if (scrambleInterval) {
            clearInterval(scrambleInterval);
        }
        
        // Start glitch animation - snappier timing
        slowGlitch();
        scrambleInterval = setInterval(slowGlitch, 200); // Faster interval for snappier feel
    }
    
    function stopScrambling() {
        isHovering = false;
        if (scrambleInterval) {
            clearInterval(scrambleInterval);
            scrambleInterval = null;
        }
        
        // Keep current state (target text), then slowly glitch back to original
        // First ensure we're showing the target text if we're not already
        var currentDisplayText = pandjiNameSpan.textContent;
        if (currentDisplayText !== targetText) {
            pandjiNameSpan.textContent = targetText;
            currentText = targetText;
        }
        
        // Small delay before starting glitch back
        setTimeout(function() {
            var glitchBackInterval = null;
            var glitchBackFrameCount = 0;
            
            function glitchBack() {
                const currentArray = pandjiNameSpan.textContent.split('');
                const targetArray = originalText.split('');
                let changed = 0;
                const maxChanges = Math.random() < 0.4 ? 2 : 1; // 40% chance for 2 changes
                
                // Gradually reveal original text characters
                for (let i = 0; i < currentArray.length && changed < maxChanges; i++) {
                    if (currentArray[i] === ' ') continue;
                    
                    // If character doesn't match original, gradually reveal it
                    if (i < targetArray.length && currentArray[i] !== targetArray[i]) {
                        // 30% chance to change this character (snappier but still deliberate)
                        if (Math.random() < 0.3) {
                            // Sometimes show original char, sometimes random char
                            if (Math.random() < 0.7) {
                                currentArray[i] = targetArray[i];
                            } else {
                                currentArray[i] = getRandomChar();
                            }
                            changed++;
                        }
                    } else if (i >= targetArray.length) {
                        // Remove extra characters
                        if (Math.random() < 0.3) {
                            currentArray.splice(i, 1);
                            changed++;
                            i--; // Adjust index after removal
                        }
                    }
                }
                
                pandjiNameSpan.textContent = currentArray.join('');
                glitchBackFrameCount++;
                
                // Check if fully reassembled to original
                if (currentArray.join('') === originalText) {
                    if (glitchBackInterval) {
                        clearInterval(glitchBackInterval);
                        glitchBackInterval = null;
                    }
                    pandjiNameSpan.textContent = originalText;
                    currentText = originalText;
                    frameCount = 0;
                    return;
                }
                
                // Safety: ensure we show original text after enough frames
                if (glitchBackFrameCount > 20) {
                    if (glitchBackInterval) {
                        clearInterval(glitchBackInterval);
                        glitchBackInterval = null;
                    }
                    pandjiNameSpan.textContent = originalText;
                    currentText = originalText;
                    frameCount = 0;
                    return;
                }
            }
            
            // Start glitch back animation (snappier but still calming)
            glitchBack();
            glitchBackInterval = setInterval(glitchBack, 200);
        }, 150); // Shorter delay for snappier feel
    }
    
    // Add hover listeners to the name span
    // Desktop: hover to trigger name switching
    pandjiNameSpan.addEventListener('mouseenter', startScrambling);
    pandjiNameSpan.addEventListener('mouseleave', stopScrambling);
    pandjiNameSpan.style.cursor = 'pointer'; // Indicate it's interactive
    
    // Mobile: tap to trigger name switching
    let isToggled = false;
    pandjiNameSpan.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (!isToggled) {
            startScrambling();
            isToggled = true;
            // After animation completes, toggle back
            setTimeout(function() {
                stopScrambling();
                setTimeout(function() {
                    isToggled = false;
                }, 2000); // Allow time for glitch back animation
            }, 1000);
        }
    }, { passive: false });
    
    // Add click handler to navigate to about me section in sidebar
    pandjiNameSpan.addEventListener('click', function(e) {
        e.preventDefault();
        // Find the about me section in the sidebar
        const fixedSections = document.querySelectorAll('.sidebar .fixed-section');
        let aboutMeSection = null;
        
        for (let i = 0; i < fixedSections.length; i++) {
            const linkText = fixedSections[i].querySelector('.nav-section-link');
            if (linkText && linkText.textContent.trim().toLowerCase() === 'about me') {
                aboutMeSection = fixedSections[i];
                break;
            }
        }
        
        if (aboutMeSection) {
            // Scroll sidebar to show the about me section
            aboutMeSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            // Add a subtle highlight effect on the title
            const navTitle = aboutMeSection.querySelector('.nav-section-title');
            if (navTitle) {
                navTitle.style.transition = 'background-color 0.3s ease';
                navTitle.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                setTimeout(function() {
                    navTitle.style.backgroundColor = '';
                }, 1000);
            }
        }
    });
});

// Auto-load components on page load
// Safari iOS compatible - handle both DOMContentLoaded and immediate execution
(function() {
    'use strict';
    
    function initComponents() {
        console.log('Initializing components...');
        
        // Initialize components
        (async function() {
            try {
                await loadComponentsMain();
            } catch (error) {
                console.error('Error in component loading:', error);
                // Show JS failure indicator
                if (typeof showJSFailureIndicator === 'function') {
                    showJSFailureIndicator('Component loading failed: ' + error.message);
                }
            }
        })();
    }
    
    // Try multiple initialization methods for maximum compatibility
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOMContentLoaded fired');
            initComponents();
        });
    } else {
        // DOM already loaded
        console.log('DOM already ready');
        initComponents();
    }
    
    // Also try after a short delay as backup
    setTimeout(function() {
        var sidebar = document.getElementById('sidebar');
        if (!sidebar && document.body) {
            console.log('Delayed initialization - sidebar missing');
            initComponents();
        }
    }, 500);
})();

async function loadComponentsMain() {
    // Determine base path based on current page location
    // For GitHub Pages compatibility: handle both root and subdirectory deployments
    const pathname = window.location.pathname;
    const pathParts = pathname.split('/').filter(function(part) {
        return part && part !== 'index.html';
    });
    
    // Check if we're in a subdirectory (like /works/)
    const isInSubdirectory = pathname.includes('/works/');
    
    // Calculate basePath: go up one level for each directory we're in
    let basePath = '';
    if (isInSubdirectory) {
        // We're in /works/ subdirectory, need to go up one level
        basePath = '../';
    } else if (pathParts.length > 0) {
        // We're in a GitHub Pages subdirectory (e.g., /username/repo/)
        // Count how many levels deep we are (excluding the filename)
        const depth = pathParts.length;
        if (depth > 0) {
            basePath = '../'.repeat(depth);
        }
    }
    
    console.log('Loading components with basePath: ' + basePath + ', pathname: ' + pathname);
    
    // Only load components if they don't already exist
    const sidebarExists = document.getElementById('sidebar');
    
    // Add resize listener to handle orientation changes
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const sidebarToggle = document.getElementById('sidebarToggle');
            if (sidebarToggle && typeof initializeSidebarToggle === 'function') {
                initializeSidebarToggle();
            }
        }, 250);
    });
    
    if (!sidebarExists) {
        console.log('Loading sidebar component...');
        try {
            const result = await loadComponent('sidebar', 'beforeMain', { basePath });
            if (result) {
                console.log('Sidebar loaded successfully');
            } else {
                console.error('Sidebar failed to load');
                // Show content even if sidebar fails to load
                const mainContent = document.querySelector('.content');
                if (mainContent) {
                    setTimeout(function() {
                        mainContent.classList.add('loaded');
                    }, 300);
                }
            }
        } catch (err) {
            console.error('Error loading sidebar:', err);
            // Show content even if sidebar fails to load
            const mainContent = document.querySelector('.content');
            if (mainContent) {
                setTimeout(function() {
                    mainContent.classList.add('loaded');
                }, 300);
            }
        }
    } else {
        console.log('Sidebar already exists');
        // If sidebar already exists, show content after a brief delay
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.content');
        if (sidebar && mainContent) {
            setTimeout(function() {
                sidebar.classList.add('loaded');
                setTimeout(function() {
                    mainContent.classList.add('loaded');
                }, 150);
            }, 50);
        }
    }
    
    // Load projects data and initialize project system
    initializeProjectSystem(basePath);
}

// ============================================
// Project Data System - Single Source of Truth
// ============================================

let projectsData = null;

// Load projects.json - single source of truth
async function loadProjectsData(basePath) {
    // iOS Safari compatibility - handle default parameter
    if (typeof basePath === 'undefined' || basePath === null) {
        basePath = '';
    }
    if (projectsData) {
        return projectsData; // Return cached data
    }
    
    try {
        let response;
        try {
            // Ensure basePath ends with / if it's not empty
            var projectsPath = basePath;
            if (projectsPath && !projectsPath.endsWith('/') && projectsPath !== '../') {
                projectsPath += '/';
            }
            projectsPath += 'data/projects.json';
            
            response = await fetch(projectsPath, {
                cache: 'default', // Allow browser/service worker caching
                credentials: 'same-origin'
            });
        } catch (fetchError) {
            // Fallback to XHR for Safari iOS
            return loadProjectsDataXHR(basePath);
        }
        
        if (!response.ok) {
            throw new Error('Failed to load projects data');
        }
        const data = await response.json();
        projectsData = data;
        console.log('Projects data loaded:', data.projects.length, 'projects');
        return data;
    } catch (error) {
        console.error('Error loading projects data:', error);
        // Try XHR fallback
        try {
            return await loadProjectsDataXHR(basePath);
        } catch (xhrError) {
            console.error('XHR fallback also failed:', xhrError);
            return null;
        }
    }
}

// XHR fallback for projects data
function loadProjectsDataXHR(basePath) {
    // iOS Safari compatibility
    if (!basePath) {
        basePath = '';
    }
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        // Ensure basePath ends with / if it's not empty
        var projectsPath = basePath;
        if (projectsPath && !projectsPath.endsWith('/') && projectsPath !== '../') {
            projectsPath += '/';
        }
        projectsPath += 'data/projects.json';
        xhr.open('GET', projectsPath, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 0) {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        projectsData = data;
                        console.log('Projects data loaded via XHR:', data.projects.length, 'projects');
                        resolve(data);
                    } catch (e) {
                        reject(new Error('Failed to parse JSON: ' + e.message));
                    }
                } else {
                    reject(new Error('XHR failed with status: ' + xhr.status));
                }
            }
        };
        xhr.onerror = function() {
            reject(new Error('XHR network error'));
        };
        xhr.send();
    });
}

// Get project by slug
function getProjectBySlug(slug) {
    if (!projectsData) return null;
    return projectsData.projects.find(p => p.slug === slug);
}

// Get featured projects
function getFeaturedProjects() {
    if (!projectsData) return [];
    return projectsData.projects.filter(p => p.featured);
}

// Get projects by tags
function getProjectsByTags(tags) {
    if (!projectsData) return [];
    if (!tags || tags.length === 0) return projectsData.projects;
    
    return projectsData.projects.filter(project => {
        return tags.every(tag => project.tags.includes(tag));
    });
}

// Generate sidebar project list from projects.json
function generateSidebarProjectList(projects) {
    const worksList = document.querySelector('.works-list');
    if (!worksList) return;
    
    // Clear existing items
    worksList.innerHTML = '';
    
    // Filter to only "works" category projects
    const worksProjects = projects.filter(p => p.category === 'works');
    
    // Store projects data for sorting
    projectsData = worksProjects;
    
    // Generate list items
    worksProjects.forEach(project => {
        const li = document.createElement('li');
        li.setAttribute('data-tags', project.tags.join(' '));
        
        const linkWrapper = document.createElement('div');
        linkWrapper.className = 'project-link-wrapper';
        
        const a = document.createElement('a');
        a.href = `works/${project.slug}.html`;
        a.textContent = project.slug;
        
        // Check if this is the active page
        const currentPath = window.location.pathname;
        const projectPath = `works/${project.slug}.html`;
        if (currentPath.includes(projectPath) || currentPath.endsWith(`/${project.slug}.html`)) {
            a.classList.add('active');
            linkWrapper.classList.add('has-active-link'); // Add class for easier CSS targeting
        }
        
        linkWrapper.appendChild(a);
        
        // Add date if it exists
        if (project.date) {
            const dateSpan = document.createElement('span');
            dateSpan.className = 'project-date-sidebar';
            dateSpan.textContent = project.date;
            linkWrapper.appendChild(dateSpan);
            console.log('Added date for', project.slug, ':', project.date);
        }
        
        li.appendChild(linkWrapper);
        worksList.appendChild(li);
    });
    
    // Apply current sort after generating list (skip animation on initial generation)
    setTimeout(() => {
        if (typeof applySort === 'function') {
            applySort(currentSort, currentDirection, worksProjects, true);
            updateSortButtons(currentSort);
        }
    }, 50);
    
    console.log('Sidebar project list generated:', worksProjects.length, 'projects');
}

// Render project page from data
function renderProjectPage(project) {
    if (!project) {
        console.error('No project data provided');
        return;
    }
    
    // Check if content is already pre-rendered (from build script)
    const contentElement = document.querySelector('[data-project-content]');
    const hasPreRenderedContent = contentElement && contentElement.innerHTML.trim() && 
                                   !contentElement.innerHTML.includes('will be populated') &&
                                   !contentElement.innerHTML.includes('will be inserted');
    
    if (hasPreRenderedContent) {
        console.log('Project page already has pre-rendered content, skipping JS rendering');
        // Still update tags and other metadata that might be missing
        updateProjectMetadata(project);
        return;
    }
    
    // Update title
    const titleElement = document.querySelector('[data-project-title]');
    if (titleElement) {
        if (titleElement.tagName === 'TITLE') {
            titleElement.textContent = `${project.title} — pandjico`;
        } else {
            titleElement.textContent = project.title;
        }
    }
    
    // Render tags
    const tagsContainer = document.querySelector('[data-project-tags]');
    if (tagsContainer && (!tagsContainer.innerHTML || tagsContainer.innerHTML.includes('will be'))) {
        tagsContainer.innerHTML = '';
        project.tags.forEach(tag => {
            const button = document.createElement('button');
            button.className = 'tag';
            button.setAttribute('data-tag', tag);
            button.textContent = `#${tag}`;
            tagsContainer.appendChild(button);
        });
    }
    
    // Render date
    const dateElement = document.querySelector('[data-project-date]');
    if (dateElement && project.date) {
        dateElement.textContent = project.date;
        dateElement.style.display = '';
    } else if (dateElement) {
        dateElement.style.display = 'none';
    }
    
    // Render description
    const descriptionElement = document.querySelector('[data-project-description]');
    if (descriptionElement) {
        if (project.description) {
            descriptionElement.innerHTML = `<p>${project.description}</p>`;
            descriptionElement.style.display = '';
        } else {
            descriptionElement.style.display = 'none';
        }
    }
    
    // Render content (only if not pre-rendered)
    if (contentElement && !hasPreRenderedContent) {
        if (project.content) {
            // Convert newlines to paragraphs
            const paragraphs = project.content.split('\n\n').filter(p => p.trim());
            contentElement.innerHTML = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
            contentElement.style.display = '';
        } else {
            contentElement.style.display = 'none';
        }
    }
    
    // Render links
    const linksElement = document.querySelector('[data-project-links]');
    if (linksElement) {
        if (project.links && project.links.length > 0) {
            linksElement.innerHTML = project.links.map(link => 
                `<a href="${link.url}" class="project-link">${link.label}</a>`
            ).join('');
            linksElement.style.display = '';
        } else {
            linksElement.style.display = 'none';
        }
    }
    
    console.log('Project page rendered:', project.slug);
}

// Update only metadata (tags, date) without overwriting content
function updateProjectMetadata(project) {
    const tagsContainer = document.querySelector('[data-project-tags]');
    if (tagsContainer && (!tagsContainer.innerHTML || tagsContainer.innerHTML.includes('will be'))) {
        tagsContainer.innerHTML = '';
        project.tags.forEach(tag => {
            const button = document.createElement('button');
            button.className = 'tag';
            button.setAttribute('data-tag', tag);
            button.textContent = `#${tag}`;
            tagsContainer.appendChild(button);
        });
    }
    
    const dateElement = document.querySelector('[data-project-date]');
    if (dateElement && project.date) {
        dateElement.textContent = project.date;
    }
}

// Generate featured projects on homepage - new carousel structure
function generateFeaturedProjects(projects) {
    const container = document.getElementById('featuredProjects');
    if (!container) return;
    
    // Use the projects parameter if provided, otherwise fall back to global projectsData
    const projectsToUse = projects || (projectsData && projectsData.projects) || [];
    
    // Filter for specific 5 featured projects in order
    const featuredIds = ['sail_pattern_lab', 'driftpad', 'ascension_rx', 'sapling', 'weather_aura'];
    const featured = featuredIds.map(function(id) {
        return projectsToUse.find(function(p) { return p.id === id; });
    }).filter(function(p) { return p !== undefined; });
    
    if (featured.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.innerHTML = '';
    container.className = 'featured-projects-carousel';
    
    // Create progress dots container (mobile)
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots';
    dotsContainer.setAttribute('aria-hidden', 'true');
    featured.forEach(function(project, index) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('data-index', index);
        dot.setAttribute('aria-label', 'Go to slide ' + (index + 1));
        if (index === 0) dot.classList.add('active');
        dotsContainer.appendChild(dot);
    });
    container.appendChild(dotsContainer);
    
    // Create cards container
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'featured-projects-cards';
    
    featured.forEach(function(project, index) {
        const card = document.createElement('article');
        card.className = 'featured-project-card';
        card.setAttribute('data-index', index);
        // Ensure white border is applied (except first card)
        if (index > 0) {
            card.style.borderTop = '1px solid var(--color-white)';
        }
        
        const link = document.createElement('a');
        link.href = 'works/' + project.slug + '.html';
        link.className = 'featured-project-card-link';
        link.setAttribute('aria-label', 'View ' + (project.title || project.slug));
        
        // Image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'featured-project-image-container';
        
        if (project.image) {
            const img = document.createElement('img');
            img.src = project.image;
            img.alt = project.title || project.slug;
            img.loading = index < 2 ? 'eager' : 'lazy'; // Load first 2 immediately
            img.onerror = function() {
                console.error('Failed to load image:', project.image, 'for project:', project.title);
                this.style.display = 'none';
            };
            imageContainer.appendChild(img);
        }
        
        // Gradient overlay
        const gradientOverlay = document.createElement('div');
        gradientOverlay.className = 'featured-project-gradient';
        imageContainer.appendChild(gradientOverlay);
        
        // Blurb container (overlay on image)
        const blurbContainer = document.createElement('div');
        blurbContainer.className = 'featured-project-blurb';
        
        // Title
        const h3 = document.createElement('h3');
        h3.className = 'featured-project-title';
        h3.textContent = project.title || project.slug;
        blurbContainer.appendChild(h3);
        
        // Description
        if (project.description) {
            const p = document.createElement('p');
            p.className = 'featured-project-description';
            p.textContent = project.description;
            blurbContainer.appendChild(p);
        }
        
        // CTA button (always visible on mobile, revealed on hover desktop)
        const ctaButton = document.createElement('span');
        ctaButton.className = 'featured-project-cta';
        ctaButton.innerHTML = 'SEE PROJECT <i data-lucide="arrow-right" class="cta-icon"></i>';
        blurbContainer.appendChild(ctaButton);
        
        imageContainer.appendChild(blurbContainer);
        link.appendChild(imageContainer);
        card.appendChild(link);
        cardsContainer.appendChild(card);
    });
    
    container.appendChild(cardsContainer);
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        setTimeout(function() {
            lucide.createIcons();
        }, 200);
    }
    
    // Initialize scroll tracking for progress dots (mobile)
    initializeCarouselScroll(container, dotsContainer);
    
    console.log('Featured projects carousel generated:', featured.length);
}

// Initialize carousel scroll tracking for progress dots and card stack animation
// SIMPLIFIED VERSION - cards in normal flow with CSS scroll-snap
function initializeCarouselScroll(container, dotsContainer) {
    const cardsContainer = container.querySelector('.featured-projects-cards');
    if (!cardsContainer || !dotsContainer) return;
    
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    const cards = cardsContainer.querySelectorAll('.featured-project-card');
    
    if (window.innerWidth > 768) {
        // Desktop: use regular scroll tracking
        function updateActiveDot() {
            const scrollTop = cardsContainer.scrollTop;
            const cardHeight = cards[0] ? cards[0].offsetHeight : 0;
            const activeIndex = Math.round(scrollTop / cardHeight);
            
            dots.forEach(function(dot, index) {
                if (index === activeIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
        
        let scrollTimeout;
        cardsContainer.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateActiveDot, 50);
        });
        updateActiveDot();
        return;
    }
    
    // Mobile: SIMPLIFIED - cards in normal flow, CSS handles snapping
    let currentIndex = 0;
    
    // Simple setup - just ensure cards are in normal flow
    function setupCards() {
        if (cards.length === 0) return;
        
        // Calculate card height from viewport
        const viewportHeight = window.innerHeight;
        const header = document.querySelector('.home-header');
        const headerHeight = header ? header.offsetHeight : 0;
        const cta = document.getElementById('featuredWorkCta');
        const ctaHeight = cta ? cta.offsetHeight : 0;
        const cardHeight = viewportHeight - headerHeight - ctaHeight;
        
        
        if (cardHeight <= 0) return;
        
        // Set all cards to same height with border-box
        cards.forEach(function(card, index) {
            card.style.position = 'relative'; // Normal flow - SIMPLIFIED
            card.style.boxSizing = 'border-box';
            card.style.height = cardHeight + 'px';
            card.style.minHeight = cardHeight + 'px';
            card.style.maxHeight = cardHeight + 'px';
            card.style.margin = '0';
            card.style.padding = '0';
            // Remove any transforms - let CSS handle it
            card.style.transform = 'none';
            
        });
        
        // Add padding-bottom to container so last card can scroll fully into view
        // This ensures the CTA on the last card is visible above the fixed "SEE ALL WORK" CTA
        cardsContainer.style.paddingBottom = ctaHeight + 'px';
        
        // Container height is automatic (cards in flow)
        // CSS scroll-snap handles the snapping
        
        return cardHeight;
    }
    
    // Expose recalculation function for layout updates
    window.recalculateCarousel = function() {
        setupCards();
        updateCardStates();
    };
    
    // PHYSICAL CARD CAROUSEL - Simplified for snappy, tactile feel
    // Let CSS scroll-snap handle the snapping, JS handles visual stacking
    
    function updateCardStates() {
        if (cards.length === 0) return;
        
        const scrollTop = cardsContainer.scrollTop;
        const cardHeight = cards[0].offsetHeight;
        if (!cardHeight || cardHeight <= 0) return;
        
        // Calculate which card we're on based on scroll position
        const exactIndex = scrollTop / cardHeight;
        const activeIndex = Math.round(exactIndex);
        const clampedIndex = Math.max(0, Math.min(activeIndex, cards.length - 1));
        
        // How far we've scrolled past the current card's start (0 to 1)
        const progress = exactIndex - Math.floor(exactIndex);
        
        // Update each card's visual state
        cards.forEach(function(card, index) {
            card.classList.remove('active', 'prev', 'next');
            
            if (index === clampedIndex) {
                // ACTIVE CARD - sits at top, fully visible
                card.classList.add('active');
                card.style.transform = 'translateY(0) scale(1)';
                card.style.zIndex = String(20);
                card.style.opacity = '1';
                card.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
                
            } else if (index === clampedIndex + 1) {
                // NEXT CARD - slides up from below, stacking on top
                card.classList.add('next');
                
                // Calculate how much to pull up (based on scroll progress)
                const pullUp = cardHeight * progress;
                
                // Slight scale effect as it comes up (starts at 0.98, ends at 1)
                const scale = 0.98 + (0.02 * progress);
                
                card.style.transform = `translateY(${-Math.round(pullUp)}px) scale(${scale.toFixed(3)})`;
                card.style.zIndex = String(30); // Above active card
                card.style.opacity = '1';
                
                // Shadow intensifies as card rises
                const shadowIntensity = 0.2 + (0.4 * progress);
                const shadowBlur = 8 + (24 * progress);
                card.style.boxShadow = `0 ${-4 - (8 * progress)}px ${shadowBlur}px rgba(0, 0, 0, ${shadowIntensity})`;
                
            } else if (index < clampedIndex) {
                // PREVIOUS CARDS - hidden behind
                card.classList.add('prev');
                card.style.transform = 'translateY(-100%) scale(0.95)';
                card.style.zIndex = String(5 + index);
                card.style.opacity = '0';
                card.style.boxShadow = 'none';
                
            } else {
                // FUTURE CARDS - waiting below
                card.style.transform = 'translateY(0) scale(1)';
                card.style.zIndex = String(5 + index);
                card.style.opacity = '1';
                card.style.boxShadow = 'none';
            }
        });
        
        // Update dots
        if (clampedIndex !== currentIndex) {
            currentIndex = clampedIndex;
            dots.forEach(function(dot, index) {
                if (index === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    }
    
    // Track scroll and update card states for stacking effect
    let rafId = null;
    let scrollTimeout = null;
    let isScrolling = false;
    let lastScrollTop = 0;
    
    function handleScroll() {
        const currentScrollTop = cardsContainer.scrollTop;
        
        // Disable transitions during active scroll to prevent bounce
        if (!isScrolling) {
            isScrolling = true;
            // Ensure scroll behavior is auto for immediate snapping
            cardsContainer.style.scrollBehavior = 'auto';
            cards.forEach(function(card) {
                card.style.transition = 'none';
            });
        }
        
        // Only update if scroll position changed meaningfully (reduces unnecessary updates)
        if (Math.abs(currentScrollTop - lastScrollTop) >= 1) {
            lastScrollTop = currentScrollTop;
            updateCardStates();
        }
    }
    
    cardsContainer.addEventListener('scroll', function() {
        // Use requestAnimationFrame for smooth updates, but throttle it
        if (!rafId) {
            rafId = requestAnimationFrame(function() {
                handleScroll();
                rafId = null;
            });
        }
        
        // Clear any pending scroll end timeout
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        // Re-enable transitions after scroll ends (but keep scroll-behavior as auto)
        scrollTimeout = setTimeout(function() {
            isScrolling = false;
            // Keep scroll-behavior as auto for immediate snapping
            cardsContainer.style.scrollBehavior = 'auto';
            cards.forEach(function(card) {
                card.style.transition = '';
            });
        }, 150);
    }, { passive: true });
    
    // Also handle scrollend event for more reliable detection
    if ('onscrollend' in window) {
        cardsContainer.addEventListener('scrollend', function() {
            const finalScrollTop = cardsContainer.scrollTop;
            const finalCardHeight = cards[0].offsetHeight;
            const finalIndex = Math.round(finalScrollTop / finalCardHeight);
            const expectedSnap = finalIndex * finalCardHeight;
            
            isScrolling = false;
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            // Keep scroll-behavior as auto for immediate snapping
            cardsContainer.style.scrollBehavior = 'auto';
            cards.forEach(function(card) {
                card.style.transition = '';
            });
            
            // Force perfect alignment - if scroll position is off, snap it immediately
            const snapOffset = finalScrollTop - expectedSnap;
            if (Math.abs(snapOffset) > 1) {
                cardsContainer.scrollTop = expectedSnap;
                lastSnappedPosition = expectedSnap;
            } else {
                lastSnappedPosition = finalScrollTop;
            }
            
            // Final update to ensure correct state
            updateCardStates();
        }, { passive: true });
    }
    
    // Dot click handlers - scroll to card
    dots.forEach(function(dot, index) {
        dot.addEventListener('click', function() {
            if (cards[index] && cards.length > 0) {
                const cardHeight = cards[0].offsetHeight;
                cardsContainer.scrollTo({
                    top: cardHeight * index,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // SIMPLIFIED: Initialize
    setTimeout(function() {
        setupCards();
        cardsContainer.scrollTop = 0;
        lastSnappedPosition = 0;
        currentIndex = 0;
        updateCardStates();
    }, 100);
    
    // Update on resize
    window.addEventListener('resize', function() {
        setupCards();
        updateCardStates();
    });
}

// Initialize project system
async function initializeProjectSystem(basePath) {
    // iOS Safari compatibility - handle default parameter
    if (typeof basePath === 'undefined' || basePath === null) {
        basePath = '';
    }
    // Load projects data
    const data = await loadProjectsData(basePath);
    if (!data) {
        console.warn('Projects data not available, using fallback');
        return;
    }
    
    // Check if we're on a project page
    const isProjectPage = window.location.pathname.includes('/works/');
    
    if (isProjectPage) {
        // Extract project slug from URL
        const pathParts = window.location.pathname.split('/');
        const filename = pathParts[pathParts.length - 1];
        const slug = filename.replace('.html', '');
        
        // Load and render project
        const project = getProjectBySlug(slug);
        if (project) {
            renderProjectPage(project);
        } else {
            console.warn('Project not found:', slug);
        }
    } else {
        // On index page - generate sidebar list and featured projects
        // Wait for sidebar to load first
        setTimeout(() => {
            generateSidebarProjectList(data.projects);
            generateFeaturedProjects(data.projects);
            // Re-initialize filtering and sorting after generating list
            initializeFiltering();
            initializeSorting();
        }, 200);
    }
}

