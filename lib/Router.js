'use strict'

const fs       = require("fs");
const express  = require("express");
const body     = require("body-parser");
const helmet   = require("helmet");
const Promise  = require("promise");
const cors     = require("cors");
const utils    = require("./Utils")

// express routes


var Router = function(port){

  this.port = port;
  this.app = express();
  this.server = require('http').Server(this.app);
  this.io = require('socket.io')(this.server)
  this.app.use(helmet())
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
  this.app.use('/static', express.static(__dirname + '/../assets', {

    maxAge: 3600000,
    etag: true

  }))

  this.server.listen(this.port)

  this.io.on('connection', socket => {

    utils.items.mappedUsers.push(socket)

  })

  this.app.use('/api', require('./routes/api'))

  this.app.get('/report', (req, res) => {

    res.render('report', {

      title: 'Segnalazione'

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
      var user_id = utils.items.registered[Buffer.from(req.params.email, 'base64').toString('utf8')];

      console.log("USERID: " + user_id);

      utils.items.db.query("INSERT INTO ConfirmedUsers VALUES(?)", [user_id])

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

  this.app.get('/', (req, res) => {

    res.render('index', {

      title: 'Homepage'

    })

  })

}

module.exports = Router
