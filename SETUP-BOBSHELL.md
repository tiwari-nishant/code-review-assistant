# Bob Shell Code Review Assistant Setup Guide

This guide explains how to set up the Bob Shell-powered code review assistant for your GitHub repository.

## Overview

The system provides:
- **Automatic PR Reviews**: Bob Shell automatically reviews every pull request
- **Manual Commands**: Trigger reviews, summaries, and triage on-demand
- **Issue Triage**: Automatically label issues based on content

## Prerequisites

1. **Bob Shell API Key**: Obtain from IBM Bob Shell service
2. **GitHub Repository**: Admin access to configure secrets and workflows
3. **Optional**: GitHub App for enhanced permissions

## Setup Steps

### 1. Add Required Secrets

Go to your repository **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

**Required:**
- `BOBSHELL_API_KEY`: Your IBM Bob Shell API key

**Optional (for GitHub App):**
- `BOB_APP_PRIVATE_KEY`: GitHub App private key

### 2. Add Optional Variables

Go to **Settings** → **Secrets and variables** → **Actions** → **Variables** tab

**Optional:**
- `BOB_APP_ID`: GitHub App ID (if using GitHub App)
- `BOBSHELL_VERSION`: Bob Shell version (default: `latest`)
- `NODE_VERSION`: Node.js version (default: `22`)
- `DEBUG`: Enable debug mode (`true` or `false`)
- `BOB_OWNERS_ONLY`: Restrict manual commands to owners only (`true` or `false`)

### 3. Commit Required Files

Ensure these files are in your repository's default branch (usually `main`):

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
    ├── dispatch.yml            # Manual command dispatcher
    ├── review.yml              # PR review workflow
    ├── summary.yml             # PR summary workflow
    ├── triage.yml              # Issue triage workflow
    └── scheduled-triage.yml    # Scheduled batch triage
```

### 4. Push to GitHub

```bash
git add .github/
git commit -m "Add Bob Shell code review assistant"
git push origin main
```

## How It Works

### Automatic PR Reviews

When a pull request is **opened**, **updated**, or **reopened**:

1. GitHub Actions triggers the `auto-pr-review.yml` workflow
2. Bob Shell is installed and configured
3. GitHub MCP server is set up for PR operations
4. Bob analyzes the PR using the `/bob-review` command
5. Bob posts review comments directly on the PR
6. Cost summary is posted as a comment

**Workflow file**: `.github/workflows/auto-pr-review.yml`

### Manual Commands

Comment on any PR or issue with these commands:

#### Review a Pull Request
```
@bobshell /review
```
Triggers a comprehensive code review with line-by-line feedback.

#### Generate PR Summary
```
@bobshell /summary
```
Creates a structured summary of the pull request changes.

#### Triage an Issue
```
@bobshell /triage
```
Analyzes the issue and suggests appropriate labels.

**Workflow file**: `.github/workflows/dispatch.yml`

### Scheduled Issue Triage

Automatically runs every hour to triage unlabeled issues:

1. Finds all open issues without labels
2. Bob analyzes each issue
3. Appropriate labels are applied automatically

**Workflow file**: `.github/workflows/scheduled-triage.yml`

## Customization

### Modify Review Prompts

Edit the `.toml` files in `.github/commands/` to customize Bob's behavior:

- `bob-review.toml`: Change review focus areas
- `bob-summary.toml`: Adjust summary format
- `bob-triage.toml`: Modify label selection criteria

### Adjust Coin Limits

In workflow files, modify the `max_coins` parameter:

```yaml
with:
  max_coins: 3  # Increase for more thorough reviews
```

### Change Triggers

Edit workflow `on:` sections to change when reviews run:

```yaml
on:
  pull_request:
    types:
      - opened        # New PRs
      - synchronize   # New commits
      - reopened      # Reopened PRs
```

## Troubleshooting

### Workflow Not Running

**Check:**
1. ✅ `BOBSHELL_API_KEY` is set in repository secrets
2. ✅ All required files are in the default branch
3. ✅ Workflows are enabled in repository settings
4. ✅ GitHub Actions has proper permissions

**View logs:**
- Go to **Actions** tab in your repository
- Click on the failed workflow run
- Expand steps to see detailed logs

### Bob Shell Installation Fails

**Error**: `bash: line 1: syntax error near unexpected token 'newline'`

**Cause**: The Bob Shell installation URL returned HTML (404 page) instead of the installation script.

**Current Solution**: The action now uses npm to install Bob Shell: `npm install -g @ibm/bob-shell`

**Alternative Solutions if npm installation fails:**

1. **Use IBM Internal Installation Script** (requires IBM network):
   ```bash
   curl -fsSL https://internal.bob.ibm.com/install.sh | bash
   ```

2. **Use Self-Hosted Runners** within IBM network

3. **Manual Installation** - Download Bob Shell binary and add to PATH:
   ```yaml
   - name: 'Install Bob Shell'
     run: |
       wget https://your-internal-url/bob-shell-linux-x64
       chmod +x bob-shell-linux-x64
       sudo mv bob-shell-linux-x64 /usr/local/bin/bob
   ```

4. **Contact IBM Bob Shell Support** for the correct installation method for your environment

### No Review Comments Posted

**Check:**
1. Bob Shell API key is valid
2. GitHub token has `pull-requests: write` permission
3. Review the workflow logs for errors
4. Verify MCP server configuration is correct

### Permission Errors

**Error**: `Resource not accessible by integration`

**Solution**: Add GitHub App or ensure `GITHUB_TOKEN` has required permissions:

```yaml
permissions:
  contents: 'read'
  issues: 'write'
  pull-requests: 'write'
```

## Network Requirements

### IBM Internal Network

Bob Shell installation requires access to:
- `https://bob.ibm.com/install.sh`
- IBM Bob Shell API endpoints

**Options:**
1. **Self-hosted runners**: Run within IBM network
2. **GitHub-hosted runners**: May need VPN or proxy configuration
3. **Alternative installation**: Download Bob Shell binary manually

### GitHub MCP Server

Downloads from:
- `https://github.com/github/github-mcp-server/releases/`

This is publicly accessible and should work on all runners.

## Cost Management

Bob Shell uses "coins" to track usage:

- **Review**: ~3 coins per PR
- **Summary**: ~2 coins per PR
- **Triage**: ~2 coins per issue

**Monitor costs:**
- Check workflow logs for session summaries
- Review cost comments posted on PRs
- Adjust `max_coins` to control spending

## Security Best Practices

1. **Never commit secrets**: Use GitHub Secrets for API keys
2. **Limit permissions**: Use minimal required permissions
3. **Review workflows**: Audit workflow changes carefully
4. **Use GitHub Apps**: For better security and rate limits
5. **Restrict commands**: Set `BOB_OWNERS_ONLY=true` to limit access

## Support

For issues with:
- **Bob Shell**: Contact IBM Bob Shell support
- **GitHub Actions**: Check GitHub Actions documentation
- **This setup**: Review workflow logs and this guide

## Example Workflow Run

```
1. Developer creates PR
2. auto-pr-review.yml triggers
3. Bob Shell installs
4. GitHub MCP server downloads
5. Bob analyzes PR code
6. Bob posts review comments
7. Cost summary posted
8. Workflow completes
```

## Next Steps

1. ✅ Verify `BOBSHELL_API_KEY` is set
2. ✅ Push all workflow files to default branch
3. ✅ Create a test PR to verify automatic review
4. ✅ Try manual commands: `@bobshell /review`
5. ✅ Monitor Actions tab for workflow runs
6. ✅ Customize prompts as needed

---

**Ready to go!** Create a pull request to see Bob Shell in action! 🚀