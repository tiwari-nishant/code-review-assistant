# Automated Code Review Setup

This guide explains how to set up fully automated code reviews that run on every pull request.

## 🚀 Features

The automated workflow:
- ✅ Runs automatically on every PR (open, update, reopen)
- ✅ Analyzes code for common issues
- ✅ Checks for security vulnerabilities
- ✅ Reviews code quality and best practices
- ✅ Posts review comments directly on the PR
- ✅ Adds labels to reviewed PRs
- ✅ **No API keys required** (except GitHub token, which is automatic)

## 📋 What Gets Checked

### Security
- Hardcoded credentials (passwords, API keys, tokens)
- SQL injection vulnerabilities
- Use of dangerous functions (eval)
- Insecure random number generation

### Code Quality
- Console.log statements
- TODO comments
- Very long lines (>120 chars)
- Commented-out code

### Best Practices
- Use of `var` instead of `const`/`let`
- Loose equality (`==`) instead of strict (`===`)
- Empty catch blocks
- Missing error handling

### Performance
- Nested loops (O(n²) complexity)
- Synchronous file operations
- Blocking operations

## 🔧 Setup (2 minutes)

### Step 1: Enable GitHub Actions

The workflow file is already included at `.github/workflows/auto-review.yml`.

GitHub Actions is enabled by default on most repositories. If not:
1. Go to your repository on GitHub
2. Click "Settings" → "Actions" → "General"
3. Enable "Allow all actions and reusable workflows"

### Step 2: That's It!

The workflow uses `GITHUB_TOKEN` which is automatically provided by GitHub Actions. No additional configuration needed!

## 📊 How It Works

```
PR Opened/Updated
       ↓
GitHub Actions Triggered
       ↓
Checkout Code
       ↓
Get Diff (base vs head)
       ↓
Run Automated Reviewer
       ↓
Analyze Code Changes
       ↓
Generate Review Report
       ↓
Post Comment on PR
       ↓
Add "automated-review" Label
```

## 🎯 Example Review Output

When a PR is created, you'll see a comment like this:

```markdown
## 🤖 Automated Code Review

**Files Analyzed:** 5
**Review Date:** 2024-01-15 10:30:00

---

### 📊 Summary

- **Issues Found:** 3
- **Suggestions:** 2

### 🚨 Critical Issues (1)

**src/config.js:15** - Possible hardcoded credential detected. Use environment variables instead.
> 💡 Move sensitive data to environment variables or a secure vault.

### ⚠️ High Priority Issues (1)

**src/api.js:42** - Potential SQL injection vulnerability. Use parameterized queries.
> 💡 Use prepared statements or ORM methods instead of string concatenation.

### 📋 Medium Priority Issues (1)

- **src/utils.js:28** - Empty catch block detected.

---

### ✅ Review Checklist

Please ensure:
- [ ] Code follows project style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No sensitive data is exposed
- [ ] Performance impact is acceptable
- [ ] All review comments are addressed
```

## 🎨 Customization

### Modify Review Rules

Edit `src/automated-reviewer.js` to customize what gets checked:

```javascript
// Add custom checks
checkCustomRules(line, file, lineNum) {
  // Your custom logic here
  if (line.includes('myPattern')) {
    this.issues.push({
      file,
      line: lineNum,
      severity: 'medium',
      category: 'custom',
      message: 'Custom rule violation',
      suggestion: 'Fix it this way...'
    });
  }
}
```

### Change Workflow Triggers

Edit `.github/workflows/auto-review.yml`:

```yaml
# Run only on specific branches
on:
  pull_request:
    branches:
      - main
      - develop
    types: [opened, synchronize]

# Run only for specific file types
on:
  pull_request:
    paths:
      - '**.js'
      - '**.ts'
      - '**.py'
```

### Add Manual Trigger

```yaml
on:
  pull_request:
    types: [opened, synchronize]
  workflow_dispatch:  # Allows manual trigger
```

## 🔍 Testing the Workflow

### Test Locally

Before pushing, test the reviewer locally:

```bash
# Get diff for a branch
git diff main...your-branch > test-diff.txt

# Run the reviewer
node src/automated-reviewer.js test-diff.txt

# Check the output
```

### Test in GitHub

1. Create a test branch
2. Make some changes (add a console.log, use var, etc.)
3. Open a PR
4. Watch the Actions tab for the workflow
5. Check the PR for the automated review comment

## 📈 Monitoring

### View Workflow Runs

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Click "Automated Code Review" workflow
4. View individual runs and logs

### Check Review History

All automated reviews are posted as comments on PRs. You can:
- Search for comments by the GitHub Actions bot
- Filter PRs by the "automated-review" label
- Review the Actions logs for detailed information

## 🚨 Handling Critical Issues

When critical issues are found:
1. The workflow adds a warning annotation
2. The review comment highlights critical issues
3. Consider requiring review approval before merge

### Require Approval for Critical Issues

Add to `.github/workflows/auto-review.yml`:

```yaml
- name: Fail on critical issues
  if: steps.review.outputs.REVIEW_GENERATED == 'true'
  run: |
    if grep -q "🚨 Critical Issues" review-output.md; then
      echo "::error::Critical security issues found!"
      exit 1
    fi
```

## 🔄 Integration with Branch Protection

Enhance security by requiring the workflow to pass:

1. Go to Settings → Branches
2. Add branch protection rule for `main`
3. Enable "Require status checks to pass"
4. Select "code-review" workflow
5. Enable "Require branches to be up to date"

## 💡 Best Practices

1. **Review the Reviews**: Automated reviews catch common issues but aren't perfect
2. **Combine with Human Review**: Use automation to catch obvious issues, humans for logic
3. **Customize Rules**: Tailor the checks to your project's needs
4. **Monitor False Positives**: Adjust rules if you see too many false alarms
5. **Keep It Updated**: Regularly update the reviewer logic

## 🆚 Comparison with Other Approaches

| Approach | Setup | Cost | Automation | Quality |
|----------|-------|------|------------|---------|
| **This Workflow** | ⭐ Easy | 🆓 Free | ⭐⭐⭐⭐ High | ⭐⭐⭐ Good |
| **Bob Manual** | ⭐ Easy | 🆓 Free | ⭐⭐ Manual | ⭐⭐⭐⭐⭐ Excellent |
| **OpenAI Auto** | ⭐⭐ Moderate | 💰 Paid | ⭐⭐⭐⭐⭐ Full | ⭐⭐⭐⭐⭐ Excellent |
| **Manual Review** | ⭐⭐⭐ None | 🆓 Free | ⭐ Manual | ⭐⭐⭐⭐⭐ Excellent |

## 🔧 Troubleshooting

### Workflow Not Running

**Check:**
- GitHub Actions is enabled in repository settings
- Workflow file is in `.github/workflows/`
- Workflow syntax is valid (check Actions tab for errors)

### Review Not Posted

**Check:**
- Workflow has `pull-requests: write` permission
- No errors in the Actions log
- The automated-reviewer.js script ran successfully

### Too Many False Positives

**Solution:**
- Adjust severity thresholds in `automated-reviewer.js`
- Add exceptions for specific patterns
- Customize rules for your codebase

### Missing Some Issues

**Solution:**
- Add custom checks to `automated-reviewer.js`
- Combine with manual review
- Consider using the OpenAI-powered version for deeper analysis

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Code Review Best Practices](https://google.github.io/eng-practices/review/)

## 🎉 Success!

Once set up, every PR will automatically receive a code review within minutes. This helps:
- Catch common issues early
- Maintain code quality
- Reduce manual review burden
- Speed up the development process

---

**Questions?** Open an issue on GitHub or check the main [README.md](README.md)