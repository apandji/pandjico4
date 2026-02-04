// Component loader - loads reusable HTML components
async function loadComponent(componentName, insertMethod, options = {}) {
    const { basePath = '' } = options;
    const componentPath = `${basePath}components/${componentName}.html`;
    
    console.log(`Attempting to load component: ${componentPath}`);
    
    try {
        const response = await fetch(componentPath);
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
                initializeFiltering();
                initializeLogoScrambling();
                initializeDateDisplay();
                initializeWeatherDisplay();
                initializeMobileMenu();
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
            }, 50);
        }
        
        return true;
    } catch (error) {
        console.error(`Component ${componentName} failed to load:`, error);
        console.error(`Attempted path: ${componentPath}`);
        console.error(`Current URL: ${window.location.href}`);
        return false;
    }
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
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
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
    }
    
    function closeSidebar() {
        sidebar.classList.remove('open');
        document.body.classList.remove('sidebar-open');
        if (sidebarBackdrop) {
            sidebarBackdrop.classList.remove('active');
        }
        // Change back to MENU instantly
        setMenuText(originalText);
    }
    
    mobileMenuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleSidebar();
    });
    
    // Close sidebar when clicking backdrop
    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', closeSidebar);
    }
    
    // Close sidebar when clicking nav links (but not filter tags)
    const navLinks = sidebar.querySelectorAll('a, button:not(.filter-tag)');
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

    // Event listeners for sidebar filter buttons
    freshFilterTags.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterValue = btn.getAttribute('data-filter');
            toggleFilter(filterValue);
        });
    });
    
    // Event listeners for project page tags
    const projectTags = document.querySelectorAll('.project-tags .tag');
    projectTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.preventDefault();
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
        
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            
            if (!href || href === '#' || href === '/') return;
            
            // Get the filename from the href (handle both relative and absolute paths)
            const hrefFilename = href.split('/').pop();
            
            // Check if this link's filename matches the current page filename
            if (hrefFilename === currentFilename || currentPath.includes(hrefFilename)) {
                link.classList.add('active');
            }
        });
    }
    
    setActiveProject();
}

// Note: initializeFiltering is called after sidebar component loads
// No need to initialize on DOMContentLoaded since sidebar is always loaded dynamically

// Random project lucky button
document.addEventListener('DOMContentLoaded', function() {
    const luckyButton = document.querySelector('.lucky-button');
    if (!luckyButton) return;
    
    const tooltip = luckyButton.querySelector('.lucky-tooltip');
    
    // Position tooltip dynamically to avoid sidebar clipping
    function updateTooltipPosition() {
        if (!tooltip) return;
        const rect = luckyButton.getBoundingClientRect();
        const tooltipWidth = tooltip.offsetWidth || 120; // Estimate if not rendered
        const isMobile = window.innerWidth <= 768;
        
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
        
        if (isMobile) {
            // On mobile, align to right edge of sidebar to avoid overflow
            const sidebar = document.querySelector('.sidebar');
            const sidebarRect = sidebar ? sidebar.getBoundingClientRect() : null;
            if (sidebarRect) {
                // Position relative to sidebar right edge, with some padding
                // Convert 0.5rem to pixels (assuming 16px base font size = 8px)
                const paddingPx = 8;
                tooltip.style.left = (sidebarRect.right - tooltipWidth - paddingPx) + 'px';
                tooltip.style.transform = 'none'; // Remove centering transform
            } else {
                // Fallback: center on button
                tooltip.style.left = (rect.left + rect.width / 2) + 'px';
                tooltip.style.transform = 'translateX(-50%)';
            }
        } else {
            // Desktop: center on button
            tooltip.style.left = (rect.left + rect.width / 2) + 'px';
            tooltip.style.transform = 'translateX(-50%)';
        }
    }
    
    luckyButton.addEventListener('mouseenter', () => {
        updateTooltipPosition();
    });
    
    luckyButton.addEventListener('focus', () => {
        updateTooltipPosition();
    });
    
    const projectLinks = document.querySelectorAll('.works-list li a[href]');
    
    // Filter to only projects with actual links (not #)
    const validProjects = Array.from(projectLinks).filter(link => {
        const href = link.getAttribute('href');
        return href && href !== '#' && href !== '/';
    });
    
    if (validProjects.length === 0) return;
    
    function getRandomProject() {
        const randomIndex = Math.floor(Math.random() * validProjects.length);
        return validProjects[randomIndex];
    }
    
    function navigateToRandom() {
        const randomProject = getRandomProject();
        const href = randomProject.getAttribute('href');
        
        if (href) {
            window.location.href = href;
        }
    }
    
    // Click/touch handler
    luckyButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigateToRandom();
    });
    
    // Keyboard handler (Enter and Space)
    luckyButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            navigateToRandom();
        }
    });
});

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
document.addEventListener('DOMContentLoaded', async function() {
    // Determine base path based on current page location
    const pathname = window.location.pathname;
    const isSubdirectory = pathname.includes('/works/') || pathname.split('/').filter(Boolean).length > 1;
    const basePath = isSubdirectory ? '../' : '';
    
    console.log('Loading components with basePath:', basePath, 'pathname:', pathname);
    
    // Only load components if they don't already exist
    const sidebarExists = document.getElementById('sidebar');
    const mobileMenuExists = document.getElementById('mobileMenuToggle');
    
    if (!mobileMenuExists) {
        console.log('Loading mobile-menu component...');
        try {
            const result = await loadComponent('mobile-menu', 'afterBegin', { basePath });
            if (result) {
                console.log('Mobile menu loaded successfully');
            } else {
                console.error('Mobile menu failed to load');
            }
        } catch (err) {
            console.error('Error loading mobile-menu:', err);
        }
    } else {
        console.log('Mobile menu already exists');
    }
    
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
});

