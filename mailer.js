const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "658795e352bda6",
    pass: "4f36f139db0729"
  }
});

exports.sendEmail = async (to, subject, text) => {
  return transporter.sendMail({
    from: `"Print System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text
  });
};
