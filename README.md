# POSENTIA Marketing Site

Production-ready marketing site for POSENTIA, featuring two product landing pages with interactive demos.

## Products

1. **POSENTIA Follow Up Boss LeadFlow Automation** (`/products/leadflow`)
   - $999 one-time payment, lifetime access
   - For U.S. real estate agents using Follow Up Boss
   - Interactive demo with Follow Up Boss API integration

2. **POSENTIA AI Receptionist** (`/products/receptionist`)
   - $99/month recurring subscription
   - For SMBs (restaurants, HVAC, salons, clinics, etc.)
   - Interactive demo with Google Business Profile lookup

## Tech Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Serverless API Routes** under `/app/api`
- **Deployable to Vercel**

## Local Development

### Prerequisites

- Node.js 18+ and npm/yarn
- Environment variables configured (see below)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Follow Up Boss API (for LeadFlow demo)
FUB_API_BASE_URL=https://api.followupboss.com/v1/
FUB_API_KEY=your_follow_up_boss_api_key_here

# Google Places API (for Receptionist demo)
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# Retell API (optional, for Receptionist voice calls)
RETELL_API_KEY=your_retell_api_key_here
RETELL_MASTER_AGENT_ID=your_master_agent_id_here
RETELL_MASTER_AGENT_VERSION=0

# Calendly (for booking install calls)
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/your-calendly-link

# Payment Links (for checkout page)
NEXT_PUBLIC_PAYMENT_LINK_LEAD_CONCIERGE=https://buy.stripe.com/your-lead-concierge-link
NEXT_PUBLIC_PAYMENT_LINK_RECEPTIONIST=https://buy.stripe.com/your-receptionist-link

# Supabase (optional, for contact form submissions)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend (optional, for email notifications)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=POSENTIA <noreply@posentia.com>
CONTACT_FORM_RECIPIENT_EMAIL=your-email@example.com
```

### Environment Variables Explained

- **NEXT_PUBLIC_SITE_URL**: Your site URL (used for absolute links)
- **FUB_API_KEY**: Follow Up Boss API key for LeadFlow integration (optional for demo - sandbox mode available)
- **GOOGLE_PLACES_API_KEY**: Google Places API key for business profile lookup (optional for demo - mock data available)
- **RETELL_API_KEY**: Retell API key for voice calls (optional - demo mode available)
- **RETELL_MASTER_AGENT_ID**: Master agent ID created in Retell dashboard (optional - demo mode available)
- **RETELL_MASTER_AGENT_VERSION**: Agent version, usually 0 (optional, defaults to 0)
- **NEXT_PUBLIC_CALENDLY_URL**: Calendly link for booking install calls
- **NEXT_PUBLIC_PAYMENT_LINK_LEAD_CONCIERGE**: Payment link for AI Lead Concierge checkout (Stripe Payment Links, etc.)
- **NEXT_PUBLIC_PAYMENT_LINK_RECEPTIONIST**: Payment link for AI Receptionist checkout (Stripe Payment Links, etc.)
- **Supabase/Resend**: Optional for contact form storage and email notifications

## Sandbox Demo Mode

Both demos work without API keys using **sandbox mode**:

- **LeadFlow Demo**: Works without Follow Up Boss API key. Shows realistic UI and logs, but doesn't push to actual CRM.
- **Receptionist Demo**: Works without Google Places API key or Retell API key. Uses mock business profile data and simulated calls.

To enable full functionality, add the respective API keys to `.env.local`.

## Project Structure

```
/app
  /api
    /fub              # Follow Up Boss API routes
      /test-connection
      /push-lead
    /gbp              # Google Business Profile API routes
      /lookup
    /retell           # Retell API routes
      /create-agent   # (Legacy placeholder - not used)
      /start-demo     # (Legacy placeholder - not used)
      /web-call       # Creates web call with dynamic variables
    /contact          # Contact form submission
  /products
    /leadflow         # LeadFlow product page
    /receptionist     # Receptionist product page
  /checkout           # Checkout placeholder page
  /contact            # Contact page
  page.tsx            # Home page

/components
  /demos
    LeadFlowDemo.tsx      # LeadFlow interactive demo
    ReceptionistDemo.tsx  # Receptionist interactive demo
    AuditLogPanel.tsx     # Audit log component
    DemoCard.tsx          # Demo container component
  /ui
    ProductHero.tsx       # Product hero section
    FeatureGrid.tsx       # Feature grid layout
    FAQAccordion.tsx      # FAQ accordion
    CTASection.tsx        # CTA section
    Navbar.tsx            # Site navigation
    Footer.tsx            # Site footer
```

## API Routes

### Follow Up Boss (`/app/api/fub/*`)

- **POST `/api/fub/test-connection`**: Tests Follow Up Boss API connection
- **POST `/api/fub/push-lead`**: Pushes a lead to Follow Up Boss CRM

Both routes support sandbox mode if no API key is provided.

### Google Business Profile (`/app/api/gbp/*`)

- **POST `/api/gbp/lookup`**: Looks up business profile from Google Places API

Returns mock data if API key is not configured or business is not found.

### Retell (`/app/api/retell/*`)

- **POST `/api/retell/web-call`**: Creates a web call using Retell's master agent with dynamic variables
  - Accepts `businessProfile` in request body
  - Injects business data as dynamic variables (`business_name`, `business_category`, etc.)
  - Returns `access_token` for Retell Web SDK
  - Falls back to demo mode if API keys are missing

Uses a master agent approach with dynamic variables for cost-effective operation.

### Contact Form (`/app/api/contact`)

- **POST `/api/contact`**: Handles contact form submissions

Saves to Supabase if configured, otherwise logs to console.

## Stripe Checkout

The `/checkout` page is a placeholder. To implement Stripe checkout:

1. Install Stripe: `npm install stripe @stripe/stripe-js`
2. Create checkout session API route
3. Integrate Stripe Checkout in `/app/checkout/page.tsx`

Currently, the checkout page directs users to book an install call or email sales.

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The site is optimized for Vercel's serverless functions and edge network.

### Environment Variables on Vercel

Make sure to add all environment variables in the Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add each variable from `.env.local`
- Redeploy after adding variables

## Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Interactive demos with sandbox mode
- ✅ Follow Up Boss API integration (with fallback)
- ✅ Google Places API integration (with fallback)
- ✅ Contact form with Supabase storage
- ✅ SEO-optimized metadata
- ✅ TypeScript for type safety
- ✅ TailwindCSS for styling
- ✅ Production-ready code structure

## Next Steps

1. **Implement Stripe Checkout**: Replace placeholder checkout page with actual Stripe integration
2. **Retell Integration**: ✅ Implemented - Create master agent in Retell dashboard and add credentials
3. **Email Notifications**: Set up Resend for contact form email notifications
4. **Analytics**: Add analytics tracking (Google Analytics, Plausible, etc.)
5. **Testing**: Add unit tests and E2E tests

## Support

For questions or issues, contact:
- Email: sales@posentia.com
- Or submit an issue in the repository

## License

Private - All rights reserved.
