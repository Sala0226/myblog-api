const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

exports.sendResetEmail = async (email, resetUrl) => {
  await transporter.sendMail({
    from: `"MyBlog" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Réinitialisation de ton mot de passe',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
        <h2 style="color: #534AB7;">Réinitialisation du mot de passe</h2>
        <p>Tu as demandé à réinitialiser ton mot de passe.</p>
        <p>Clique sur le bouton ci-dessous. Ce lien expire dans <strong>1 heure</strong>.</p>
        <a href="${resetUrl}"
          style="display: inline-block; padding: 12px 24px; background: #534AB7; color: white; border-radius: 8px; text-decoration: none; font-weight: 500; margin: 1rem 0;">
          Réinitialiser mon mot de passe
        </a>
        <p style="color: #888; font-size: 13px;">Si tu n'as pas demandé cela, ignore cet email.</p>
      </div>
    `
  });
};