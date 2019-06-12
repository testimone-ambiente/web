'use strict'

const fs       = require("fs");
const express  = require("express");
const body     = require("body-parser");
const helmet   = require("helmet");
const Promise  = require("promise");
const cookieParser = require("cookie-parser");
const cors     = require("cors");
const utils    = require("./Utils")

// express routes


var Router = function(port){

  this.port = port;
  this.app = express();
  this.server = require('http').Server(this.app);
  this.io = require('socket.io')(this.server)
  this.app.use(helmet())
  this.app.use(cookieParser());
  this.app.enable('trust proxy');
  this.app.disable('x-powered-by');
  this.app.use(body.json({ limit: '500mb' }));
  this.app.use(body.urlencoded({ limit: '500mb', extended: true, parameterLimit: 50000 }));
  this.app.set('views', __dirname + '/../views');
  this.app.set('view engine', 'twig');
  this.app.use(cors({
    origin: 'https://ambiente.emilianomaccaferri.com',
    optionsSuccessStatus: 200
  }))
  this.app.use('/uploads', express.static(__dirname + '/../data/uploads', {

    maxAge: 3600000,
    etag: true

  }))
  this.app.use('/static', express.static(__dirname + '/../assets'))/*, {

    maxAge: 3600000,
    etag: true

  }))*/

  this.server.listen(this.port)

  this.io.on('connection', socket => {

    var address = socket.handshake.headers.referer;

    if(address.includes('/dashboard'))
      utils.items.adminListening.push(socket)
    else
      utils.items.mappedUsers.push(socket)

  })

  this.app.use('/api', require('./routes/api'))
  this.app.use('/dashboard', require('./routes/dashboard'))

  this.app.get('/download', (req, res) => {

    res.render('download', {

      title: 'Download'

    })

  })

  this.app.get('/report', (req, res) => {

    res.redirect('/reports');
    return;

  })

  this.app.get('/reports', async(req, res) => {

    res.render('reports', {

      title: 'Segnalazioni'

    })

  })

  this.app.get('/report/:id', async(req, res) => {

    var report = await utils.items.db.query(`SELECT * FROM Reports WHERE report_id = ?`, [req.params.id]);

    var items = await readDir(`./data/uploads/${req.params.id}`);
    if(report.length == 0)
      return res.render('report_not_found', {title: 'Segnalazione non trovata'})

    var rep = report[0];

    if(rep.user_id === null)
      rep.report_name = 'Segnalazione anonima'
    else
      rep.report_name = `${utils.items.users[rep.user_id].name} ${utils.items.users[rep.user_id].surname}`;

    rep.report_longitude = parseFloat(rep.report_longitude).toFixed(6);
    rep.report_latitude = parseFloat(rep.report_latitude).toFixed(6);

    rep.report_date = rep.report_date * 1000;

    rep.report_date = new Date(rep.report_date).toString().split("GMT")[0];

    res.render('report', {

      title: 'Segnalazione',
      report: rep,
      id: req.params.id,
      images: items

    })

  })

  this.app.get('/map', (req, res) => {

    res.render('map', {

      title: 'Segnalazioni'

    })

  })

  this.app.get('/verify/:id/:email', async(req, res) => {

    var r = await utils.items.db.query("SELECT * FROM EmailVerifications WHERE BINARY verification_id = ? AND email = ?", [req.params.id, Buffer.from(req.params.email, 'base64').toString('utf8')])

    if(r.length > 0){

      utils.items.db.query("DELETE FROM EmailVerifications WHERE verification_id = ? AND email = ?", [req.params.id, Buffer.from(req.params.email, 'base64').toString('utf8')])
      var user = utils.items.registered[Buffer.from(req.params.email, 'base64').toString('utf8')];


      console.log("USERID: " + user.user_id);

      utils.items.db.query("INSERT INTO ConfirmedUsers VALUES(?)", [user.user_id])

      res.render('verification', {

        title: 'Account verificato'

      })

    }else{

      res.redirect('/')

    }

  })

  this.app.get('/register', (req, res) => {

    res.render('register', {

      title: 'Registrati'

    })

  })

  this.app.get('/login', (req, res) => {

    res.render('login', {

      title: 'Login'

    })

  })

  this.app.get('/', (req, res) => {

    res.render('index', {

      title: 'Homepage'

    })

  })

}

var readDir = (dir) => {

  return new Promise(

    (resolve, reject) => {

      fs.readdir(dir, (err, files) => {

        return resolve(files)

      });

    }

  )

}

module.exports = Router
