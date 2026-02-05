// Component loader - loads reusable HTML components
// Safari iOS compatible version with fallback
async function loadComponent(componentName, insertMethod, options = {}) {
    const { basePath = '' } = options;
    const componentPath = `${basePath}components/${componentName}.html`;
    
    console.log(`Attempting to load component: ${componentPath}`);
    
    try {
        // Use fetch with error handling for Safari iOS
        let response;
        try {
            response = await fetch(componentPath, {
                method: 'GET',
                cache: 'no-cache',
                credentials: 'same-origin'
            });
        } catch (fetchError) {
            console.error('Fetch error:', fetchError);
            // Fallback to XMLHttpRequest for older Safari
            return loadComponentXHR(componentName, insertMethod, options);
        }
        
        console.log(`Fetch response for ${componentName}:`, response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`Failed to load component: ${componentName} - ${response.status} ${response.statusText}`);
        }
        const html = await response.text();
        console.log(`Successfully fetched ${componentName}, HTML length:`, html.length);
        
        // Insert component based on method
        if (insertMethod === 'beforeMain') {
            const main = document.querySelector('main');
            if (main) {
                main.insertAdjacentHTML('beforebegin', html);
                console.log(`Inserted ${componentName} before main`);
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
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                try {
                    initializeFiltering();
                    initializeSorting();
                    initializeFilterToggle();
                    initializeLogoScrambling();
                    initializeDateDisplay();
                    initializeWeatherDisplay();
                    // Initialize mobile menu - check if component exists first
                    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
                    if (mobileMenuToggle) {
                        initializeMobileMenu();
                    } else if (window.innerWidth <= 768) {
                        // If on mobile and menu doesn't exist, try to load it
                        console.log('Sidebar loaded but mobile menu missing, attempting to load...');
                        loadComponent('mobile-menu', 'afterBegin', { basePath }).then(result => {
                            if (result) {
                                setTimeout(() => {
                                    initializeMobileMenu();
                                }, 100);
                            }
                        });
                    }
                } catch (error) {
                    console.error('Error initializing sidebar features:', error);
                }
            }, 100);
        }
        
        // Re-initialize mobile menu after mobile menu component loads
        // Note: We only initialize Lucide icons here, full initialization happens when sidebar loads
        if (componentName === 'mobile-menu') {
            setTimeout(() => {
                // Initialize Lucide icons for the menu icons
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
                // Also ensure mobile menu is initialized if sidebar already exists
                const sidebar = document.getElementById('sidebar');
                if (sidebar) {
                    try {
                        initializeMobileMenu();
                    } catch (error) {
                        console.error('Error initializing mobile menu after component load:', error);
                    }
                }
            }, 100);
        }
        
        return true;
    } catch (error) {
        console.error(`Component ${componentName} failed to load:`, error);
        console.error(`Attempted path: ${componentPath}`);
        console.error(`Current URL: ${window.location.href}`);
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
        const { basePath = '' } = options;
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

// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', function() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// Mobile menu toggle - can be called multiple times for dynamic components
function initializeMobileMenu() {
    // Try primary menu first, then fallback
    let mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (!mobileMenuToggle) {
        // Try fallback menu
        mobileMenuToggle = document.getElementById('mobileMenuToggleFallback');
        if (mobileMenuToggle) {
            mobileMenuToggle.style.display = 'flex';
            mobileMenuToggle.id = 'mobileMenuToggle'; // Rename for consistency
        }
    }
    
    const mobileMenuText = mobileMenuToggle ? mobileMenuToggle.querySelector('.mobile-menu-text') : null;
    const sidebar = document.getElementById('sidebar');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    
    if (!mobileMenuToggle || !sidebar || !mobileMenuText) return;
    
    // Skip if already initialized
    if (mobileMenuToggle.dataset.initialized === 'true') {
        return;
    }
    mobileMenuToggle.dataset.initialized = 'true';
    
    const originalText = 'MENU';
    const closeText = 'BACK';
    let scrambleInterval = null;
    
    function setMenuText(targetText) {
        // Clear any existing interval
        if (scrambleInterval) {
            clearInterval(scrambleInterval);
            scrambleInterval = null;
        }
        
        // Set text instantly
        mobileMenuText.textContent = targetText;
        
        // Toggle icons and class
        const rightIcon = mobileMenuToggle.querySelector('.mobile-menu-icon-right');
        const leftIcon = mobileMenuToggle.querySelector('.mobile-menu-icon-left');
        
        if (targetText === closeText) {
            mobileMenuToggle.classList.add('is-close');
            // Show left icon, hide right icon
            if (rightIcon) rightIcon.style.display = 'none';
            if (leftIcon) leftIcon.style.display = 'block';
            // Re-initialize Lucide icons
            if (typeof lucide !== 'undefined' && leftIcon) {
                lucide.createIcons();
            }
        } else {
            mobileMenuToggle.classList.remove('is-close');
            // Show right icon, hide left icon
            if (rightIcon) rightIcon.style.display = 'block';
            if (leftIcon) leftIcon.style.display = 'none';
            // Re-initialize Lucide icons
            if (typeof lucide !== 'undefined' && rightIcon) {
                lucide.createIcons();
            }
        }
    }
    
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
        sidebar.classList.add('open');
        document.body.classList.add('sidebar-open');
        if (sidebarBackdrop) {
            sidebarBackdrop.classList.add('active');
        }
        // Change to CLOSE instantly
        setMenuText(closeText);
        // Trigger haptic feedback if available
        if (window.triggerHapticFeedback) {
            window.triggerHapticFeedback('light');
        }
    }
    
    function closeSidebar() {
        sidebar.classList.remove('open');
        document.body.classList.remove('sidebar-open');
        if (sidebarBackdrop) {
            sidebarBackdrop.classList.remove('active');
        }
        // Change back to MENU instantly
        setMenuText(originalText);
        // Trigger haptic feedback if available
        if (window.triggerHapticFeedback) {
            window.triggerHapticFeedback('light');
        }
    }
    
    // Haptic feedback function - available globally
    window.triggerHapticFeedback = function(intensity = 'light') {
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
    
    mobileMenuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleSidebar();
    });
    
    // Swipe gesture handling for sidebar
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
            
            // Swipe right to open (from left edge)
            if (deltaX > 0 && !isSidebarOpen && touchStartX < 50) {
                openSidebar();
            }
            // Swipe left to close (when sidebar is open)
            else if (deltaX < 0 && isSidebarOpen) {
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
    
    // Close sidebar on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
}

// Note: initializeMobileMenu is called after sidebar component loads
// No need to initialize on DOMContentLoaded since sidebar is always loaded dynamically

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
        
        // Clear and add elements in correct order
        logoWeather.innerHTML = '';
        logoWeather.appendChild(prefixSpan);
        logoWeather.appendChild(iconContainer);
        logoWeather.appendChild(tempSpan);
        
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
        
        // Show loading state
        logoWeather.textContent = 'Fetching the weather...';
        
        // Always fetch fresh (cache disabled for testing)
        console.log('Fetching fresh weather data');
        
        // Fetch fresh data
        const weather = await fetchWeather();
        if (weather) {
            cacheWeather(weather);
            await displayWeather(weather);
        } else {
            // Error - show nothing
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

    // Characters that look code-like for scrambling
    const codeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`';

    let scrambleInterval = null;
    let isHovering = false;
    let currentText = originalText; // Track which version is currently displayed

    function getRandomChar() {
        return codeChars[Math.floor(Math.random() * codeChars.length)];
    }

    function scrambleText() {
        if (!isHovering) return;
        
        // Occasionally show P4NDJICO during scrambling (20% chance)
        if (Math.random() < 0.2) {
            logoText.textContent = easterEggText;
            return;
        }
        
        const textArray = logoText.textContent.split('');
        const scrambled = textArray.map((char, index) => {
            // Skip spaces, keep them as spaces
            if (char === ' ') return ' ';
            // Randomly scramble characters
            return Math.random() > 0.3 ? getRandomChar() : char;
        });
        
        logoText.textContent = scrambled.join('');
    }

    function startScrambling() {
        isHovering = true;
        // Scramble immediately
        scrambleText();
        // Continue scrambling at intervals
        scrambleInterval = setInterval(scrambleText, 50);
    }

    function stopScrambling() {
        isHovering = false;
        if (scrambleInterval) {
            clearInterval(scrambleInterval);
            scrambleInterval = null;
        }
        // Restore to current text (either original or easter egg)
        logoText.textContent = currentText;
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
    
    worksFilterToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        worksSection.classList.toggle('filter-collapsed');
        
        // Save state to localStorage
        const isCollapsed = worksSection.classList.contains('filter-collapsed');
        localStorage.setItem('worksFilterCollapsed', isCollapsed.toString());
        
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
            
            // Toggle direction if clicking the same sort button
            if (currentSort === sortType) {
                const currentDir = newButton.getAttribute('data-direction');
                const newDirection = currentDir === 'asc' ? 'desc' : 'asc';
                newButton.setAttribute('data-direction', newDirection);
                currentDirection = newDirection;
                updateSortButtonIcon(newButton, sortType, currentDirection);
            } else {
                // Switch to different sort type, use its current direction
                currentSort = sortType;
                currentDirection = newButton.getAttribute('data-direction');
                // Update all buttons to reflect current state
                updateAllSortButtonIcons();
            }
            
            applySort(sortType, currentDirection);
            updateSortButtons(sortType);
            
            return false; // Additional prevention
        });
        
        // Keyboard handler
        newButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation(); // Prevent sidebar from closing on mobile
                
                const sortType = newButton.getAttribute('data-sort');
                
                // Toggle direction if clicking the same sort button
                if (currentSort === sortType) {
                    const currentDir = newButton.getAttribute('data-direction');
                    const newDirection = currentDir === 'asc' ? 'desc' : 'asc';
                    newButton.setAttribute('data-direction', newDirection);
                    currentDirection = newDirection;
                    updateSortButtonIcon(newButton, sortType, currentDirection);
                } else {
                    // Switch to different sort type
                    currentSort = sortType;
                    currentDirection = newButton.getAttribute('data-direction');
                    // Update all buttons to reflect current state
                    updateAllSortButtonIcons();
                }
                
                applySort(sortType, currentDirection);
                updateSortButtons(sortType);
                
                return false; // Additional prevention
            }
        });
    });
    
    // Set initial button states
    updateAllSortButtonIcons();
    
    // Apply initial sort if projects list exists
    const worksList = document.querySelector('.works-list');
    if (worksList && worksList.children.length > 0) {
        // Load projects data if not already loaded
        loadProjectsData().then(data => {
            if (data && data.projects) {
                // projectsData is a global variable from Project Data System
                const worksProjects = data.projects.filter(p => p.category === 'works');
                applySort(currentSort, currentDirection, worksProjects);
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

function applySort(sortType, direction = 'asc', projectsArray = null) {
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
    
    // Re-append items in sorted order
    itemsWithSortValue.forEach(({ item }) => {
        worksList.appendChild(item);
    });
    
    // Note: Active project highlighting is handled by initializeFiltering
    // which calls setActiveProject after filtering
}


// Featured Work scramble effect on hover (text or arrow)
document.addEventListener('DOMContentLoaded', function() {
    const featuredWorkSection = document.querySelector('.featured-work .section-header');
    const featuredWorkLink = document.querySelector('.featured-work .section-link');
    const featuredWorkSpan = document.getElementById('featuredWorkText');
    
    if (!featuredWorkSection || !featuredWorkLink || !featuredWorkSpan) return;
    
    const originalText = 'FEATURED WORK';
    const targetText = 'SEE ALL WORKS';
    const codeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
    
    let scrambleInterval = null;
    let isHovering = false;
    
    function getRandomChar() {
        return codeChars[Math.floor(Math.random() * codeChars.length)];
    }
    
    function scrambleText() {
        const textArray = targetText.split('');
        const scrambled = textArray.map((char, index) => {
            if (char === ' ') return ' ';
            return Math.random() > 0.3 ? getRandomChar() : char;
        });
        
        featuredWorkSpan.textContent = scrambled.join('');
    }
    
    function startScrambling() {
        isHovering = true;
        
        // Scramble for a brief period
        scrambleText();
        scrambleInterval = setInterval(scrambleText, 50);
        
        // After 250ms of scrambling, stop and show target text
        setTimeout(() => {
            if (scrambleInterval) {
                clearInterval(scrambleInterval);
                scrambleInterval = null;
            }
            if (isHovering) {
                featuredWorkSpan.textContent = targetText;
            }
        }, 250);
    }
    
    function stopScrambling() {
        isHovering = false;
        if (scrambleInterval) {
            clearInterval(scrambleInterval);
            scrambleInterval = null;
        }
        featuredWorkSpan.textContent = originalText;
    }
    
    // Add hover listeners to the entire section header
    featuredWorkSection.addEventListener('mouseenter', startScrambling);
    featuredWorkSection.addEventListener('mouseleave', stopScrambling);
    featuredWorkLink.addEventListener('focus', startScrambling);
    featuredWorkLink.addEventListener('blur', stopScrambling);
});

// About section scramble effect on hover (text or arrow)
document.addEventListener('DOMContentLoaded', function() {
    const aboutSection = document.querySelector('.about-section .section-header');
    const aboutLink = document.querySelector('.about-section .section-link');
    const aboutSpan = document.getElementById('aboutText');
    
    if (!aboutSection || !aboutLink || !aboutSpan) return;
    
    const originalText = 'ABOUT ME';
    const targetText = 'READ MORE';
    const codeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
    
    let scrambleInterval = null;
    let isHovering = false;
    
    function getRandomChar() {
        return codeChars[Math.floor(Math.random() * codeChars.length)];
    }
    
    function scrambleText() {
        const textArray = targetText.split('');
        const scrambled = textArray.map((char, index) => {
            if (char === ' ') return ' ';
            return Math.random() > 0.3 ? getRandomChar() : char;
        });
        
        aboutSpan.textContent = scrambled.join('');
    }
    
    function startScrambling() {
        isHovering = true;
        
        // Scramble for a brief period
        scrambleText();
        scrambleInterval = setInterval(scrambleText, 50);
        
        // After 250ms of scrambling, stop and show target text
        setTimeout(() => {
            if (scrambleInterval) {
                clearInterval(scrambleInterval);
                scrambleInterval = null;
            }
            if (isHovering) {
                aboutSpan.textContent = targetText;
            }
        }, 250);
    }
    
    function stopScrambling() {
        isHovering = false;
        if (scrambleInterval) {
            clearInterval(scrambleInterval);
            scrambleInterval = null;
        }
        aboutSpan.textContent = originalText;
    }
    
    // Add hover listeners to the entire section header
    aboutSection.addEventListener('mouseenter', startScrambling);
    aboutSection.addEventListener('mouseleave', stopScrambling);
    aboutLink.addEventListener('focus', startScrambling);
    aboutLink.addEventListener('blur', stopScrambling);
});

// Auto-load components on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded fired');
    
    // Initialize components
    (async function() {
        try {
            await loadComponentsMain();
        } catch (error) {
            console.error('Error in component loading:', error);
            // Show fallback menu on error
            var fallback = document.getElementById('mobileMenuToggleFallback');
            if (fallback && window.innerWidth <= 768) {
                fallback.style.display = 'flex';
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
        }
    })();
});

async function loadComponentsMain() {
    // Determine base path based on current page location
    const pathname = window.location.pathname;
    const isSubdirectory = pathname.includes('/works/') || pathname.split('/').filter(Boolean).length > 1;
    const basePath = isSubdirectory ? '../' : '';
    
    console.log('Loading components with basePath:', basePath, 'pathname:', pathname);
    
    // Only load components if they don't already exist
    const sidebarExists = document.getElementById('sidebar');
    const mobileMenuExists = document.getElementById('mobileMenuToggle');
    
    if (!mobileMenuExists && window.innerWidth <= 768) {
        console.log('Loading mobile-menu component...');
        // Retry logic for mobile menu loading
        let retries = 3;
        let loaded = false;
        
        while (retries > 0 && !loaded) {
            try {
                const result = await loadComponent('mobile-menu', 'afterBegin', { basePath });
                if (result) {
                    // Verify it was actually inserted
                    const menuElement = document.getElementById('mobileMenuToggle');
                    if (menuElement) {
                        console.log('Mobile menu loaded successfully');
                        loaded = true;
                        // Ensure Lucide icons are initialized
                        if (typeof lucide !== 'undefined') {
                            setTimeout(() => {
                                lucide.createIcons();
                            }, 100);
                        }
                    } else {
                        throw new Error('Mobile menu element not found after load');
                    }
                } else {
                    throw new Error('loadComponent returned false');
                }
            } catch (err) {
                console.error(`Error loading mobile-menu (${retries} retries left):`, err);
                retries--;
                if (retries > 0) {
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }
        
        if (!loaded) {
            console.error('Failed to load mobile menu after all retries');
            // Show fallback menu button
            const fallbackMenu = document.getElementById('mobileMenuToggleFallback');
            if (fallbackMenu) {
                fallbackMenu.style.display = 'flex';
                // Initialize Lucide icons for fallback
                if (typeof lucide !== 'undefined') {
                    setTimeout(() => {
                        lucide.createIcons();
                        initializeMobileMenu();
                    }, 100);
                }
            }
        }
    } else if (mobileMenuExists) {
        console.log('Mobile menu already exists');
    }
    
    // Add resize listener to handle orientation changes
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const mobileMenuToggle = document.getElementById('mobileMenuToggle');
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile && !mobileMenuToggle) {
                console.log('Window resized to mobile, loading mobile menu...');
                loadComponent('mobile-menu', 'afterBegin', { basePath }).then(result => {
                    if (result) {
                        const menuElement = document.getElementById('mobileMenuToggle');
                        if (menuElement && typeof lucide !== 'undefined') {
                            setTimeout(() => {
                                lucide.createIcons();
                                initializeMobileMenu();
                            }, 100);
                        }
                    }
                });
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
            }
        } catch (err) {
            console.error('Error loading sidebar:', err);
        }
    } else {
        console.log('Sidebar already exists');
    }
    
    // Load projects data and initialize project system
    initializeProjectSystem(basePath);
    
    // Periodic check to ensure mobile menu exists (backup safety net)
    if (window.innerWidth <= 768) {
        setInterval(() => {
            const menuExists = document.getElementById('mobileMenuToggle');
            const sidebarExists = document.getElementById('sidebar');
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile && sidebarExists && !menuExists) {
                console.warn('Mobile menu missing, attempting recovery...');
                const fallbackMenu = document.getElementById('mobileMenuToggleFallback');
                if (fallbackMenu) {
                    fallbackMenu.style.display = 'flex';
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                    initializeMobileMenu();
                } else {
                    // Last resort: try to reload the component
                    loadComponent('mobile-menu', 'afterBegin', { basePath }).then(result => {
                        if (result) {
                            setTimeout(() => {
                                if (typeof lucide !== 'undefined') {
                                    lucide.createIcons();
                                }
                                initializeMobileMenu();
                            }, 100);
                        }
                    });
                }
            }
        }, 3000); // Check every 3 seconds
    }
}

// ============================================
// Project Data System - Single Source of Truth
// ============================================

let projectsData = null;

// Load projects.json - single source of truth
async function loadProjectsData(basePath = '') {
    if (projectsData) {
        return projectsData; // Return cached data
    }
    
    try {
        let response;
        try {
            response = await fetch(basePath + 'data/projects.json', {
                cache: 'no-cache',
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
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', basePath + 'data/projects.json', true);
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
    
    // Apply current sort after generating list
    setTimeout(() => {
        if (typeof applySort === 'function') {
            applySort(currentSort, currentDirection, worksProjects);
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

// Generate featured projects on homepage
function generateFeaturedProjects(projects) {
    const container = document.getElementById('featuredProjects');
    if (!container) return;
    
    const featured = getFeaturedProjects();
    if (featured.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.innerHTML = '';
    
    featured.forEach(project => {
        const article = document.createElement('article');
        article.className = 'featured-project';
        
        const link = document.createElement('a');
        link.href = `works/${project.slug}.html`;
        link.className = 'featured-project-link';
        
        if (project.image) {
            const imageDiv = document.createElement('div');
            imageDiv.className = 'featured-project-image';
            const img = document.createElement('img');
            img.src = project.image;
            img.alt = project.slug;
            imageDiv.appendChild(img);
            link.appendChild(imageDiv);
        }
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'featured-project-content';
        
        const h3 = document.createElement('h3');
        h3.textContent = project.slug;
        contentDiv.appendChild(h3);
        
        if (project.description) {
            const p = document.createElement('p');
            p.className = 'featured-project-description';
            p.textContent = project.description;
            contentDiv.appendChild(p);
        }
        
        if (project.tags && project.tags.length > 0) {
            const tagsSpan = document.createElement('span');
            tagsSpan.className = 'featured-project-tags';
            tagsSpan.textContent = project.tags.join(', ');
            contentDiv.appendChild(tagsSpan);
        }
        
        link.appendChild(contentDiv);
        article.appendChild(link);
        container.appendChild(article);
    });
    
    console.log('Featured projects generated:', featured.length);
}

// Initialize project system
async function initializeProjectSystem(basePath = '') {
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

