import nodemailer from 'nodemailer';

/**
 * Fire-and-forget inquiry notification email.
 *
 * If SMTP env vars are not configured, this is a silent no-op (the DB write in
 * /api/contact still succeeds). Any transport error is swallowed — it must
 * never block the contact-message persistence path.
 */
export interface InquiryEmailInput {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  country?: string | null;
  productInterest?: string | null;
  subject: string;
  message: string;
  locale?: string;
}

let cachedTransport: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter | null {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  if (cachedTransport) return cachedTransport;

  cachedTransport = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return cachedTransport;
}

export async function sendInquiryEmail(input: InquiryEmailInput): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    // SMTP not configured — skip silently.
    return;
  }

  const to = process.env.ADMIN_TO || process.env.SMTP_FROM;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const subjectLine = `New Inquiry [${input.subject}] from ${input.name}`;
  const text = [
    `You received a new inquiry on the QtechVending site.`,
    ``,
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone || '-'}`,
    `Company: ${input.company || '-'}`,
    `Country: ${input.country || '-'}`,
    `Product interest: ${input.productInterest || '-'}`,
    `Subject: ${input.subject}`,
    `Locale: ${input.locale || 'en'}`,
    ``,
    `Message:`,
    input.message,
  ].join('\n');

  try {
    await transport.sendMail({
      from: from || undefined,
      to,
      subject: subjectLine,
      text,
      replyTo: input.email,
    });
  } catch (err) {
    // Fire-and-forget: never block the request.
    console.error('[notifications] failed to send inquiry email:', err);
  }
}
