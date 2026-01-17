import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { businessName } = await request.json();

    if (!businessName) {
      return NextResponse.json(
        { error: 'Business name required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      // Return mock data if API key not configured
      return NextResponse.json({
        profile: {
          name: businessName,
          category: 'Service Business',
          hours: 'Mon-Fri 9AM-5PM',
          rating: 4.5,
          phone: '(555) 123-4567',
          address: '123 Main St, City, State',
        },
        mock: true,
        message: 'Google Places API key not configured. Using demo data.',
      });
    }

    // Use Places API Text Search to find the business
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(businessName)}&key=${apiKey}`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.results || searchData.results.length === 0) {
      // Return mock data if no results found
      return NextResponse.json({
        profile: {
          name: businessName,
          category: 'Service Business',
          hours: 'Mon-Fri 9AM-5PM',
          rating: 4.5,
          phone: '(555) 123-4567',
          address: '123 Main St, City, State',
        },
        mock: true,
        message: 'Business not found in Google Places. Using demo data.',
      });
    }

    const place = searchData.results[0];
    const placeId = place.place_id;

    // Get detailed information including hours
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_phone_number,formatted_address,rating,types,opening_hours&key=${apiKey}`;

    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    if (detailsData.error) {
      throw new Error(detailsData.error_message || 'Google Places API error');
    }

    const placeDetails = detailsData.result;

    // Format business hours
    let hours = 'Hours not available';
    if (placeDetails.opening_hours?.weekday_text) {
      hours = placeDetails.opening_hours.weekday_text.join(', ');
    } else if (placeDetails.opening_hours?.open_now !== undefined) {
      hours = placeDetails.opening_hours.open_now ? 'Open now' : 'Closed';
    }

    // Determine category from types
    const types = placeDetails.types || [];
    const category = types
      .filter((t: string) => !t.startsWith('point_of_interest') && t !== 'establishment')
      .map((t: string) => t.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
      .slice(0, 1)[0] || 'Business';

    const profile = {
      name: placeDetails.name || businessName,
      category,
      hours,
      rating: placeDetails.rating || 4.0,
      phone: placeDetails.formatted_phone_number || 'Phone not available',
      address: placeDetails.formatted_address || 'Address not available',
    };

    return NextResponse.json({
      profile,
      mock: false,
    });
  } catch (error) {
    console.error('Google Business Profile lookup error:', error);
    
    // Return mock data on error
    const { businessName } = await request.json();
    return NextResponse.json({
      profile: {
        name: businessName || 'Business',
        category: 'Service Business',
        hours: 'Mon-Fri 9AM-5PM',
        rating: 4.5,
        phone: '(555) 123-4567',
        address: '123 Main St, City, State',
      },
      mock: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error during lookup. Using demo data.',
    });
  }
}

