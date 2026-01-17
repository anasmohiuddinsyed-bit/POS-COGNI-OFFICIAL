import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { webhookUrl, lead } = await request.json();

    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, error: 'Webhook URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(webhookUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook URL format' },
        { status: 400 }
      );
    }

    // Prepare payload (redact PII)
    const payload = {
      contact: {
        name: lead.name || 'Lead',
        phone: lead.phone || '***-***-****',
        source: lead.source || 'Unknown',
      },
      qualification: {
        intent: lead.qualification?.intent || '',
        timeline: lead.qualification?.timeline || '',
        budget: lead.qualification?.budget || '',
        location: lead.qualification?.location || '',
        preApproval: lead.qualification?.preApproval || '',
        leadScore: lead.qualification?.leadScore || '',
        nextAction: lead.qualification?.nextAction || '',
      },
      tags: [
        lead.qualification?.intent,
        lead.qualification?.leadScore,
        `Source: ${lead.source}`,
      ].filter(Boolean),
      notes: lead.qualification ? 
        `AI-qualified lead. Intent: ${lead.qualification.intent || 'Unknown'}. Timeline: ${lead.qualification.timeline || 'Unknown'}. Budget: ${lead.qualification.budget || 'Unknown'}. Score: ${lead.qualification.leadScore || 'Unknown'}.` :
        'Lead received and qualified by POSENTIA AI.',
      tasks: lead.qualification?.nextAction ? [
        {
          action: lead.qualification.nextAction,
          priority: lead.qualification.leadScore === 'Hot' ? 'High' : 'Normal',
        },
      ] : [],
      timestamp: new Date().toISOString(),
    };

    // Send to webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Successfully sent to CRM webhook',
      });
    } else {
      const errorText = await response.text().catch(() => 'Unknown error');
      return NextResponse.json(
        {
          success: false,
          error: `CRM webhook returned status ${response.status}: ${errorText.substring(0, 200)}`,
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Webhook test error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'Request timeout - webhook did not respond in time' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

