# Quick Start Guide

Get your code review assistant running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- GitHub account with a repository
- OpenAI API account

## Step 1: Clone and Install (1 minute)

```bash
git clone https://github.com/tiwari-nishant/code-review-assistant.git
cd code-review-assistant
npm install
```

## Step 2: Get API Keys (2 minutes)

### GitHub Token
1. Visit: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scope: `repo`
4. Copy the token

### OpenAI Key
1. Visit: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key

## Step 3: Configure (1 minute)

```bash
cp .env.example .env
```

Edit `.env`:
```env
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repo_name
OPENAI_API_KEY=your_openai_key_here
```

## Step 4: Test (1 minute)

```bash
npm test
```

You should see:
```
✅ All required environment variables are set
✅ Connected to GitHub as: your_username
✅ Repository access confirmed
✅ OpenAI API connected successfully
```

## Step 5: Review a PR

### Option A: Test with Dry Run
```bash
node src/review-pr.js 123 --dry-run
```

### Option B: Post Real Review
```bash
node src/review-pr.js 123
```

## What's Next?

- **Automate Reviews**: Set up GitHub Actions (see [SETUP.md](SETUP.md))
- **Customize**: Adjust settings in `.env`
- **Learn More**: Read the full [README.md](README.md)

## Common Issues

### "Error: Bad credentials"
→ Check your GitHub token in `.env`

### "Error: Insufficient quota"
→ Add credits to your OpenAI account

### "Error: Not Found"
→ Verify repository owner and name in `.env`

## Need Help?

- Full setup guide: [SETUP.md](SETUP.md)
- Documentation: [README.md](README.md)
- Issues: https://github.com/tiwari-nishant/code-review-assistant/issues

---

**That's it!** You're ready to automate code reviews. 🚀