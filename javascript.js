const city_name = document.querySelector('.name');
const temperature = document.querySelector('.temp');
const weather_card = document.querySelector('.weather_card');
const weather = document.querySelector('.weather');
const wind = document.querySelector('.wind');
const err_bar = document.querySelector('.err');
const form = document.querySelector('form');
const input = document.querySelector('input');
const icon = document.querySelector('.icon')
const temp_feels_like = document.querySelector('.temp_feels_like')
const sunrise = document.querySelector('.sunrise');
const sunset = document.querySelector('.sunset')
const forecast_cards = document.querySelectorAll('.forecast_cards')
const forecast_dates = document.querySelectorAll('.forecast_date')
const forecast_temps = document.querySelectorAll('.forecast_temp')
const forecast_weathers = document.querySelectorAll('.forecast_weather')

async function getWeather(city) {
  try {
    input.style.borderColor = 'black'
    const starttimer = Date.now()
    clearEntries()
    let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&lang=en&appid=be2261b09598bb533e609e98c10fcace&units=metric`, { mode: 'cors' })
    let data = await response.json();
    console.log(data);
    showData(data);
    console.log(`Elapsed Time: ${(Date.now() - starttimer) / 1000} s`)
  } catch (err) {
    console.log(err)
    err_bar.textContent = 'Something Wrong :/'
    input.style.borderColor = 'red'
  }
};

function showData(data) {
  city_name.textContent = data.name
  temperature.textContent = `${data.main.temp} °`
  temp_feels_like.textContent = `${data.main.feels_like} °`
  weather.textContent = capitalizeLetters(data.weather[0].description);
  wind.textContent = `${data.wind.speed} m/s`
  sunrise.textContent = getTime(data.sys.sunrise, data.timezone)
  sunset.textContent = getTime(data.sys.sunset, data.timezone)
  icon.alt = data.weather[0].description;
  icon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
  showBackground(data.weather[0].icon, weather_card)
};

function showBackground(data, card) {
  switch (data) {
    case '01d': case '01n': case '02d': case '02n':
      card.style.cssText = "background-image: url(sunny.jpg)";
      break;
    case '03d': case '03n': case '04d': case '04n':
      card.style.cssText = "background-image: url(cloud.gif)";
      break;
    case '09d': case '09n': case '10d': case '10n': case '11d': case '11n':
      card.style.cssText = "background-image: url(rain.gif)";
      break;
    case '13d': case '13n':
      card.style.cssText = "background-image: url(snow.gif)";
      break;
    case '50d': case '50n':
      card.style.cssText = "background-image: url(haze.webp)";
      break;
  }
}

function clearEntries() {
  city_name.textContent = 'loading now...'
  temperature.textContent = '-';
  temp_feels_like.textContent = '-';
  weather.textContent = '';
  wind.textContent = '-';
  err_bar.textContent = '';
  icon.src = '';
  icon.alt = '';
  sunrise.textContent = '-';
  sunset.textContent = '-';
};

function capitalizeLetters(str) {
  if (/\s/.test(str)) {
    let [word1, word2] = str.split(' ');
    let word1Cap = word1.charAt(0).toUpperCase();
    let word2Cap = word2.charAt(0).toUpperCase();
    return `${word1Cap}${word1.slice(1)} ${word2Cap}${word2.slice(1)}`;
  }
  wordCap = str.charAt(0).toUpperCase();
  return `${wordCap}${str.slice(1)}`
};

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
    getForecasts(city)
  });
})();

(async function rotate_city() {
  let list = ['brighton', 'Tromsø', 'nagano', 'hiroshima', 'sydney', 'yekaterinburg', 'cape town', 'kolkata', 'jeddah', 'sapporo']
  //let list = ['miami,us']
  while (true) {
    getWeather(list[0])
    getForecasts(list[0])
    await new Promise(resolve => setTimeout(resolve, 5000));
    list.push(list.shift()); //rotate by moving list[0] to list[-1]
  }
})();

function clearEntriesForecasts() {
  forecast_dates.forEach((f_date) => {
    f_date.textContent = '-'
  })
  forecast_temps.forEach((f_temp) => {
    f_temp.textContent = '-'
  })
  forecast_weathers.forEach((f_weather) => {
    f_weather.src = ''
  })
}

async function getForecasts(city) {
  try {
    clearEntriesForecasts()
    const starttimer = Date.now()
    let response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&lang=en&appid=be2261b09598bb533e609e98c10fcace&units=metric`, { mode: 'cors' });
    let data = await response.json();
    console.log(data);
    let localTimeZone = data.city.timezone //a number
    let localDate = getTime(Math.floor(Date.now() / 1000), localTimeZone, 'd')
    // indexNewDay < 7 coz here we need to find the next day based on timezones where the cities are.
    // if a place is now at 0:00, the frames would be 3,6,9,12,15,18,21,0(next day)
    // if a place is now @ 23:59, frames would be 0(next day)
    for (let indexNewDay = 0; indexNewDay <= 7; indexNewDay++) {
      if (localDate !== getTime(data.list[indexNewDay].dt, localTimeZone, 'd')) {
        let tempArr = [];
        // The API only offers every 3-hour forecast over 5 days without local time conversion.
        // So I have to convert to local time based on city. 
        // 'indexNewDay': an index that points to the first time frame after a new day.
        forecast_dates.forEach((f_date, index) => {
          let dateIndex = indexNewDay + index * 8;
          f_date.textContent = getTime(data.list[dateIndex].dt, localTimeZone, 'd')
        })

        for (let i = indexNewDay; i <= indexNewDay + 23; i++) {
          //indexNewDay doesn't come form 0, but tempArr does
          tempArr.push([data.list[i].main.temp]) 
        } //tempArr is neccessary coz we need find max and min
        forecast_temps.forEach((f_temp, index) => {
          //0,8; 8,16; 16,24; three days
          let tempForTheDay = tempArr.slice(index * 8, index * 8 + 8)
          f_temp.textContent = `${Math.min(...tempForTheDay)} °/ ${Math.max(...tempForTheDay)} °`
        }) 

        forecast_weathers.forEach((f_weather, index) => {
          //index at 12:00, 4, 12, 20
          let noonIndex = indexNewDay + index * 8 + 4
          f_weather.src = `https://openweathermap.org/img/wn/${data.list[noonIndex].weather[0].icon}.png`
        })

        forecast_cards.forEach((card, index) => {
          let noonIndex = indexNewDay + index * 8 + 4;
          showBackground(data.list[noonIndex].weather[0].icon, card)
        })
        console.log(`Elapsed Time: ${(Date.now() - starttimer) / 1000} s`)
        return;
      }
    }
  } catch (err) {
    console.log(err);
  };
}
