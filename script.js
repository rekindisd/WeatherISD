let LAT = -6.2;  // default Jakarta
let LON = 106.8;

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

async function fetchWeather(date) {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${LAT}&longitude=${LON}&start_date=${date}&end_date=${date}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
  const res = await fetch(url);
  return await res.json();
}

function setupMap() {
  const map = L.map('map').setView([LAT, LON], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  let marker = L.marker([LAT, LON]).addTo(map);

  map.on('click', function (e) {
    LAT = e.latlng.lat;
    LON = e.latlng.lng;
    marker.setLatLng(e.latlng);
    console.log(`Lokasi dipilih: ${LAT}, ${LON}`);
  });
}

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

setupMap();
setupDatePicker();
