# 🤖 Code Review Assistant

An automated code review assistant powered by IBM Bob Shell that analyzes pull requests and provides AI-powered feedback directly on GitHub.

## ⚡ Quick Start - Two Options

### 1. 🚀 Bob Shell GitHub Actions (Recommended - Fully Automated!)

**Automatic AI-powered reviews on every PR using IBM Bob Shell!**

- ✅ Runs automatically on every PR
- ✅ AI-powered code analysis via Bob Shell
- ✅ Posts detailed review comments with line-by-line feedback
- ✅ Supports manual commands (`@bobshell /review`, `/summary`, `/triage`)
- ✅ Automatic issue triage and labeling
- ✅ Scheduled batch processing of unlabeled issues

👉 **[Complete Setup Guide](SETUP-BOBSHELL.md)** (5 minutes)

**Requirements:**
- IBM Bob Shell API key
- GitHub repository with Actions enabled

### 2. 💻 Manual Bob CLI Version

**Uses Bob AI assistant built into your IDE for manual reviews.**

- ✅ No external API keys or costs
- ✅ Interactive review process
- ✅ IDE integration

👉 **[Get Started with Bob CLI](README-BOB.md)** | **[Quick Start](QUICKSTART-BOB.md)**

---

## 🎯 Bob Shell GitHub Actions (Recommended)

### Features

- 🤖 **AI-Powered Reviews**: Uses IBM Bob Shell for intelligent code analysis
- 🔄 **Automatic Triggers**: Reviews run on every PR automatically
- 💬 **Interactive Commands**: Trigger reviews, summaries, and triage on-demand
- 🏷️ **Smart Triage**: Automatically labels issues based on content
- ⏰ **Scheduled Triage**: Batch processes unlabeled issues every hour
- 📊 **Cost Tracking**: Monitors Bob Shell coin usage per review
- 🔧 **Customizable**: Adjust prompts and settings for your needs

### How It Works

```
PR Created/Updated
       ↓
GitHub Actions Triggered
       ↓
Bob Shell Installed
       ↓
GitHub MCP Server Setup
       ↓
Bob Analyzes Code
       ↓
Review Posted on PR
       ↓
Done! ✅
```

### Available Workflows

#### 1. Automatic PR Review
**File**: `.github/workflows/auto-pr-review.yml`

Triggers automatically when:
- Pull request is opened
- New commits are pushed
- Pull request is reopened

**What it does:**
- Analyzes all code changes
- Posts line-by-line review comments
- Provides overall assessment
- Reports cost in Bob coins

#### 2. Manual Commands
**File**: `.github/workflows/dispatch.yml`

Trigger by commenting on PRs or issues:

```bash
# Comprehensive code review
@bobshell /review

# Generate PR summary
@bobshell /summary

# Triage and label issue
@bobshell /triage
```

#### 3. Scheduled Issue Triage
**File**: `.github/workflows/scheduled-triage.yml`

**Runs automatically every hour** to:
- Find all unlabeled issues
- Find issues marked with "status/needs-triage"
- Analyze issue content with Bob Shell AI
- Apply appropriate labels automatically
- Process up to 100 issues per run

**How it works:**

```
Every Hour (Automatic)
       ↓
Find Unlabeled Issues
       ↓
Bob Shell Analyzes (Batch)
       ↓
Determines Appropriate Labels
       ↓
Applies Labels Automatically
       ↓
Done! ✅
```

**Example:**
```
Before:
  Issue #123: "App crashes on login"
  Labels: (none)

After (Automatic):
  Issue #123: "App crashes on login"
  Labels: bug, priority/high
  Reason: Critical functionality broken
```

**Benefits:**
- ✅ **Zero manual work** - Runs 24/7 automatically
- ✅ **Consistent labeling** - Same AI criteria for all issues
- ✅ **Batch processing** - Handles up to 100 issues per hour
- ✅ **Smart analysis** - Understands context and intent
- ✅ **Cost efficient** - ~3 coins per batch (only when issues exist)

**Customization:**
- Adjust schedule in workflow file (default: hourly)
- Modify labeling criteria in `bob-scheduled-triage.toml`
- Change batch size (default: 100 issues)
- Set coin budget (default: 3 coins)

### Setup Instructions

#### Step 1: Add Bob Shell API Key

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - **Name:** `BOBSHELL_API_KEY`
   - **Value:** Your IBM Bob Shell API key

#### Step 2: Commit Workflow Files

Ensure these files are in your repository:

```
.github/
├── actions/
│   └── bob-action/
│       └── action.yml          # Bob Shell composite action
├── commands/
│   ├── bob-review.toml         # PR review prompt
│   ├── bob-summary.toml        # PR summary prompt
│   ├── bob-triage.toml         # Issue triage prompt
│   └── bob-scheduled-triage.toml  # Batch triage prompt
└── workflows/
    ├── auto-pr-review.yml      # Automatic PR reviews
    ├── dispatch.yml            # Manual commands
    ├── review.yml              # Review workflow
    ├── summary.yml             # Summary workflow
    ├── triage.yml              # Single issue triage
    └── scheduled-triage.yml    # Hourly batch triage
```

#### Step 3: Push and Test

```bash
git add .github/
git commit -m "Add Bob Shell code review automation"
git push origin main
```

Create a test PR to see Bob Shell in action!

### Customization

#### Adjust Review Prompts

Edit `.github/commands/bob-review.toml`:

```toml
[prompt]
system = """
You are an expert code reviewer...
Focus on:
1. Your custom focus areas
2. Specific patterns to check
3. Team coding standards
"""
```

#### Customize Scheduled Triage

Edit `.github/commands/bob-scheduled-triage.toml` to:
- Change labeling criteria
- Adjust priority heuristics
- Modify analysis principles
- Add custom rules

#### Change Triage Schedule

Edit `.github/workflows/scheduled-triage.yml`:

```yaml
schedule:
  - cron: '0 */2 * * *'  # Every 2 hours
  - cron: '0 9 * * 1'    # Every Monday at 9 AM
```

#### Adjust Coin Limits

In workflow files, modify `max_coins`:

```yaml
with:
  max_coins: 5  # Increase for more thorough reviews
```

#### Customize Triggers

Edit workflow `on:` sections:

```yaml
on:
  pull_request:
    types: [opened, synchronize]
    branches: [main, develop]  # Specific branches
```

### Cost Management

Bob Shell uses "coins" to track usage:

- **PR Review**: ~3 coins per PR
- **PR Summary**: ~2 coins per PR  
- **Issue Triage**: ~2 coins per issue
- **Scheduled Triage**: ~3 coins per batch (only when issues exist)

**Daily cost estimate (busy repository):**
- Automatic PR reviews: Variable (depends on PR activity)
- Scheduled triage: ~72 coins/day (24 runs × 3 coins)
- Actual triage cost: Much lower (only runs when unlabeled issues exist)

**Monitor costs:**
- Check workflow logs for session summaries
- Review cost comments posted on PRs
- Adjust `max_coins` to control spending
- Modify triage schedule to reduce frequency

---

## 💻 Manual Bob CLI Version

For interactive, IDE-based reviews using Bob.

👉 **[Bob CLI Documentation](README-BOB.md)**

**Use cases:**
- Manual code review sessions
- Learning and exploration
- Custom analysis workflows

---

## 🔧 Advanced Configuration

### GitHub App Integration (Optional)

**Want comments from "Bob" instead of "github-actions[bot]"?**

Create a GitHub App to customize the bot name and avatar!

**Benefits:**
- ✅ Custom bot name (e.g., "Bob Code Review Assistant")
- ✅ Custom avatar/icon
- ✅ Better rate limits (5,000 vs 1,000 req/hour)
- ✅ Professional appearance

👉 **[Complete GitHub App Setup Guide](GITHUB-APP-SETUP.md)** (10 minutes)

**Quick setup:**
1. Create a GitHub App with your desired name
2. Generate private key
3. Install app on your repository
4. Add to repository:
   - Variable: `BOB_APP_ID`
   - Secret: `BOB_APP_PRIVATE_KEY`

The workflows will automatically use the GitHub App if configured!

### Self-Hosted Runners

For IBM internal network access:

```yaml
runs-on: self-hosted  # Instead of ubuntu-latest
```

### Debug Mode

Enable detailed logging:

```yaml
env:
  DEBUG: true
```

Or set repository variable: `DEBUG=true`

### Disable Scheduled Triage

If you don't want automatic hourly triage:

1. Delete `.github/workflows/scheduled-triage.yml`, or
2. Comment out the schedule trigger:
```yaml
# schedule:
#   - cron: '0 * * * *'
```

---

## 📊 Workflow Comparison

| Workflow | Trigger | Purpose | Cost |
|----------|---------|---------|------|
| **auto-pr-review.yml** | PR opened/updated | Automatic code review | ~3 coins/PR |
| **dispatch.yml** | `@bobshell` comment | Manual commands | Variable |
| **review.yml** | Called by dispatch | PR review | ~3 coins |
| **summary.yml** | Called by dispatch | PR summary | ~2 coins |
| **triage.yml** | Called by dispatch | Single issue triage | ~2 coins |
| **scheduled-triage.yml** | Every hour | Batch issue labeling | ~3 coins/batch |

---

## 🛠️ Troubleshooting

### Workflow Not Running

**Check:**
1. ✅ `BOBSHELL_API_KEY` is set in repository secrets
2. ✅ All workflow files are in default branch
3. ✅ GitHub Actions is enabled
4. ✅ Workflows have proper permissions

### Bob Shell Installation Fails

**Current installation method:** npm (`npm install -g @ibm/bob-shell`)

**If this fails:**
1. Contact IBM Bob Shell support for correct installation method
2. Update `.github/actions/bob-action/action.yml` with correct URL
3. Consider using self-hosted runners within IBM network

See **[SETUP-BOBSHELL.md](SETUP-BOBSHELL.md)** for detailed troubleshooting.

### No Review Comments Posted

**Check:**
1. Bob Shell API key is valid
2. GitHub token has `pull-requests: write` permission
3. Review workflow logs for errors
4. Verify MCP server configuration

### Scheduled Triage Not Working

**Check:**
1. Workflow file exists in default branch
2. Repository has unlabeled issues
3. Bob Shell API key is valid
4. Check Actions tab for workflow runs and errors

---

## 📚 Documentation

- **[SETUP-BOBSHELL.md](SETUP-BOBSHELL.md)** - Complete Bob Shell setup guide
- **[README-BOB.md](README-BOB.md)** - Manual Bob CLI documentation
- **[QUICKSTART-BOB.md](QUICKSTART-BOB.md)** - Quick start guide
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use this project for your own repositories.

---

## 💬 Support

- **Issues**: Open an issue on GitHub
- **Bob Shell**: Contact IBM Bob Shell support
- **Documentation**: Check the guides in this repository

---

## 🎯 Quick Links

- [Bob Shell Setup](SETUP-BOBSHELL.md)
- [Manual Bob CLI](README-BOB.md)
- [Workflows](.github/workflows/)
- [Command Prompts](.github/commands/)
- [Scheduled Triage Workflow](.github/workflows/scheduled-triage.yml)

---

Made with ❤️ for better code reviews powered by IBM Bob Shell