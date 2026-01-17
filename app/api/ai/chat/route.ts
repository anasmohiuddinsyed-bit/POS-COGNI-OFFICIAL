import { NextRequest, NextResponse } from 'next/server';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ 
      content: generateSmartMockResponse([], null, 'sms')
    });
  }
  
  try {
    const { messages, property, type } = body;

    // Get API key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // Fallback to smart mock responses if no API key
      return NextResponse.json({
        content: generateSmartMockResponse(messages, property, type),
      });
    }

    // Count how many questions have been asked (conversation length)
    const assistantMessages = messages.filter((m: any) => m.role === 'assistant').length;
    
    // Build conversation context with available properties
    const availableProperties = property ? `Current property: ${property.address}, ${property.beds} bed, ${property.baths} bath, ${property.sqft} sqft, $${property.price.toLocaleString()}` : 'Not specified';
    
    // Build conversation context
    const systemPrompt = `You are POSENTIA, an AI assistant helping real estate agent Sarah Martinez. 
You're responding to a ${type === 'sms' ? 'text message' : 'email'} from a potential lead who saw a property listing.

Property details: ${availableProperties}

Available properties the user can ask about:
- 123 Main Street: 3 bed, 2 bath, 1,850 sqft, $725,000
- 456 Oak Avenue: 4 bed, 3 bath, 2,450 sqft, $895,000
- 789 Pine Drive: 2 bed, 2 bath, 1,650 sqft, $625,000
- 321 Elm Court: 5 bed, 4 bath, 3,200 sqft, $1,250,000

If user asks about properties (e.g., "3 bedroom house", "$700k property"), you can mention these available listings.

Your role:
- Be friendly, professional, and helpful
- Ask maximum 2-3 simple questions: (1) buy/sell/rent intent, (2) budget range
- After getting intent and budget, say "Thank you! We'll reach out shortly with properties/more info. Have a great day!"
- Keep responses ${type === 'sms' ? 'brief and conversational (SMS style, 1-2 sentences max)' : 'professional but warm (email style, 2-3 sentences max)'}
- Ask ONE question at a time - never ask multiple questions
- If you've already asked 2+ questions and have intent + budget, end with "We'll reach out"

IMPORTANT: After 2-3 message exchanges, end the conversation with "We'll reach out to you shortly..."

${type === 'email' ? 'Sign emails with "Best regards,\nSarah Martinez"' : ''}`;

    const conversationMessages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content,
      })),
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using mini for faster/cheaper responses
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: type === 'sms' ? 150 : 300,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      // Fallback to mock response
      return NextResponse.json({
        content: generateSmartMockResponse(messages, property, type),
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || generateSmartMockResponse(messages, property, type);

    return NextResponse.json({
      content: aiResponse,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    // Fallback to mock response on error
    return NextResponse.json({
      content: generateSmartMockResponse(body?.messages || [], body?.property, body?.type || 'sms'),
    });
  }
}

function generateSmartMockResponse(messages: any[], property: any, type: 'sms' | 'email'): string {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
  const conversationLength = messages.length;

  // Initial greeting
  if (conversationLength <= 1) {
    const propertyInfo = property ? ` for ${property.address}` : '';
    return type === 'sms'
      ? `Hi! Thanks for reaching out${propertyInfo}. I'd love to help you find your perfect home. Are you looking to buy, sell, or rent?`
      : `Hi!\n\nThanks for your interest${propertyInfo}! I'd love to help you find your perfect home.\n\nAre you looking to buy, sell, or rent?\n\nBest regards,\nSarah Martinez`;
  }

  // Intent detection - buy, sell, or rent
  const hasBuyIntent = lastMessage.includes('buy') || lastMessage.includes('purchase') || lastMessage.includes('looking to buy') || lastMessage === 'buy';
  const hasSellIntent = lastMessage.includes('sell') || lastMessage.includes('selling') || lastMessage === 'sell';
  const hasRentIntent = lastMessage.includes('rent') || lastMessage.includes('renting') || lastMessage === 'rent';

  // Check conversation history to see if we already asked about intent
  const previousMessages = messages.slice(0, -1).map((m: any) => m.content?.toLowerCase() || '');
  const alreadyAskedIntent = previousMessages.some(msg => 
    msg.includes('buy') || msg.includes('sell') || msg.includes('rent') || 
    msg.includes('looking to buy') || msg.includes('looking to sell') || msg.includes('looking to rent')
  );

  if (hasBuyIntent || hasSellIntent || hasRentIntent) {
    // After getting intent, ask for budget
    return type === 'sms'
      ? "Great! What's your budget range? This helps me show you the best properties."
      : "Great! What's your budget range? This helps me show you the best properties that fit your needs.\n\nBest regards,\nSarah";
  }

  // Price question
  if (lastMessage.includes('price') || lastMessage.includes('cost') || lastMessage.includes('how much')) {
    const priceInfo = property ? `The listing is priced at $${property.price.toLocaleString()}. ` : '';
    return type === 'sms'
      ? `${priceInfo}Does this fit your budget? What price range are you looking at?`
      : `${priceInfo}Does this fit your budget? What price range are you looking at?\n\nBest regards,\nSarah`;
  }

  // Viewing/schedule
  if (lastMessage.includes('view') || lastMessage.includes('schedule') || lastMessage.includes('tour') || lastMessage.includes('see')) {
    return type === 'sms'
      ? "I'd be happy to schedule a viewing! What days work best for you? Are you available this week?"
      : "I'd be happy to schedule a viewing! What days work best for you? Are you available this week?\n\nBest regards,\nSarah";
  }

  // Budget responses - after budget, end with "we'll reach out"
  // Only end if we have both intent AND budget (conversation has at least 3-4 messages)
  if (lastMessage.match(/\$?\d+[kK]|\d+\s*(thousand|k)/)) {
    // Check if we already have intent (buy/sell/rent was mentioned earlier)
    const hasIntent = previousMessages.some(msg => 
      msg.includes('buy') || msg.includes('sell') || msg.includes('rent') ||
      msg.includes('purchase') || msg.includes('selling') || msg.includes('renting')
    );
    
    // Only end if we have both intent and budget
    if (hasIntent && conversationLength >= 3) {
      return type === 'sms'
        ? "Perfect! Thank you for the information. We'll reach out to you shortly with properties that match your criteria. Have a great day!"
        : "Perfect! Thank you for the information.\n\nWe'll reach out to you shortly with properties that match your criteria.\n\nHave a great day!\n\nBest regards,\nSarah Martinez";
    }
    
    // If budget given but no intent yet, still end (they might have skipped it)
    if (conversationLength >= 4) {
      return type === 'sms'
        ? "Perfect! Thank you for the information. We'll reach out to you shortly. Have a great day!"
        : "Perfect! Thank you for the information.\n\nWe'll reach out to you shortly.\n\nHave a great day!\n\nBest regards,\nSarah Martinez";
    }
  }

  // If we've asked 2+ questions already, end the conversation
  if (conversationLength >= 4) {
    return type === 'sms'
      ? "Thank you! We'll reach out to you shortly with more information. Have a great day!"
      : "Thank you for the information!\n\nWe'll reach out to you shortly with more details.\n\nHave a great day!\n\nBest regards,\nSarah Martinez";
  }

  // Timeline/pre-approval responses - after this, end
  if (lastMessage.includes('30') || lastMessage.includes('month') || lastMessage.includes('timeline') || lastMessage.includes('pre') || lastMessage.includes('approve')) {
    return type === 'sms'
      ? "Thank you! We'll reach out to you shortly with properties that match. Have a great day!"
      : "Thank you for the information!\n\nWe'll reach out to you shortly with properties that match.\n\nHave a great day!\n\nBest regards,\nSarah Martinez";
  }

  // Default response - only use if we haven't asked many questions yet
  // If conversation is very short (1-2 messages), ask about intent
  if (conversationLength <= 2) {
    return type === 'sms'
      ? "Hi! Thanks for reaching out. Are you looking to buy, sell, or rent?"
      : "Hi!\n\nThanks for reaching out! Are you looking to buy, sell, or rent?\n\nBest regards,\nSarah Martinez";
  }
  
  // If we have intent but user gave unclear response, ask for budget
  if (alreadyAskedIntent && conversationLength >= 3) {
    return type === 'sms'
      ? "Great! What's your budget range?"
      : "Great! What's your budget range?\n\nBest regards,\nSarah";
  }

  // Final fallback
  return type === 'sms'
    ? "I'd love to help! Are you buying, selling, or renting?"
    : "I'd love to help! Are you buying, selling, or renting?\n\nBest regards,\nSarah";
}
