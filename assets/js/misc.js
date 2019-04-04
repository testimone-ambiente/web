/*-- collapsible -- */

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
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
      $(e.currentTarget).css({color: "white", background: "#202124"}).addClass("selected")
    else
      $(e.currentTarget).css({color: "#202124", background: "none"}).removeClass("selected")

  })

/* -- Range slider -- */

var rangeSlider = function(){
  var slider = $('.box'),
      range = $('.slider'),
      value = $('.slider_value');

  slider.each(function(){

    value.each(function(){
      var value = $(this).prev().attr('value');
      $(this).html(value);
    });

    range.on('input', function(){
      $(this).next(value).html(this.value);
    });
  });
};

rangeSlider();

/* -- Date picker -- */

$(function() {

  $('input[name="datefilter"]').daterangepicker({
      opens: 'right',
      drops: 'up',
      buttonClasses: "btn_picker",
      autoUpdateInput: false,
      locale: {
          cancelLabel: 'Clear'
      }
  });

  $('input[name="datefilter"]').on('apply.daterangepicker', function(ev, picker) {
      $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
  });

  $('input[name="datefilter"]').on('cancel.daterangepicker', function(ev, picker) {
      $(this).val('');
  });

});
