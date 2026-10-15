import 'dotenv/config';
import nodemailer from 'nodemailer';

// // Create a transporter using SMTP
// const transporter = nodemailer.createTransport({
//   host: "smtp.example.com",
//   port: 587,
//   secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function send(email: string, subject: string, html: string) {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    html,
  });
}

function sendActivationLink(email: string, activationToken: string) {
  const link = `${process.env.CLIENT_HOST}/activate/${activationToken}`;

  const html = `
    <h1>Account activation</h1>
    <a href="${link}">${link}</a>
  `;

  // console.log('Activation link:', link);
  // eslint-disable-next-line no-console
  console.log(
    'Activation link:',
    `http://localhost:3005/auth/activate/${activationToken}`,
  );

  return send(email, 'Account activation', html);
}

export const mailer = {
  send,
  sendActivationLink,
};
