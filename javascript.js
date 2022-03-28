const city_name = document.querySelector('.name');
const temperature = document.querySelector('.temp');
const weather = document.querySelector('.weather');
const wind = document.querySelector('.wind');
const err_bar = document.querySelector('.err');
const form = document.querySelector('form');

async function getWeather(city) {
  try {
    const starttimer = Date.now()
    clearEntries()()
    let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&lang=en&appid=lol&units=metric`, {mode: 'cors'})
    //console.log(response)
    let data = await response.json();
    //console.log(data)
    city_name.textContent = data.name
    temperature.textContent = `${data.main.temp} .C`
    weather.textContent = data.weather[0].description
    wind.textContent = `Wind Speed: ${data.wind.speed} m/s`
    console.log(`Elapsed Time: ${ (Date.now() - starttimer) / 1000} s`)
  } catch(err) {
    err_bar.textContent = 'Please change your search words'
  }
}


form.addEventListener('submit', (e) => {
  e.preventDefault()
  let formData = new FormData(form)
  let city;
  for (const [name,value] of formData) {city = value};
  getWeather(city)
});

function clearEntries() {
  return function() {
      city_name.textContent = '';
      temperature.textContent = '';
      weather.textContent = '';
      wind.textContent = '';
      err_bar.textContent = '';  
  };
};

(async function rotate_city() {
  let list = ['brighton', 'miami', 'nagano', 'hiroshima', 'glasgow', 'castleford', 'beirut', 'kolkata', 'riyadh']
  while (true) {
    getWeather(list[0])
    await new Promise(resolve => setTimeout(resolve, 5000));
    list.push(list.shift());
  }
})()

//getWeather('brighton');

//fetch('https://api.openweathermap.org/data/2.5/weather?q=matsumoto&lang=en&appid=be2261b09598bb533e609e98c10fcace&units=metric', {mode: 'cors'})
//  .then((response) => {
//    return response.json()
//  }).then((data) => {
//    la_name.textContent = data.name
//    temperature.textContent = `${data.main.temp} .C`
//    weather.textContent = data.weather[0].description
//    wind.textContent = `Wind Speed: ${data.wind.speed} m/s`
//  }).catch(() => {
//    err_bar.textContent = 'Please change your search words'
//  })
