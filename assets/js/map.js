var map = L.map('map', {zoomControl: false}).setView([41.846828, 7.879184], 6);

new L.Control.Zoom({position: 'bottomright'}).addTo(map)

var bologna = L.marker([44.498955, 11.327591]).addTo(map);
bologna.bindPopup("<b>Bologna</b><br>Capoluogo dell'Emilia-Romagna");


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
