const express = require(`express`);
const router  = express.Router();
const utils   = require('../Utils');
const Mail    = require('../Mail');
const fs      = require("fs")

router.use((req, res, next) => {

  res.setHeader('Access-Control-Allow-Origin', 'https://ambiente.emilianomaccaferri.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  var sessionid = req.cookies.sessionid;

  if(sessionid === undefined && req.originalUrl != '/dashboard/login'){

    res.redirect('/dashboard/login');
    return;

  }

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

      if(req.originalUrl != '/dashboard/login'){
        res.redirect('/dashboard/login');
        return;
      }
      else
        next();

    })

})

router.get('/', (req, res) => {

  res.render('dashboard/dashboard', {
    title: 'Home',
    user: res.user,
    count: parseInt(utils.items.genericReports.length + utils.items.reports.length)
  })

})

router.get('/settings', (req, res) => {

  res.render('dashboard/settings', {
    title: 'Home',
    user: res.user
  })

})

router.get('/report/:report_id', (req, res) => {

  var report = utils.items.reports_per_id[req.params.report_id];

  fs.readdir(`./data/uploads/${req.params.report_id}`, (err, items) => {

    console.log(items);

    res.render('dashboard/report', {

      title: report.report_title,
      report: report,
      images: items,
      user: res.user

    })

  })

})

router.get('/archive', (req, res) => {

  res.render('dashboard/archive', {
    title: 'Segnalazioni',
    user: res.user,
    reports: utils.items.adminReports,
    ten: utils.items.adminReports.slice(0, 10),
    current: 1,
    pages: Object.keys(utils.items.adminPages)
  })

})

router.get('/archive/:page', (req, res) => {

  if(req.params.page == 1){
    res.redirect('/dashboard/archive');
    return;
  }

  res.render('dashboard/archive_page', {
    title: 'Segnalazioni',
    user: res.user,
    reports: utils.items.adminReports,
    page: utils.items.adminPages[req.params.page],
    current: req.params.page,
    pages: Object.keys(utils.items.adminPages)
  })

})

router.get('/reports', (req, res) => {

  res.render('dashboard/reports', {
    title: 'Segnalazioni',
    user: res.user,
    ten: utils.items.adminReports.slice(0, 10)
  })

})

router.get('/login', (req, res) => {

  res.render('dashboard/login', {
    title: 'Login'
  })

})

module.exports = router;
