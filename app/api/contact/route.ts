import { NextRequest, NextResponse } from 'next/server';
import { appendFile, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { supabase } from '@/lib/supabase';

async function saveContactToCSV(data: {
  timestamp: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  industry: string;
  callVolume?: string;
  message: string;
}) {
  try {
    const dataDir = join(process.cwd(), 'data');
    const csvPath = join(dataDir, 'QUESTIONS.CSV');

    // Create data directory if it doesn't exist
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    // CSV headers
    const headers = 'Timestamp,Name,Email,Phone,Company,Industry,CallVolume,Message\n';

    // Check if file exists, if not create it with headers
    if (!existsSync(csvPath)) {
      await writeFile(csvPath, headers, 'utf-8');
    }

    // Escape CSV values (handle commas and quotes)
    const escapeCSV = (value: string | undefined) => {
      if (!value) return '';
      const stringValue = String(value);
      // If contains comma, quote, or newline, wrap in quotes and escape quotes
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Prepare CSV row
    const row = [
      escapeCSV(data.timestamp),
      escapeCSV(data.name),
      escapeCSV(data.email),
      escapeCSV(data.phone),
      escapeCSV(data.company),
      escapeCSV(data.industry),
      escapeCSV(data.callVolume),
      escapeCSV(data.message),
    ].join(',');

    // Append to CSV file
    await appendFile(csvPath, row + '\n', 'utf-8');
  } catch (error) {
    console.error('Failed to save contact to CSV:', error);
    // Don't throw - we don't want CSV errors to break the API response
  }
}

async function sendEmailNotification(data: {
  name: string;
  email: string;
  phone?: string;
  company: string;
  industry: string;
  callVolume?: string;
  message: string;
}): Promise<boolean> {
  try {
    // Get recipient email from environment variable, or use a default
    const recipientEmail = process.env.CONTACT_FORM_RECIPIENT_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL;
    
    if (!recipientEmail) {
      console.log('No CONTACT_FORM_RECIPIENT_EMAIL env var set - skipping email');
      return false;
    }

    // Use Resend API (recommended for Vercel) or simple fetch to email service
    // Option 1: Resend (install: npm install resend)
    // Option 2: Simple email via API (using a service like EmailJS, FormSpree, or SendGrid)
    
    // For now, we'll use a simple approach with fetch to a service
    // You can replace this with Resend or another email service
    
    const emailBody = `
New Contact Form Submission from POSENTIA Website

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Company: ${data.company}
Industry: ${data.industry}
Call Volume: ${data.callVolume || 'Not specified'}

Message:
${data.message}

---
Submitted at: ${new Date().toISOString()}
    `.trim();

    // If RESEND_API_KEY is set, use Resend
    if (process.env.RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'POSENTIA <noreply@posentia.com>',
          to: recipientEmail,
          subject: `New Contact Form: ${data.company} - ${data.name}`,
          text: emailBody,
        }),
      });

      if (!resendResponse.ok) {
        const error = await resendResponse.text();
        console.error('Resend API error:', error);
        return false;
      }

      return true;
    }

    // Fallback: Log the email (for local dev or if no email service configured)
    console.log('=== CONTACT FORM SUBMISSION ===');
    console.log(emailBody);
    console.log('=== END SUBMISSION ===');
    
    return false; // Return false since we didn't actually send
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, company, industry, callVolume, message } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!company || !company.trim()) {
      return NextResponse.json(
        { error: 'Company is required' },
        { status: 400 }
      );
    }

    if (!industry) {
      return NextResponse.json(
        { error: 'Industry is required' },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Save to Supabase (primary storage - works on Vercel)
    if (supabase) {
      try {
        const { error: dbError } = await supabase
          .from('contact_submissions')
          .insert({
            name: name.trim(),
            email,
            phone: phone || null,
            company: company.trim(),
            industry,
            call_volume: callVolume || null,
            message: message.trim(),
          });

        if (dbError) {
          console.error('Supabase insert error:', dbError);
          console.error('Error details:', JSON.stringify(dbError, null, 2));
          // Don't fail the request - CSV fallback will handle it
          // But log detailed error for debugging
        } else {
          console.log('✅ Successfully saved to Supabase');
        }
      } catch (dbError: any) {
        console.error('Failed to save to Supabase:', dbError);
        // Don't fail the request if DB save fails - still return success
        // CSV will save locally as fallback
      }
    } else {
      console.warn('⚠️  Supabase not configured - skipping database save');
      console.warn('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    }

    // Try to save to CSV (works locally, fails silently on Vercel)
    try {
      await saveContactToCSV({
        timestamp: new Date().toISOString(),
        name: name.trim(),
        email,
        phone: phone || '',
        company: company.trim(),
        industry,
        callVolume: callVolume || '',
        message: message.trim(),
      });
    } catch (csvError) {
      // CSV saving fails on Vercel - that's expected
      console.log('CSV save skipped (expected on Vercel)');
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been received. We will get back to you soon.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}

