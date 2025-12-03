---
description: Submit a pull request
---

# Submit Pull Request Workflow

Follow these steps to submit your work for review:

## 1. Run tests
```bash
npm test
```

## 2. Run linter
```bash
npm run lint
```

## 3. Build project to verify no build errors
```bash
npm run build
```

## 4. Stage and commit your changes
```bash
git add .
git commit -m "feat: [brief description of your changes]"
```

Use conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance

## 5. Push to remote
```bash
git push origin [your-branch-name]
```

## 6. Create Pull Request on GitHub

1. Go to https://github.com/Variqsewpaul/service-marketplace-app
2. Click "New Pull Request"
3. Set base: `develop` ← compare: `feature/your-branch-name`
4. Fill in the PR template:

```markdown
## Description
[Brief description of what this PR does]

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added unit tests
- [ ] Verified in browser
- [ ] No console errors

## Screenshots (if applicable)
[Add screenshots of UI changes]

## Related Issues
Closes #[issue-number]
```

5. Request review from at least 1 team member
6. Wait for approval before merging

---

**Your PR is ready for review! Team members will be notified.**
