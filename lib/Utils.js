const fs        = require("fs");
const Promise   = require("promise");
const crypto    = require("crypto")
const random    = require('randomstring');
const bcrypt    = require('bcrypt-nodejs')
const MySQL     = require("./MySQL");
const moment    = require("moment");
const ALGORITHM = 'aes-128-cbc';
const config    = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

const db = new MySQL(config);

module.exports.items = {

  db: db,
  config: config,
  random: (len) => { return random.generate(len); },
  registered: {},
  users: {},
  sessions: {},
  adminSessions: {},
  adminReports: [],
  adminGeneric: [],
  adminPages: {},
  reports: [],
  reports_per_state: {},
  reports_per_id: {},
  reports_per_description: {},
  generic_reports_per_description: {},
  generic_reports_per_state: {},
  generic_reports_per_id: {},
  mappedUsers: [],
  genericReports: [],
  admins: {},
  usernameToAdminId : {},
  adminListening: []

}

db.query("SELECT * FROM AdminSessions")
  .then(sessions => {

    sessions.forEach(session => {

      exports.items.adminSessions[session.session_id] = { user_id: session.user_id, expiry: session.expiry }

    })

  })

db.query("SELECT * FROM GenericReports ORDER BY report_date")
  .then(reports => {

    reports.forEach(report => {

      exports.items.adminGeneric.push(report)
      exports.items.generic_reports_per_id[report.report_id] = report;
      exports.items.genericReports.push({report_date: report.report_date, report_state: report.report_state, report_title: report.report_title, report_address: report.report_address, report_latitude: report.report_latitude, report_longitude: report.report_longitude})
      exports.items.generic_reports_per_description[report.report_description] = report.report_id;
      if(!exports.items.generic_reports_per_state.hasOwnProperty(report.report_state))
        exports.items.generic_reports_per_state[report.report_state] = {};


      exports.items.generic_reports_per_state[report.report_state][report.report_id] = {report_date: report.report_date, report_state: report.report_state, report_title: report.report_title, report_address: report.report_address, report_latitude: report.report_latitude, report_longitude: report.report_longitude}

    })

  })

db.query("SELECT * FROM Admins")
  .then(rows => {

    rows.forEach(row => {

      exports.items.usernameToAdminId[row.username] = {user_id: row.user_id}

      exports.items.admins[row.user_id] = {

        username: row.username,
        password: row.password,
        uber_admin: row.uber_admin

      }

    })

  })

db.query("SELECT * FROM Users")
  .then(rows => {
    rows.forEach(async(row) => {

      // loading every user in a dictionary because it's fasterrrrr

      var dec = (await exports.decrypt(row.email)).toString("utf-8");

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

    sessions.forEach(session => {

      exports.items.sessions[session.session_id] = { user_id: session.user_id, expiry: session.expiry }

    })

    return db.query(`
      SELECT * FROM Reports ORDER BY report_date DESC
      `)

  })

  .then(reports => {

    var index = 0, page = 1;
    exports.items.adminPages["1"] = [];

    reports.forEach(report => {

      if(index % 10 == 0 && index != 0){
        page++;
        exports.items.adminPages[page.toString()] = [];
      }

      report.readable_date = moment(report.report_date * 1000).format('DD/MM/YYYY').toString();
      report.user = exports.items.users[report.user_id];
      exports.items.adminReports.push(report);
      exports.items.reports_per_id[report.report_id] = report;
      exports.items.adminPages[page.toString()].push(report);
      exports.items.reports.push({report_date: report.report_date, report_state: report.report_state, report_title: report.report_title, report_address: report.report_address, report_latitude: report.report_latitude, report_longitude: report.report_longitude})
      exports.items.reports_per_description[report.report_description] = report.report_id;
      if(!exports.items.reports_per_state.hasOwnProperty(report.report_state))
        exports.items.reports_per_state[report.report_state] = {};

      exports.items.reports_per_state[report.report_state][report.report_id] = {report_date: report.report_date, report_state: report.report_state, report_title: report.report_title, report_address: report.report_address, report_latitude: report.report_latitude, report_longitude: report.report_longitude}

      index++;

    })

    console.log(exports.items.adminReports.length);

  })

module.exports.updateGenericReports = (report) => {

  exports.items.adminGeneric.unshift(report)
  exports.items.genericReports.unshift({report_date: report.report_date, report_state: report.report_state, report_title: report.report_title, report_address: report.report_address, report_latitude: report.report_latitude, report_longitude: report.report_longitude})
  exports.items.generic_reports_per_description[report.report_description] = report.report_id;
  if(!exports.items.generic_reports_per_state.hasOwnProperty(report.report_state))
    exports.items.generic_reports_per_state[report.report_state] = {};

  exports.items.generic_reports_per_state[report.report_state][report.report_id] = {report_date: report.report_date, report_state: report.report_state, report_title: report.report_title, report_address: report.report_address, report_latitude: report.report_latitude, report_longitude: report.report_longitude}
}

module.exports.reloadReports = (report) => {

  return new Promise(

    (resolve, reject) => {

      db.query("SELECT * FROM Reports ORDER BY report_date DESC")
      .then(reports => {

        var index = 0, page = 1;
        exports.items.adminPages["1"] = [];

        reports.forEach(report => {

          if(index % 10 == 0 && index != 0){
            page++;
            exports.items.adminPages[page.toString()] = [];
          }

          report.readable_date = moment(report.report_date * 1000).format('DD/MM/YYYY').toString();
          report.user = exports.items.users[report.user_id];
          exports.items.adminReports.push(report);
          exports.items.reports_per_id[report.report_id] = report;
          exports.items.adminPages[page.toString()].push(report);
          exports.items.reports.push({report_date: report.report_date, report_state: report.report_state, report_title: report.report_title, report_address: report.report_address, report_latitude: report.report_latitude, report_longitude: report.report_longitude})
          exports.items.reports_per_description[report.report_description] = report.report_id;
          if(!exports.items.reports_per_state.hasOwnProperty(report.report_state))
            exports.items.reports_per_state[report.report_state] = {};

          exports.items.reports_per_state[report.report_state][report.report_id] = {report_date: report.report_date, report_state: report.report_state, report_title: report.report_title, report_address: report.report_address, report_latitude: report.report_latitude, report_longitude: report.report_longitude}

          index++;

        })

        resolve(true)

      })

    }

  )

}

module.exports.updateReports = (report) => {

  exports.items.adminReports.unshift(report);
  exports.items.reports_per_id[report.report_id] = report;
  report.user = exports.items.users[report.user_id];
  exports.items.reports.unshift({report_date: report.report_date, report_state: report.report_state, report_title: report.report_title, report_address: report.report_address, report_latitude: report.report_latitude, report_longitude: report.report_longitude})
  exports.items.reports_per_description[report.report_description] = report.report_id;
  if(!exports.items.reports_per_state.hasOwnProperty(report.report_state))
    exports.items.reports_per_state[report.report_state] = {};

  exports.items.reports_per_state[report.report_state][report.report_id] = {report_date: report.report_date, report_state: report.report_state, report_title: report.report_title, report_address: report.report_address, report_latitude: report.report_latitude, report_longitude: report.report_longitude}

}

module.exports.writeImage = (base64, path) => {

  return new Promise(

    (resolve, reject) => {

      var d = Buffer.from(base64, "base64");

      var writer = fs.createWriteStream(path);

      writer.write(d)
      writer.end();

      writer.on('close', () => {

        return resolve(true)

      })

      writer.on('error', (err) => {

        return reject(err)

      })

    }

  )

}

module.exports.getCategories = async(inverted) => {

  try{

    var categories = await exports.items.db.query("SELECT * FROM Categories");
    var c = {};

    if(inverted){

      categories.map(category => {

        c[category.category_name] = category.category_id;

      })

    }else{

      categories.map(category => {

        c[category.category_id] = category.category_name;

      })

    }

    return c;

  }catch(err){

    return err;

  }

}

module.exports.verifyAdminSession = async(sessionid) => {

    try{
      if(exports.items.adminSessions.hasOwnProperty(sessionid)){
        var expiry = exports.items.adminSessions[sessionid].expiry;
        var current = (new Date().getTime()) / 1000;
        if(expiry < current){

          delete exports.items.adminSession[sessionid];

          await exports.items.db.query("DELETE FROM AdminSessions WHERE session_id = ?", [sessionid])

          return {success: false, error: 'session_expired'};

        }
        return {success: true, time_left: (expiry - current).toFixed(0)}

      }else{

        return {success: false, error: 'invalid_session', status: 403}

      }
    }catch(err){

      return err;

    }
}

module.exports.verifySession = async(sessionid) => {

    try{
      if(exports.items.sessions.hasOwnProperty(sessionid)){
        var expiry = exports.items.sessions[sessionid].expiry;
        var current = (new Date().getTime()) / 1000;
        if(expiry < current){

          delete utils.items.sessions[sessionid];

          await utils.items.db.query("DELETE FROM Sessions WHERE session_id = ?", [sessionid])

          return {success: false, error: 'session_expired'};

        }

        return {success: true, time_left: (expiry - current).toFixed(0)}

      }else{

        return {success: false, error: 'invalid_session', status: 403}

      }
    }catch(err){

      return err;

    }
}

module.exports.verifyPassword = (userid, password, admin) => {

  return new Promise(

    (resolve, reject) => {
      var hash;

      if(admin)
        hash = exports.items.admins[userid.user_id].password;
      else
        hash = exports.items.users[userid.user_id].password;


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

      var iv = random.generate(16);
      var cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(exports.items.config.aes), iv);
      var encrypted = cipher.update(text);

      encrypted = Buffer.concat([encrypted, cipher.final()]);

      return resolve(Buffer.from(iv).toString('hex') + ':' + encrypted.toString('hex'));

    }

  )

}

module.exports.decrypt = (text) => {

  return new Promise(

    (resolve, reject) => {

      var textParts = text.split(':');
      var iv = Buffer.from(textParts.shift(), 'hex');
      var encryptedText = Buffer.from(textParts.join(':'), 'hex');
      var decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(exports.items.config.aes), iv);
      decipher.setAutoPadding(true)
      var decrypted = decipher.update(encryptedText);

      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return resolve(decrypted.toString('ascii'));

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
