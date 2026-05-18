# 🤖 Code Review Assistant

An automated code review assistant that analyzes pull requests and provides constructive feedback directly on GitHub.

## ⚡ Fully Automated GitHub Actions (NEW!)

**Zero setup, zero API keys, fully automated reviews on every PR!**

The workflow automatically:
- ✅ Runs on every PR (open/update)
- ✅ Checks for security issues, code quality, and best practices
- ✅ Posts detailed review comments
- ✅ Requires only GitHub token (automatic)

👉 **[Setup Automated Reviews](AUTOMATION.md)** (2 minutes)

---

## 🎯 Three Options Available

### 1. Automated GitHub Actions (Recommended - Fully Automated!)
Runs automatically on every PR. **No setup, no API keys, completely free!**

👉 **[Setup Guide](AUTOMATION.md)** | **[View Workflow](.github/workflows/auto-review.yml)**

### 2. Bob-Powered Version (Manual with AI)
Uses Bob AI assistant built into your IDE. **No external API keys or costs required!**

👉 **[Get Started with Bob Version](README-BOB.md)** | **[Quick Start](QUICKSTART-BOB.md)**

### 3. OpenAI-Powered Version (Fully Automated with AI)
Uses OpenAI's GPT models for AI-powered automated reviews. Requires OpenAI API key.

👉 **[OpenAI Version Documentation](#openai-powered-version)** | **[Quick Start](QUICKSTART.md)**

---

# Bob-Powered Version (Recommended)

**Why choose Bob?**
- ✅ No API keys needed
- ✅ No per-review costs
- ✅ Uses AI already in your IDE
- ✅ Simple 3-minute setup

See **[README-BOB.md](README-BOB.md)** for complete documentation.

---

# OpenAI-Powered Version

## Features

- 🔍 **Automated PR Analysis**: Analyzes code changes in pull requests using AI
- 💬 **Intelligent Comments**: Posts detailed review comments on GitHub PRs
- 📊 **Multiple Review Modes**: 
  - Quick review for overall assessment
  - Detailed file-by-file analysis
  - Batch review for multiple PRs
- 🎯 **Focus Areas**:
  - Code quality and best practices
  - Potential bugs and issues
  - Security vulnerabilities
  - Performance concerns
  - Code maintainability
  - Documentation quality

## Prerequisites

- Node.js 18+ installed
- GitHub Personal Access Token with `repo` scope
- OpenAI API key (for AI-powered reviews)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/tiwari-nishant/code-review-assistant.git
cd code-review-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` and add your credentials:
```env
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=tiwari-nishant
GITHUB_REPO=code-review-assistant
OPENAI_API_KEY=your_openai_api_key
REVIEW_MODEL=gpt-4
MAX_FILES_PER_REVIEW=20
```

## Getting Your Tokens

### GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Code Review Assistant")
4. Select the `repo` scope (full control of private repositories)
5. Click "Generate token" and copy the token
6. Add it to your `.env` file

### OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Give it a name and copy the key
4. Add it to your `.env` file

## Usage

### Review a Specific Pull Request

```bash
node src/review-pr.js <pr-number>
```

Example:
```bash
node src/review-pr.js 123
```

### Dry Run (Preview Without Posting)

```bash
node src/review-pr.js <pr-number> --dry-run
```

### Detailed File-by-File Review

```bash
node src/review-pr.js <pr-number> --detailed
```

### Review All Open Pull Requests

```bash
node src/review-pr.js --all
```

### Using npm Scripts

```bash
# Start the assistant
npm start

# Review a PR
npm run review -- 123

# Review with dry run
npm run review -- 123 --dry-run
```

## How It Works

1. **Fetch PR Data**: Retrieves pull request information, changed files, and diffs from GitHub
2. **AI Analysis**: Sends the code changes to OpenAI's GPT model for analysis
3. **Generate Review**: Creates a structured review with:
   - Overall assessment
   - Specific issues and concerns
   - Positive aspects
   - Suggestions for improvement
4. **Post Comment**: Adds the review as a comment on the GitHub pull request

## Project Structure

```
code-review-assistant/
├── src/
│   ├── index.js           # Main entry point
│   ├── review-pr.js       # PR review orchestrator
│   ├── github-client.js   # GitHub API integration
│   └── code-analyzer.js   # AI-powered code analysis
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── package.json          # Project dependencies
└── README.md            # This file
```

## API Modules

### GitHubClient

Handles all GitHub API interactions:
- Fetch PR details and files
- Get PR diffs
- Post review comments
- List open PRs

### CodeAnalyzer

AI-powered code analysis:
- Analyze code changes
- Generate review feedback
- Parse and structure analysis results
- Create formatted review comments

### PullRequestReviewer

Orchestrates the review process:
- Coordinate GitHub and AI operations
- Handle multiple review modes
- Format and post reviews

## Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| `GITHUB_TOKEN` | GitHub personal access token | Required |
| `GITHUB_OWNER` | Repository owner username | Required |
| `GITHUB_REPO` | Repository name | Required |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `REVIEW_MODEL` | OpenAI model to use | `gpt-4` |
| `MAX_FILES_PER_REVIEW` | Max files in detailed review | `20` |

## Examples

### Example 1: Quick Review

```bash
node src/review-pr.js 42
```

Output:
```
🔍 Starting review for PR #42...
📥 Fetching PR details...
   Title: Add user authentication
   Author: developer123
   Base: main ← Head: feature/auth
📂 Fetching changed files...
   Found 5 changed file(s)
📄 Fetching PR diff...
🤖 Analyzing code changes with AI...
✍️  Generating review comment...
📤 Posting review to GitHub...
✅ Review posted successfully!
   Comment URL: https://github.com/...
```

### Example 2: Detailed Review with Dry Run

```bash
node src/review-pr.js 42 --detailed --dry-run
```

This will analyze each file individually and show the review without posting it.

## Limitations

- Maximum diff size is limited to avoid token limits
- Rate limiting applies to GitHub API calls
- OpenAI API costs apply per review
- Large PRs may take longer to analyze

## Best Practices

1. **Review Regularly**: Set up automated reviews for new PRs
2. **Use Dry Run**: Test reviews before posting
3. **Monitor Costs**: Track OpenAI API usage
4. **Customize Prompts**: Adjust analysis prompts for your needs
5. **Combine with Human Review**: Use as a supplement, not replacement

## Troubleshooting

### "Error: Bad credentials"
- Check your GitHub token is valid and has `repo` scope
- Ensure the token is correctly set in `.env`

### "Error: Insufficient quota"
- Check your OpenAI API credits
- Consider using a different model (e.g., `gpt-3.5-turbo`)

### "Error: Not Found"
- Verify the repository owner and name in `.env`
- Ensure the PR number exists

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own repositories.

## Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ for better code reviews