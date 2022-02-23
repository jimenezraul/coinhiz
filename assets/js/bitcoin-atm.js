// Set all the variables
var geoKey = "AIzaSyAY0aUhmoBFuEw8NhIcYCP9CsR5qj7wA6o";
var btcAtmSearch = document.querySelector("#btc-atm-search");
var city = document.querySelector("#city");
var atmInfoEl = document.querySelector("#atm-info");
var map;
var service;
var infowindow;
var isOpen = false;
var myLocation = document.querySelector("#my-location");
var message = document.querySelector("#message");
var loading = document.querySelector("#loading");
var apiKey = "2c55cf825b3d6637f09bec8a5d37fed0";
mapboxgl.accessToken =
  "sk.eyJ1IjoiamltZW5lenJhdWwiLCJhIjoiY2t6ejF0ZTR0MDYwZTNqcGE2ZHRzbXV5ZSJ9.6XDWP1pR9idnb_Vm9hgOGw";

// Orlando location
var latlng = {
  lat: 28.5383832,
  lng: -81.3789269,
};

// Get coordinates from city

function getGeo(place) {
  var url = `https://api.openweathermap.org/data/2.5/weather?q=${place}&appid=${apiKey}&units=imperial`;
  fetch(url)
    .then(function (response) {
      if (response.ok) {
        response.json().then(async function (data) {
          var coords = {
            lat: data.coord.lat,
            lng: data.coord.lon,
          };
          latlng = coords;
          initMap();
        });
      } else {
        // message on city not found
        message.textContent = "City not found";
      }
    })
    .catch(function (e) {
      // message on connection error
      message.textContent = "Check your connection and try again";
    });
}

// Initialize the map
function initMap() {
  loading.style.display = "none";
  var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/jimenezraul/ckzxacuvz001514levaifjas2",
    center: [latlng.lng, latlng.lat],
    zoom: 10,
  });

  map.on("click", (event) => {
    // If the user clicked on one of your markers, get its information.
    const features = map.queryRenderedFeatures(event.point, {
      layers: ["north-america"], // replace with your layer name
    });
    if (!features.length) {
      return;
    }
    const feature = features[0];
    const popup = new mapboxgl.Popup({ offset: [10, -15] })
      .setLngLat(feature.geometry.coordinates)
      .setHTML(
        `<h3>${feature.properties.name}</h3>
        <p>${feature.properties.description}</p>
        <p>${feature.properties.address}</p>`
      )
      .addTo(map);
    // Code from the next step will go here.
  });

  map.on("load", function () {
    getMarkers();
  });

  map.on("moveend", function () {
    getMarkers();
  });

  function getMarkers() {
    var features = map.queryRenderedFeatures({ layers: ["north-america"] });
    atmInfoEl.innerHTML = "";
    features.forEach((feature) => {
      createElement(feature.properties);
    });
  }
}

// Create Atm Info Element
function createElement(p) {
  const mapAdd = p.address.split("\n").join(" ");
  var photo;
  if (p.photos) {
    photo = p.photos[0].getUrl({ maxWidth: 200, maxHeight: 200 });
  } else {
    photo = "./assets/img/200x200-bitcoin.png";
  }

  var place = {
    name: p.name,
    address: p.address,
    photo: photo,
    url: "https://www.google.com/maps/place/" + mapAdd,
  };

  var div = document.createElement("div");
  var div2 = document.createElement("div");
  var div3 = document.createElement("div");
  div.classList.add(
    "flex",
    "items-center",
    "w-11/12",
    "md:w-10/12",
    "lg:w-8/12",
    "xl:w-6/12",
    "rounded",
    "shadow",
    "mt-4",
    "p-2",
    "border"
  );
  var h2 = document.createElement("h2");
  h2.innerText = place.name;
  var p1 = document.createElement("p");
  p1.innerText = place.address;
  var img = document.createElement("img");
  var a = document.createElement("a");
  if (place.photo) {
    img.setAttribute("src", place.photo);
  }
  a.classList =
    "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2";
  a.setAttribute("href", place.url);
  a.setAttribute("target", "_blank");
  a.textContent = "View on Google Maps";
  img.classList.add("object-contain", "rounded", "w-full");
  div2.classList.add("col-3");
  div2.appendChild(img);
  div3.setAttribute(
    "class",
    "text-center w-full card-body flex flex-col items-center"
  );
  div.appendChild(div2);
  div3.append(h2, p1, a);
  div.appendChild(div3);
  atmInfoEl.appendChild(div);
}

// Set marker on the map
// function createMarker(place) {
//   if (!place.geometry || !place.geometry.location) return;
//   const iconBase = "./assets/img/location.png";
//   var contentString = `<h1 class="map-h1">${place.name}</h1> <p>${place.formatted_address}</p>`;

//   var infoWindow = new google.maps.InfoWindow({
//     content: contentString,
//   });

//   const marker = new google.maps.Marker({
//     map,
//     position: place.geometry.location,
//     title: place.name,
//     icon: iconBase,
//   });

//   google.maps.event.addListener(marker, "click", function (event) {
//     if (!marker.open) {
//       infoWindow.open(map, marker);
//       marker.open = true;
//     } else {
//       infoWindow.close();
//       marker.open = false;
//     }
//     google.maps.event.addListener(map, "click", function () {
//       infoWindow.close();
//       marker.open = false;
//     });
//   });
// }

// City input validation
function isValid() {
  if (city.value.length < 1) {
    message.innerText = "Please enter a city";
    return false;
  }
  if (!isNaN(city.value)) {
    message.innerText = "City name can't contain numbers.";
    return false;
  }
  return true;
}

// ATM Search Handler
var atmSearchHandler = function (e) {
  e.preventDefault();
  // Clear the previous search
  atmInfoEl.innerHTML = "";
  var cityName = city.value.trim();
  if (isValid()) {
    message.textContent = "";
    getGeo(cityName);
  }
  city.value = "";
};

// Get the user current location
function geoLocationHandler() {
  var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  function success(pos) {
    message.textContent = "";
    var crd = pos.coords;
    latlng.lat = crd.latitude;
    latlng.lng = crd.longitude;
    initMap();
  }

  function error(err) {
    loading.style.display = "none";
    if (err.message === "Timeout expired") {
      message.textContent = err.message + ", Please try again.";
    } else {
      message.textContent = err.message;
    }
    message.style.color = "red";
  }

  loading.style.display = "";
  navigator.geolocation.getCurrentPosition(success, error, options);
}

btcAtmSearch.addEventListener("click", atmSearchHandler);
myLocation.addEventListener("click", geoLocationHandler);

initMap();
