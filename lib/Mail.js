const nodemailer = require(`nodemailer`);
const utils      = require(`./Utils`);
const Promise    = require(`promise`);
const fs         = require(`fs`)

class Mail{

  constructor(obj){

    console.log(obj.email);

    this.obj = obj;
    this.subject = obj.subject;
    this.email   = obj.email;
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: utils.items.config.email,
        pass: utils.items.config.email_password
      }
    });

  }

  init(){

    return new Promise(

      (resolve, reject) => {

        console.log(this.obj.template);

        fs.readFile(this.obj.template, (err, data) => {

          data = data.toString('utf8')

          for(var value in this.obj.variables){

            var r = new RegExp(`%${value}%`, ['g'])
            data = data.replace(r, this.obj.variables[value])

          }

          this.options = {
            from: `"Comunicazioni Mountain Wilderness" <${utils.items.config.email}>`,
            to: this.email,
            subject: this.subject,
            html: data
          }
          console.log(this.options);
          return resolve(true)

        })

      }

    )

  }

  async send(){

    try{
      console.log("sending...");
      console.log(this.options);
      var info = await this.transporter.sendMail(this.options);
      console.log(info);
      return info;
    }catch(err){
      throw err;
    }

  }

}

module.exports = Mail;
