const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

exports.sendResetEmail = async (email, resetUrl) => {
  await transporter.sendMail({
    from:    '"MyBlog" <no-reply@myblog.com>',
    to:      email,
    subject: 'Réinitialisation de ton mot de passe',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <h2 style="color: #534AB7; margin: 0;">MyBlog</h2>
          <p style="color: #888; font-size: 13px; margin: 4px 0 0;">Partagez vos idées, inspirez le monde</p>
        </div>
        <div style="background: white; border-radius: 12px; padding: 2rem; border: 1px solid #eee;">
          <h3 style="color: #1a1a1a; margin: 0 0 1rem;">Réinitialisation du mot de passe</h3>
          <p style="color: #555; font-size: 14px;">Tu as demandé à réinitialiser ton mot de passe. Clique sur le bouton ci-dessous :</p>
          <div style="text-align: center; margin: 1.5rem 0;">
            <a href="${resetUrl}"
              style="display: inline-block; padding: 12px 32px; background: #534AB7; color: white; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 15px;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p style="color: #888; font-size: 12px; text-align: center;">Ce lien expire dans <strong>1 heure</strong>.</p>
          <p style="color: #aaa; font-size: 12px; text-align: center;">Si tu n'as pas demandé cela, ignore cet email.</p>
        </div>
      </div>
    `
  });
};