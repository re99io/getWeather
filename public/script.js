(async function () {
  
  const formEl = document.querySelector('form')
  const weatherInfoEl = document.querySelector('#weather-info')
  const citiesListEl = document.querySelector('#citiesList')
  let citiesArray = localStorage.getItem('cities') ? JSON.parse(localStorage.getItem('cities')) : []
 
  async function getCityFromGeoData() {
    try {
      const response = await axios.get('https://get.geojs.io/v1/ip/geo.json')
      return response.data.city
    } catch (error) {
      console.error(error.message)
    }
  }

  const cityFromGeoData = await getCityFromGeoData()

  async function getWeatherData(cityName) {
    try {
      const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${cityName}&appid=c768bc4e962d2a69c28ba404045dc96c`
      )
      return response.data
    } catch (error) {
      console.error(error.message)
    }
  }

  const weatherInCityFromGeoData = await getWeatherData(cityFromGeoData)  

  function showWeather(el, weatherInfo) {
    if (weatherInfo) {
      const weatherIconCode = weatherInfo.weather[0].icon
      el.innerHTML = ''
      const cityEl = document.createElement('h3')
      const tempEl = document.createElement('h3')
      const picEl = document.createElement('img')
      cityEl.innerText = weatherInfo.name
      cityEl.id = 'city'
      tempEl.innerText = weatherInfo.main.temp
      tempEl.id = 'temp'
      picEl.src = `http://openweathermap.org/img/wn/${weatherIconCode}.png`
      el.append(cityEl)
      el.append(tempEl)
      el.append(picEl)      

    } 
    else {
      el.innerHTML = ''
      const errorEl = document.createElement('p')
      errorEl.innerText = 'No weather data received'
      el.prepend(errorEl)
    }
  }
 
  function editElStyleBorder(el, cities) {
    if (cities[0]) {el.style['border-radius'] = ''}
    else {el.style['border-radius'] = '0px 0px 5px 5px'}
  }
  
  editElStyleBorder(weatherInfoEl, citiesArray)
  showWeather(weatherInfoEl, weatherInCityFromGeoData)  

  function saveCitiesToStorage(cities) {
    localStorage.setItem('cities', JSON.stringify(cities))
  }

  function drawCitiesList(el, cities) {
    el.innerHTML = ''
    cities.forEach(cityInArray => {
      const li = document.createElement('li')
      li.textContent = cityInArray
      li.addEventListener('click', async () => {
        const weatherData = await getWeatherData(cityInArray)
        showWeather(weatherInfoEl, weatherData)
      })
      el.appendChild(li)
    })
  }

  drawCitiesList(citiesListEl, citiesArray)

  formEl.addEventListener('submit', async (event) => {

    event.preventDefault()

    const formElement = event.target
    const inputEl = formElement.querySelector('input')
    const cityName = inputEl.value
    inputEl.value = ''

    const weatherData = await getWeatherData(cityName)
    showWeather(weatherInfoEl, weatherData)

    if (weatherData) {
    citiesArray.unshift(weatherData.name)
    citiesArray = [...new Set(citiesArray)]
    editElStyleBorder(weatherInfoEl, citiesArray)
    
    if (citiesArray.length > 10) citiesArray.pop()

    drawCitiesList(citiesListEl, citiesArray)

    saveCitiesToStorage(citiesArray) 
    }
    
  })

})()
