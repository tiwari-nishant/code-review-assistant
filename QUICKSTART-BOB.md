# Quick Start - Bob-Powered Version

Get started with Bob-powered code reviews in 3 minutes! No external API keys needed.

## Step 1: Install (30 seconds)

```bash
git clone https://github.com/tiwari-nishant/code-review-assistant.git
cd code-review-assistant
npm install
```

## Step 2: Configure GitHub (1 minute)

```bash
cp .env.example .env
```

Edit `.env` and add your GitHub token:
```env
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your-username
GITHUB_REPO=your-repo
```

**Get GitHub Token:**
1. Visit: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select `repo` scope
4. Copy token

## Step 3: Review a PR (1 minute)

```bash
# Prepare review for PR #123
npm run review 123
```

This creates a review prompt file. Now ask Bob:

```
"Please review the file .bob-review-temp/review-prompt-123.md 
and provide a comprehensive code review"
```

## Step 4: Post Review

Copy Bob's review and post it to GitHub:

```bash
# Bob will provide the review text
# You can post it manually or use GitHub CLI
gh pr comment 123 --body "$(cat review.txt)"
```

## That's It! 🎉

You now have a working code review assistant powered by Bob.

## What Makes This Different?

- ✅ **No external API keys needed** (only GitHub)
- ✅ **No per-review costs**
- ✅ **Uses Bob** (already in your IDE)
- ✅ **Simple 3-minute setup**
- ✅ **High-quality AI reviews**

## Next Steps

- Read [README-BOB.md](README-BOB.md) for detailed usage
- Customize review prompts in `src/bob-review-pr.js`
- Enable automated reviews with [AUTOMATION.md](AUTOMATION.md)

## Common Commands

```bash
# Review specific PR
npm run review 123

# Preview without saving
npm run review 123 --dry-run

# Review all open PRs
npm run review --all
```

## Bonus: Automated Reviews

Want fully automated reviews? We have that too!

```bash
# Already included - just push to GitHub
# See AUTOMATION.md for details
```

The automated workflow:
- Runs on every PR automatically
- No API keys needed
- Posts reviews instantly
- Completely free

## Need Help?

- Full guide: [README-BOB.md](README-BOB.md)
- Automation: [AUTOMATION.md](AUTOMATION.md)
- Issues: https://github.com/tiwari-nishant/code-review-assistant/issues

---

**Happy reviewing with Bob! 🤖**