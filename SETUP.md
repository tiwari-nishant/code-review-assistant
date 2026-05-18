# Setup Guide for Code Review Assistant

This guide will help you set up the code review assistant for your GitHub repository.

## 🎯 Two Setup Options

### Option 1: Automated GitHub Actions (Recommended - Zero Setup!)
**Fully automated reviews on every PR. No configuration needed!**

👉 See [AUTOMATION.md](AUTOMATION.md) for details

### Option 2: Bob-Powered Manual Reviews
**Use Bob AI assistant for detailed code reviews**

👉 Continue reading below

---

## Quick Setup for Bob Version (3 minutes)

### Step 1: Get Your GitHub Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it "Code Review Assistant"
4. Select scope: `repo` (Full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)

### Step 2: Local Setup

1. Clone the repository:
```bash
git clone https://github.com/tiwari-nishant/code-review-assistant.git
cd code-review-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Edit `.env` with your credentials:
```env
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=tiwari-nishant
GITHUB_REPO=code-review-assistant
```

5. Test the setup:
```bash
npm test
```

### Step 3: Review a Pull Request

```bash
# Prepare review for PR #123
npm run review 123

# This creates a review prompt file
# Now ask Bob to review it
```

## Usage Examples

### Manual Review with Bob

```bash
# Prepare review for PR #123
npm run review 123

# Preview without saving
npm run review 123 --dry-run

# Review all open PRs
npm run review --all
```

Then ask Bob:
```
"Please review the file .bob-review-temp/review-prompt-123.md 
and provide a comprehensive code review"
```

### Automated Review via GitHub Actions

The automated workflow is already included! It will:
1. Trigger on new PRs or updates
2. Analyze all code changes automatically
3. Post review comments
4. No additional setup required

See [AUTOMATION.md](AUTOMATION.md) for details.

## Customization

### Adjust Review Prompts

Edit `src/bob-review-pr.js` to customize the review prompt:

```javascript
createReviewPrompt(prData, files, diff) {
  // Customize what Bob should focus on
  return `Please review focusing on:
  1. Security vulnerabilities
  2. Performance optimizations
  3. Code maintainability
  ...`;
}
```

### Customize Automated Checks

Edit `src/automated-reviewer.js` to add custom rules:

```javascript
checkCustomRules(line, file, lineNum) {
  if (line.includes('myPattern')) {
    this.issues.push({
      file,
      line: lineNum,
      severity: 'medium',
      message: 'Custom rule violation'
    });
  }
}
```

## Workflow Customization

Edit `.github/workflows/auto-review.yml` to:

### Review Only Specific File Types

```yaml
on:
  pull_request:
    types: [opened, synchronize]
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
  workflow_dispatch:
    inputs:
      pr_number:
        description: 'PR number to review'
        required: true
```

### Schedule Regular Reviews

```yaml
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM
```

## Troubleshooting

### Issue: "Error: Bad credentials"
**Solution:** 
- Verify your GitHub token is correct
- Ensure it has `repo` scope
- Check if the token has expired

### Issue: "Error: Not Found"
**Solution:**
- Verify `GITHUB_OWNER` and `GITHUB_REPO` in `.env`
- Ensure the PR number exists
- Check repository permissions

### Issue: GitHub Actions not triggering
**Solution:**
- Ensure the workflow file is in `.github/workflows/`
- Verify the workflow is enabled in repository settings
- Check Actions tab for error messages

### Issue: Review comments not posting
**Solution:**
- Verify GitHub token has write permissions
- Check if the repository allows bot comments
- Review GitHub Actions logs for errors

### Issue: Bob doesn't see the review prompt
**Solution:**
- Check that the file was created in `.bob-review-temp/`
- Try opening the file directly in your IDE
- Ensure Bob is active in your IDE

## Cost Estimation

### GitHub API
- Free for public repositories
- Included in GitHub plans for private repositories

### Bob Reviews
- **Free** - Uses Bob AI assistant already in your IDE
- No external API costs

### Automated Reviews
- **Free** - Uses GitHub Actions free tier
- 2,000 minutes/month included
- Typical review: ~1 minute

## Best Practices

1. **Start with Automated**: Enable GitHub Actions for instant feedback
2. **Use Bob for Deep Dives**: When you need detailed analysis
3. **Combine Both**: Automated for quick checks, Bob for thorough review
4. **Customize Rules**: Tailor checks to your team's standards
5. **Regular Updates**: Keep dependencies updated for security

## Advanced Configuration

### Multiple Repositories

To use with multiple repositories:

1. Create separate `.env` files:
```bash
.env.repo1
.env.repo2
```

2. Use environment-specific commands:
```bash
# Review PR in repo1
env $(cat .env.repo1) npm run review 123

# Review PR in repo2
env $(cat .env.repo2) npm run review 456
```

### Custom Review Focus

Create custom review templates in `src/bob-review-pr.js`:

```javascript
const customPrompt = `
Review this code focusing on:
1. Security vulnerabilities
2. Performance optimizations
3. Code maintainability
4. Test coverage

Provide specific, actionable feedback.
`;
```

## Support

- **Issues**: https://github.com/tiwari-nishant/code-review-assistant/issues
- **Discussions**: https://github.com/tiwari-nishant/code-review-assistant/discussions
- **Documentation**: [README.md](README.md)

## Next Steps

After setup:
1. ✅ Test with a sample PR using `--dry-run`
2. ✅ Enable GitHub Actions for automated reviews
3. ✅ Try Bob-powered review for detailed analysis
4. ✅ Customize rules based on your needs
5. ✅ Monitor and adjust as needed

Happy reviewing! 🚀