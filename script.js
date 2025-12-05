// ============================================
// WEATHER PRO - Advanced Weather Application
// Version: 3.0.0
// ============================================

// API Configuration
const API_CONFIG = {
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    API_KEY: '6a382ec6cb5712ccdb0b26e67db1698c',
    UNITS: 'metric',
    LANGUAGE: 'en'
};

// Application State
const AppState = {
    currentLocation: null,
    weatherData: null,
    forecastData: null,
    airQualityData: null,
    unitSystem: 'metric',
    theme: 'dark',
    locations: [],
    updateInterval: null
};

// DOM Elements Cache
const DOM = {
    // Search Elements
    searchField: document.getElementById('searchField'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    
    // Weather Display Elements
    currentWeather: document.getElementById('currentWeather'),
    currentTemp: document.getElementById('currentTemp'),
    feelsLikeTemp: document.getElementById('feelsLikeTemp'),
    tempRange: document.getElementById('tempRange'),
    dewPoint: document.getElementById('dewPoint'),
    
    // Wind Elements
    windSpeed: document.getElementById('windSpeed'),
    windDirection: document.getElementById('windDirection'),
    windGust: document.getElementById('windGust'),
    windDirectionIcon: document.getElementById('windDirectionIcon'),
    pressureValue: document.getElementById('pressureValue'),
    
    // Humidity Elements
    humidityValue: document.getElementById('humidityValue'),
    visibilityValue: document.getElementById('visibilityValue'),
    cloudCover: document.getElementById('cloudCover'),
    uvIndex: document.getElementById('uvIndex'),
    
    // Sun & Moon Elements
    sunriseTime: document.getElementById('sunriseTime'),
    sunsetTime: document.getElementById('sunsetTime'),
    dayLength: document.getElementById('dayLength'),
    moonPhase: document.getElementById('moonPhase'),
    
    // Air Quality Elements
    aqiValue: document.getElementById('aqiValue'),
    aqiLabel: document.getElementById('aqiLabel'),
    
    // Forecast Elements
    hourlyForecast: document.getElementById('hourlyForecast'),
    weeklyForecast: document.getElementById('weeklyForecast'),
    
    // Statistics Elements
    avgTemp: document.getElementById('avgTemp'),
    totalRain: document.getElementById('totalRain'),
    avgWind: document.getElementById('avgWind'),
    sunHours: document.getElementById('sunHours'),
    
    // Footer Elements
    currentTime: document.getElementById('currentTime'),
    locationInfo: document.getElementById('locationInfo'),
    
    // UI Elements
    loadingSpinner: document.getElementById('loadingSpinner'),
    errorContainer: document.getElementById('errorContainer'),
    errorMessage: document.getElementById('errorMessage'),
    backToTop: document.getElementById('backToTop')
};

// Initialize Application
function initApp() {
    console.log('🌤️ Weather Pro Initializing...');
    
    // Load saved preferences
    loadPreferences();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize UI
    initializeUI();
    
    // Set default location or use geolocation
    const defaultCity = AppState.locations[0] || 'London';
    searchWeather(defaultCity);
    
    // Start background updates
    startBackgroundUpdates();
    
    console.log('✅ Weather Pro Initialized');
}

// Load user preferences from localStorage
function loadPreferences() {
    try {
        const savedUnit = localStorage.getItem('weatherUnit');
        const savedTheme = localStorage.getItem('theme');
        const savedLocations = localStorage.getItem('savedLocations');
        
        if (savedUnit) AppState.unitSystem = savedUnit;
        if (savedTheme) AppState.theme = savedTheme;
        if (savedLocations) AppState.locations = JSON.parse(savedLocations);
        
        // Update unit buttons
        updateUnitButtons();
        
        // Apply theme
        document.documentElement.setAttribute('data-theme', AppState.theme);
    } catch (error) {
        console.error('Error loading preferences:', error);
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Search functionality
    DOM.searchBtn.addEventListener('click', handleSearch);
    DOM.searchField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Location button
    DOM.locationBtn.addEventListener('click', getLocationWeather);
    
    // Quick city buttons
    document.querySelectorAll('[data-city]').forEach(button => {
        button.addEventListener('click', (e) => {
            const city = e.currentTarget.getAttribute('data-city');
            DOM.searchField.value = city;
            searchWeather(city);
        });
    });
    
    // Unit conversion buttons
    document.querySelectorAll('[data-unit]').forEach(button => {
        button.addEventListener('click', (e) => {
            const unit = e.currentTarget.getAttribute('data-unit');
            changeUnitSystem(unit);
        });
    });
    
    // Back to top button
    DOM.backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Window scroll for back to top visibility
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            DOM.backToTop.classList.add('visible');
        } else {
            DOM.backToTop.classList.remove('visible');
        }
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Error dismiss button
    document.querySelector('[data-bs-dismiss="alert"]')?.addEventListener('click', () => {
        DOM.errorContainer.classList.add('d-none');
    });
    
    // Save location on search
    DOM.searchBtn.addEventListener('click', () => {
        const city = DOM.searchField.value.trim();
        if (city && !AppState.locations.includes(city)) {
            AppState.locations.unshift(city);
            if (AppState.locations.length > 5) AppState.locations.pop();
            localStorage.setItem('savedLocations', JSON.stringify(AppState.locations));
        }
    });
}

// Initialize UI components
function initializeUI() {
    // Update current time
    updateCurrentTime();
    
    // Setup time updater
    setInterval(updateCurrentTime, 60000); // Update every minute
    
    // Initialize charts and visualizations
    initializeCharts();
    
    // Add animation classes
    addAnimations();
}

// Update current time display
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    DOM.currentTime.textContent = timeString;
}

// Handle search functionality
function handleSearch() {
    const city = DOM.searchField.value.trim();
    if (city) {
        searchWeather(city);
    } else {
        showError('Please enter a city name');
    }
}

// Main weather search function
async function searchWeather(location) {
    showLoading();
    hideError();
    
    try {
        // Fetch current weather
        const weatherData = await fetchWeatherData(location);
        
        // Fetch forecast data
        const forecastData = await fetchForecastData(location);
        
        // Fetch air quality data
        const airQualityData = await fetchAirQualityData(
            weatherData.coord.lat,
            weatherData.coord.lon
        );
        
        // Update application state
        AppState.weatherData = weatherData;
        AppState.forecastData = forecastData;
        AppState.airQualityData = airQualityData;
        AppState.currentLocation = location;
        
        // Update UI with data
        updateCurrentWeather(weatherData);
        updateForecastData(forecastData);
        updateAirQualityData(airQualityData);
        updateStatistics(weatherData, forecastData);
        
        // Update location info
        DOM.locationInfo.textContent = `Location: ${weatherData.name}, ${weatherData.sys.country}`;
        
        // Save last location
        localStorage.setItem('lastLocation', location);
        
        // Update page title
        document.title = `${weatherData.name} Weather | Weather Pro`;
        
    } catch (error) {
        console.error('Search error:', error);
        showError(error.message || 'Unable to fetch weather data. Please try again.');
    } finally {
        hideLoading();
    }
}

// Fetch current weather data
async function fetchWeatherData(location) {
    const url = `${API_CONFIG.BASE_URL}/weather?q=${encodeURIComponent(location)}&appid=${API_CONFIG.API_KEY}&units=${API_CONFIG.UNITS}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('City not found. Please check the spelling and try again.');
        } else if (response.status === 401) {
            throw new Error('API key error. Please contact support.');
        } else {
            throw new Error('Unable to fetch weather data. Please try again later.');
        }
    }
    
    return await response.json();
}

// Fetch forecast data
async function fetchForecastData(location) {
    const url = `${API_CONFIG.BASE_URL}/forecast?q=${encodeURIComponent(location)}&appid=${API_CONFIG.API_KEY}&units=${API_CONFIG.UNITS}&cnt=40`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Unable to fetch forecast data.');
    }
    
    return await response.json();
}

// Fetch air quality data
async function fetchAirQualityData(lat, lon) {
    try {
        const url = `${API_CONFIG.BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_CONFIG.API_KEY}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Unable to fetch air quality data.');
        }
        
        return await response.json();
    } catch (error) {
        console.warn('Air quality data not available:', error);
        return null;
    }
}

// Get weather by user's location
async function getLocationWeather() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }
    
    showLoading();
    
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        });
        
        const { latitude, longitude } = position.coords;
        
        // Reverse geocode to get city name
        const cityName = await reverseGeocode(latitude, longitude);
        
        if (cityName) {
            DOM.searchField.value = cityName;
            await searchWeather(cityName);
        } else {
            // Use coordinates directly
            const weatherData = await fetchWeatherByCoords(latitude, longitude);
            AppState.weatherData = weatherData;
            updateCurrentWeather(weatherData);
            DOM.searchField.value = `${weatherData.name}, ${weatherData.sys.country}`;
        }
        
    } catch (error) {
        console.error('Geolocation error:', error);
        
        if (error.code === 1) {
            showError('Location access denied. Please enable location services.');
        } else if (error.code === 2) {
            showError('Location unavailable. Please check your connection.');
        } else if (error.code === 3) {
            showError('Location request timed out. Please try again.');
        } else {
            showError('Unable to get your location. Please try searching manually.');
        }
    } finally {
        hideLoading();
    }
}

// Reverse geocode coordinates to city name
async function reverseGeocode(lat, lon) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'WeatherProApp/1.0'
            }
        });
        
        if (!response.ok) return null;
        
        const data = await response.json();
        return data.address.city || data.address.town || data.address.village;
    } catch (error) {
        console.warn('Reverse geocode failed:', error);
        return null;
    }
}

// Fetch weather by coordinates
async function fetchWeatherByCoords(lat, lon) {
    const url = `${API_CONFIG.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_CONFIG.API_KEY}&units=${API_CONFIG.UNITS}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Unable to fetch weather for your location.');
    }
    
    return await response.json();
}

// Update current weather display
function updateCurrentWeather(data) {
    // Update location and time
    document.querySelector('#cityName').textContent = `${data.name}, ${data.sys.country}`;
    document.querySelector('#currentDate').textContent = formatDetailedDate(new Date());
    
    // Update main temperature display
    const tempValue = Math.round(data.main.temp);
    const tempElement = DOM.currentWeather.querySelector('.temp-value') || document.createElement('span');
    tempElement.className = 'temp-value';
    tempElement.textContent = tempValue;
    
    const tempUnit = DOM.currentWeather.querySelector('.temp-unit') || document.createElement('span');
    tempUnit.className = 'temp-unit';
    tempUnit.textContent = AppState.unitSystem === 'metric' ? '°C' : '°F';
    
    const weatherIcon = DOM.currentWeather.querySelector('.weather-icon-large') || document.createElement('i');
    weatherIcon.className = `wi wi-owm-${data.weather[0].id} weather-icon-large`;
    
    const weatherDesc = DOM.currentWeather.querySelector('.weather-condition') || document.createElement('h3');
    weatherDesc.className = 'weather-condition';
    weatherDesc.textContent = capitalizeWords(data.weather[0].description);
    
    // Update detailed temperature
    DOM.currentTemp.querySelector('.temp-value').textContent = tempValue;
    DOM.currentTemp.querySelector('.temp-unit').textContent = AppState.unitSystem === 'metric' ? '°C' : '°F';
    
    DOM.feelsLikeTemp.textContent = `${Math.round(data.main.feels_like)}°`;
    DOM.tempRange.textContent = `${Math.round(data.main.temp_min)}° / ${Math.round(data.main.temp_max)}°`;
    
    // Calculate and display dew point
    const dewPoint = calculateDewPoint(data.main.temp, data.main.humidity);
    DOM.dewPoint.textContent = `${Math.round(dewPoint)}°`;
    
    // Update wind information
    DOM.windSpeed.textContent = (data.wind.speed * 3.6).toFixed(1);
    DOM.windDirection.textContent = `${data.wind.deg}°`;
    DOM.windGust.textContent = data.wind.gust ? `${(data.wind.gust * 3.6).toFixed(1)} km/h` : '-- km/h';
    DOM.pressureValue.textContent = `${data.main.pressure} hPa`;
    
    // Update wind direction icon
    updateWindDirectionIcon(data.wind.deg);
    
    // Update humidity information
    DOM.humidityValue.textContent = data.main.humidity;
    DOM.visibilityValue.textContent = (data.visibility / 1000).toFixed(1);
    DOM.cloudCover.textContent = `${data.clouds.all}%`;
    
    // Calculate and display UV index (mock for now)
    const uvIndex = calculateUVIndex(data.coord.lat, data.coord.lon, new Date());
    DOM.uvIndex.textContent = uvIndex;
    updateUIStyle(uvIndex);
    
    // Update sun and moon information
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    
    DOM.sunriseTime.textContent = formatTime(sunrise);
    DOM.sunsetTime.textContent = formatTime(sunset);
    
    // Calculate day length
    const dayLengthMs = sunset - sunrise;
    const hours = Math.floor(dayLengthMs / (1000 * 60 * 60));
    const minutes = Math.floor((dayLengthMs % (1000 * 60 * 60)) / (1000 * 60));
    DOM.dayLength.textContent = `${hours}h ${minutes}m`;
    
    // Calculate moon phase
    const moonPhase = calculateMoonPhase(new Date());
    DOM.moonPhase.textContent = moonPhase;
    
    // Update background based on weather
    updateBackground(data.weather[0].main, data.weather[0].id);
    
    // Add animation
    addWeatherAnimation(data.weather[0].main);
}

// Update forecast data display
function updateForecastData(data) {
    // Update hourly forecast
    updateHourlyForecast(data.list.slice(0, 8));
    
    // Update weekly forecast
    updateWeeklyForecast(data.list);
}

// Update hourly forecast
function updateHourlyForecast(hourlyData) {
    DOM.hourlyForecast.innerHTML = '';
    
    hourlyData.forEach((item, index) => {
        const time = new Date(item.dt * 1000);
        const hourItem = document.createElement('div');
        hourItem.className = 'hour-item';
        hourItem.innerHTML = `
            <div class="hour-time">${formatHour(time)}</div>
            <div class="hour-icon">
                <i class="wi wi-owm-${item.weather[0].id}"></i>
            </div>
            <div class="hour-temp">${Math.round(item.main.temp)}°</div>
        `;
        
        // Add animation delay
        hourItem.style.animationDelay = `${index * 0.1}s`;
        hourItem.classList.add('fade-in');
        
        DOM.hourlyForecast.appendChild(hourItem);
    });
}

// Update weekly forecast
function updateWeeklyForecast(forecastData) {
    // Group by day
    const dailyForecasts = {};
    
    forecastData.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        if (!dailyForecasts[day]) {
            dailyForecasts[day] = {
                temps: [],
                weather: [],
                rain: [],
                wind: []
            };
        }
        
        dailyForecasts[day].temps.push(item.main.temp);
        dailyForecasts[day].weather.push(item.weather[0]);
        dailyForecasts[day].rain.push(item.rain ? item.rain['3h'] || 0 : 0);
        dailyForecasts[day].wind.push(item.wind.speed);
    });
    
    DOM.weeklyForecast.innerHTML = '';
    
    Object.entries(dailyForecasts).slice(0, 7).forEach(([day, data], index) => {
        const maxTemp = Math.round(Math.max(...data.temps));
        const minTemp = Math.round(Math.min(...data.temps));
        const avgRain = data.rain.length > 0 ? Math.round(data.rain.reduce((a, b) => a + b) / data.rain.length) : 0;
        const avgWind = Math.round(data.wind.reduce((a, b) => a + b) / data.wind.length * 3.6);
        
        // Get most common weather condition
        const weatherCount = {};
        data.weather.forEach(w => {
            const id = w.id;
            weatherCount[id] = (weatherCount[id] || 0) + 1;
        });
        
        const mostCommonWeather = Object.entries(weatherCount)
            .sort((a, b) => b[1] - a[1])[0][0];
        
        const forecastRow = document.createElement('div');
        forecastRow.className = 'forecast-row';
        forecastRow.innerHTML = `
            <div class="forecast-day">${index === 0 ? 'Today' : day}</div>
            <div class="forecast-icon">
                <i class="wi wi-owm-${mostCommonWeather}"></i>
            </div>
            <div class="forecast-temp">
                <span class="temp-max">${maxTemp}°</span>
                <span class="temp-min">${minTemp}°</span>
            </div>
            <div class="forecast-precip">
                <i class="bi bi-droplet"></i> ${avgRain}%
            </div>
            <div class="forecast-wind">
                <i class="bi bi-wind"></i> ${avgWind} km/h
            </div>
        `;
        
        forecastRow.style.animationDelay = `${index * 0.1}s`;
        forecastRow.classList.add('fade-in');
        
        DOM.weeklyForecast.appendChild(forecastRow);
    });
}

// Update air quality data
function updateAirQualityData(data) {
    if (!data || !data.list || data.list.length === 0) {
        DOM.aqiValue.textContent = '--';
        DOM.aqiLabel.textContent = 'Data unavailable';
        return;
    }
    
    const aqi = data.list[0].main.aqi;
    const pollutants = data.list[0].components;
    
    // Update AQI value
    DOM.aqiValue.textContent = aqi;
    
    // Update AQI label
    const aqiLabels = {
        1: 'Good',
        2: 'Fair',
        3: 'Moderate',
        4: 'Poor',
        5: 'Very Poor'
    };
    
    DOM.aqiLabel.textContent = aqiLabels[aqi] || 'Unknown';
    
    // Update pollutant bars
    updatePollutantBars(pollutants);
}

// Update pollutant visualization bars
function updatePollutantBars(pollutants) {
    const pollutantElements = document.querySelectorAll('.pollutant');
    
    pollutantElements.forEach(element => {
        const name = element.querySelector('.pollutant-name').textContent;
        const bar = element.querySelector('.pollutant-level');
        const valueElement = element.querySelector('.pollutant-value');
        
        let value = 0;
        let maxValue = 100;
        
        switch (name) {
            case 'PM2.5':
                value = pollutants.pm2_5 || 0;
                maxValue = 35;
                break;
            case 'PM10':
                value = pollutants.pm10 || 0;
                maxValue = 50;
                break;
            case 'O₃':
                value = pollutants.o3 || 0;
                maxValue = 100;
                break;
            default:
                value = 0;
        }
        
        const percentage = Math.min((value / maxValue) * 100, 100);
        bar.style.width = `${percentage}%`;
        valueElement.textContent = value.toFixed(1);
        
        // Update bar color based on value
        updatePollutantBarColor(bar, percentage);
    });
}

// Update pollutant bar color
function updatePollutantBarColor(bar, percentage) {
    if (percentage <= 50) {
        bar.style.background = 'var(--gradient-4)';
    } else if (percentage <= 75) {
        bar.style.background = 'var(--gradient-5)';
    } else {
        bar.style.background = 'var(--gradient-2)';
    }
}

// Update statistics
function updateStatistics(weatherData, forecastData) {
    // Calculate average temperature from forecast
    const temps = forecastData.list.slice(0, 8).map(item => item.main.temp);
    const avgTemp = temps.reduce((a, b) => a + b) / temps.length;
    DOM.avgTemp.textContent = `${Math.round(avgTemp)}°`;
    
    // Calculate total precipitation
    const rainData = forecastData.list.slice(0, 8)
        .filter(item => item.rain && item.rain['3h'])
        .map(item => item.rain['3h']);
    
    const totalRain = rainData.reduce((a, b) => a + b, 0);
    DOM.totalRain.textContent = `${Math.round(totalRain)} mm`;
    
    // Calculate average wind speed
    const winds = forecastData.list.slice(0, 8).map(item => item.wind.speed);
    const avgWind = winds.reduce((a, b) => a + b) / winds.length;
    DOM.avgWind.textContent = `${Math.round(avgWind * 3.6)} km/h`;
    
    // Calculate sunshine hours (simplified)
    const sunHours = calculateSunshineHours(weatherData.coord.lat, weatherData.coord.lon);
    DOM.sunHours.textContent = sunHours;
}

// Change unit system
function changeUnitSystem(unit) {
    if (AppState.unitSystem === unit) return;
    
    AppState.unitSystem = unit;
    localStorage.setItem('weatherUnit', unit);
    
    // Update unit buttons
    updateUnitButtons();
    
    // Refresh data with new units
    if (AppState.currentLocation) {
        searchWeather(AppState.currentLocation);
    }
}

// Update unit buttons state
function updateUnitButtons() {
    document.querySelectorAll('[data-unit]').forEach(button => {
        if (button.getAttribute('data-unit') === AppState.unitSystem) {
            button.classList.add('active');
            button.classList.remove('btn-outline-light');
            button.classList.add('btn-light');
        } else {
            button.classList.remove('active');
            button.classList.remove('btn-light');
            button.classList.add('btn-outline-light');
        }
    });
}

// Show loading spinner
function showLoading() {
    DOM.loadingSpinner.classList.remove('d-none');
    document.body.style.overflow = 'hidden';
}

// Hide loading spinner
function hideLoading() {
    DOM.loadingSpinner.classList.add('d-none');
    document.body.style.overflow = '';
}

// Show error message
function showError(message) {
    DOM.errorMessage.textContent = message;
    DOM.errorContainer.classList.remove('d-none');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        DOM.errorContainer.classList.add('d-none');
    }, 5000);
}

// Hide error message
function hideError() {
    DOM.errorContainer.classList.add('d-none');
}

// Start background updates
function startBackgroundUpdates() {
    // Clear any existing interval
    if (AppState.updateInterval) {
        clearInterval(AppState.updateInterval);
    }
    
    // Update every 10 minutes
    AppState.updateInterval = setInterval(() => {
        if (AppState.currentLocation) {
            searchWeather(AppState.currentLocation);
        }
    }, 10 * 60 * 1000);
}

// Initialize charts and visualizations
function initializeCharts() {
    // This would initialize weather charts if using a chart library
    // For now, we'll set up placeholders
    console.log('Charts initialized');
}

// Add animations to elements
function addAnimations() {
    // Add fade-in animation to weather cards
    document.querySelectorAll('.weather-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
}

// Add weather-specific animations
function addWeatherAnimation(weatherCondition) {
    const body = document.body;
    
    // Remove existing weather animations
    body.classList.remove('weather-rain', 'weather-snow', 'weather-wind', 'weather-sun');
    
    // Add new animation based on weather
    switch (weatherCondition.toLowerCase()) {
        case 'rain':
        case 'drizzle':
            body.classList.add('weather-rain');
            break;
        case 'snow':
            body.classList.add('weather-snow');
            break;
        case 'clear':
            body.classList.add('weather-sun');
            break;
        case 'wind':
        case 'clouds':
            body.classList.add('weather-wind');
            break;
    }
}

// Update background based on weather
function updateBackground(weatherCondition, weatherId) {
    const body = document.body;
    let gradient = '';
    
    if (weatherId >= 200 && weatherId < 300) {
        // Thunderstorm
        gradient = 'linear-gradient(135deg, #2c3e50 0%, #4a6491 100%)';
    } else if (weatherId >= 300 && weatherId < 600) {
        // Rain/Drizzle
        gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    } else if (weatherId >= 600 && weatherId < 700) {
        // Snow
        gradient = 'linear-gradient(135deg, #e6dada 0%, #274046 100%)';
    } else if (weatherId >= 700 && weatherId < 800) {
        // Atmosphere (fog, mist, etc.)
        gradient = 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)';
    } else if (weatherId === 800) {
        // Clear
        gradient = 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)';
    } else if (weatherId > 800) {
        // Clouds
        gradient = 'linear-gradient(135deg, #a3bded 0%, #6991c7 100%)';
    } else {
        gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    
    body.style.background = gradient;
}

// Update wind direction icon
function updateWindDirectionIcon(degrees) {
    const icon = DOM.windDirectionIcon;
    icon.style.transform = `rotate(${degrees}deg)`;
}

// Update UI style based on UV index
function updateUIStyle(uvIndex) {
    const element = DOM.uvIndex;
    element.className = 'value uv-index';
    
    if (uvIndex <= 2) {
        element.classList.add('uv-low');
    } else if (uvIndex <= 5) {
        element.classList.add('uv-moderate');
    } else if (uvIndex <= 7) {
        element.classList.add('uv-high');
    } else if (uvIndex <= 10) {
        element.classList.add('uv-very-high');
    } else {
        element.classList.add('uv-extreme');
    }
}

// ===== Utility Functions =====

// Format time
function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

// Format hour
function formatHour(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true
    }).replace(' ', '');
}

// Format detailed date
function formatDetailedDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Capitalize words
function capitalizeWords(str) {
    return str.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Calculate dew point
function calculateDewPoint(temp, humidity) {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
}

// Calculate UV index (simplified)
function calculateUVIndex(lat, lon, date) {
    // This is a simplified calculation
    // In a real app, you would use an API for accurate UV data
    const hour = date.getHours();
    const month = date.getMonth();
    
    let baseUV = 5; // Base UV for midday
    baseUV *= Math.cos((lat * Math.PI) / 180); // Adjust for latitude
    baseUV *= (month >= 3 && month <= 8) ? 1.2 : 0.8; // Adjust for season
    baseUV *= (hour >= 10 && hour <= 14) ? 1.5 : 0.7; // Adjust for time of day
    
    return Math.round(baseUV);
}

// Calculate moon phase
function calculateMoonPhase(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Simplified calculation
    const c = Math.floor(year / 100);
    let e = 0;
    
    if (month < 3) {
        e = 0.6;
    } else {
        e = (month + 1) * 0.6;
    }
    
    const jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) + 
              Math.floor(275 * month / 9) + day + 1721013.5 + e - c * 2 + 0.5;
    
    const daysSinceNew = (jd - 2451549.5) % 29.53;
    
    if (daysSinceNew < 1.84566) return 'New Moon';
    if (daysSinceNew < 5.53699) return 'Waxing Crescent';
    if (daysSinceNew < 9.22831) return 'First Quarter';
    if (daysSinceNew < 12.91963) return 'Waxing Gibbous';
    if (daysSinceNew < 16.61096) return 'Full Moon';
    if (daysSinceNew < 20.30228) return 'Waning Gibbous';
    if (daysSinceNew < 23.99361) return 'Last Quarter';
    if (daysSinceNew < 27.68493) return 'Waning Crescent';
    return 'New Moon';
}

// Calculate sunshine hours
function calculateSunshineHours(lat, lon) {
    // Simplified calculation
    // In reality, you would use solar position calculations
    const date = new Date();
    const month = date.getMonth();
    
    // Approximate sunshine hours based on month and latitude
    let baseHours = 12;
    baseHours += (Math.abs(lat) / 90) * (month >= 3 && month <= 8 ? 4 : -4);
    
    return Math.round(baseHours);
}

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', initApp);

// ===== PWA Support =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// ===== Offline Support =====
window.addEventListener('online', () => {
    console.log('Back online');
    if (AppState.currentLocation) {
        searchWeather(AppState.currentLocation);
    }
});

window.addEventListener('offline', () => {
    console.log('Offline');
    showError('You are offline. Weather data may not be up to date.');
});

// ===== Export for testing =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppState,
        DOM,
        initApp,
        searchWeather,
        getLocationWeather
    };
}