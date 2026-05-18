# Getting Started with Code Review Assistant

Welcome! This guide will help you choose and set up the right version for your needs.

## 🎯 Which Version Should I Use?

### Automated GitHub Actions (Recommended - Fully Automated!)

**Choose this if:**
- ✅ You want zero setup
- ✅ You want fully automated reviews
- ✅ You don't want to manage any API keys
- ✅ You want instant feedback on every PR
- ✅ Budget is a concern (it's free!)

**Setup time:** 0 minutes (already configured!)  
**Cost:** Free  
**Automation:** Fully automated

👉 **[Start with Automated Reviews](AUTOMATION.md)**

### Bob-Powered Version (Best for Deep Analysis)

**Choose this if:**
- ✅ You want AI-powered analysis
- ✅ You use Bob in your IDE
- ✅ You want detailed, contextual reviews
- ✅ You're okay with manual triggering
- ✅ You want zero external API costs

**Setup time:** 3 minutes  
**Cost:** Free  
**Automation:** Semi-automated (you trigger, Bob analyzes)

👉 **[Start with Bob Version](QUICKSTART-BOB.md)**

## Quick Comparison

| Feature | Automated Actions | Bob Version |
|---------|------------------|-------------|
| **API Keys** | None (GitHub auto) | GitHub only |
| **Cost** | Free | Free |
| **Setup** | 0 minutes | 3 minutes |
| **Automation** | Fully automated | Semi-automated |
| **Quality** | Good (pattern-based) | Excellent (AI-powered) |
| **Best For** | Quick checks | Deep analysis |

## Installation

```bash
# Clone the repository
git clone https://github.com/tiwari-nishant/code-review-assistant.git
cd code-review-assistant

# Install dependencies
npm install
```

## Automated Version Quick Start

**Already set up!** Just:

1. Push this code to your GitHub repository
2. GitHub Actions will automatically enable
3. Create a test PR
4. Watch the automated review appear in ~1 minute

**That's it!** No configuration needed.

**Full guide:** [AUTOMATION.md](AUTOMATION.md)

## Bob Version Quick Start

```bash
# 1. Configure (GitHub token only)
cp .env.example .env
# Edit .env:
GITHUB_TOKEN=your_token
GITHUB_OWNER=your_username
GITHUB_REPO=your_repo

# 2. Review a PR
npm run review 123

# 3. Ask Bob to review the generated prompt
# Bob will analyze and provide feedback

# 4. Post the review to GitHub
```

**Full guide:** [README-BOB.md](README-BOB.md)

## What's Included

### Core Features (Both Versions)
- 🔍 Comprehensive code analysis
- 💬 GitHub PR integration
- 📊 Security vulnerability detection
- 🎯 Code quality checks
- 📝 Detailed feedback with suggestions

### Automated Version Specific
- ⚡ Runs on every PR automatically
- 🆓 Completely free
- 🚀 Fast (~1 minute)
- 🔧 Pattern-based analysis
- ✅ No API keys needed

### Bob Version Specific
- 🤖 AI-powered analysis
- 💰 No external API costs
- 🎨 Highly customizable
- 🔧 IDE integration
- 🧠 Deep contextual understanding

## Project Structure

```
code-review-assistant/
├── .github/workflows/
│   └── auto-review.yml        # Automated workflow ⭐
├── src/
│   ├── automated-reviewer.js  # Pattern-based analyzer ⭐
│   ├── bob-review-pr.js       # Bob-powered reviewer ⭐
│   └── github-client.js       # GitHub API integration
├── AUTOMATION.md              # Automated setup guide ⭐
├── README-BOB.md              # Bob version docs ⭐
├── QUICKSTART-BOB.md          # Bob quick start ⭐
└── .env.example               # Configuration template
```

## Common Tasks

### Review a Specific PR

**Automated (already running):**
- Just create/update a PR
- Review appears automatically

**Bob Version:**
```bash
npm run review 123
# Then ask Bob to review the prompt
```

### Review All Open PRs

**Automated:**
- Already reviewing all PRs automatically

**Bob Version:**
```bash
npm run review --all
# Then ask Bob to review each prompt
```

### Test Your Setup

```bash
npm test
```

## Getting Help

- **Automated Version:** [AUTOMATION.md](AUTOMATION.md)
- **Bob Version:** [README-BOB.md](README-BOB.md)
- **Setup Issues:** [SETUP.md](SETUP.md)
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md)
- **GitHub Issues:** https://github.com/tiwari-nishant/code-review-assistant/issues

## FAQ

**Q: Can I use both versions?**  
A: Yes! Automated for quick checks, Bob for deep analysis.

**Q: Which is better?**  
A: Automated for speed and convenience, Bob for quality and depth.

**Q: Do I need Bob installed?**  
A: Only for the Bob version. Automated version works without Bob.

**Q: Is it really free?**  
A: Yes! Both versions are completely free. No hidden costs.

**Q: Can I customize the reviews?**  
A: Yes! Both versions support extensive customization.

## Next Steps

### Recommended Path

1. **Start with Automated** - Get instant value (0 setup)
2. **Add Bob for Important PRs** - Deep analysis when needed
3. **Customize as Needed** - Tailor to your workflow

### Day 1: Enable Automated Reviews
- Push code to GitHub
- Verify workflow runs
- Create test PR

### Week 1: Try Bob Version
- Set up Bob integration
- Review a complex PR
- Compare with automated

### Month 1: Optimize
- Customize automated rules
- Adjust Bob prompts
- Fine-tune for your team

---

**Ready to start?**

- 🚀 [Automated Version](AUTOMATION.md) - Zero setup, instant value
- 🤖 [Bob Version](QUICKSTART-BOB.md) - AI-powered, detailed analysis

Happy reviewing! 🎉