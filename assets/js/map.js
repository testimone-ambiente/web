/* -- Initial configuration -- */

var map = L.map('map', {zoomControl: false}).setView([42.846828, 10.579184], 5.5);

var layer = L.esri.basemapLayer('ImageryFirefly').addTo(map);			//Initializes satellitar map + labels
layerLabels = L.esri.basemapLayer('ImageryLabels');
map.addLayer(layerLabels);

new L.Control.Zoom({position: 'topright'}).addTo(map);						//add zoom controls

/* Global Variables */

var markerStartup = [];
var marker;
var markerDefaultGroup;

var titleMarker = [];
var addressMarker = [];

var region_markers = {
	"Abruzzo": [], "Piemonte": [], "Sardegna": [], "Liguria": [], "Emilia-Romagna": [], "Valle d'Aosta": [],
	"Trentino": [],  "Lombardia": [], "Campania": [], "Lazio": [], "Veneto": [],  "Sicilia": [], "Calabria": [],
	"Toscana": [], "Marche": [],  "Umbria": [], "Friuli": [], "Molise": [],  "Puglia": [], "Basilicata": []
}

/* -- Marker display class -- */

var socket = io();

class Display {

    dynamicDisplay() {

        socket.on('report', report => {

            marker = L.marker([report.report_latitude, report.report_longitude]).addTo(map);
            marker.bindPopup(`<b>${report.report_title}</b><br>${moment.unix(report.report_date).format('DD/MM/YYYY')}<br>`);
            markerStartup.push(marker);
            markerDefaultGroup = L.layerGroup(markerStartup).addTo(map);

        })

    }

    staticDisplay() {

        $.get("/api/data/getReports", reports => {

            reports.map(report => {

                console.log(report);

                marker = L.marker([report.report_latitude, report.report_longitude]).addTo(map);
                marker.bindPopup(`<b>${report.report_title}</b><br>${moment.unix(report.report_date).format('DD/MM/YYYY')}<br>`);
                markerStartup.push(marker);
                markerDefaultGroup = L.layerGroup(markerStartup).addTo(map);
            })

        })

    }

}

/* Class Functions Active */

var little_marker = new Display();
little_marker.staticDisplay();
little_marker.dynamicDisplay();

/* Filter functions */

class Filters {

    regionFilter(regione) {
        $.get("/api/data/getReports", reports => {

            reports.map(report => {

                map.removeLayer(markerDefaultGroup);

                if (report.report_state == regione || regione == null) {
                    marker = L.marker([report.report_latitude, report.report_longitude]).addTo(map);
                    marker.bindPopup(`<b>${report.report_title}</b><br>${moment.unix(report.report_date).format('DD/MM/YYYY')}`);
                    region_markers[regione].push(marker);

                }

            })
        })
    }

    regionRemove(regione) {
        $.get("/api/data/getReports", reports => {

            reports.map(report => {
                region_markers[regione].forEach(marker => map.removeLayer(marker));
            })

        })
    }

    titleFilter(title) {
        var matcher = new RegExp("(\w*" + title + "\w*)", "i");

        $.get("/api/data/getReports", reports => {

            reports.map(report => {

                map.removeLayer(markerDefaultGroup);

                if (title == '') {
                    map.removeLayer(markerDefaultGroup);
                } else {
                    if (matcher.test(report.report_title)) {
                        marker = L.marker([report.report_latitude, report.report_longitude]).addTo(map);
                        marker.bindPopup(`<b>${report.report_title}</b><br>${moment.unix(report.report_date).format('DD/MM/YYYY')}`);
                        titleMarker.push(marker);
                    }
                }
            })
        })
    }

    titleRemove() {
        $.get("/api/data/getReports", reports => {

            reports.map(report => {
                titleMarker.forEach(marker => map.removeLayer(marker));
            })

        })
    }

		addressFilter(address) {
				var matcher = new RegExp("(\w*" + address + "\w*)", "i");

        $.get("/api/data/getReports", reports => {

            reports.map(report => {

                map.removeLayer(markerDefaultGroup);

                if (address == '') {
                    map.removeLayer(markerDefaultGroup);
                } else {
                    if (matcher.test(report.report_address)) {
                        marker = L.marker([report.report_latitude, report.report_longitude]).addTo(map);
                        marker.bindPopup(`<b>${report.report_title}</b><br>${moment.unix(report.report_date).format('DD/MM/YYYY')}`);
                        addressMarker.push(marker);
                    }
                }
            })
        })
    }

    addressRemove() {
        $.get("/api/data/getReports", reports => {

            reports.map(report => {
                addressMarker.forEach(marker => map.removeLayer(marker));
            })

        })
    }

		dateFilter(date) {

        $.get("/api/data/getReports", reports => {

            reports.map(report => {

								var marker_date = moment.unix(report.report_date.toString()).format('DD/MM/YYYY');
                map.removeLayer(markerDefaultGroup);

                if (date == '') {
                    map.removeLayer(markerDefaultGroup);
                } else {
                    if (marker_date == date) {
                        marker = L.marker([report.report_latitude, report.report_longitude]).addTo(map);
                        marker.bindPopup(`<b>${report.report_title}</b><br>${moment.unix(report.report_date).format('DD/MM/YYYY')}`);
                        addressMarker.push(marker);
                    }
                }
            })
        })
    }

		dateRemove() {
        $.get("/api/data/getReports", reports => {

            reports.map(report => {
                addressMarker.forEach(marker => map.removeLayer(marker));
            })

        })
    }

		regionWiper() {
    for (var value of Object.keys(region_markers)) {
        region_markers[value].forEach(marker => map.removeLayer(marker));
    }
}


    restartMarkers() {
        map.removeLayer(markerDefaultGroup);
        markerDefaultGroup.addTo(map);
    }

		filterWiper() {										//rimuove tutti i filtri e gli input dei campi
			this.regionWiper();
			this.titleRemove();
			this.addressRemove();
			this.dateRemove();
			$(".item").css({color: "#fff", background: "none"}).removeClass("selected");
			$("#search-title")[0].value = '';
			$("#search-address")[0].value = '';

		}

		fullReset() {										//bottone azzera filtri
			this.filterWiper();
			this.restartMarkers();
			$("#search-date")[0].value = '';
		}

}

var little_filter = new Filters();

/* Filters Actions */

/* Filtri per i bottoni delle regioni */

$(".item").on('click', e => {

    if (!$(e.currentTarget).hasClass("selected")) {
        little_filter.regionFilter($(e.currentTarget).attr('name'));
        little_filter.titleRemove();
        little_filter.addressRemove();
				little_filter.dateRemove();
    } else {
        little_filter.regionRemove($(e.currentTarget).attr('name'));
        if ($(".item.selected").length == 1) {
            little_filter.titleRemove();
            little_filter.addressRemove();
						little_filter.dateRemove();
            little_filter.restartMarkers();
        }
    }

})

/* Filtri per i campi di testo */

function titleSearch() {
    var title_string = $("#search-title")[0].value;

    little_filter.filterWiper();
    little_filter.titleFilter(title_string);

}

function addressSearch() {
    var address_string = $("#search-address")[0].value;

    little_filter.filterWiper();
    little_filter.addressFilter(address_string);

}

function dateSearch() {
    var date_string = $("#search-date")[0].value;

    little_filter.filterWiper();
		little_filter.dateFilter(date_string);
}
