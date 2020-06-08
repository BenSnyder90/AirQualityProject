function createMap(aqiData) {
    console.log("Create Maps...");
    // Create the tile layer that will be the background of our map
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "light-v10",
      accessToken: api_key
    });
    //var heat = L.heatLayer(aqiHeat).addTo(map);
    // Create a baseMaps object to hold the lightmap layer
    var baseMaps = {
      "Light Map": lightmap
    };
  
    // Create an overlayMaps object to hold the bikeStations layer
    var overlayMaps = {
      "City": aqiData,
      //"Heatmap": heat
    };
  
    // Create the map object with options
     map = L.map("map-id", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [lightmap, aqiData]
    });
  
    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);

    
  }
  
  function createBaseMap() {
    console.log("Create Base Maps...");
    // Create the tile layer that will be the background of our map
     lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "light-v10",
      accessToken: api_key
    });
    //var heat = L.heatLayer(aqiHeat).addTo(map);
    // Create a baseMaps object to hold the lightmap layer
     baseMaps = {
      "Light Map": lightmap
    };
    
    map = L.map("map-id", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [lightmap]
    });
  }
  
  function createOverlays(layergroups){
    // Create an overlayMaps object to hold the bikeStations layer
     overlayMaps = {
      "City": aqiData,
      //"Heatmap": heat
    };
  
    // Create the map object with options
     map = L.map("map-id", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [lightmap, aqiData]
    });
  
    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);

    
  }
  function createMarkers(response, date) {
    console.log(`CreateMarkers...`);
    // Pull the "stations" property off of response.data
    var records = response.data;
    //console.log(records.length);
    var filteredRecords = records.filter(d => d.Date == date);
    //console.log(filteredRecords.length);
  
    // Initialize an array to hold bike markers
    var aqiMarkers = [];
  
    // Loop through the stations array
    for (var index = 0; index < filteredRecords.length; index++) {
      var city = filteredRecords[index];
      //aqiHeat.push([city.Lat, city.Lng, city.AQI]);
      // For each station, create a marker and bind a popup with the station's name
      var cityLoc = L.circleMarker([city.Lat, city.Lng],{
        color: "black",
        weight: 1,
        fillColor: getColor(city.Category),
        radius: city.AQI/5,
        fillOpacity: .8
      })
        .bindPopup("<h3>" + city.City +", "+ city.State + "</h3><h3>"+city.Date+"<h4><b>Population: </b>" + city.Population +
                     "</h4><h4><b>AQI: </b>" +city.AQI + "<b> - ("+ city.Category + ")</b>" +
                     "<h4><b>Business Closure Date: </b>" + city.initial_business_closure);
  
      // Add the marker to the bikeMarkers array
      aqiMarkers.push(cityLoc);
    }
    //console.log(aqiMarkers);
    // Create a layer group made from the bike markers array, pass it into the createMap function
    //createMap(L.layerGroup(aqiMarkers));
    var group = L.layerGroup(aqiMarkers);
    return group;
  }
  
  function getColor(category){
    switch (category) {
        case "Good":
            return "green";
        case "Moderate":
            return "yellow";
        case "Unhealthy for Sensitive Groups":
            return "orange";
        case "Unhealthy":
            return "red";
        case "Very Unhealthy":
            return "purple";
        case "Hazardous":
            return "maroon"   
        default:
            return "silver";
    }
}

function createHeatmaps(response, date) {
  filteredRecords = response.data.filter(d=> d.Date == date);
  
  var heatData = {
    'max': 300,
    'data': []
    };
  console.log(`Creating heatmaps...`);
  for (var i = 0; i < filteredRecords.length; i++){
  city = filteredRecords[i];
  //console.log(`City: ${city.City}, Lat: ${city.Lat}, Lng: ${city.Lng}, AQI: ${city.AQI}`);
  //Add city data to data dict for heatmap
  heatData.data.push({'lat':city.Lat, 'lng': city.Lng,'count':city.AQI, 'radius': city.AQI/100});
}
//console.log(heatData);
      
//Set config parameters for heatmap. See: https://www.patrick-wied.at/static/heatmapjs/plugin-leaflet-layer.html
//Radius is set to AQI level of each city divided by 100
var cfg ={
  "radius": 'radius',
  "maxOpacity": .8,
  "scaleRadius":true,
  "useLocalExtrema": true
  };

//Create new heatmap layer and add to maps
var heatmapLayer = new HeatmapOverlay(cfg).addTo(map);
//Update map with heatmap data dict
heatmapLayer =heatmapLayer.setData(heatData);

return heatmapLayer;
}


  // Perform an API call to the Citi Bike API to get station information. Call createMarkers when complete
  d3.json("records.json").then( response=>{
      console.log(response.data.length);

      //createBaseMap();
       // Create the map object with options
    // map = L.map("map-id", {
    //   center: [37.09, -95.71],
    //   zoom: 5,
    //   });

    //   // map.createPane('left');
    //   // map.createPane('right');
    //   // map.getPane('left').style.zIndez =650;
    //   // map.getPane('right').style.zIndez =650;

    //   // Create the tile layer that will be the background of our map
    // var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    //   attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    //   maxZoom: 18,
    //   id: "light-v10",
    //   accessToken: api_key,
    //   //pane: 'left'
    //   }).addTo(map);
    
      var data2019 = createMarkers(response, "2019-03-31");
      console.log(data2019);
      var records = response.data;
    //console.log(records.length);
    var filteredRecords = records.filter(d => d.Date == "2019-03-31");

      var heatData = {
        'max': 300,
        'data': []
    };
    console.log(`Creating heatmaps...`);
    for (var i = 0; i < filteredRecords.length; i++){
      city = filteredRecords[i];
      //console.log(`City: ${city.City}, Lat: ${city.Lat}, Lng: ${city.Lng}, AQI: ${city.AQI}`);
      //Add city data to data dict for heatmap
      heatData.data.push({'lat':city.Lat, 'lng': city.Lng,'count':city.AQI, 'radius': city.AQI/100});
    }
    console.log(heatData);
          
    //Set config parameters for heatmap. See: https://www.patrick-wied.at/static/heatmapjs/plugin-leaflet-layer.html
    //Radius is set to AQI level of each city divided by 100
    var cfg ={
      "radius": 'radius',
      "maxOpacity": .8,
      "scaleRadius":true,
      "useLocalExtrema": true
      };
    
    //Create new heatmap layer and add to maps
    var heatmap2019 = new HeatmapOverlay(cfg);
    //Update map with heatmap data dict
    heatmap2019.setData(heatData);
    
    var side2019 = L.layerGroup([data2019, heatmap2019]);

    var data2020 = createMarkers(response, "2020-03-31");
      console.log(data2020);
    filteredRecords = records.filter(d => d.Date == "2020-03-31");
     heatData = {
      'max': 300,
      'data': []
  };
  console.log(`Creating heatmaps...`);
  for (var i = 0; i < filteredRecords.length; i++){
    city = filteredRecords[i];
    //console.log(`City: ${city.City}, Lat: ${city.Lat}, Lng: ${city.Lng}, AQI: ${city.AQI}`);
    //Add city data to data dict for heatmap
    heatData.data.push({'lat':city.Lat, 'lng': city.Lng,'count':city.AQI, 'radius': city.AQI/100});
  }
  console.log(heatData);
        
  //Set config parameters for heatmap. See: https://www.patrick-wied.at/static/heatmapjs/plugin-leaflet-layer.html
  //Radius is set to AQI level of each city divided by 100
  var cfg ={
    "radius": 'radius',
    "maxOpacity": .8,
    "scaleRadius":true,
    "useLocalExtrema": true
    };
  
  //Create new heatmap layer and add to maps
  var heatmap2020 = new HeatmapOverlay(cfg);
  //Update map with heatmap data dict
  heatmap2020.setData(heatData);
  
  var side2020 = L.layerGroup([data2020,heatmap2020]);
      
     

     console.log("Create Maps...");
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "light-v10",
      accessToken: api_key,
      //pane: 'left'
      });

     var baseMaps = {
      "Light Map": lightmap,
     };

    var overlayMaps = {
      "2019": side2019,
      "2020": side2020
      //"Heatmap": heat
      };
      console.log("map object");
    var map = L.map("map-id", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [lightmap]
      });

      
    
  
    
      console.log("Layers");
    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);

    L.easyPrint({
      title: 'Print',
      position: 'bottomright',
      sizeModes: ['Current','A4Portrait', 'A4Landscape'],
      exportOnly: true
    }).addTo(map);
    


      
      
      });