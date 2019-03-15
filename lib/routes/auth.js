const express = require(`express`);
const router  = express.Router();
const utils   = require('../Utils');
const Mail    = require('../Mail')

router.get('/', (req, res) => {

  res.json({

    success: true,
    message: "auth_endpoint",
    version: "1.0.0"

  })

})

router.post('/session', async(req, res) => {

  var sessionid = req.body.sessionid;
  var check;

  try{

    check = await utils.verifySession(sessionid);
    res.json(check)

  }catch(err){

    res.status(err.status || 500).json(err)

  }

})

router.post('/keepalive', async(req, res) => {

  var userid = req.body.userid,
      sessionid = req.body.sessionid;

  try{

    if(!(await utils.checkParameters([userid, sessionid])))
      return res.status(400).json({success: false, error: 'missing_parameter'})

    if(utils.items.sessions[sessionid]){

      var expiry = utils.items.sessions[sessionid].expiry;
      var current = (new Date().getTime()) / 1000;
      if(expiry < current){

        delete utils.items.sessions[sessionid];
        await utils.items.db.query("DELETE FROM Sessions WHERE session_id = ?", [sessionid])

        return res.status(403).json({success: false, error: 'session_expired'});

      }

      utils.items.sessions[sessionid].expiry += 172800;
      await utils.items.db.query("UPDATE Sessions SET expiry = expiry + ? WHERE session_id = ?", [172800, sessionid])

    }else{

      return res.status(403).json({success: false, error: 'invalid_session'})

    }

  }catch(err){

    return res.status(err.status || 500).json(err)

  }

})

router.post('/login', async(req, res) => {

  var email = req.body.email,
      password = req.body.password,
      userid = utils.items.registered[email];

  console.log("parameters" + email, password, userid);

  try{

    if(!(await utils.checkParameters([email, password])))
      return res.status(400).json({success: false, error: 'missing_parameter'})

    console.log("parameters: correct");

    if(userid)
      return res.status(403).json({success: false, error: 'invalid_credentials'});

    if(!(await utils.verifyPassword(userid, password)))
      return res.status(403).json({success: false, error: 'invalid_credentials'});

    else{

      console.log("credentials: correct");
      var isVerified = (await utils.items.db.query("SELECT * FROM ConfirmedUsers WHERE user_id = ?", [userid])).length;

      if(!isVerified)
        return res.status(403).json({success: false, error: 'unverified_account'})

      var sessionid = utils.items.random(128),
      expiryTime = parseInt(((new Date().getTime()) / 1000)) + 172800; // 2 days session that will eventually be extended every login (if in the 48h range)

      await utils.items.db.query("INSERT INTO Sessions VALUES(?,?,?)", [userid, sessionid, expiryTime])
      utils.items.sessions[sessionid] = {user_id: userid, expiry: expiryTime}

      console.log(utils.items.sessions);

      res.status(200).json({success: true, sessionid: sessionid, userid, issued_at: parseInt(((new Date().getTime()) / 1000))})

    }

  }catch(err){

    throw err;
    res.status(err.status || 500).json(err)

  }

})

router.post('/register', async(req, res) => {

  var name = req.body.name,
      surname = req.body.surname,
      email = req.body.email,
      password = req.body.password,
      userid   = utils.items.random(128),
      hash;

  console.log(name, surname, email);

  if(!(await utils.checkParameters([name, surname, email, password])))
    return res.status(400).json({success: false, error: 'missing_parameter'})

  if(utils.items.registered[email])
    return res.status(409).json({success: false, error: 'email_already_registered'})

  if(password.length < 8)
    return res.status(400).json({success: false, error: 'invalid_password'})

  utils.hash(password)
    .then(hashed => {

      hash = hashed;

      console.log(hashed);

      var toDo = [

        utils.encrypt(name),
        utils.encrypt(surname),
        utils.encrypt(email)

      ]
      console.log(toDo);
      return Promise.all(toDo);

    })

    .then(items => {

      var encryptedName = items[0],
          encryptedSurname = items[1],
          encryptedEmail = items[2];

      console.log("encrypted");

      return utils.items.db.query(`INSERT INTO Users VALUES(?,?,?,?,?)`, [encryptedName, encryptedSurname, encryptedEmail, hash, userid])

    })

    .then(async(success) => {

      console.log(`sending to: ${email}`);
      var gen = utils.items.random(128);
      var base64email = Buffer.from(email).toString('base64');
      console.log("bongo");
      var code = `${utils.items.config.endpoint}/verify/${gen}/${base64email}`
      await utils.items.db.query("INSERT INTO EmailVerifications VALUES(?,?)", [email, gen])
      // non blocking email
      var mail = new Mail({
        email: email,
        subject: 'Registrazione a Mountain Wilderness',
        template: './data/service/registration-email.html',
        variables: {
          "name": name,
          "surname": surname,
          "code": code
        }
      });

      await mail.init();
      mail.send();

      console.log("done");

      utils.items.registered[email] = userid;
      utils.items.users[userid] = {name, surname, email, password: hash}

      console.log(utils.items.users[userid]);

      return res.status(200).json({
        success: true
      })

    })

    .catch(err => {

      throw err;
      console.log(err);
      return res.json(err)

    })


})


module.exports = router;
