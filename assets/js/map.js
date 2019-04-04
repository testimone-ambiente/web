/* -- Initial configuration -- */

var map = L.map('map', {zoomControl: false}).setView([41.846828, 7.879184], 6);
var layer = L.esri.basemapLayer('Topographic').addTo(map);
new L.Control.Zoom({position: 'topright'}).addTo(map)

/* -- Examples test --*/

setTimeout(() => {

	var bologna = L.marker([44.498955, 11.327591]).addTo(map);
	bologna.bindPopup("<b>Bologna</b><br>Capoluogo dell'Emilia-Romagna");

}, 5000)

/* -- Rest API -- */

var socket = io();

console.log(socket);

socket.on('report', report => {

	var marker = L.marker([report.report_longitude, report.report_latitude]).addTo(map);
	marker.bindPopup(`<b>${report.report_state}</b><br>${new Date(report.report_date * 1000)}`)

})

/* -- Filter test -- */

 $.get("/api/data/getReports", reports => {

	reports.map(report => {

		var marker = L.marker([report.report_longitude, report.report_latitude]).addTo(map);
		marker.bindPopup(`<b>${report.report_state}</b><br>${new Date(report.report_date * 1000)}`)

	})

})


function filtroRegione(regione){

	$.get("/api/data/getReports", reports => {

		reports.map(report => {

			if(report.report_state == regione) {
				var marker = L.marker([report.report_longitude, report.report_latitude]).addTo(map);
				marker.bindPopup(`<b>${report.report_state}</b><br>${new Date(report.report_date * 1000)}`)
			}

		})

	})

}

filtroRegione("Calabria");

/* -- Map selector -- */

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

	 /* Geocoding Control */

	var searchControl = L.esri.Geocoding.geosearch({
		position: "topright",
		placeholder: "Cerca una località"
	}).addTo(map);
  var results = L.layerGroup().addTo(map);

  searchControl.on('results', function(data){
    results.clearLayers();
  });
