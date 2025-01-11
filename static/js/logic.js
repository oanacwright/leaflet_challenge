var map = L.map('map').setView([37.75, -122.23], 5);  // Set initial view to somewhere in the US

// Add OpenStreetMap base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Function to determine the color based on the depth
function getColor(depth) {
    return depth > 700 ? '#800026' :
           depth > 500 ? '#BD0026' :
           depth > 300 ? '#E31A1C' :
           depth > 100 ? '#FC4E2A' :
           depth > 50  ? '#FD8D3C' :
           depth > 20  ? '#FEB24C' :
           depth > 0   ? '#FED976' :
                         '#FFEDA0';
}

// Function to determine the size based on the magnitude
function getRadius(magnitude) {
    return magnitude * 3;  // Scale the size of the circle markers
}

// Fetch the earthquake data from the USGS API
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
    .then(response => response.json())
    .then(data => {
        // Loop through each earthquake feature
        data.features.forEach(function(feature) {
            var coords = feature.geometry.coordinates;
            var lat = coords[1];  // Latitude
            var lon = coords[0];  // Longitude
            var depth = coords[2]; // Depth
            var magnitude = feature.properties.mag; // Magnitude
            var place = feature.properties.place;  // Location name
            var time = new Date(feature.properties.time);  // Timestamp of the earthquake
            
            // Create a circle marker for each earthquake
            var marker = L.circleMarker([lat, lon], {
                radius: getRadius(magnitude),
                fillColor: getColor(depth),
                color: '#000',
                weight: 0.5,
                opacity: 0.7,
                fillOpacity: 0.7
            }).addTo(map);
            
            // Bind a popup to the marker
            marker.bindPopup(`
                <b>Location:</b> ${place}<br>
                <b>Magnitude:</b> ${magnitude}<br>
                <b>Depth:</b> ${depth} km<br>
                <b>Time:</b> ${time.toUTCString()}
            `);
        });
    });

// Create a legend for the depth coloring
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<h4>Earthquake Depth (km)</h4>'; // Add title to the legend
    var depthLabels = ['0-20 km', '20-50 km', '50-100 km', '100-300 km', '300-500 km', '500-700 km', '700+ km'];
    var depthColors = ['#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];
    
    for (var i = 0; i < depthLabels.length; i++) {
        div.innerHTML += '<i style="background:' + depthColors[i] + '"></i> ' + depthLabels[i] + '<br>';
    }
    return div;
};

// Add the legend to the map
legend.addTo(map);