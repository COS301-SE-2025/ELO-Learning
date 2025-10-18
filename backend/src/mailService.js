import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@elo-learning.co.za';

let transporter = null;
if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function sendResetEmail(toEmail, toName, resetLink) {
  const subject = 'ELO Learning — Password Reset Request';
  const text = `Hi ${
    toName || ''
  },\n\nWe received a request to reset your ELO Learning password. Click the link below to reset your password:\n\n${resetLink}\n\nIf you didn't request this, you can safely ignore this email. The link will expire in 1 hour.\n\nThanks,\nELO Learning Team`;

  const html = `<p>Hi ${toName || ''},</p>
    <p>We received a request to reset your ELO Learning password. Click the button below to reset your password. The link will expire in 1 hour.</p>
    <p><a href="${resetLink}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none">Reset Password</a></p>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <p>Thanks,<br/>ELO Learning Team</p>`;

  if (!transporter) {
    // Fallback: log reset link to console so developers can use it in dev environment
    console.log('SMTP not configured. Skipping email send. Reset link:');
    console.log(resetLink);
    return { ok: true, info: 'smtp-not-configured' };
  }

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: toEmail,
      subject,
      text,
      html,
    });
    return { ok: true, info };
  } catch (err) {
    console.error('Error sending reset email:', err);
    return { ok: false, error: err };
  }
}

export default { sendResetEmail };
