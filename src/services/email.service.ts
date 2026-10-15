import 'dotenv/config';
import nodemailer from 'nodemailer';

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

  // eslint-disable-next-line no-console
  console.log(
    'Activation link:',
    `http://localhost:3005/auth/activate/${activationToken}`,
  );

  return send(email, 'Account activation', html);
}

function sendEmailChangedNotification(oldEmail: string, newEmail: string) {
  const html = `
    <h1>Your email was changed</h1>
    <p>Your account email was changed to ${newEmail}.</p>
    <p>If this was not you, contact support.</p>
  `;

  return send(oldEmail, 'Your email was changed', html);
}

export const mailer = {
  send,
  sendActivationLink,
  sendEmailChangedNotification,
};
