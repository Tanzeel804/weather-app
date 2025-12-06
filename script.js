// Weather App - Complete & Functional with Mobile Fixes
// Author: Tanzeel Ahmed

// API Configuration
const API_KEY = '6a382ec6cb5712ccdb0b26e67db1698c';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const elements = {
    // Desktop Search
    searchField: document.getElementById('searchField'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    
    // Mobile Search
    mobileSearchField: document.getElementById('mobileSearchField'),
    mobileSearchBtn: document.getElementById('mobileSearchBtn'),
    mobileLocationBtn: document.getElementById('mobileLocationBtn'),
    mobileSearchToggle: document.getElementById('mobileSearchToggle'),
    mobileSearchBar: document.getElementById('mobileSearchBar'),
    
    // Current Weather
    cityName: document.getElementById('cityName'),
    currentDate: document.getElementById('currentDate'),
    weatherStatus: document.getElementById('weatherStatus'),
    temperature: document.getElementById('temperature'),
    feelsLike: document.getElementById('feelsLike'),
    weatherIcon: document.getElementById('weatherIcon'),
    
    // Weather Details
    windSpeed: document.getElementById('windSpeed'),
    humidity: document.getElementById('humidity'),
    pressure: document.getElementById('pressure'),
    visibility: document.getElementById('visibility'),
    
    // Sun/Moon
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset'),
    dayLength: document.getElementById('dayLength'),
    
    // Temperature Range
    tempMin: document.getElementById('tempMin'),
    tempCurrent: document.getElementById('tempCurrent'),
    tempMax: document.getElementById('tempMax'),
    tempProgress: document.getElementById('tempProgress'),
    
    // Forecast
    hourlyForecast: document.getElementById('hourlyForecast'),
    forecastDays: document.getElementById('forecastDays'),
    
    // UI Elements
    errorContainer: document.getElementById('errorContainer'),
    errorMessage: document.getElementById('errorMessage'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    themeToggle: document.getElementById('themeToggle'),
    currentTime: document.getElementById('currentTime'),
    backToTop: document.getElementById('backToTop')
};

// App State
const state = {
    currentCity: 'London',
    unit: 'metric',
    theme: localStorage.getItem('theme') || 'dark',
    weatherData: null,
    isMobile: window.innerWidth <= 768
};

// Initialize App
function initApp() {
    // Set theme
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeButton();
    
    // Initialize AOS
    AOS.init({
        duration: 800,
        once: true,
        offset: 100,
        easing: 'ease-in-out',
        delay: 100
    });
    
    // Check device type
    checkDeviceType();
    
    // Load default city
    loadWeather(state.currentCity);
    
    // Setup event listeners
    setupEventListeners();
    
    // Update time
    updateTime();
    setInterval(updateTime, 1000);
    
    // Initialize alerts
    initializeAlerts();
    
    // Smooth scroll for nav links
    setupSmoothScroll();
    
    // Setup back to top
    setupBackToTop();
}

// Check device type and adjust UI
function checkDeviceType() {
    state.isMobile = window.innerWidth <= 768;
    
    // Adjust UI based on device
    if (state.isMobile) {
        // Mobile specific adjustments
        document.querySelector('.search-section')?.classList.add('d-none');
    } else {
        // Desktop specific adjustments
        document.querySelector('.search-section')?.classList.remove('d-none');
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Desktop search
    elements.searchBtn?.addEventListener('click', handleSearch);
    elements.searchField?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Mobile search
    elements.mobileSearchBtn?.addEventListener('click', handleMobileSearch);
    elements.mobileSearchField?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleMobileSearch();
    });
    
    // Location buttons
    elements.locationBtn?.addEventListener('click', getCurrentLocation);
    elements.mobileLocationBtn?.addEventListener('click', getCurrentLocation);
    
    // Mobile search toggle
    elements.mobileSearchToggle?.addEventListener('click', toggleMobileSearch);
    
    // Close mobile search when clicking outside
    document.addEventListener('click', (e) => {
        if (state.isMobile && 
            !elements.mobileSearchBar.contains(e.target) && 
            !elements.mobileSearchToggle.contains(e.target) &&
            elements.mobileSearchBar.classList.contains('active')) {
            toggleMobileSearch();
        }
    });
    
    // Quick city buttons
    document.querySelectorAll('[data-city]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const city = e.target.getAttribute('data-city');
            if (state.isMobile) {
                elements.mobileSearchField.value = city;
                loadWeather(city);
                toggleMobileSearch(); // Close search bar after selection
            } else {
                elements.searchField.value = city;
                loadWeather(city);
            }
        });
    });
    
    // Theme toggle
    elements.themeToggle?.addEventListener('click', toggleTheme);
    
    // Error dismiss
    document.querySelector('[data-bs-dismiss="alert"]')?.addEventListener('click', hideError);
    
    // Window resize
    window.addEventListener('resize', () => {
        checkDeviceType();
        AOS.refresh(); // Refresh AOS on resize
    });
}

// Handle desktop search
function handleSearch() {
    const city = elements.searchField.value.trim();
    if (city) {
        loadWeather(city);
    } else {
        showError('Please enter a city name');
    }
}

// Handle mobile search
function handleMobileSearch() {
    const city = elements.mobileSearchField.value.trim();
    if (city) {
        loadWeather(city);
        toggleMobileSearch(); // Close search bar after search
    } else {
        showError('Please enter a city name');
    }
}

// Toggle mobile search bar
function toggleMobileSearch() {
    elements.mobileSearchBar.classList.toggle('active');
    
    if (elements.mobileSearchBar.classList.contains('active')) {
        elements.mobileSearchField.focus();
    }
}

// Load weather data
async function loadWeather(city) {
    showLoading();
    hideError();
    
    try {
        // Fetch current weather
        const currentData = await fetchWeather(city);
        
        // Fetch forecast
        const forecastData = await fetchForecast(city);
        
        // Update state
        state.currentCity = city;
        state.weatherData = { current: currentData, forecast: forecastData };
        
        // Update UI
        updateCurrentWeather(currentData);
        updateForecast(forecastData);
        
        // Update alerts based on weather
        updateAlerts(currentData);
        
        // Update weather animation
        updateWeatherAnimation(currentData.weather[0].main);
        
        // Sync search fields
        if (state.isMobile) {
            elements.mobileSearchField.value = city;
        } else {
            elements.searchField.value = city;
        }
        
        // Save to localStorage
        localStorage.setItem('lastCity', city);
        
        // Update page title
        document.title = `${currentData.name} Weather | Weather Pro`;
        
        // Refresh AOS for new content
        setTimeout(() => {
            AOS.refresh();
        }, 500);
        
    } catch (error) {
        console.error('Error loading weather:', error);
        showError(error.message || 'Failed to load weather data. Please try again.');
    } finally {
        hideLoading();
    }
}

// Fetch current weather
async function fetchWeather(city) {
    const url = `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=${state.unit}`;
    const response = await fetch(url);
    
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('City not found. Please check the city name.');
        }
        throw new Error('Unable to fetch weather data. Please try again.');
    }
    
    return await response.json();
}

// Fetch forecast
async function fetchForecast(city) {
    const url = `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=${state.unit}`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Unable to fetch forecast data.');
    }
    
    return await response.json();
}

// Update current weather display
function updateCurrentWeather(data) {
    // Update basic info
    elements.cityName.textContent = `${data.name}, ${data.sys.country}`;
    elements.currentDate.textContent = formatDate(new Date());
    elements.weatherStatus.textContent = data.weather[0].description;
    
    // Update temperature
    const temp = Math.round(data.main.temp);
    const feels = Math.round(data.main.feels_like);
    elements.temperature.textContent = `${temp}°${state.unit === 'metric' ? 'C' : 'F'}`;
    elements.feelsLike.textContent = `${feels}°${state.unit === 'metric' ? 'C' : 'F'}`;
    
    // Update weather icon
    const iconCode = data.weather[0].icon;
    elements.weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    elements.weatherIcon.alt = data.weather[0].description;
    
    // Update weather details
    elements.windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    elements.humidity.textContent = `${data.main.humidity}%`;
    elements.pressure.textContent = `${data.main.pressure} hPa`;
    elements.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    
    // Update sunrise/sunset
    const sunriseTime = new Date(data.sys.sunrise * 1000);
    const sunsetTime = new Date(data.sys.sunset * 1000);
    elements.sunrise.textContent = formatTime(sunriseTime);
    elements.sunset.textContent = formatTime(sunsetTime);
    
    // Calculate day length
    const dayLength = sunsetTime - sunriseTime;
    const hours = Math.floor(dayLength / (1000 * 60 * 60));
    const minutes = Math.floor((dayLength % (1000 * 60 * 60)) / (1000 * 60));
    elements.dayLength.textContent = `${hours}h ${minutes}m`;
    
    // Update temperature range
    const tempMin = Math.round(data.main.temp_min);
    const tempMax = Math.round(data.main.temp_max);
    elements.tempMin.textContent = `${tempMin}°C`;
    elements.tempCurrent.textContent = `${temp}°C`;
    elements.tempMax.textContent = `${tempMax}°C`;
    
    // Update temperature progress bar
    const tempRange = tempMax - tempMin;
    const tempPosition = tempRange > 0 ? ((temp - tempMin) / tempRange) * 100 : 50;
    elements.tempProgress.style.width = `${tempPosition}%`;
    
    // Update background based on weather
    updateWeatherBackground(data.weather[0].main);
}

// Update forecast display
function updateForecast(data) {
    // Clear existing content
    elements.hourlyForecast.innerHTML = '';
    elements.forecastDays.innerHTML = '';
    
    // Group forecast by day
    const dailyForecasts = {};
    const now = new Date();
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        
        if (!dailyForecasts[day]) {
            dailyForecasts[day] = {
                temps: [],
                weather: [],
                time: date
            };
        }
        
        dailyForecasts[day].temps.push(item.main.temp);
        dailyForecasts[day].weather.push(item.weather[0]);
        
        // Add to hourly forecast for today and tomorrow
        if (date.getDate() === now.getDate() || date.getDate() === now.getDate() + 1) {
            addHourlyForecastItem(date, item);
        }
    });
    
    // Update 5-day forecast
    Object.entries(dailyForecasts).slice(0, 5).forEach(([day, data], index) => {
        addDailyForecastItem(day, data, index === 0);
    });
}

// Add hourly forecast item
function addHourlyForecastItem(date, data) {
    const hourDiv = document.createElement('div');
    hourDiv.className = 'hour-item';
    
    const hour = date.getHours();
    const temp = Math.round(data.main.temp);
    const icon = data.weather[0].icon;
    const desc = data.weather[0].description;
    
    hourDiv.innerHTML = `
        <div class="hour-time">${hour}:00</div>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}" class="hour-icon">
        <div class="hour-temp">${temp}°</div>
        <div class="hour-desc">${desc}</div>
    `;
    
    // Add AOS animation
    hourDiv.setAttribute('data-aos', 'fade-up');
    hourDiv.setAttribute('data-aos-delay', (elements.hourlyForecast.children.length * 50));
    
    elements.hourlyForecast.appendChild(hourDiv);
}

// Add daily forecast item
function addDailyForecastItem(day, data, isToday) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'forecast-day';
    
    const avgTemp = Math.round(data.temps.reduce((a, b) => a + b) / data.temps.length);
    const maxTemp = Math.round(Math.max(...data.temps));
    const minTemp = Math.round(Math.min(...data.temps));
    
    // Get most common weather
    const weatherCount = {};
    data.weather.forEach(w => {
        weatherCount[w.main] = (weatherCount[w.main] || 0) + 1;
    });
    const mostCommonWeather = Object.keys(weatherCount).reduce((a, b) => 
        weatherCount[a] > weatherCount[b] ? a : b
    );
    
    dayDiv.innerHTML = `
        <div class="day-name">${isToday ? 'Today' : day}</div>
        <div class="forecast-temp">
            <div class="weather-icon-small">
                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${mostCommonWeather}" width="40">
            </div>
            <div class="temp-range">
                <span class="temp-high">${maxTemp}°</span>
                <span class="temp-low">${minTemp}°</span>
            </div>
        </div>
    `;
    
    // Add AOS animation
    dayDiv.setAttribute('data-aos', 'fade-up');
    dayDiv.setAttribute('data-aos-delay', (elements.forecastDays.children.length * 100));
    
    elements.forecastDays.appendChild(dayDiv);
}

// Get current location
function getCurrentLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }
    
    showLoading();
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const city = await reverseGeocode(latitude, longitude);
                
                if (city) {
                    if (state.isMobile) {
                        elements.mobileSearchField.value = city;
                        loadWeather(city);
                        toggleMobileSearch();
                    } else {
                        elements.searchField.value = city;
                        loadWeather(city);
                    }
                } else {
                    // Use coordinates directly
                    const weatherData = await fetchWeatherByCoords(latitude, longitude);
                    state.weatherData = weatherData;
                    updateCurrentWeather(weatherData);
                    
                    if (state.isMobile) {
                        elements.mobileSearchField.value = `${weatherData.name}, ${weatherData.sys.country}`;
                    } else {
                        elements.searchField.value = `${weatherData.name}, ${weatherData.sys.country}`;
                    }
                }
                
            } catch (error) {
                showError('Unable to get location. Please search manually.');
            }
        },
        (error) => {
            hideLoading();
            switch (error.code) {
                case 1:
                    showError('Location access denied. Please enable location services.');
                    break;
                case 2:
                    showError('Location unavailable. Please check your connection.');
                    break;
                case 3:
                    showError('Location request timed out. Please try again.');
                    break;
                default:
                    showError('Unable to get your location.');
            }
        }
    );
}

// Reverse geocode coordinates
async function reverseGeocode(lat, lon) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
        const data = await response.json();
        return data.address.city || data.address.town || data.address.village;
    } catch (error) {
        return null;
    }
}

// Fetch weather by coordinates
async function fetchWeatherByCoords(lat, lon) {
    const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${state.unit}`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Unable to fetch weather for your location.');
    }
    
    return await response.json();
}

// Toggle theme
function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('theme', state.theme);
    updateThemeButton();
}

// Update theme button icon
function updateThemeButton() {
    const sunIcon = elements.themeToggle.querySelector('.bi-sun-fill');
    const moonIcon = elements.themeToggle.querySelector('.bi-moon-fill');
    
    if (state.theme === 'dark') {
        sunIcon.classList.add('d-none');
        moonIcon.classList.remove('d-none');
        elements.themeToggle.title = 'Switch to Light Mode';
    } else {
        sunIcon.classList.remove('d-none');
        moonIcon.classList.add('d-none');
        elements.themeToggle.title = 'Switch to Dark Mode';
    }
}

// Update time
function updateTime() {
    const now = new Date();
    elements.currentTime.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

// Update weather background
function updateWeatherBackground(weatherCondition) {
    const body = document.body;
    
    // Remove all weather background classes
    body.classList.remove(
        'weather-bg-clear',
        'weather-bg-clouds',
        'weather-bg-rain',
        'weather-bg-thunderstorm',
        'weather-bg-snow',
        'weather-bg-mist'
    );
    
    // Add appropriate class
    switch (weatherCondition.toLowerCase()) {
        case 'clear':
            body.classList.add('weather-bg-clear');
            break;
        case 'clouds':
            body.classList.add('weather-bg-clouds');
            break;
        case 'rain':
        case 'drizzle':
            body.classList.add('weather-bg-rain');
            break;
        case 'thunderstorm':
            body.classList.add('weather-bg-thunderstorm');
            break;
        case 'snow':
            body.classList.add('weather-bg-snow');
            break;
        case 'mist':
        case 'fog':
        case 'haze':
            body.classList.add('weather-bg-mist');
            break;
    }
}

// Update weather animation
function updateWeatherAnimation(weatherCondition) {
    // Remove existing weather animation
    const existingAnimation = document.querySelector('.weather-animation');
    if (existingAnimation) {
        existingAnimation.remove();
    }
    
    // Create new animation based on weather
    const animationDiv = document.createElement('div');
    animationDiv.className = 'weather-animation';
    
    switch (weatherCondition.toLowerCase()) {
        case 'rain':
        case 'drizzle':
            animationDiv.classList.add('rain-animation');
            break;
        case 'snow':
            animationDiv.classList.add('snow-animation');
            break;
        case 'clear':
            animationDiv.classList.add('sun-animation');
            break;
        case 'clouds':
            animationDiv.classList.add('cloud-animation');
            break;
    }
    
    document.body.appendChild(animationDiv);
}

// Initialize alerts
function initializeAlerts() {
    const alertsContainer = document.getElementById('weatherAlerts');
    if (alertsContainer) {
        alertsContainer.innerHTML = `
            <div class="alert alert-info d-flex align-items-center" role="alert">
                <i class="bi bi-info-circle-fill me-2"></i>
                <div>
                    <strong>No active alerts</strong>
                    <p class="mb-0">Search for a city to see weather alerts.</p>
                </div>
            </div>
        `;
    }
}

// Update alerts based on weather
function updateAlerts(weatherData) {
    const alertsContainer = document.getElementById('weatherAlerts');
    if (!alertsContainer) return;
    
    const alerts = [];
    const condition = weatherData.weather[0].main;
    const windSpeed = weatherData.wind.speed;
    const temp = weatherData.main.temp;
    
    // Check for severe weather conditions
    if (condition === 'Thunderstorm') {
        alerts.push({
            type: 'danger',
            icon: 'bi-lightning-fill',
            title: '⚡ Thunderstorm Warning',
            message: 'Thunderstorm detected. Stay indoors and avoid using electrical appliances.'
        });
    }
    
    if (windSpeed > 15) {
        alerts.push({
            type: 'warning',
            icon: 'bi-wind',
            title: '💨 High Wind Warning',
            message: 'Strong winds detected. Secure loose objects and be cautious outdoors.'
        });
    }
    
    if (temp > 35) {
        alerts.push({
            type: 'warning',
            icon: 'bi-thermometer-sun',
            title: '🔥 Heat Warning',
            message: 'Extreme heat detected. Stay hydrated and avoid prolonged sun exposure.'
        });
    }
    
    if (temp < 0) {
        alerts.push({
            type: 'info',
            icon: 'bi-snow',
            title: '❄️ Freezing Temperature',
            message: 'Freezing temperatures detected. Dress warmly and watch for ice on roads.'
        });
    }
    
    // Update alerts container
    if (alerts.length > 0) {
        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert alert-${alert.type} d-flex align-items-center mb-3" role="alert" data-aos="fade-up">
                <i class="${alert.icon} me-2"></i>
                <div>
                    <strong>${alert.title}</strong>
                    <p class="mb-0">${alert.message}</p>
                </div>
            </div>
        `).join('');
    } else {
        alertsContainer.innerHTML = `
            <div class="alert alert-success d-flex align-items-center" role="alert" data-aos="fade-up">
                <i class="bi bi-check-circle-fill me-2"></i>
                <div>
                    <strong>✅ All Clear</strong>
                    <p class="mb-0">No severe weather alerts for ${weatherData.name}.</p>
                </div>
            </div>
        `;
    }
}

// Setup smooth scroll for nav links
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile navbar if open
                if (state.isMobile) {
                    const navbarCollapse = document.querySelector('.navbar-collapse.show');
                    if (navbarCollapse) {
                        const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                        bsCollapse.hide();
                    }
                }
                
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Setup back to top button
function setupBackToTop() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            elements.backToTop.classList.add('visible');
        } else {
            elements.backToTop.classList.remove('visible');
        }
    });
    
    elements.backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Format date
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format time
function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

// Show loading spinner
function showLoading() {
    elements.loadingSpinner.classList.remove('d-none');
    document.body.style.overflow = 'hidden';
}

// Hide loading spinner
function hideLoading() {
    elements.loadingSpinner.classList.add('d-none');
    document.body.style.overflow = '';
}

// Show error message
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorContainer.classList.remove('d-none');
    
    // Auto hide error after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

// Hide error message
function hideError() {
    elements.errorContainer.classList.add('d-none');
}

// Load last searched city on page load
window.addEventListener('DOMContentLoaded', () => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        state.currentCity = lastCity;
        if (state.isMobile) {
            elements.mobileSearchField.value = lastCity;
        } else {
            elements.searchField.value = lastCity;
        }
    }
    initApp();
});

// Handle offline/online status
window.addEventListener('offline', () => {
    showError('📡 You are offline. Please check your internet connection.');
});

window.addEventListener('online', () => {
    hideError();
    if (state.currentCity) {
        loadWeather(state.currentCity);
    }
});

// Add touch feedback for mobile
document.addEventListener('touchstart', function() {}, true);

// Prevent zoom on double tap (mobile optimization)
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);