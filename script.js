// Weather App - Complete & Functional
// Author: Tanzeel Ahmed

// API Configuration
const API_KEY = "6a382ec6cb5712ccdb0b26e67db1698c";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// DOM Elements
const elements = {
  // Search
  searchField: document.getElementById("searchField"),
  searchBtn: document.getElementById("searchBtn"),
  locationBtn: document.getElementById("locationBtn"),

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
};

// App State
const state = {
  currentCity: "London",
  unit: "metric",
  theme: localStorage.getItem("theme") || "dark",
  weatherData: null,
};

// Initialize App
function initApp() {
  // Set theme
  document.documentElement.setAttribute("data-theme", state.theme);
  updateThemeButton();

  // Load default city
  loadWeather(state.currentCity);

  // Setup event listeners
  setupEventListeners();

  // Update time
  updateTime();
  setInterval(updateTime, 1000);
}

// Setup all event listeners
function setupEventListeners() {
  // Search button
  elements.searchBtn.addEventListener("click", () => {
    const city = elements.searchField.value.trim();
    if (city) {
      loadWeather(city);
    } else {
      showError("Please enter a city name");
    }
  });

  // Enter key in search field
  elements.searchField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      elements.searchBtn.click();
    }
  });

  // Location button
  elements.locationBtn.addEventListener("click", getCurrentLocation);

  // Quick city buttons
  document.querySelectorAll("[data-city]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const city = e.target.getAttribute("data-city");
      elements.searchField.value = city;
      loadWeather(city);
    });
  });

  // Theme toggle
  elements.themeToggle.addEventListener("click", toggleTheme);

  // Error dismiss
  document
    .querySelector('[data-bs-dismiss="alert"]')
    ?.addEventListener("click", hideError);
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

    // Save to localStorage
    localStorage.setItem("lastCity", city);
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
    }
    throw new Error("Unable to fetch weather data. Please try again.");
  }

  return await response.json();
}

// Fetch forecast
async function fetchForecast(city) {
  const url = `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=${state.unit}`;
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
  const tempPosition = ((temp - tempMin) / tempRange) * 100;
  elements.tempProgress.style.width = `${tempPosition}%`;

  // Update background based on weather
  updateWeatherBackground(data.weather[0].main);
}

// Update forecast display
function updateForecast(data) {
  // Clear existing content
  elements.hourlyForecast.innerHTML = "";
  elements.forecastDays.innerHTML = "";

  // Group forecast by day
  const dailyForecasts = {};
  const now = new Date();

  data.list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString("en-US", { weekday: "long" });

    if (!dailyForecasts[day]) {
      dailyForecasts[day] = {
        temps: [],
        weather: [],
        time: date,
      };
    }

    dailyForecasts[day].temps.push(item.main.temp);
    dailyForecasts[day].weather.push(item.weather[0]);

    // Add to hourly forecast for today
    if (date.getDate() === now.getDate()) {
      addHourlyForecastItem(date, item);
    }
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
        <div class="hour-time">${hour}:00</div>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}" class="hour-icon">
        <div class="hour-temp">${temp}°</div>
        <div class="hour-desc">${desc}</div>
    `;

  elements.hourlyForecast.appendChild(hourDiv);
}

// Add daily forecast item
function addDailyForecastItem(day, data, isToday) {
  const dayDiv = document.createElement("div");
  dayDiv.className = "forecast-day fade-in";

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

  dayDiv.innerHTML = `
        <div class="day-name">${isToday ? "Today" : day}</div>
        <div class="forecast-temp">
            <div class="weather-icon-small">
                <img src="https://openweathermap.org/img/wn/${
                  data.weather[0].icon
                }.png" alt="${mostCommonWeather}" width="40">
            </div>
            <div class="temp-range">
                <span class="temp-high">${maxTemp}°</span>
                <span class="temp-low">${minTemp}°</span>
            </div>
        </div>
    `;

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
          elements.searchField.value = city;
          await loadWeather(city);
        } else {
          // Use coordinates directly
          const url = `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${state.unit}`;
          const response = await fetch(url);
          const data = await response.json();

          elements.searchField.value = data.name;
          loadWeather(data.name);
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

// Toggle theme
function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", state.theme);
  localStorage.setItem("theme", state.theme);
  updateThemeButton();
}

// Update theme button icon
function updateThemeButton() {
  const sunIcon = elements.themeToggle.querySelector(".bi-sun-fill");
  const moonIcon = elements.themeToggle.querySelector(".bi-moon-fill");

  if (state.theme === "dark") {
    sunIcon.classList.add("d-none");
    moonIcon.classList.remove("d-none");
  } else {
    sunIcon.classList.remove("d-none");
    moonIcon.classList.add("d-none");
  }
}

// Update time
function updateTime() {
  const now = new Date();
  elements.currentTime.textContent = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
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
      body.classList.add("weather-bg-mist");
      break;
  }
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
  elements.loadingSpinner.classList.remove("d-none");
  document.body.style.overflow = "hidden";
}

// Hide loading spinner
function hideLoading() {
  elements.loadingSpinner.classList.add("d-none");
  document.body.style.overflow = "";
}

// Show error message
function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorContainer.classList.remove("d-none");
}

// Hide error message
function hideError() {
  elements.errorContainer.classList.add("d-none");
}

// Load last searched city on page load
window.addEventListener("DOMContentLoaded", () => {
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    elements.searchField.value = lastCity;
    state.currentCity = lastCity;
  }
  initApp();
});

// Handle offline/online status
window.addEventListener("offline", () => {
  showError("You are offline. Please check your internet connection.");
});

window.addEventListener("online", () => {
  hideError();
  if (state.currentCity) {
    loadWeather(state.currentCity);
  }
});

// Export for testing if needed
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    loadWeather,
    getCurrentLocation,
    toggleTheme,
  };
}
