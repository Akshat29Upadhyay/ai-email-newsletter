# Resend Email Setup Guide

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```bash
# Resend Configuration
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=your_verified_domain@yourdomain.com

# Optional fallback email for testing
RESEND_FALLBACK_TO=test@example.com

# Site URL for unsubscribe links
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Supabase Configuration (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Configuration (if using Gemini)
GEMINI_API_KEY=your_gemini_api_key
```

## Steps to Configure Resend

1. **Get your Resend API Key:**
   - Go to [resend.com](https://resend.com)
   - Sign up/login and get your API key from the dashboard

2. **Verify your domain:**
   - Add your domain in Resend dashboard
   - Follow the DNS verification steps
   - Use your verified domain email as `RESEND_FROM_EMAIL`

3. **Test the setup:**
   - Use the compose editor in your dashboard
   - Send a test email to verify everything works

## Current Features

Your email system already includes:
- ✅ Email composition with AI assistance
- ✅ Subscriber management
- ✅ Unsubscribe functionality
- ✅ Resend API integration
- ✅ Personalized unsubscribe links

## Sending to All Subscribers

The system automatically:
- Fetches all active subscribers for an organization
- Sends personalized emails with unsubscribe links
- Handles batching for large subscriber lists
- Provides fallback options for testing 