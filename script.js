let LAT = -6.2;
let LON = 106.8;

// Fungsi ubah kode cuaca menjadi kategori Indonesia + ikon
function mapWeatherToIndoCategory(code) {
  if ([0, 1].includes(code)) return { label: "Cerah", icon: "https://cdn-icons-png.flaticon.com/512/869/869869.png" };
  if ([2, 3, 45, 48].includes(code)) return { label: "Berawan", icon: "https://cdn-icons-png.flaticon.com/512/414/414825.png" };
  if ([51, 53, 55, 56, 57, 61, 63, 66, 67, 71, 73, 77, 80, 81, 85, 86].includes(code)) {
    return { label: "Hujan Ringan", icon: "https://cdn-icons-png.flaticon.com/512/1163/1163657.png" };
  }
  if ([65, 82, 95, 96, 99].includes(code)) {
    return { label: "Hujan Lebat", icon: "https://cdn-icons-png.flaticon.com/512/1146/1146869.png" };
  }
  return { label: `Kode tidak dikenali (${code})`, icon: "https://cdn-icons-png.flaticon.com/512/414/414825.png" };
}

// Ambil data cuaca dari Open-Meteo berdasarkan tanggal
async function fetchWeather(date) {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${LAT}&longitude=${LON}&start_date=${date}&end_date=${date}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
  const res = await fetch(url);
  return await res.json();
}

// Ambil nama lokasi dari koordinat (reverse geocoding)
async function getLocationName(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  const address = data.address;
  return address.city || address.town || address.village || address.county || "Lokasi Tidak Dikenal";
}

// Tampilkan cuaca hari ini
async function showTodayWeather() {
  const today = new Date().toISOString().split('T')[0];
  const data = await fetchWeather(today);
  const code = data.daily.weathercode[0];
  const max = data.daily.temperature_2m_max[0];
  const min = data.daily.temperature_2m_min[0];
  const { label, icon } = mapWeatherToIndoCategory(code);

  document.getElementById('weather-today').innerHTML = `
    <div class="weather-card">
      <div class="date">${today}</div>
      <img src="${icon}" alt="ikon cuaca">
      <div class="temp">${label}<br>Max: ${max}°C<br>Min: ${min}°C</div>
    </div>
  `;
}

// Setup kalender dan tampilkan cuaca berdasarkan tanggal
function setupDatePicker() {
  const input = document.getElementById('date-picker');
  const today = new Date();
  const maxDate = today.toISOString().split('T')[0];
  const minDate = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];

  input.max = maxDate;
  input.min = minDate;

  input.addEventListener('change', async () => {
    const date = input.value;
    if (!date) return;

    const data = await fetchWeather(date);
    const code = data.daily.weathercode[0];
    const max = data.daily.temperature_2m_max[0];
    const min = data.daily.temperature_2m_min[0];
    const { label, icon } = mapWeatherToIndoCategory(code);

    document.getElementById('selected-weather').innerHTML = `
      <div class="weather-card">
        <div class="date">${date}</div>
        <img src="${icon}" alt="ikon cuaca">
        <div class="temp">${label}<br>Max: ${max}°C<br>Min: ${min}°C</div>
      </div>
    `;
  });
}

// Deteksi lokasi pengguna
function detectLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        LAT = pos.coords.latitude;
        LON = pos.coords.longitude;
        const locationName = await getLocationName(LAT, LON);
        document.querySelector("h2").innerHTML = `Cuaca Hari Ini – <span style="color:#555">${locationName}</span>`;
        init();
      },
      async () => {
        console.warn("Gagal mendeteksi lokasi, menggunakan default Jakarta");
        const locationName = await getLocationName(LAT, LON);
        document.querySelector("h2").innerHTML = `Cuaca Hari Ini – <span style="color:#555">${locationName}</span>`;
        init();
      }
    );
  } else {
    console.warn("Geolocation tidak didukung browser");
    init();
  }
}

// Inisialisasi
function init() {
  showTodayWeather();
  setupDatePicker();
}

detectLocation();
