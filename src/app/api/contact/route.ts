import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendInquiryEmail } from '@/lib/notifications';
import type { ContactSubject } from '@/types';

export const dynamic = 'force-dynamic';

const VALID_SUBJECTS: ContactSubject[] = ['general', 'sales', 'support', 'customization', 'partnership'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() || null : null;
  const company = typeof body.company === 'string' ? body.company.trim() || null : null;
  const country = typeof body.country === 'string' ? body.country.trim() || null : null;
  const productInterest = typeof body.productInterest === 'string' ? body.productInterest.trim() || null : null;
  const subjectRaw = typeof body.subject === 'string' ? body.subject : 'general';
  const subject = (VALID_SUBJECTS as string[]).includes(subjectRaw) ? (subjectRaw as ContactSubject) : 'general';
  const locale = typeof body.locale === 'string' ? body.locale : 'en';

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'name, email and message are required.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
  }

  try {
    const created = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone,
        company,
        country,
        productInterest,
        subject,
        message,
        locale,
      },
    });

    // Fire-and-forget email (never blocks the response).
    void sendInquiryEmail({
      name,
      email,
      phone,
      company,
      country,
      productInterest,
      subject,
      message,
      locale,
    });

    return NextResponse.json({ success: true, id: created.id }, { status: 200 });
  } catch (err) {
    console.error('[api/contact] failed to persist message:', err);
    return NextResponse.json({ error: 'Failed to save your inquiry. Please try again.' }, { status: 500 });
  }
}
