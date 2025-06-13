let LAT = -6.2;
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

async function fetchTodayWeather() {
  const urlDaily = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
  const resDaily = await fetch(urlDaily);
  const dataDaily = await resDaily.json();

  const today = new Date().toISOString().split("T")[0];
  const indexToday = dataDaily.daily?.time?.indexOf(today);

  if (indexToday !== -1 && dataDaily.daily.weathercode[indexToday] !== undefined) {
    const code = dataDaily.daily.weathercode[indexToday];
    const max = dataDaily.daily.temperature_2m_max[indexToday];
    const min = dataDaily.daily.temperature_2m_min[indexToday];
    const { label, icon } = mapWeatherToIndoCategory(code);

    document.getElementById('today-weather').innerHTML = `
      <div class="weather-card">
        <div class="date">Hari ini (${today})</div>
        <img src="${icon}" alt="ikon cuaca">
        <div class="temp">${label}<br>Max: ${max}°C<br>Min: ${min}°C</div>
      </div>
    `;
  } else {
    // fallback ke hourly
    const urlHourly = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&hourly=temperature_2m,weathercode&timezone=auto`;
    const resHourly = await fetch(urlHourly);
    const dataHourly = await resHourly.json();

    const now = new Date();
    const nowHour = now.getHours();
    const todayStr = now.toISOString().split("T")[0];
    const hourlyTime = dataHourly.hourly.time;
    const index = hourlyTime.findIndex(t => t.startsWith(todayStr) && t.includes(`${String(nowHour).padStart(2, '0')}:00`));

    if (index !== -1) {
      const temp = dataHourly.hourly.temperature_2m[index];
      const code = dataHourly.hourly.weathercode[index];
      const { label, icon } = mapWeatherToIndoCategory(code);

      document.getElementById('today-weather').innerHTML = `
        <div class="weather-card">
          <div class="date">Hari ini (${todayStr}, pukul ${nowHour}:00)</div>
          <img src="${icon}" alt="ikon cuaca">
          <div class="temp">${label}<br>Suhu: ${temp}°C</div>
        </div>
      `;
    } else {
      document.getElementById('today-weather').innerHTML = `<p>Data cuaca belum tersedia untuk jam ini.</p>`;
    }
  }
}

async function fetchWeather(date) {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${LAT}&longitude=${LON}&start_date=${date}&end_date=${date}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
  const res = await fetch(url);
  return await res.json();
}

function setupDatePicker() {
  const input = document.getElementById('date-picker');
  const today = new Date();
  const maxDate = today.toISOString().split('T')[0];
  const minDate = new Date(today.setFullYear(today.getFullYear() - 1)).toISOString().split('T')[0];

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

async function searchLocationByName(name) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.length > 0) {
    LAT = parseFloat(data[0].lat);
    LON = parseFloat(data[0].lon);
    document.getElementById("location-result").textContent = `Lokasi ditemukan: ${data[0].display_name}`;
    fetchTodayWeather(); // perbarui cuaca hari ini berdasarkan lokasi baru
  } else {
    document.getElementById("location-result").textContent = "Lokasi tidak ditemukan.";
  }
}

function setupLocationSearch() {
  document.getElementById('search-button').addEventListener('click', () => {
    const locationName = document.getElementById('location-input').value;
    if (locationName.trim() !== "") {
      searchLocationByName(locationName);
    }
  });
}

// Inisialisasi
setupLocationSearch();
setupDatePicker();
fetchTodayWeather(); // tampilkan cuaca hari ini saat load
