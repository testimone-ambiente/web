var map = L.map('map', {zoomControl: false}).setView([41.846828, 7.879184], 6);

new L.Control.Zoom({position: 'bottomright'}).addTo(map)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
