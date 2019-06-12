/*-- collapsible -- */

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
}

/* -- Sidebar transition -- */

function togglebtn() {
  $("#toggle-btn")[0].classList.toggle("change");
}

function openNav() {
  $("#mySider")[0].classList.toggle("transition")
  togglebtn();
}

/* -- Button animation -- */

  $(".item").click((e) => {

    if(!$(e.currentTarget).hasClass("selected"))
      $(e.currentTarget).css({color: "black", background: "white"}).addClass("selected")
    else
      $(e.currentTarget).css({color: "white", background: "none"}).removeClass("selected")

  })


/* -- Date picker -- */

/* $(function() {

  $('input[name="datefilter"]').daterangepicker({
      opens: 'right',
      drops: 'up',
      format: "DD/MM/YYYY",
      singleDatePicker: true,
      showDropdowns: true,
      autoUpdateInput: false,
      autoApply: true,
      locale: {
          cancelLabel: 'Clear'
      }
  });

  $('input[name="datefilter"]').on('apply.daterangepicker', function(ev, picker) {
      $(this).val(picker.startDate.format('DD/MM/YYYY'));
  });

  $('input[name="datefilter"]').on('cancel.daterangepicker', function(ev, picker) {
      $(this).val('');
  });

}); */


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

function changeBasemap(basemaps) {
    var basemap = basemaps.value;
    setBasemap(basemap);
}

/* Geocoding Control */

var searchControl = L.esri.Geocoding.geosearch({
    position: "topright",
    placeholder: "Cerca una località"
}).addTo(map);
var results = L.layerGroup().addTo(map);

searchControl.on('results', function(data) {
    results.clearLayers();
});
