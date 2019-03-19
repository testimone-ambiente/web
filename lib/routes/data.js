const express = require(`express`);
const router  = express.Router();
const utils   = require('../Utils');

router.get('/', (req, res) => {

  res.json({

    success: true,
    message: "data_endpoint",
    version: "1.0.0"

  })

})

router.post('/getSelf', (req, res) => {

  var sessionid = req.body.sessionid,
      userid     = req.body.userid;

  utils.verifySession(sessionid)
    .then(async(success) => {

      console.log("useriddd");
      var user = utils.items.sessions[sessionid].user_id;
      if(user === userid){

        var actualUser = utils.items.users[user];
        console.log(actualUser);

        return res.json(
          {
            name: actualUser.name.trim(),
            surname: actualUser.surname.trim().split("\u0007")[0],
            email: actualUser.email
          }
        )

      }else{

        res.status(403).json({success: false, error: 'unauthorized'})

      }

    })

    .catch(err => {

      res.status(err.status || 500).json(err);

    })


})

router.get('/getReports', (req, res) => {

  var perState = req.query.groupPerState;
  var region = req.query.state;

  if(region){
    region = region.toLowerCase().charAt(0).toUpperCase() + region.toLowerCase().slice(1);
    console.log(region);
    return res.json(utils.items.reports_per_state[region])
  }

  if(perState == 'true')
    return res.json(utils.items.reports_per_state)

  return res.json(utils.items.reports)

})

router.get('/getCategories', async(req, res) => {

  try{

    return res.json(await utils.getCategories())

  }catch(err){

    res.status(err.status || 500).json(err)

  }

})

router.post('/addReport', async(req, res) => {

  var report_id = utils.items.random(64),
      category_id = (await utils.getCategories(true))[req.body.category],
      report_date = parseInt(new Date().getTime() / 1000),
      report_longitude = req.body.longitude,
      report_latitude = req.body.latitude,
      report_height = req.body.height || "---",
      user_id = (await utils.items.db.query("SELECT * FROM Sessions WHERE session_id = ?", [req.body.sessionid]))[0].user_id,
      report_state = req.body.state;

  utils.checkParameters(report_id, category_id, report_date, report_longitude, report_latitude, report_height, user_id, report_state)
    .then(success => {

      return utils.verifySession(req.body.sessionid)

    })

    .then(nice => {

      return utils.items.db.query("INSERT INTO Reports VALUES(?,?,?,?,?,?,?,?)", [report_id, category_id, report_date, report_longitude, report_latitude, report_height, user_id, report_state])

    })

    .then(success => {

      utils.items.reports.push({report_id, category_id, report_date, report_longitude, report_latitude, report_height, user_id, report_state});

      utils.items.mappedUsers.forEach(user => {

        user.emit('report', {report_id, category_id, report_date, report_longitude, report_latitude, report_height, user_id, report_state})

      })

      res.json({success: true})

    })

    .catch(err => {

      res.status(err.status || 500).json(err)

    })

  //res.json({report_id, category_id, date, long, lat, height, userid})

})

module.exports = router;
