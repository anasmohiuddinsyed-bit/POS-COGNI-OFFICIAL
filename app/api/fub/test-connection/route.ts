import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key required' },
        { status: 400 }
      );
    }

    const fubApiBaseUrl = process.env.FUB_API_BASE_URL || 'https://api.followupboss.com/v1/';
    const testUrl = `${fubApiBaseUrl}people?limit=1`;

    // Test the connection by making a simple API call
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Connection successful',
      });
    } else {
      const errorText = await response.text();
      return NextResponse.json(
        {
          success: false,
          error: `API returned status ${response.status}: ${errorText.substring(0, 200)}`,
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Follow Up Boss connection test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

