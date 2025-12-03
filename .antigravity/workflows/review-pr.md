---
description: Review a teammate's pull request
---

# Review Pull Request Workflow

Follow these steps to review a teammate's code:

## 1. Fetch the PR branch from GitHub
```bash
git fetch origin [branch-name]
```

Example:
```bash
git fetch origin feature/payment-integration
```

## 2. Checkout the branch locally
```bash
git checkout [branch-name]
```

## 3. Install any new dependencies
```bash
npm install
```

## 4. Start the development server
```bash
npm run dev
```

## 5. Test the changes

- Open http://localhost:3000 in your browser
- Test the new feature or bug fix
- Check for console errors (F12 → Console)
- Verify UI changes look correct
- Test edge cases and error handling

## 6. Review the code in Antigravity

- Read through the changed files
- Check for:
  - Code quality and readability
  - Proper error handling
  - Security concerns
  - Performance issues
  - Consistent coding style
  - Adequate comments

## 7. Run tests
```bash
npm test
```

## 8. Leave feedback on GitHub

Go to the PR on GitHub and:

**If changes look good:**
- Click "Review changes"
- Select "Approve"
- Add positive feedback

**If changes need work:**
- Click "Review changes"
- Select "Request changes"
- Add specific, constructive comments
- Suggest improvements

**If you have questions:**
- Click "Review changes"
- Select "Comment"
- Ask clarifying questions

## 9. Return to your branch
```bash
git checkout [your-branch-name]
```

---

**Code Review Best Practices:**
- Be respectful and constructive
- Explain the "why" behind suggestions
- Acknowledge good work
- Focus on the code, not the person
- Respond within 4 hours for normal PRs, 1 hour for urgent fixes
