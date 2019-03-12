const fs        = require("fs");
const Promise   = require("promise");
const crypto    = require("crypto")
const random    = require('randomstring');
const bcrypt    = require('bcrypt-nodejs')
const MySQL     = require("./MySQL");
const ALGORITHM = 'aes-256-ctr';
const config    = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

const db = new MySQL(config);

module.exports.items = {

  db: db,
  config: config,
  random: (len) => { return random.generate(len); },
  registered: {},
  users: {},
  sessions: {}

}

db.query("SELECT * FROM Users")
  .then(rows => {

    rows.forEach(async(row) => {

      // loading every user in a dictionary because it's fasterrrrr

      var dec = (await exports.decrypt(row.email)).toString().split("\u0004")[0];

      console.log(dec);

      exports.items.registered[dec] = {
        user_id: row.user_id
      };

      exports.items.users[row.user_id] = {

        name: await exports.decrypt(row.name),
        surname: await exports.decrypt(row.surname),
        email: dec,
        password: row.password

      }

    })

    return db.query("SELECT * FROM Sessions")

  })
  .then(sessions => {

    console.log(sessions);

    sessions.forEach(session => {

      exports.items.sessions[session.session_id] = { user_id: session.user_id, expiry: session.expiry }

    })

    console.log(exports.items.registered);

  })

module.exports.verifyPassword = (userid, password) => {

  return new Promise(

    (resolve, reject) => {

      console.log(exports.items.users[userid]);
      var hash = exports.items.users[userid].password;
      bcrypt.compare(password, hash, (err, success) => {

        if(err){
          reject(err);
          return;
        }

        resolve(success)

      })

    }

  )

}
module.exports.checkParameters = (args) => {

  return new Promise(

    (resolve, reject) => {

      for(var i = 0; i < args.length; i++){

        if(!args[i])
          return reject({success: false, error: 'missing_parameter', status: 400});

      }

      return resolve(true);

    }

  )

}


module.exports.encrypt = (text) => {

  return new Promise(

    (resolve, reject) => {

      var iv = crypto.randomBytes(16);
      var cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(exports.items.config.aes), iv);
      var encrypted = cipher.update(text);

      encrypted = Buffer.concat([encrypted, cipher.final()]);

      return resolve(iv.toString('hex') + ':' + encrypted.toString('hex'));

    }

  )

}

module.exports.decrypt = (text) => {

  return new Promise(

    (resolve, reject) => {

      var textParts = text.split(':');
      var iv = Buffer.from(textParts.shift(), 'hex');
      var encryptedText = Buffer.from(textParts.join(':'), 'hex');
      var decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(exports.items.config.aes), iv);
      decipher.setAutoPadding(false)
      var decrypted = decipher.update(encryptedText);

      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return resolve(decrypted.toString());

    }

  )

}

module.exports.hash = (password) => {

  return new Promise(

    (resolve, reject) => {

      bcrypt.hash(password, null, null, (err, hash) => {

        if(err) return reject(err);

        return resolve(hash)

      })

    }

  )

}
