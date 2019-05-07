const express = require(`express`);
const zlib    = require(`zlib`);
const router  = express.Router();
const utils   = require('../Utils');
const fs      = require('fs');
const stream  = require('stream');
const moment  = require('moment');

process.on('uncaughtException', function (err) {
  console.log(err);
})

router.get('/', (req, res) => {

  res.json({

    success: true,
    message: "data_endpoint",
    version: "1.0.0"

  })

})

router.get('/search', (req, res) => {

  var query = req.params.q;

  if(query){



  }

})

router.post('/getSelf', (req, res) => {

  var sessionid = req.body.sessionid,
      userid     = req.body.userid;

  utils.verifySession(sessionid)
    .then(async(success) => {

      console.log("useriddd");
      var user = utils.items.sessions[sessionid].user_id;
      console.log(`USER FOUND: ${user}`);
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

router.get('/getGenericReports', (req, res) => {

  var perState = req.query.groupPerState;
  var region = req.query.state;

  if(region){
    region = region.toLowerCase().charAt(0).toUpperCase() + region.toLowerCase().slice(1);
    console.log(region);
    return res.json(utils.items.generic_reports_per_state[region])
  }

  if(perState == 'true')
    return res.json(utils.items.generic_reports_per_state)

  return res.json(utils.items.genericReports)

})

router.get('/getCategories', async(req, res) => {

  try{

    return res.json(await utils.getCategories())

  }catch(err){

    res.status(err.status || 500).json(err)

  }

})

router.post('/addGenericReport', async(req, res) => {

  var report_id = utils.items.random(64),
      report_date = parseInt(new Date().getTime() / 1000),
      report_title = req.body.title,
      user_id = (await utils.items.db.query("SELECT * FROM Sessions WHERE session_id = ?", [req.body.sessionid]))[0].user_id,
      report_state = req.body.state,
      report_description = req.body.description.replace(/\n/g, "<br>"),
      report_address = req.body.address || "indirizzo non specificato",
      images = req.body.images || "";

      images = images.replace(/,\s*$/, "").split(",") || "";


  utils.checkParameters([report_id, report_date, user_id, report_state, report_description, report_title])
    .then(success => {

      return utils.verifySession(req.body.sessionid)

    })

    .then(nice => {

      return utils.items.db.query("INSERT INTO GenericReports VALUES(?,?,?,?,?,?,?)", [report_id, report_date, user_id, report_address, report_state, report_description, report_title])

    })

    .then(async(success) => {

      utils.updateGenericReports({report_id, report_date, user_id, report_address, report_state, report_description, report_title})

      utils.items.mappedUsers.forEach(user => {

        user.emit('generic_report', {report_id, report_date, user_id, report_address, report_state, report_description, report_title})

      })

      fs.mkdirSync(`./data/uploads/${report_id}`);
      var imgs = [];

      if(images){

        for(image in images){
          imgs.push(utils.writeImage(images[image], `./data/uploads/${report_id}/${require('randomstring').generate(10)}.jpg`))
        }

      }

      await Promise.all(imgs);

      res.json({success: true})

    })

    .catch(err => {

      console.log(err);
      res.status(err.status || 500).json(err)

    })

  //res.json({report_id, category_id, date, long, lat, height, userid})

})

router.post('/reportLength', (req, res) => {

  return res.json({
    success: true,
    length: parseInt(utils.items.genericReports.length + utils.items.reports.length)
  })

})

router.post('/addReport', async(req, res) => {

  var report_id = utils.items.random(64),
      report_date = parseInt(new Date().getTime() / 1000),
      report_longitude = req.body.longitude,
      report_title = req.body.title,
      report_latitude = req.body.latitude,
      report_height = req.body.altitude || "altitudine non specificata",
      user_id = (await utils.items.db.query("SELECT * FROM Sessions WHERE session_id = ?", [req.body.sessionid]))[0].user_id,
      report_state = req.body.state,
      report_description = req.body.description.replace(/\n/g, "<br>"),
      report_address = req.body.address || "indirizzo non specificato",
      images = req.body.images || "";

      images = images.replace(/,\s*$/, "").split(",") || "";

  console.log(images);
  console.log("LUNGHEZZA : " + images.length);


  utils.checkParameters(report_id, report_date, report_longitude, report_latitude, report_height, user_id, report_state)
    .then(success => {

      return utils.verifySession(req.body.sessionid)

    })

    .then(nice => {

      return utils.items.db.query("INSERT INTO Reports VALUES(?,?,?,?,?,?,?,?,?,?)", [report_id, report_date, report_longitude, report_latitude, report_height, user_id, report_state, report_description, report_title, report_address])

    })

    .then(async(success) => {

      utils.updateReports({report_id, report_date, report_longitude, report_latitude, report_height, user_id, report_state, report_description, report_title, report_address});

      utils.items.mappedUsers.forEach(user => {

        user.emit('report', {report_date, report_longitude, report_latitude, report_height, report_state, report_title, report_address})

      })

      utils.items.adminListening.forEach(admin => {

        admin.emit('new-report', {
          report_id,
          report_date,
          report_longitude,
          report_latitude,
          report_height,
          user_id,
          report_state,
          report_description,
          report_title,
          report_address,
          user: utils.items.users[user_id],
          readable_date: moment(report_date * 1000).format('DD/MM/YYYY').toString()
        })

      })

      fs.mkdirSync(`./data/uploads/${report_id}`);

      var imgs = [];

      if(images){

        for(image in images){
          imgs.push(utils.writeImage(images[image], `./data/uploads/${report_id}/${require('randomstring').generate(10)}.jpg`))
        }

      }

      await Promise.all(imgs);

      res.json({success: true})

    })

    .catch(err => {

      console.log(err);
      res.status(err.status || 500).json(err)

    })

  //res.json({report_id, category_id, date, long, lat, height, userid})

})

router.post('/addGuestReport', async(req, res) => {

  var report_id = utils.items.random(64),
      report_date = parseInt(new Date().getTime() / 1000),
      report_longitude = req.body.longitude,
      report_title = req.body.title,
      report_latitude = req.body.latitude,
      report_height = req.body.altitude || "altitudine non specificata",
      user_id = null,
      report_state = req.body.state,
      report_description = req.body.description.replace(/\n/g, "<br>"),
      report_address = req.body.address || "indirizzo non specificato",
      images = req.body.images || "";

      images = images.replace(/,\s*$/, "").split(",") || "";


  utils.checkParameters(report_id, report_date, report_longitude, report_latitude, report_height, report_state)
    .then(success => {

      return utils.items.db.query("INSERT INTO Reports VALUES(?,?,?,?,?,?,?,?,?,?)", [report_id, report_date, report_longitude, report_latitude, report_height, user_id, report_state, report_description, report_title, report_address])

    })

    .then(async(success) => {

      utils.updateReports({report_id, report_date, report_longitude, report_latitude, report_height, user_id, report_state, report_description, report_title, report_address});

      utils.items.mappedUsers.forEach(user => {

        user.emit('report', {report_id, report_date, report_longitude, report_latitude, report_height, user_id, report_state, report_description, report_title, report_address})

      })

      fs.mkdirSync(`./data/uploads/${report_id}`);

      var imgs = [];

      if(images){

        for(image in images){
          imgs.push(utils.writeImage(images[image], `./data/uploads/${report_id}/${require('randomstring').generate(10)}.jpg`))
        }

      }

      await Promise.all(imgs);

      res.json({success: true})

    })

    .catch(err => {

      console.log(err);
      res.status(err.status || 500).json(err)

    })

  //res.json({report_id, category_id, date, long, lat, height, userid})

})

router.post('/addGuestGenericReport', async(req, res) => {

  var report_id = utils.items.random(64),
      report_date = parseInt(new Date().getTime() / 1000),
      report_title = req.body.title,
      user_id = null,
      report_state = req.body.state,
      report_description = req.body.description.replace(/\n/g, "<br>"),
      report_address = req.body.address || "indirizzo non specificato",
      images = req.body.images || "";

      images = images.replace(/,\s*$/, "").split(",") || "";


  utils.checkParameters([report_id, report_date, report_state, report_description, report_title])
    .then(success => {

      return utils.items.db.query("INSERT INTO GenericReports VALUES(?,?,?,?,?,?,?,?)", [report_id, report_date, user_id, report_address, report_state, report_description, report_title])

    })

    .then(async(success) => {

      utils.updateGenericReports({report_id, report_date, user_id, report_address, report_state, report_description, report_title})

      utils.items.mappedUsers.forEach(user => {

        user.emit('generic_report', {report_id, report_date, user_id, report_address, report_state, report_description, report_title})

      })

      fs.mkdirSync(`./data/uploads/${report_id}`);

      var imgs = [];

      if(images){

        for(image in images){
          imgs.push(utils.writeImage(images[image], `./data/uploads/${report_id}/${require('randomstring').generate(10)}.jpg`))
        }

      }

      await Promise.all(imgs);

      res.json({success: true})

    })

    .catch(err => {

      console.log(err);
      res.status(err.status || 500).json(err)

    })

  //res.json({report_id, category_id, date, long, lat, height, userid})

})

module.exports = router;
