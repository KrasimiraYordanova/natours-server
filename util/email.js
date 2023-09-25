const nodemailer = require("nodemailer");

async function sendEmail(options) {
  // need to follow 3 steps in order to send mails with emailer
  
  // 1. we need to create a transporter
  // - it is not node js that will send the email itself
  // - the service we are going to use, like gmail
  // - nomatter what service we are going to use we always need to create a transporter
  const transporter = nodemailer.createTransport({
    // service: 'Gmail',
    // auth: {
    //     email: process.env.EMAIL_USERNAME,
    //     password: process.env.EMAIL_PASSWORD
    // }
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      password: process.env.EMAIL_PASSWORD,
    },
    // On gmail we need to active "less secure app" option
  });


  // 2. define the email options
  const mailOptions = {
    from: "Krasimira Yordanova <novakrasy@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };


  // 3. send the email with nodemailer
  // - asyncronous function returning a promise
  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;