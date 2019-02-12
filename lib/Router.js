'use strict'

const fs       = require("fs");
const express  = require("express");
const body     = require("body-parser");
const helmet   = require("helmet");
const Promise  = require("promise");

// express routes


var Router = function(port){

  this.port = port;
  this.app = express();
  this.app.use(helmet())
  this.app.enable('trust proxy');
  this.app.disable('x-powered-by');
  this.app.use(body.json());
  this.app.use(body.urlencoded({extended: true}));
  this.app.set('views', __dirname + '/../views');
  this.app.set('view engine', 'twig');
  this.io = require('socket.io')(this.app.listen(port))
  this.app.set('socketio', this.io)
  this.app.use('/static', express.static(__dirname + '/../assets'))

  this.app.get('/', (req, res) => {

    res.render('index', {

      title: 'Homepage'

    })

  })

}

module.exports = Router
