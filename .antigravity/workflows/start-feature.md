---
description: Start working on a new feature
---

# Start New Feature Workflow

Follow these steps to begin working on a new feature:

// turbo-all

## 1. Ensure you're on develop branch
```bash
git checkout develop
git pull origin develop
```

## 2. Create feature branch
```bash
git checkout -b feature/[feature-name]
```

Replace `[feature-name]` with a descriptive name like:
- `payment-integration`
- `user-profile-ui`
- `booking-system`

## 3. Install/update dependencies
```bash
npm install
```

## 4. Set up environment (if not already done)
```bash
# Copy .env.example to .env.local if it doesn't exist
# Then fill in your local environment variables
```

## 5. Start development server
```bash
npm run dev
```

## 6. Verify setup
Open browser to http://localhost:3000 and verify the app is running.

---

**You're all set! Start coding with Antigravity AI assistance.**
