const city_name = document.querySelector('.name');
const temperature = document.querySelector('.temp');
const weather = document.querySelector('.weather');
const wind = document.querySelector('.wind');
const err_bar = document.querySelector('.err');
const form = document.querySelector('form');
const input = document.querySelector('input');
const icon = document.querySelector('.icon')
const temp_feels_like = document.querySelector('.temp_feels_like')
const sunrise = document.querySelector('.sunrise');
const sunset = document.querySelector('.sunset')
const forecast_dates = document.querySelectorAll('.forecast_date')
const forecast_temps = document.querySelectorAll('.forecast_temp')
const forecast_weathers = document.querySelectorAll('.forecast_weather')

async function getWeather(city) {
  try {
    input.style.borderColor = 'black'
    const starttimer = Date.now()
    clearEntries()
    city_name.textContent = 'loading now...'
    let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&lang=en&appid=be2261b09598bb533e609e98c10fcace&units=metric`, { mode: 'cors' })
    let data = await response.json();
    console.log(data);
    showData(data);
    console.log(`Elapsed Time: ${(Date.now() - starttimer) / 1000} s`)
  } catch (err) {
    err_bar.textContent = 'City Not Found'
    input.style.borderColor = 'red'
  }
}

function showData(data) {
  city_name.textContent = data.name
  temperature.textContent = `${data.main.temp} °`
  temp_feels_like.textContent = `${data.main.feels_like} °`
  weather.textContent = capitalizeLetters(data.weather[0].description);
  icon.alt = data.weather[0].description;
  icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
  wind.textContent = `${data.wind.speed} m/s`
  sunrise.textContent = getTime(data.sys.sunrise, data.timezone)
  sunset.textContent = getTime(data.sys.sunset, data.timezone)
}

function clearEntries() {
  city_name.textContent = '';
  temperature.textContent = '';
  temp_feels_like.textContent = '';
  weather.textContent = '';
  wind.textContent = '';
  err_bar.textContent = '';
  icon.src = '';
  icon.alt = '';
  sunrise.textContent = '';
  sunset.textContent = '';
};

function capitalizeLetters(str) {
  let [word1, word2] = str.split(' ');
  let word1Cap = word1.charAt(0).toUpperCase();
  let word2Cap = word2.charAt(0).toUpperCase();
  return `${word1Cap}${word1.slice(1)} ${word2Cap}${word2.slice(1)}`;
}

function getTime(unixTime, timezone, d = '') {
  let convertedTime = new Date((unixTime + timezone) * 1000)
  if (d === '') {
    let [hour, min] = [convertedTime.getUTCHours(), convertedTime.getUTCMinutes()]
    hour < 10 ? hour = '0' + hour : hour
    min < 10 ? min = '0' + min : min
    return `${hour}:${min}`
  } else if (d === 'd') {
    const monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May',
      'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    let month = convertedTime.getUTCMonth()
    let date = convertedTime.getUTCDate()
    return `${monthArray[month]} ${date}`
  } else {
    throw Error('Parameter d must be either \'\' or \'d\'.')
  }
}

(function searchCity() {
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    let formData = new FormData(form)
    let city;
    for (const [name, value] of formData) { city = value };
    getWeather(city)
  });
})();

(async function rotate_city() {
  //let list = ['brighton', 'miami', 'nagano', 'hiroshima', 'glasgow', 'castleford', 'beirut', 'kolkata', 'riyadh']
  let list = ['hiroshima']
  while (true) {
    getWeather(list[0])
    await new Promise(resolve => setTimeout(resolve, 500000));
    list.push(list.shift());
  }
})();

(async function getForecast(city) {
  try {
    let response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&lang=en&appid=be2261b09598bb533e609e98c10fcace&units=metric`, { mode: 'cors' });
    let data = await response.json();
    console.log(data);
    //
    let localTimeZone = data.city.timezone
    let localDate = getTime(Math.floor(Date.now() / 1000), localTimeZone, 'd')
    //console.log(localDate)
    for (let indexNewDay = 0; indexNewDay <= 7; indexNewDay++) {
      if (localDate !== getTime(data.list[indexNewDay].dt, localTimeZone, 'd')) {
        let tempArr = [];
        // The API only offers every 3-hour forecast over 5 days without local time conversion.
        // So I have to convert to local time based on city. 
        // Day 1, 'indexNewDay' is equal to the first time frame after a new day.
        for (let i = indexNewDay; i <= indexNewDay + 7; i++) {
          tempArr.push(data.list[i].main.temp)
        }
        document.querySelector('#fc_temp_day1').textContent =
          `${Math.min(...tempArr)} °/${Math.max(...tempArr)} °`
        tempArr = [] //clearout
        // Day 2
        for (let i = indexNewDay + 8; i <= indexNewDay + 15; i++) {
          tempArr.push(data.list[i].main.temp)
        }
        document.querySelector('#fc_temp_day2').textContent =
          `${Math.min(...tempArr)} °/${Math.max(...tempArr)} °`
        tempArr = [] //clearout
        // Day 3
        for (let i = indexNewDay + 16; i <= indexNewDay + 23; i++) {
          tempArr.push(data.list[i].main.temp)
        }
        document.querySelector('#fc_temp_day3').textContent =
          `${Math.min(...tempArr)} °/${Math.max(...tempArr)} °`
        // Day 3 OVER
      }
    }
    //
    showForecast(data)
  } catch (err) {
    console.log(err);
  };
})('honolulu');

function showForecast(data) {
  let arrayIndex = 5;
  forecast_dates.forEach(f_date => {
    f_date.textContent = getTime(data.list[arrayIndex].dt, data.city.timezone, 'd')
    arrayIndex += 8;
  })
}
