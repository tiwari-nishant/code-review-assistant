# 🤖 Bob-Powered Code Review Assistant

An automated code review assistant that uses **Bob AI** (your IDE assistant) to analyze pull requests and provide constructive feedback directly on GitHub.

## ✨ Key Features

- 🎯 **No External API Keys Required** - Uses Bob's built-in capabilities
- 🔍 **Comprehensive Analysis** - Code quality, security, performance, and best practices
- 💬 **GitHub Integration** - Posts reviews directly to pull requests
- 🚀 **Easy Setup** - Only requires a GitHub token
- 📊 **Multiple Review Modes** - Quick review, detailed analysis, or batch processing

## Why Bob-Powered?

Unlike traditional code review tools that require OpenAI API keys and incur costs per review, this version leverages Bob - the AI assistant already integrated in your IDE. This means:

- ✅ No additional API costs
- ✅ No need to manage multiple API keys
- ✅ Uses the same AI you're already familiar with
- ✅ Seamless integration with your development workflow

## Prerequisites

- Node.js 18+ installed
- GitHub Personal Access Token
- Bob AI assistant (already available in your IDE)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure GitHub Token

```bash
cp .env.example .env
```

Edit `.env`:
```env
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=tiwari-nishant
GITHUB_REPO=code-review-assistant
```

### 3. Review a Pull Request

```bash
# Prepare review for PR #123
npm run review 123

# This will:
# 1. Fetch PR data from GitHub
# 2. Create a comprehensive review prompt
# 3. Save it to .bob-review-temp/review-prompt-123.md
```

### 4. Complete Review with Bob

After running the command, you'll see instructions to complete the review using Bob:

**Option 1: Ask Bob directly in your IDE**
```
"Please review the PR prompt in .bob-review-temp/review-prompt-123.md"
```

**Option 2: Use Bob's review command**
```
/review --issue-coverage
```

**Option 3: Use obtain_git_diff tool**
Bob can use its built-in `obtain_git_diff` tool to analyze the changes directly.

### 5. Post Review to GitHub

Once Bob provides the review, you can post it:

```bash
# Bob will provide the review text
# Copy it and post using the GitHub CLI or manually
```

## How It Works

```
┌─────────────────┐
│  Your Command   │
│  npm run review │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Fetch PR Data   │
│ from GitHub     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create Review   │
│ Prompt File     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Ask Bob to    │
│  Review Prompt  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Bob Analyzes    │
│ Code Changes    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Post Review to  │
│    GitHub PR    │
└─────────────────┘
```

## Usage Examples

### Review a Specific PR

```bash
# Prepare review for PR #123
npm run review 123

# Preview without saving
npm run review 123 --dry-run
```

### Review All Open PRs

```bash
npm run review --all
```

### Using Bob's Tools Directly

Bob has built-in tools you can use:

1. **obtain_git_diff** - Get diff between branches
```
Ask Bob: "Use obtain_git_diff to compare feature-branch with main"
```

2. **submit_review_findings** - Submit structured review
```
Ask Bob: "Submit these review findings to the PR"
```

3. **fetch_github_issue** - Analyze PR against issue
```
Ask Bob: "Fetch and analyze GitHub issue #123"
```

## Project Structure

```
code-review-assistant/
├── src/
│   ├── bob-review-pr.js      # Main Bob-powered reviewer
│   ├── bob-reviewer.js        # Bob integration logic
│   ├── github-client.js       # GitHub API client
│   ├── review-pr.js           # OpenAI version (optional)
│   └── code-analyzer.js       # OpenAI analyzer (optional)
├── .bob-review-temp/          # Temporary review files
├── .env.example               # Environment template
├── package.json               # Dependencies
└── README-BOB.md             # This file
```

## Configuration

### Required Environment Variables

```env
GITHUB_TOKEN=ghp_xxxxx          # GitHub personal access token
GITHUB_OWNER=your-username      # Repository owner
GITHUB_REPO=your-repo-name      # Repository name
```

### Getting a GitHub Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scope: `repo` (Full control of private repositories)
4. Copy the token and add to `.env`

## Advanced Usage

### Custom Review Focus

Edit the review prompt in `src/bob-review-pr.js` to customize what Bob focuses on:

```javascript
createReviewPrompt(prData, files, diff) {
  // Customize the review instructions here
  return `Please focus on:
  1. Security vulnerabilities
  2. Performance optimizations
  3. Code maintainability
  ...`;
}
```

### Automated Workflow

You can integrate this into your CI/CD:

```yaml
# .github/workflows/bob-review.yml
name: Bob Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  prepare-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      - run: npm run review ${{ github.event.pull_request.number }}
      # Then manually complete with Bob
```

## Comparison: Bob vs OpenAI

| Feature | Bob-Powered | OpenAI-Powered |
|---------|-------------|----------------|
| API Key Required | ❌ No | ✅ Yes |
| Cost per Review | 🆓 Free | 💰 $0.05-$0.50 |
| Setup Complexity | ⭐ Simple | ⭐⭐ Moderate |
| Review Quality | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Excellent |
| Automation | ⭐⭐⭐ Semi-automated | ⭐⭐⭐⭐⭐ Fully automated |
| IDE Integration | ✅ Native | ❌ External |

## Tips for Best Results

1. **Be Specific**: When asking Bob to review, provide context about what you want to focus on
2. **Use Bob's Tools**: Leverage Bob's built-in `obtain_git_diff` and `submit_review_findings` tools
3. **Iterate**: If Bob's first review isn't detailed enough, ask for more specific analysis
4. **Combine Approaches**: Use Bob for detailed analysis and the OpenAI version for automation

## Troubleshooting

### "Error: Bad credentials"
- Verify your GitHub token in `.env`
- Ensure the token has `repo` scope

### "Bob doesn't see the review prompt"
- Check that the file was created in `.bob-review-temp/`
- Try opening the file directly in your IDE

### "Review prompt is too long"
- The diff is automatically truncated to 15,000 characters
- For very large PRs, review files individually

## Migrating from OpenAI Version

If you were using the OpenAI-powered version:

1. Keep your existing setup
2. Use `npm run review:openai` for the old version
3. Use `npm run review` for the Bob-powered version
4. Both can coexist in the same project

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - See [LICENSE](LICENSE) for details.

## Support

- **Issues**: https://github.com/tiwari-nishant/code-review-assistant/issues
- **Discussions**: https://github.com/tiwari-nishant/code-review-assistant/discussions

---

**Made with ❤️ using Bob AI Assistant**

No API keys, no costs, just great code reviews! 🚀