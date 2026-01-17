import { NextRequest, NextResponse } from 'next/server';

type LeadData = {
  name: string;
  phone: string;
  message: string;
  intent?: string;
};

export async function POST(request: NextRequest) {
  try {
    const { apiKey, lead } = await request.json() as { apiKey?: string; lead: LeadData };

    if (!lead || !lead.name || !lead.phone) {
      return NextResponse.json(
        { success: false, error: 'Lead data incomplete' },
        { status: 400 }
      );
    }

    // If no API key provided, use sandbox mode
    if (!apiKey) {
      // Return mock response for sandbox mode
      return NextResponse.json({
        success: true,
        leadId: `sandbox-${Date.now()}`,
        message: 'Lead logged in sandbox mode (no API key provided)',
        sandbox: true,
      });
    }

    const fubApiBaseUrl = process.env.FUB_API_BASE_URL || 'https://api.followupboss.com/v1/';
    const createPersonUrl = `${fubApiBaseUrl}people`;

    // Format lead data for Follow Up Boss API
    const fubPayload = {
      name: lead.name,
      phones: [{ number: lead.phone, type: 'mobile' }],
      tags: ['AI-qualified', lead.intent || 'inquiry'],
      sources: ['SMS Lead'],
      notes: [
        {
          body: `Lead source: SMS/Email\nMessage: ${lead.message}\nIntent: ${lead.intent || 'inquiry'}\nAI-qualified and logged automatically via POSENTIA LeadFlow`,
          type: 'note',
        },
      ],
    };

    // Push to Follow Up Boss
    const response = await fetch(createPersonUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fubPayload),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        leadId: data.id || data.person?.id || 'unknown',
        message: 'Lead successfully pushed to Follow Up Boss',
        sandbox: false,
      });
    } else {
      const errorText = await response.text();
      console.error('Follow Up Boss API error:', response.status, errorText);
      
      // Return sandbox mode response if API fails
      return NextResponse.json({
        success: true,
        leadId: `sandbox-${Date.now()}`,
        message: `API push failed (status ${response.status}), logged in sandbox mode`,
        error: errorText.substring(0, 200),
        sandbox: true,
      });
    }
  } catch (error) {
    console.error('Follow Up Boss push lead error:', error);
    
    // Return sandbox mode response on error
    return NextResponse.json({
      success: true,
      leadId: `sandbox-${Date.now()}`,
      message: 'Error during push, logged in sandbox mode',
      error: error instanceof Error ? error.message : 'Unknown error',
      sandbox: true,
    });
  }
}

