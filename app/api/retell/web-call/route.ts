import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { businessProfile } = await request.json();

    if (!businessProfile) {
      return NextResponse.json(
        { error: 'Business profile required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.RETELL_API_KEY;
    const masterAgentId = process.env.RETELL_MASTER_AGENT_ID;
    const agentVersion = process.env.RETELL_MASTER_AGENT_VERSION || '0';

    if (!apiKey || !masterAgentId) {
      // Demo mode - return mock access token
      return NextResponse.json({
        success: true,
        access_token: 'demo-token-' + Date.now(),
        call_id: 'demo-call-' + Date.now(),
        mock: true,
        message: 'Retell API key or Master Agent ID not configured. Using demo mode.',
      });
    }

    // Prepare dynamic variables for the master agent
    const dynamicVariables = {
      business_name: businessProfile.name,
      business_category: businessProfile.category,
      business_address: businessProfile.address,
      business_phone: businessProfile.phone || 'Not provided',
      business_hours: businessProfile.hours,
      business_website: businessProfile.website || 'Not provided',
      business_rating: businessProfile.rating?.toString() || 'N/A',
      business_reviews: businessProfile.reviews?.toString() || 'N/A',
    };

    // Create web call via Retell API
    const response = await fetch('https://api.retellai.com/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: masterAgentId,
        agent_version: parseInt(agentVersion),
        retell_llm_dynamic_variables: dynamicVariables,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Retell API error:', errorText);
      throw new Error(`Retell API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      access_token: data.access_token,
      call_id: data.call_id,
      mock: false,
    });
  } catch (error) {
    console.error('Retell web call creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
