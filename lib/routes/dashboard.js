const express = require(`express`);
const router  = express.Router();
const utils   = require('../Utils');
const Mail    = require('../Mail');

router.use((req, res, next) => {

  res.setHeader('Access-Control-Allow-Origin', 'https://ambiente.emilianomaccaferri.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  var sessionid = req.cookies.sessionid;

  utils.verifyAdminSession(sessionid)
    .then(success => {

      res.user = utils.items.admins[utils.items.adminSessions[sessionid].user_id];
      if(req.originalUrl == '/dashboard/login'){
          res.redirect('/dashboard')
          return;
      }

      next();


    })

    .catch(err => {

      if(req.originalUrl != '/dashboard/login')
        res.redirect('/dashboard/login')
      else
        next();

    })

})

router.get('/', (req, res) => {

  res.render('dashboard', {
    title: 'Home'
  })

})

router.get('/login', (req, res) => {

  res.render('dashboard/login', {
    title: 'Login'
  })

})

module.exports = router;
