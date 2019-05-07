$("#login").on('submit', e => {

  e.preventDefault();
  var username = $("#username").val().trim(),
      password = $("#password").val().trim();

  $.post('/api/dashboard/login', {

    username, password

  })
  .done(data => {

    window.location = "/dashboard";

  })


  .fail(err => {

    alert("Errore!")

  })

})
