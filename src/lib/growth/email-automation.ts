import { logger } from '@ares/logger';
import { Resend } from 'resend';


let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY ?? '');
  }
  return _resend;
}
const FROM_EMAIL = 'SensiPRO <noreply@sensibilidadespro.com>';

interface EmailInput {
  to: string;
  subject: string;
  html: string;
}

interface EmailResult {
  id: string;
}

async function sendEmail(input: EmailInput): Promise<EmailResult | null> {
  try {
    const result = await getResend().emails.send({
      from: FROM_EMAIL,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    logger.info('Email sent', { to: input.to, subject: input.subject });
    return result.data;
  } catch (error) {
    logger.error('Email failed', { to: input.to, error: String(error) });
    return null;
  }
}

export async function sendWelcomeEmail(email: string, username: string): Promise<EmailResult | null> {
  return sendEmail({
    to: email,
    subject: `🎯 ¡Bienvenido a SensiPRO, ${username}!`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#050810;color:white;padding:32px;border-radius:12px">
        <h1 style="color:#ff6a00;font-size:24px">¡Bienvenido a SensiPRO!</h1>
        <p style="color:#94a3b8;line-height:1.6">
          Hola ${username}, tu cuenta está lista. Genera tu primera sensibilidad perfecta para Free Fire.
        </p>
        <a href="https://sensibilidadespro.com/generator" style="display:inline-block;background:#ff6a00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
          Ir al Generador →
        </a>
        <p style="color:#475569;font-size:12px;margin-top:32px">
          Si no creaste esta cuenta, ignora este email.
        </p>
      </div>
    `,
  });
}

export async function sendExpirationEmail(email: string, username: string, daysLeft: number): Promise<EmailResult | null> {
  return sendEmail({
    to: email,
    subject: `⚠️ Tu suscripción expira en ${daysLeft} días`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#050810;color:white;padding:32px;border-radius:12px">
        <h1 style="color:#f59e0b;font-size:24px">Tu suscripción expira pronto</h1>
        <p style="color:#94a3b8;line-height:1.6">
          ${username}, te quedan ${daysLeft} días de acceso Premium. Renueva para no perder tus funciones.
        </p>
        <a href="https://sensibilidadespro.com/pricing" style="display:inline-block;background:#ff6a00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
          Renovar Ahora →
        </a>
      </div>
    `,
  });
}

export async function sendWinBackEmail(email: string, username: string): Promise<EmailResult | null> {
  return sendEmail({
    to: email,
    subject: `🎮 ¡Te extrañamos, ${username}! 20% OFF en Premium`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#050810;color:white;padding:32px;border-radius:12px">
        <h1 style="color:#ff6a00;font-size:24px">¡Vuelve a SensiPRO!</h1>
        <p style="color:#94a3b8;line-height:1.6">
          ${username}, hace tiempo que no generas sensibilidades. Tenemos nuevos dispositivos y guías esperándote.
        </p>
        <p style="color:#f59e0b;font-weight:bold;font-size:18px;margin-top:16px">
          🔥 20% de descuento en Premium — solo por hoy
        </p>
        <a href="https://sensibilidadespro.com/pricing?promo=WINBACK20" style="display:inline-block;background:#ff6a00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
          Obtener Descuento →
        </a>
      </div>
    `,
  });
}
