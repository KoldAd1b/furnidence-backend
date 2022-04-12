const nodemailer = require("nodemailer");
const CustomError = require("../errors");
const ejs = require("ejs");
const path = require("path");
const sgMail = require("@sendgrid/mail");

const sendEmail = async (to, subject, text, html) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to, // Change to your recipient
    from: "kaageahrx420@gmail.com", // Change to your verified sender
    subject,
    text,
    html,
  };

  sgMail
    .send(msg)
    .then(() => {
      return "Successfully sent email";
    })
    .catch((error) => {
      return null;
    });
};

// const sendEtherealEmail = async (to, subject, html) => {
//   let testAccount = nodemailer.createTestAccount();

//   const transporter = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 587,
//     auth: {
//       user: "guillermo.kiehn86@ethereal.email",
//       pass: "DDdtRD9EnbJJ7pesra",
//     },
//   });

//   return await transporter.sendMail({
//     from: '"Ahnaf Adib" <kaageahrx420@gmail.com>', // sender address
//     to, // list of receivers
//     subject, // Subject line
//     text: "Testing for development", // plain text body
//     html, // html body
//   });
// };

const sendVerificationEmail = async (name, email, token, origin, host) => {
  const verifyEmail = `${origin}/user/verify-email?token=${token}&email=${email}`;
  const backgroundURL =
    "https://res.cloudinary.com/dxwfpdznq/image/upload/v1649152498/furniture_lworiq.jpg";
  const logoURL =
    "https://res.cloudinary.com/dxwfpdznq/image/upload/v1649152510/logo_wdvdp5.jpg";
  ejs.renderFile(
    path.join(__dirname, "../", "views", "email", "verify-email.ejs"),
    { verifyLink: verifyEmail, name, backgroundURL, logoURL },
    async function (err, data) {
      if (err) {
      } else {
        return await sendEmail(
          email,
          "Verify Your Email",
          "Your email verification link",
          data
        );
      }
    }
  );
};

const sendPasswordResetEmail = async (name, email, token, origin, host) => {
  const passwordResetEmail = `${origin}/user/reset-password?token=${token}&email=${email}`;
  const backgroundURL =
    "https://res.cloudinary.com/dxwfpdznq/image/upload/v1649152498/furniture_lworiq.jpg";
  const logoURL =
    "https://res.cloudinary.com/dxwfpdznq/image/upload/v1649152510/logo_wdvdp5.jpg";
  ejs.renderFile(
    path.join(__dirname, "../", "views", "email", "reset-password.ejs"),
    { resetLink: passwordResetEmail, name, backgroundURL, logoURL },
    async function (err, data) {
      if (err) {
      } else {
        return await sendEmail(
          email,
          "Reset your password",
          "Your Password reset link",
          data
        );
      }
    }
  );
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
