# Environment Variables for Stripe & 2FA

Add these to your `.env.local` file:

```env
# Stripe Configuration
# Get these from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Webhook secret (get after setting up webhooks)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Twilio for SMS 2FA
# Get from https://www.twilio.com/console
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token  
TWILIO_PHONE_NUMBER=+1234567890
```

## How to Get Stripe Keys

1. Go to https://stripe.com and create an account
2. Navigate to Developers → API keys
3. Copy "Publishable key" and "Secret key" (use test mode keys for now)
4. Add them to your `.env.local` file
