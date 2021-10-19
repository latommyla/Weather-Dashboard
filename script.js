var city = ""
var citySearch = $("#citySearch")
var searchBtn = $("#searchBtn")
var clearBtn = $("#clearBtn")
var currentCity = $("#currentCity")
var currentTemperature = $("#temperature")
var currentWind = $("#windspeed")
var currentHumidity = $("#humidity")
var currentIndex = $("#uvindex")
var sCity = []

function find(c) {
  for (var i=0; i < sCity.length; i++) {
    if(c.toUpperCase()===sCity[i]) {
      return -1;
    }
  }
  return 1;
}

var apiKey = "cbd797a924ad0cf3d6679e50d79ed644"

function displayWeather(event) {
  event.preventDefault();
  if(citySearch.val().trim()!=="") {
    city=citySearch.val().trim();
    currentWeather(city);
  }
}

function currentWeather(city) {
  var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + apiKey;
  
  fetch(queryURL)
    .then(function(response) {
      return response.json();
    })
    .then(function(response){

    var weathericon = response.weather[0].icon;
    var iconurl = "http://openweathermap.org/img/w/" +weathericon + ".png";
    var date = new Date(response.dt*1000).toLocaleDateString();

    $(currentCity).html(response.name + "("+date+")" + "<img src=" +iconurl+ ">");

    var tempF = (response.main.temp - 273.15) * 1.80 + 32;
    $(currentTemperature).html((tempF).toFixed(2) + "&#8457");
    $(currentHumidity).html(response.main.humidity + "%");
    var ws = response.wind.speed;
    var windsmph = (ws*2.237.toFixed(1));
    $(currentWind).html(windsmph + "MPH");

    UVIndex(response.coord.lon, response.coord.lat);
    forecast(response.id);
    if(response.cod === 200) {
      sCity = JSON.parse(localStorage.getItem("cityname"));
      console.log(sCity);
      if (sCity == null) {
        sCity = [];
        sCity.push(city.toUpperCase()
        );
        localStorage.setItem("cityname", JSON.stringify(sCity));
        addToList(city);
      } else {
        if(find(city) > 0) {
          sCity.push(city.toUpperCase());
          localStorage.setItem("cityname", JSON.stringify(sCity));
          addToList(city);
        }
      }
    }
  })
}

function UVIndex(ln, lt) {
  var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + lt + "&lon=" + ln;
  fetch(uvURL)
    .then(function(response) {
      $(currentIndex).html(response.value);
  });
}

function forecast(cityid) {
  var dayover = false;
  var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + apiKey;
  fetch(forecastURL)
    .then(function(response) {
      return response.json();
    })
    .then(function(response) {
      console.log(response)

    for (i = 0; i < 5; i++) {
      var date = new Date((response.list[((i+1) * 8) -1].dt) *1000).toLocaleDateString();
      var iconcode = response.list[((i+1) * 8) -1].weather[0].icon;
      var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
      var tempK = response.list[((i+1) * 8) -1].main.temp;
      var tempF = (((tempK - 273.5) * 1.80) + 32).toFixed(2);
      var humidity = response.list[((i+1) * 8) -1].main.humidity;

      $("#date"+i).html(date);
      $("#image"+i).html("<img src="+iconurl+">");
      $("#temp"+i).html(tempF + "&#8457");
      $("#humid"+i).html(humidity + "%");
    }
  });
}

function addToList(c) {
  var listEl = $("<li>" + c.toUpperCase() + "</li>");
  $(listEl).attr("class", "list-group-item");
  $(listEl).attr("data-value", c.toUpperCase());
  $(".list-group").append(listEl);
}

function pastSearch(event) {
  var liEl = event.target;
  if (event.target.matches("li")){
    city = liEl.textContent.trim();
    currentWeather(city);
  }
}

function lastCity(){
  $("ul").empty();
  var sCity = JSON.parse(localStorage.getItem("cityname"));
  if(sCity !==null) {
    sCity = JSON.parse(localStorage.getItem("cityname"));
    for(i = 0; i < sCity.length; i++) {
      addToList(sCity[i]);
    }
    city = sCity[i-1];
    currentWeather(city);
  }
}

function clearHistory(event) {
  event.preventDefault();
  sCity = [];
  localStorage.removeItem("cityname");
  document.location.reload();  
}

$("#searchBtn").on("click", displayWeather);
$(document).on("click", pastSearch);
$(window).on("load", lastCity);
$("#clearBtn").on("click", clearHistory);