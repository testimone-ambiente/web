/* -- Initial configuration -- */

var map = L.map('map', {zoomControl: false}).setView([42.846828, 10.579184], 5.5);
var layer = L.esri.basemapLayer('Topographic').addTo(map);
new L.Control.Zoom({position: 'topright'}).addTo(map)


/* -- Socket for realtime updates -- */

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

/* -- GET request for static display -- */

function staticDisplay(){

 $.get("/api/data/getReports", reports => {

	 console.log(reports);

	reports.map(report => {

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

})

}

/* Filter functions */

staticDisplay();

var regionMarkers = {
	"Abruzzo": [], "Piemonte": [], "Sardegna": [], "Liguria": [], "Emilia-Romagna": [], "Valle D'Aosta": [],
	"Trentino-Alto Adige": [],  "Lombardia": [], "Campania": [], "Lazio": [], "Veneto": [],  "Sicilia": [], "Calabria": [],
	"Toscana": [], "Marche": [],  "Umbria": [], "Friuli Venezia Giulia": [], "Molise": [],  "Puglia": [], "Basilicata": []
}

function filtroRegione(regione){
$.get("/api/data/getReports", reports => {

	reports.map(report => {

		map.removeLayer(myMarkers);
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
				regionMarkers[regione].forEach(marker => map.removeLayer(marker));
		})

	})
}

/* Filters Actions */

$(".item").on('click', e => {

	if(!$(e.currentTarget).hasClass("selected")){
	 filtroRegione($(e.currentTarget).attr('name'));
 }else{
	 removeRegione($(e.currentTarget).attr('name'));
	 if($(".item.selected").length == 1){
		 staticDisplay();
	 }
 }

})

function restart() {
	map.redraw();
}


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
     if (basemap === 'ShadedRelief') {
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
