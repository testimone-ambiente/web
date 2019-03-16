const mysql = require("mysql");
const fs = require("fs");
const Promise = require("promise")

var config  = fs.readFileSync('config.json', 'utf8');
config = JSON.parse(config);

var MySQL = function(){

  var self = this;
  this.err;
  this.connection = mysql.createConnection({

    host: 'localhost',
    user: config.username,
    password: config.password,
    database: config.database,
    multipleStatements: true

  });

  /*self.connection.query("DELETE FROM ConfirmedUsers")
  self.connection.query("DELETE FROM EmailVerifications")
  self.connection.query("DELETE FROM Users")
  self.connection.query("DELETE FROM Sessions")*/

  setInterval(function(){

      self.connection.query("SHOW DATABASES", function(err, r){});

  }, 5000);
}

MySQL.prototype.query = function(query, args){

  return new Promise(

    (resolve, reject) => {

      this.connection.query(query, args, (err, row) => {


        if(err){

          throw err;
          return reject({error: 'fatal', status: 500});

        }

        resolve(row);

      })

    }

  )

};

module.exports = MySQL;
