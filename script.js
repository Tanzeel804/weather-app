// Weather App - Complete & Professional
// Developer: Tanzeel Ahmed

// API Configuration
const API_KEY = "6a382ec6cb5712ccdb0b26e67db1698c";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// DOM Elements
const elements = {
  // Desktop Search
  searchField: document.getElementById("searchField"),
  searchBtn: document.getElementById("searchBtn"),
  locationBtn: document.getElementById("locationBtn"),

  // Mobile Search
  mobileSearchField: document.getElementById("mobileSearchField"),
  mobileSearchBtn: document.getElementById("mobileSearchBtn"),
  mobileLocationBtn: document.getElementById("mobileLocationBtn"),
  mobileSearchToggle: document.getElementById("mobileSearchToggle"),
  mobileSearchBar: document.getElementById("mobileSearchBar"),

  // Current Weather
  cityName: document.getElementById("cityName"),
  currentDate: document.getElementById("currentDate"),
  weatherStatus: document.getElementById("weatherStatus"),
  temperature: document.getElementById("temperature"),
  feelsLike: document.getElementById("feelsLike"),
  weatherIcon: document.getElementById("weatherIcon"),

  // Weather Details
  windSpeed: document.getElementById("windSpeed"),
  humidity: document.getElementById("humidity"),
  pressure: document.getElementById("pressure"),
  visibility: document.getElementById("visibility"),

  // Sun/Moon
  sunrise: document.getElementById("sunrise"),
  sunset: document.getElementById("sunset"),
  dayLength: document.getElementById("dayLength"),

  // Temperature Range
  tempMin: document.getElementById("tempMin"),
  tempCurrent: document.getElementById("tempCurrent"),
  tempMax: document.getElementById("tempMax"),
  tempProgress: document.getElementById("tempProgress"),

  // Forecast
  hourlyForecast: document.getElementById("hourlyForecast"),
  forecastDays: document.getElementById("forecastDays"),

  // UI Elements
  errorContainer: document.getElementById("errorContainer"),
  errorMessage: document.getElementById("errorMessage"),
  loadingSpinner: document.getElementById("loadingSpinner"),
  themeToggle: document.getElementById("themeToggle"),
  currentTime: document.getElementById("currentTime"),
  backToTop: document.getElementById("backToTop"),
  lastUpdated: document.getElementById("lastUpdated"),
};

// App State
const state = {
  currentCity: "London",
  unit: "metric",
  theme: localStorage.getItem("theme") || "dark",
  weatherData: null,
  isMobile: window.innerWidth <= 768,
};

// Developer Info
const developerInfo = {
  name: "Tanzeel Ahmed",
  email: "tanzeel.ahmed.se@gmail.com",
  github: "https://github.com/Tanzeel804",
  linkedin: "https://www.linkedin.com/in/tanzeel-ahmed-b21288397/",
  twitter: "https://twitter.com/TanzeelOnX",
  tiktok: "https://www.tiktok.com/@therealtanzeel",
  instagram: "https://www.instagram.com/tanzeelahmedpov",
  facebook: "https://www.facebook.com/tanzeelahmedpov",
  allProjects: "https://github.com/Tanzeel804?tab=repositories",
};

// Initialize App
function initApp() {
  console.log("🌤️ Weather Pro Initializing...");

  // Set theme
  document.documentElement.setAttribute("data-theme", state.theme);
  updateThemeButton();

  // Initialize AOS
  AOS.init({
    duration: 800,
    once: true,
    offset: 100,
    easing: "ease-in-out",
    delay: 100,
    mirror: false,
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

  // Update last updated time
  updateLastUpdated();

  console.log("✅ Weather Pro Initialized");
}

// Check device type and adjust UI
function checkDeviceType() {
  state.isMobile = window.innerWidth <= 768;

  // Adjust UI based on device
  if (state.isMobile) {
    document.querySelector(".search-section")?.classList.add("d-none");
  } else {
    document.querySelector(".search-section")?.classList.remove("d-none");
  }
}

// Setup all event listeners
function setupEventListeners() {
  // Desktop search
  elements.searchBtn?.addEventListener("click", handleSearch);
  elements.searchField?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
  });

  // Mobile search
  elements.mobileSearchBtn?.addEventListener("click", handleMobileSearch);
  elements.mobileSearchField?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleMobileSearch();
  });

  // Location buttons
  elements.locationBtn?.addEventListener("click", getCurrentLocation);
  elements.mobileLocationBtn?.addEventListener("click", getCurrentLocation);

  // Mobile search toggle
  elements.mobileSearchToggle?.addEventListener("click", toggleMobileSearch);

  // Close mobile search when clicking outside
  document.addEventListener("click", (e) => {
    if (
      state.isMobile &&
      elements.mobileSearchBar &&
      elements.mobileSearchToggle &&
      !elements.mobileSearchBar.contains(e.target) &&
      !elements.mobileSearchToggle.contains(e.target) &&
      elements.mobileSearchBar.classList.contains("active")
    ) {
      toggleMobileSearch();
    }
  });

  // Quick city buttons
  document.querySelectorAll("[data-city]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const city = e.target.closest("button").getAttribute("data-city");
      if (state.isMobile) {
        elements.mobileSearchField.value = city;
        loadWeather(city);
        toggleMobileSearch();
      } else {
        elements.searchField.value = city;
        loadWeather(city);
      }
    });
  });

  // Theme toggle
  elements.themeToggle?.addEventListener("click", toggleTheme);

  // Error dismiss
  const errorDismissBtn = document.querySelector('[data-bs-dismiss="alert"]');
  if (errorDismissBtn) {
    errorDismissBtn.addEventListener("click", hideError);
  }

  // Window resize
  window.addEventListener("resize", () => {
    checkDeviceType();
    AOS.refresh();
  });

  // Add keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "k") {
      e.preventDefault();
      if (state.isMobile) {
        toggleMobileSearch();
      } else {
        elements.searchField.focus();
      }
    }
  });

  // Add tooltip functionality
  document.querySelectorAll("[data-tooltip]").forEach((element) => {
    element.addEventListener("mouseenter", handleTooltip);
    element.addEventListener("mouseleave", hideTooltip);
  });
}

// Handle tooltip
function handleTooltip(e) {
  const tooltip = e.target.getAttribute("data-tooltip");
  if (tooltip) {
    // Tooltip is handled by CSS
  }
}

function hideTooltip() {
  // Tooltip is handled by CSS
}

// Handle desktop search
function handleSearch() {
  const city = elements.searchField.value.trim();
  if (city) {
    loadWeather(city);
    elements.searchField.blur();
  } else {
    showError("Please enter a city name");
    elements.searchField.focus();
  }
}

// Handle mobile search
function handleMobileSearch() {
  const city = elements.mobileSearchField.value.trim();
  if (city) {
    loadWeather(city);
    toggleMobileSearch();
  } else {
    showError("Please enter a city name");
    elements.mobileSearchField.focus();
  }
}

// Toggle mobile search bar
function toggleMobileSearch() {
  elements.mobileSearchBar.classList.toggle("active");

  if (elements.mobileSearchBar.classList.contains("active")) {
    elements.mobileSearchField.focus();
    elements.mobileSearchToggle.innerHTML = '<i class="bi bi-x-lg"></i>';
  } else {
    elements.mobileSearchToggle.innerHTML = '<i class="bi bi-search"></i>';
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
    localStorage.setItem("lastCity", city);

    // Update page title
    document.title = `${currentData.name} Weather | Weather Pro`;

    // Update last updated time
    updateLastUpdated();

    // Refresh AOS for new content
    setTimeout(() => {
      AOS.refresh();
    }, 500);

    console.log(`✅ Weather loaded for ${city}`);
  } catch (error) {
    console.error("Error loading weather:", error);
    showError(
      error.message || "Failed to load weather data. Please try again."
    );
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
      throw new Error("City not found. Please check the city name.");
    } else if (response.status === 401) {
      throw new Error("API key error. Please contact developer.");
    } else if (response.status === 429) {
      throw new Error("Too many requests. Please try again later.");
    }
    throw new Error("Unable to fetch weather data. Please try again.");
  }

  return await response.json();
}

// Fetch forecast
async function fetchForecast(city) {
  const url = `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=${state.unit}&cnt=40`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to fetch forecast data.");
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
  elements.temperature.textContent = `${temp}°${
    state.unit === "metric" ? "C" : "F"
  }`;
  elements.feelsLike.textContent = `${feels}°${
    state.unit === "metric" ? "C" : "F"
  }`;

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
  const tempPosition =
    tempRange > 0 ? ((temp - tempMin) / tempRange) * 100 : 50;
  elements.tempProgress.style.width = `${tempPosition}%`;
  elements.tempProgress.style.background = `linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)`;

  // Update background based on weather
  updateWeatherBackground(data.weather[0].main);

  // Add animation to temperature
  animateTemperature(temp);
}

// Animate temperature change
function animateTemperature(newTemp) {
  elements.temperature.style.transition = "transform 0.5s ease";
  elements.temperature.style.transform = "scale(1.1)";
  setTimeout(() => {
    elements.temperature.style.transform = "scale(1)";
  }, 500);
}

// Update forecast display
function updateForecast(data) {
  // Clear existing content
  elements.hourlyForecast.innerHTML = "";
  elements.forecastDays.innerHTML = "";

  // Group forecast by day
  const dailyForecasts = {};
  const now = new Date();

  // Filter to get 8 items per day (3-hour intervals)
  const forecastItems = data.list
    .filter((item, index) => index % 2 === 0)
    .slice(0, 24);

  forecastItems.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });

    if (!dailyForecasts[day]) {
      dailyForecasts[day] = {
        temps: [],
        weather: [],
        time: date,
      };
    }

    dailyForecasts[day].temps.push(item.main.temp);
    dailyForecasts[day].weather.push(item.weather[0]);

    // Add to hourly forecast
    addHourlyForecastItem(date, item);
  });

  // Update 5-day forecast
  Object.entries(dailyForecasts)
    .slice(0, 5)
    .forEach(([day, data], index) => {
      addDailyForecastItem(day, data, index === 0);
    });
}

// Add hourly forecast item
function addHourlyForecastItem(date, data) {
  const hourDiv = document.createElement("div");
  hourDiv.className = "hour-item fade-in";

  const hour = date.getHours();
  const temp = Math.round(data.main.temp);
  const icon = data.weather[0].icon;
  const desc = data.weather[0].description;

  hourDiv.innerHTML = `
        <div class="hour-time fw-bold">${hour}:00</div>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}" class="hour-icon my-2" width="40">
        <div class="hour-temp fw-bold">${temp}°</div>
        <div class="hour-desc small text-light opacity-75">${desc}</div>
    `;

  // Add AOS animation
  hourDiv.setAttribute("data-aos", "fade-up");
  hourDiv.setAttribute(
    "data-aos-delay",
    elements.hourlyForecast.children.length * 50
  );

  elements.hourlyForecast.appendChild(hourDiv);
}

// Add daily forecast item
function addDailyForecastItem(day, data, isToday) {
  const dayDiv = document.createElement("div");
  dayDiv.className = "forecast-day";

  const avgTemp = Math.round(
    data.temps.reduce((a, b) => a + b) / data.temps.length
  );
  const maxTemp = Math.round(Math.max(...data.temps));
  const minTemp = Math.round(Math.min(...data.temps));

  // Get most common weather
  const weatherCount = {};
  data.weather.forEach((w) => {
    weatherCount[w.main] = (weatherCount[w.main] || 0) + 1;
  });
  const mostCommonWeather = Object.keys(weatherCount).reduce((a, b) =>
    weatherCount[a] > weatherCount[b] ? a : b
  );
  const weatherIcon = data.weather[0].icon;

  dayDiv.innerHTML = `
        <div class="day-name fw-bold">${isToday ? "Today" : day}</div>
        <div class="forecast-temp d-flex align-items-center">
            <div class="weather-icon-small me-3">
                <img src="https://openweathermap.org/img/wn/${weatherIcon}.png" alt="${mostCommonWeather}" width="40">
            </div>
            <div class="temp-range">
                <span class="temp-high fw-bold">${maxTemp}°</span>
                <span class="temp-low text-light opacity-75 ms-2">${minTemp}°</span>
            </div>
        </div>
    `;

  // Add AOS animation
  dayDiv.setAttribute("data-aos", "fade-up");
  dayDiv.setAttribute(
    "data-aos-delay",
    elements.forecastDays.children.length * 100
  );

  elements.forecastDays.appendChild(dayDiv);
}

// Get current location
function getCurrentLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser");
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
          state.weatherData = { current: weatherData };
          updateCurrentWeather(weatherData);

          if (state.isMobile) {
            elements.mobileSearchField.value = `${weatherData.name}, ${weatherData.sys.country}`;
          } else {
            elements.searchField.value = `${weatherData.name}, ${weatherData.sys.country}`;
          }
        }
      } catch (error) {
        showError("Unable to get location. Please search manually.");
      }
    },
    (error) => {
      hideLoading();
      switch (error.code) {
        case 1:
          showError("Location access denied. Please enable location services.");
          break;
        case 2:
          showError("Location unavailable. Please check your connection.");
          break;
        case 3:
          showError("Location request timed out. Please try again.");
          break;
        default:
          showError("Unable to get your location.");
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
}

// Reverse geocode coordinates
async function reverseGeocode(lat, lon) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
    );
    const data = await response.json();
    return (
      data.address.city ||
      data.address.town ||
      data.address.village ||
      data.address.municipality
    );
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return null;
  }
}

// Fetch weather by coordinates
async function fetchWeatherByCoords(lat, lon) {
  const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${state.unit}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to fetch weather for your location.");
  }

  return await response.json();
}

// Toggle theme
function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", state.theme);
  localStorage.setItem("theme", state.theme);
  updateThemeButton();

  // Add theme change animation
  document.body.style.opacity = "0.8";
  document.body.style.transition = "opacity 0.3s ease";

  setTimeout(() => {
    document.body.style.opacity = "1";
  }, 300);
}

// Update theme button icon
function updateThemeButton() {
  const sunIcon = elements.themeToggle.querySelector(".bi-sun-fill");
  const moonIcon = elements.themeToggle.querySelector(".bi-moon-fill");

  if (state.theme === "dark") {
    sunIcon.classList.remove("d-none");
    moonIcon.classList.add("d-none");
    elements.themeToggle.title = "Switch to Light Mode";
  } else {
    sunIcon.classList.add("d-none");
    moonIcon.classList.remove("d-none");
    elements.themeToggle.title = "Switch to Dark Mode";
  }
}

// Update time
function updateTime() {
  const now = new Date();
  elements.currentTime.textContent = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

// Update last updated time
function updateLastUpdated() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateString = now.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  elements.lastUpdated.textContent = `${dateString} at ${timeString}`;
}

// Update weather background
function updateWeatherBackground(weatherCondition) {
  const body = document.body;

  // Remove all weather background classes
  body.classList.remove(
    "weather-bg-clear",
    "weather-bg-clouds",
    "weather-bg-rain",
    "weather-bg-thunderstorm",
    "weather-bg-snow",
    "weather-bg-mist"
  );

  // Add appropriate class
  switch (weatherCondition.toLowerCase()) {
    case "clear":
      body.classList.add("weather-bg-clear");
      break;
    case "clouds":
      body.classList.add("weather-bg-clouds");
      break;
    case "rain":
    case "drizzle":
      body.classList.add("weather-bg-rain");
      break;
    case "thunderstorm":
      body.classList.add("weather-bg-thunderstorm");
      break;
    case "snow":
      body.classList.add("weather-bg-snow");
      break;
    case "mist":
    case "fog":
    case "haze":
    case "smoke":
      body.classList.add("weather-bg-mist");
      break;
    default:
      // Default gradient based on time
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 18) {
        body.classList.add("weather-bg-clear");
      } else {
        body.classList.add("weather-bg-clouds");
      }
  }
}

// Update weather animation
function updateWeatherAnimation(weatherCondition) {
  // Remove existing weather animation
  const existingAnimation = document.querySelector(".weather-animation");
  if (existingAnimation) {
    existingAnimation.remove();
  }

  // Create new animation based on weather
  const animationDiv = document.createElement("div");
  animationDiv.className = "weather-animation";

  switch (weatherCondition.toLowerCase()) {
    case "rain":
    case "drizzle":
      animationDiv.classList.add("rain-animation");
      animationDiv.innerHTML = `<div class="raindrop"></div><div class="raindrop"></div><div class="raindrop"></div>`;
      break;
    case "snow":
      animationDiv.classList.add("snow-animation");
      animationDiv.innerHTML = `<div class="snowflake"></div><div class="snowflake"></div><div class="snowflake"></div>`;
      break;
    case "clear":
      animationDiv.classList.add("sun-animation");
      animationDiv.innerHTML = `<div class="sun"></div>`;
      break;
    case "clouds":
      animationDiv.classList.add("cloud-animation");
      animationDiv.innerHTML = `<div class="cloud"></div><div class="cloud"></div>`;
      break;
  }

  document.body.appendChild(animationDiv);
}

// Initialize alerts
function initializeAlerts() {
  const alertsContainer = document.getElementById("weatherAlerts");
  if (alertsContainer) {
    alertsContainer.innerHTML = `
            <div class="alert alert-info d-flex align-items-center" role="alert" data-aos="fade-up">
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
  const alertsContainer = document.getElementById("weatherAlerts");
  if (!alertsContainer) return;

  const alerts = [];
  const condition = weatherData.weather[0].main;
  const windSpeed = weatherData.wind.speed;
  const temp = weatherData.main.temp;

  // Check for severe weather conditions
  if (condition === "Thunderstorm") {
    alerts.push({
      type: "danger",
      icon: "bi-lightning-fill",
      title: "⚡ Thunderstorm Warning",
      message:
        "Thunderstorm detected. Stay indoors and avoid using electrical appliances.",
    });
  }

  if (windSpeed > 15) {
    alerts.push({
      type: "warning",
      icon: "bi-wind",
      title: "💨 High Wind Warning",
      message:
        "Strong winds detected. Secure loose objects and be cautious outdoors.",
    });
  }

  if (temp > 35) {
    alerts.push({
      type: "warning",
      icon: "bi-thermometer-sun",
      title: "🔥 Heat Warning",
      message:
        "Extreme heat detected. Stay hydrated and avoid prolonged sun exposure.",
    });
  }

  if (temp < 0) {
    alerts.push({
      type: "info",
      icon: "bi-snow",
      title: "❄️ Freezing Temperature",
      message:
        "Freezing temperatures detected. Dress warmly and watch for ice on roads.",
    });
  }

  // Update alerts container
  if (alerts.length > 0) {
    alertsContainer.innerHTML = alerts
      .map(
        (alert, index) => `
                <div class="alert alert-${
                  alert.type
                } d-flex align-items-center mb-3" role="alert" data-aos="fade-up" data-aos-delay="${
          index * 100
        }">
                    <i class="${alert.icon} me-2 fs-5"></i>
                    <div>
                        <strong class="d-block mb-1">${alert.title}</strong>
                        <p class="mb-0 small">${alert.message}</p>
                    </div>
                </div>
            `
      )
      .join("");
  } else {
    alertsContainer.innerHTML = `
            <div class="alert alert-success d-flex align-items-center" role="alert" data-aos="fade-up">
                <i class="bi bi-check-circle-fill me-2 fs-5"></i>
                <div>
                    <strong class="d-block mb-1">✅ All Clear</strong>
                    <p class="mb-0 small">No severe weather alerts for ${weatherData.name}.</p>
                </div>
            </div>
        `;
  }
}

// Setup smooth scroll for nav links
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Close mobile navbar if open
        if (state.isMobile) {
          const navbarCollapse = document.querySelector(
            ".navbar-collapse.show"
          );
          if (navbarCollapse) {
            const bsCollapse = new bootstrap.Collapse(navbarCollapse);
            bsCollapse.hide();
          }
        }

        // Close mobile search if open
        if (elements.mobileSearchBar?.classList.contains("active")) {
          toggleMobileSearch();
        }

        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });
      }
    });
  });
}

// Setup back to top button
function setupBackToTop() {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      elements.backToTop.classList.add("visible");
    } else {
      elements.backToTop.classList.remove("visible");
    }
  });

  elements.backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// Format date
function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Format time
function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Show loading spinner
function showLoading() {
  if (elements.loadingSpinner) {
    elements.loadingSpinner.classList.remove("d-none");
  }
  document.body.style.cursor = "wait";
}

// Hide loading spinner
function hideLoading() {
  if (elements.loadingSpinner) {
    elements.loadingSpinner.classList.add("d-none");
  }
  document.body.style.cursor = "default";
}

// Show error message
function showError(message) {
  if (elements.errorMessage && elements.errorContainer) {
    elements.errorMessage.textContent = message;
    elements.errorContainer.classList.remove("d-none");
    elements.errorContainer.style.animation = "shake 0.5s ease";

    // Auto hide error after 5 seconds
    setTimeout(() => {
      hideError();
    }, 5000);
  }
}

// Hide error message
function hideError() {
  if (elements.errorContainer) {
    elements.errorContainer.classList.add("d-none");
  }
}

// Load last searched city on page load
window.addEventListener("DOMContentLoaded", () => {
  const lastCity = localStorage.getItem("lastCity");
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
window.addEventListener("offline", () => {
  showError("📡 You are offline. Please check your internet connection.");
  if (state.weatherData) {
    // Show cached data message
    const cachedAlert = document.createElement("div");
    cachedAlert.className = "alert alert-warning mt-3";
    cachedAlert.innerHTML = `
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Showing cached data</strong>
            <p class="mb-0 small">Connect to internet for latest updates.</p>
        `;
    document.querySelector(".container").prepend(cachedAlert);
  }
});

window.addEventListener("online", () => {
  hideError();
  // Remove cached data alert
  const cachedAlert = document.querySelector(".alert-warning");
  if (cachedAlert) {
    cachedAlert.remove();
  }

  if (state.currentCity) {
    // Reload weather data
    setTimeout(() => {
      loadWeather(state.currentCity);
    }, 1000);
  }
});

// Add page load animation
window.addEventListener("load", () => {
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.5s ease";

  setTimeout(() => {
    document.body.style.opacity = "1";
  }, 100);

  setTimeout(() => {
    document.body.style.transition = "";
  }, 600);

  // Add loaded class for additional animations
  document.body.classList.add("loaded");
});

// Prevent zoom on double tap (mobile optimization)
let lastTouchEnd = 0;
document.addEventListener(
  "touchend",
  function (event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  },
  { passive: false }
);

// Add service worker for PWA capabilities
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

// Add install prompt for PWA
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Show install button if needed
  setTimeout(() => {
    if (deferredPrompt) {
      showInstallPrompt();
    }
  }, 5000);
});

function showInstallPrompt() {
  // You can add an install button here
  console.log("PWA install available");
}

// Handle app installed
window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  console.log("PWA installed");
});
