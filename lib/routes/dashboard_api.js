const express = require(`express`);
const router  = express.Router();
const utils   = require('../Utils');
const Mail    = require('../Mail');

router.get('/', (req, res) => {

  res.json({

    success: true,
    message: "dashboard_endpoint",
    version: "1.0.0"

  })

})

router.post('/removeReport', (req, res) => {

  var sessionid = req.cookies.sessionid,
      report_id = req.body.report_id;

  utils.verifyAdminSession(sessionid)
    .then(async(success) => {

      return utils.items.db.query("DELETE FROM Reports WHERE report_id = ?", [report_id]);

    })

    .then(async(success) => {

      await utils.reloadReports();

      res.json({success: true})

    })

    .catch(err => {

      console.log(err);
      return res.status(err.status || 500).json(err)

    })

})

router.post('/login', async(req, res) => {

  var username = req.body.username,
      password = req.body.password,
      userid = utils.items.usernameToAdminId[username];

  console.log(utils.items.usernameToAdminId);

  if(!username || !password)
    return res.status(400).json({success: false, error: 'missing_parameter'})

  try{

    if(!(await utils.checkParameters([username, password])))
      return res.status(400).json({success: false, error: 'missing_parameter'})

    console.log("parameters: correct");

    if(!userid)
      return res.status(403).json({success: false, error: 'invalid_credentials'});

    if(!(await utils.verifyPassword(userid, password, true)))
      return res.status(403).json({success: false, error: 'invalid_credentials'});

    else{

      console.log("credentials: correct");

      var sessionid = utils.items.random(128),
      expiryTime = parseInt(((new Date().getTime()) / 1000)) + 172800; // 2 days session that will eventually be extended every login (if in the 48h range)

      await utils.items.db.query("INSERT INTO AdminSessions VALUES(?,?,?)", [userid.user_id, sessionid, expiryTime])
      utils.items.adminSessions[sessionid] = {user_id: userid.user_id, expiry: expiryTime}

      res.cookie('sessionid', sessionid, {path: '/', maxAge: 900000000, httpOnly: true, secure: true, domain: 'ambiente.emilianomaccaferri.com'});
      res.json({success: true})

    }

  }catch(err){

    throw err;
    res.status(err.status || 500).json(err)

  }

})

module.exports = router;
