const city_name = document.querySelector('.name');
const temperature = document.querySelector('.temp');
const weather = document.querySelector('.weather');
const wind = document.querySelector('.wind');
const err_bar = document.querySelector('.err');
const form = document.querySelector('form');
const input = document.querySelector('input');
const icon = document.querySelector('.icon')
const temp_feels_like = document.querySelector('temp_feels_like')
const sunrise = document.querySelector('.sunrise');
const sunset = document.querySelector('.sunset')

async function getWeather(city) {
  try {
    input.style.borderColor = 'black'
    const starttimer = Date.now()
    clearEntries()
    city_name.textContent = 'loading now...'
    let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&lang=en&appid=be2261b09598bb533e609e98c10fcace&units=metric`, {mode: 'cors'})
    let data = await response.json();
    console.log(data);
    showData(data);
    console.log(`Elapsed Time: ${ (Date.now() - starttimer) / 1000} s`)
  } catch(err) {
    err_bar.textContent = 'City Not Found'
    input.style.borderColor = 'red'
  }
}

function showData(data) {
  city_name.textContent = data.name
  temperature.textContent = `${data.main.temp} °C`
  weather.textContent = data.weather[0].description;
  icon.alt = data.weather[0].description;
  icon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
  wind.textContent = `Wind Speed: ${data.wind.speed} m/s`
  sunrise.textContent = getTime(data.sys.sunrise, data.timezone)
  sunset.textContent = getTime(data.sys.sunset, data.timezone)
}

function clearEntries() {
  city_name.textContent = '';
  temperature.textContent = '';
  weather.textContent = '';
  wind.textContent = '';
  err_bar.textContent = '';
  icon.src = '';
  icon.alt = '';
  sunrise.textContent = '';
  sunset.textContent = '';
};


function getTime(unixTime, timezone) {
  let convertedTime = new Date((unixTime + timezone) * 1000)
  let hour = convertedTime.getUTCHours()
  let min = convertedTime.getUTCMinutes()
  let time = `${hour}:${min}`
  return time
}

(function searchCity() {
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    let formData = new FormData(form)
    let city;
    for (const [name,value] of formData) {city = value};
    getWeather(city)
  });
})();

(async function rotate_city() {
  //let list = ['brighton', 'miami', 'nagano', 'hiroshima', 'glasgow', 'castleford', 'beirut', 'kolkata', 'riyadh']
  let list = ['brighton']
  while (true) {
    getWeather(list[0])
    await new Promise(resolve => setTimeout(resolve, 500000));
    list.push(list.shift());
  }
})()
