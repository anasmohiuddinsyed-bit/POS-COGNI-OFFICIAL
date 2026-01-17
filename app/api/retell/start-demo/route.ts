import { NextRequest, NextResponse } from 'next/server';

// Placeholder for Retell demo call initiation
// This would integrate with Retell API when RETELL_API_KEY is configured

export async function POST(request: NextRequest) {
  try {
    const { agentId, phoneNumber } = await request.json();

    const apiKey = process.env.RETELL_API_KEY;

    if (!apiKey) {
      // Return mock response for demo
      return NextResponse.json({
        success: true,
        callId: `demo-call-${Date.now()}`,
        message: 'Retell API key not configured. Demo mode.',
        mock: true,
      });
    }

    // TODO: Implement actual Retell API integration
    // const retellUrl = `https://api.retell.ai/v2/create-phone-call`;
    // const response = await fetch(retellUrl, { ... });

    return NextResponse.json({
      success: true,
      callId: `call-${Date.now()}`,
      message: 'Demo call initiated (placeholder - Retell integration pending)',
      mock: false,
    });
  } catch (error) {
    console.error('Retell demo call error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

