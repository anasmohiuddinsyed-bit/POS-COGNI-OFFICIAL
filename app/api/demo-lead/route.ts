import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, product } = body;

    // Validate at least one contact method is provided
    if (!email && !phone) {
      return NextResponse.json(
        { success: false, error: 'Email or phone number is required' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format if provided (10 digits)
    if (phone && !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      return NextResponse.json(
        { success: false, error: 'Phone number must be 10 digits' },
        { status: 400 }
      );
    }

    // Save to Supabase
    if (supabase) {
      try {
        // Use demo_submissions table, but adapt the schema
        // We'll store product type in service_type field
        // Note: Schema requires email and phone_number to be NOT NULL, so we use empty strings if missing
        const { error: dbError } = await supabase
          .from('demo_submissions')
          .insert({
            business_name: `Demo User - ${product || 'demo'}`,
            email: email || '',
            phone_number: phone || '',
            service_type: product || 'demo', // Lead Concierge or Receptionist
            created_at: new Date().toISOString(),
          });

        if (dbError) {
          console.error('Supabase insert error:', dbError);
          // Continue even if DB save fails - still return success
        } else {
          console.log('✅ Successfully saved demo lead to Supabase');
        }
      } catch (dbError: any) {
        console.error('Failed to save to Supabase:', dbError);
        // Continue even if DB save fails
      }
    } else {
      console.warn('⚠️  Supabase not configured - skipping database save');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error processing demo lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

