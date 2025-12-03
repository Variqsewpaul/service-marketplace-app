# Paystack Migration - Manual Steps

## Step 1: Install/Uninstall Packages

Open **Command Prompt** (cmd) and run:

```cmd
cd C:\Users\Dell\Desktop\service-marketplace-app
npm uninstall stripe @stripe/stripe-js
npm install paystack-node
```

**Note:** We'll use Paystack Inline JS (loaded via script tag) for the frontend instead of react-paystack due to React 19 compatibility.

## Step 2: Update Environment Variables

Add to your `.env.local` file:

```env
# Paystack Keys (get from https://dashboard.paystack.com/#/settings/developer)
PAYSTACK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Create Paystack Account

1. Go to https://paystack.com
2. Sign up for an account
3. Navigate to Settings → API Keys & Webhooks
4. Copy your **test** keys
5. Add them to `.env.local`

## What I'm Doing

While you run the npm commands, I'm:
- ✅ Updating database schema for Paystack
- ✅ Creating Paystack utility functions
- ✅ Updating payment actions
- ✅ Modifying UI components

**Please run the npm commands above, then let me know when done!**
