/* -- Initial configuration -- */

var map = L.map('map', {zoomControl: false}).setView([41.846828, 7.879184], 6);
var layer = L.esri.basemapLayer('Topographic').addTo(map);
new L.Control.Zoom({position: 'topright'}).addTo(map)


/* -- Rest API -- */

var socket = io();
var markerStartup = [];

console.log(socket);

socket.on('report', report => {

	console.log(report);
	var date = new Date(report.report_date * 1000);
	console.log(report.report_date);
	var day = date.getDay();
	var month = date.getMonth();
	marker = L.marker([report.report_latitude, report.report_longitude]).addTo(map);
	marker.bindPopup(`<b>${report.report_title}</b><br>${moment.unix(report.report_date).format('DD/MM/YYYY')}<br><a href='/report/${report.report_id}'>Visualizza segnalazione</a>`);
	markerStartup.push(marker);
	myMarkers = L.layerGroup(markerStartup).addTo(map);

})

/* -- Filter test -- */

 /* $.get("/api/data/getReports", reports => {

	 console.log(reports);

	reports.map(report => {

		console.log(report);
		var marker = L.marker([report.report_latitude, report.report_longitude]).addTo(map);
		console.log(marker);
		marker.bindPopup(`<b>${report.report_title}</b><br>${new Date(report.report_date * 1000)}<br><a href='/report/${report.report_id}'>Visualizza segnalazione</a>"`)

	})

}) */ //DO NOT CANCEL

var regionMarkers = {}

function filtroRegione(regione){
$.get("/api/data/getReports", reports => {

	reports.map(report => {

		map.removeLayer(markerStartup);
		if(report.report_state == regione || regione == null) {
			var date = new Date(report.report_date * 1000);
			console.log(report.report_date);
			var day = date.getDay();
			var month = date.getMonth();
			marker = L.marker([report.report_latitude, report.report_longitude]).addTo(map);
			marker.bindPopup(`<b>${report.report_title}</b><br>${moment.unix(report.report_date).format('DD/MM/YYYY')}`);
			regionMarkers[regione].push(marker);
		}

	})
})
}

function removeRegione(regione){
	$.get("/api/data/getReports", reports => {

		reports.map(report => {
				alert("ciao");
		})

	})
}

$("#Abruzzo").click((done) => {

	if(!$(done.currentTarget).hasClass("selected")){
		filtroRegione("Abruzzo");
	}else{
		removeRegione("Abruzzo");
	}

})

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
