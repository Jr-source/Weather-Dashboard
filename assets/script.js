var searchBtnEl = $("#searchBtn");
var citySearchEl = $("#citySearch");
var cityEl = $("#city");
var temperatureEl = $("#temperature");
var humidityEl = $("#humidity");
var windspeedEl = $("#windSpeed");
var uvIndexEl = $("#uvIndex");

var apiKey = "ab666ba57468937b08060e1bacb28d8d";
var cityName;

var todayDate = moment().format("L");

var storedCity = JSON.parse(localStorage.getItem("searchedCity")) || [];
renderSearchedCities(storedCity);

function firstLetterCapital(str) {
  str = str.toLowerCase().split(" ");

  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }

  return str.join(" ");
}

searchBtnEl.on("click", function () {
  cityName = firstLetterCapital(citySearchEl.val());
  $(".hidden").removeClass("hidden");

  if (!storedCity.includes(cityName)) {
    var listCitiesBtn = $("<button>")
      .addClass("btn text-left border border-danger rounded")
      .attr("data-city", storedCity)
      .text(cityName);
    $("#searchedCities").prepend(listCitiesBtn);
    storedCity.push(cityName);
    saveToLocalstorage(storedCity);
  }
  makeWeatherRequest(cityName);
});

function saveToLocalstorage(storedCity) {
  localStorage.setItem("searchedCity", JSON.stringify(storedCity));
}

function renderSearchedCities(storedCity) {
  if (storedCity) {
    for (var i = 0; i < storedCity.length; i++) {
      var listCitiesBtn = $("<button>")
        .addClass("btn text-left border border-danger rounded")
        .attr("data-city", storedCity[i])
        .text(storedCity[i]);
      $("#searchedCities").prepend(listCitiesBtn);
    }
  }
}

$("#savedCity").on("click", "button", function () {
  var cityBtnClick = $(this).data("city");
  $(".hidden").removeClass("hidden");
  makeWeatherRequest(cityBtnClick);
});

function makeWeatherRequest(cityName) {
  
  var queryUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&appid=" +
    apiKey;
  $.ajax({
    url: queryUrl,
    method: "GET",
  }).then(function (response) {
    currentWeather(response);
  });
}

function currentWeather(response) {
  var cityValue = response.name;
  var iconValue = $("<img>")
    .attr(
      "src",
      "https://openweathermap.org/img/wn/" + response.weather[0].icon + ".png"
    )
    .addClass("bg-primary rounded");
  var tempValue = (response.main.temp - 273.15) * 1.8 + 32;
  var humidityValue = response.main.humidity;
  var windSpeedValue = response.wind.speed;

  var latValue = response.coord.lat;
  var lonValue = response.coord.lon;

  cityEl.text(cityValue + " (" + todayDate + " ) ");
  cityEl.append(iconValue);
  temperatureEl.text("Temperature: " + tempValue.toFixed(1) + " °F");
  humidityEl.text("Humidity: " + humidityValue + "%");
  windspeedEl.text("Wind Speed: " + windSpeedValue);

  uvIndexWeather(latValue, lonValue);
  forecastWeather(latValue, lonValue);
}

function uvIndexWeather(latValue, lonValue) {
  var uvIndexQueryUrl =
    "https://api.openweathermap.org/data/2.5/uvi?lat=" +
    latValue +
    "&lon=" +
    lonValue +
    "&appid=" +
    apiKey;
  $.ajax({
    url: uvIndexQueryUrl,
    method: "GET",
  }).then(function (uvData) {
    uvIndexEl.text("UV Index: " + uvData.value);
  });
}

function forecastWeather(latValue, lonValue) {
  var fiveDayForcastQueryUrl =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    latValue +
    "&lon=" +
    lonValue +
    "&exclude=minutely,hourly&appid=" +
    apiKey;
  $.ajax({
    url: fiveDayForcastQueryUrl,
    method: "GET",
  }).then(function (fiveDay) {
    var i = fiveDay.daily.length;

    for (var i = 1; i < 6; i++) {
      $("#date" + [i]).text(moment.unix(fiveDay.daily[i].dt).format("L"));

      $("#imgDate" + [i])
        .attr(
          "src",
          "https://openweathermap.org/img/wn/" +
            fiveDay.daily[i].weather[0].icon +
            ".png"
        )
        .addClass("bg-primary rounded");

      var maxTemp = fiveDay.daily[i].temp.max;
      var minTemp = fiveDay.daily[i].temp.min;
      $("#tempDate" + [i]).text(
        "Temp: " + (((maxTemp + minTemp) / 2 - 273.15) * 1.8 + 32).toFixed(1)
      );

      $("#humidityDate" + [i]).text("Humidity: " + fiveDay.daily[i].humidity);
    }
  });
}
