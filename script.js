// API Configuration
const API_KEY = "6a382ec6cb5712ccdb0b26e67db1698c";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// DOM Elements
const searchBtn = document.getElementById("searchBtn");
const searchField = document.getElementById("searchField");
const locationBtn = document.getElementById("locationBtn");
const cityName = document.getElementById("cityName");
const currentDate = document.getElementById("currentDate");
const temperatureDiv = document.getElementById("temperature");
const weatherDetails = document.getElementById("weatherDetails");
const errorContainer = document.getElementById("errorContainer");
const errorMessage = document.getElementById("errorMessage");
const cityTags = document.querySelectorAll(".city-tag");

// Weather detail elements
const feelsLikeElement = weatherDetails.querySelector(
  ".detail-item:nth-child(1) h5"
);
const windElement = weatherDetails.querySelector(
  ".detail-item:nth-child(2) h5"
);
const humidityElement = weatherDetails.querySelector(
  ".detail-item:nth-child(3) h5"
);
const sunriseElement = document.getElementById("sunrise");
const sunsetElement = document.getElementById("sunset");
const visibilityElement = document.getElementById("visibility");
const pressureElement = document.getElementById("pressure");
const lastUpdateElement = document.getElementById("lastUpdate");

// Format date
function formatDate() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return now.toLocaleDateString("en-US", options);
}

// Format time from timestamp
function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Convert meters to kilometers
function metersToKm(meters) {
  return (meters / 1000).toFixed(1);
}

// Show loading state
function showLoading() {
  temperatureDiv.innerHTML = `
        <div class="spinner-container">
            <div class="spinner-border text-light" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
}

// Show error message
function showError(message) {
  errorMessage.textContent = message;
  errorContainer.classList.remove("d-none");

  // Auto hide error after 5 seconds
  setTimeout(() => {
    errorContainer.classList.add("d-none");
  }, 5000);
}

// Hide error message
function hideError() {
  errorContainer.classList.add("d-none");
}

// Update weather display
function updateWeatherDisplay(data) {
  // Update city name and date
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  currentDate.textContent = formatDate();

  // Update temperature display
  temperatureDiv.innerHTML = `
        <div class="row align-items-center justify-content-center">
            <div class="col-auto">
                <img src="https://openweathermap.org/img/wn/${
                  data.weather[0].icon
                }@2x.png" 
                     alt="${data.weather[0].description}" 
                     class="weather-icon pulse">
            </div>
            <div class="col-auto">
                <h1 class="temp-display fw-bold">${Math.round(
                  data.main.temp
                )}°</h1>
            </div>
        </div>
        <div class="mt-2">
            <h3 class="weather-condition">${data.weather[0].description}</h3>
            <p class="mb-0">
                H: ${Math.round(data.main.temp_max)}° • 
                L: ${Math.round(data.main.temp_min)}°
            </p>
        </div>
    `;

  // Update weather details
  feelsLikeElement.textContent = `${Math.round(data.main.feels_like)}°`;
  windElement.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
  humidityElement.textContent = `${data.main.humidity}%`;

  // Update additional info
  sunriseElement.textContent = formatTime(data.sys.sunrise);
  sunsetElement.textContent = formatTime(data.sys.sunset);
  visibilityElement.textContent = `${metersToKm(data.visibility)} km`;
  pressureElement.textContent = `${data.main.pressure} hPa`;

  // Update last updated time
  lastUpdateElement.textContent = `Last updated: ${new Date().toLocaleTimeString(
    [],
    { hour: "2-digit", minute: "2-digit" }
  )}`;

  // Change background based on weather
  updateBackground(data.weather[0].main);

  // Add animation
  temperatureDiv.style.animation = "fadeIn 0.5s ease";
}

// Update background based on weather condition
function updateBackground(weatherCondition) {
  const body = document.body;
  let gradient = "";

  switch (weatherCondition.toLowerCase()) {
    case "clear":
      gradient = "linear-gradient(135deg, #f6d365 0%, #fda085 100%)";
      break;
    case "clouds":
      gradient = "linear-gradient(135deg, #a3bded 0%, #6991c7 100%)";
      break;
    case "rain":
    case "drizzle":
      gradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
      break;
    case "thunderstorm":
      gradient = "linear-gradient(135deg, #2c3e50 0%, #4a6491 100%)";
      break;
    case "snow":
      gradient = "linear-gradient(135deg, #e6dada 0%, #274046 100%)";
      break;
    case "mist":
    case "fog":
    case "haze":
      gradient = "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)";
      break;
    default:
      gradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  }

  body.style.background = gradient;
  body.style.transition = "background 1s ease";
}

// Fetch weather data
async function fetchWeatherData(city) {
  showLoading();
  hideError();

  try {
    const response = await fetch(
      `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error(
        "City not found. Please check the spelling and try again."
      );
    }

    const data = await response.json();
    updateWeatherDisplay(data);

    // Store last searched city in localStorage
    localStorage.setItem("lastCity", city);
  } catch (error) {
    showError(error.message);
    console.error("Error fetching weather data:", error);
  }
}

// Get weather by user's location
function getLocationWeather() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser");
    return;
  }

  showLoading();

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const response = await fetch(
          `${BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
          throw new Error("Unable to fetch location weather");
        }

        const data = await response.json();
        updateWeatherDisplay(data);
      } catch (error) {
        showError(error.message);
      }
    },
    (error) => {
      showError(
        "Unable to retrieve your location. Please enable location services."
      );
      console.error("Geolocation error:", error);
    }
  );
}

// Event Listeners
searchBtn.addEventListener("click", () => {
  const city = searchField.value.trim();
  if (city) {
    fetchWeatherData(city);
  } else {
    showError("Please enter a city name");
  }
});

searchField.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

locationBtn.addEventListener("click", getLocationWeather);

// Add click event to city tags
cityTags.forEach((tag) => {
  tag.addEventListener("click", () => {
    const city = tag.getAttribute("data-city");
    searchField.value = city;
    fetchWeatherData(city);
  });
});

// Load last searched city on page load
document.addEventListener("DOMContentLoaded", () => {
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    searchField.value = lastCity;
    fetchWeatherData(lastCity);
  } else {
    // Default city
    fetchWeatherData("London");
  }

  // Add animation to weather card
  document.querySelector(".weather-card").style.animation = "fadeIn 0.8s ease";
});
