var map = L.map('map', {zoomControl: false}).setView([41.846828, 7.879184], 6); //important

new L.Control.Zoom({position: 'bottomright'}).addTo(map)

setTimeout(() => {

	var bologna = L.marker([44.498955, 11.327591]).addTo(map);
	bologna.bindPopup("<b>Bologna</b><br>Capoluogo dell'Emilia-Romagna");

}, 5000)

var socket = io();

console.log(socket);

socket.on('report', report => {

	var marker = L.marker([report.report_longitude, report.report_latitude]).addTo(map);
	marker.bindPopup(`<b>${report.report_state}</b><br>${new Date(report.report_date * 1000)}`)

})

$.get("/api/data/getReports", reports => {

	reports.map(report => {

		var marker = L.marker([report.report_longitude, report.report_latitude]).addTo(map);
		marker.bindPopup(`<b>${report.report_state}</b><br>${new Date(report.report_date * 1000)}`)

	})

})

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


var circle = L.circle([44.47502, 11.00294], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 10000
}).addTo(map);

//-- map change --

var layer = L.esri.basemapLayer('Mapnik').addTo(map);
 var layerLabels;

 function setBasemap(basemap) {
     if (layer) {
       map.removeLayer(layer);
     }
     layer = L.esri.basemapLayer(basemap);
     map.addLayer(layer);
     if (layerLabels) {
       map.removeLayer(layerLabels);
     }
     if (basemap === 'ShadedRelief'
      || basemap === 'Oceans'
      || basemap === 'Gray'
      || basemap === 'DarkGray'
      || basemap === 'Terrain'
    ) {
       layerLabels = L.esri.basemapLayer(basemap + 'Labels');
       map.addLayer(layerLabels);
     } else if (basemap.includes('Imagery')) {
       layerLabels = L.esri.basemapLayer('ImageryLabels');
       map.addLayer(layerLabels);
     }
   }

   function changeBasemap(basemaps){
     var basemap = basemaps.value;
     setBasemap(basemap);
   }
