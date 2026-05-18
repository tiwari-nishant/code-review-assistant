# Bob Shell Installation for GitHub Actions

This guide explains how to install IBM Bob Shell in GitHub Actions for automated AI-powered code reviews.

## IBM Bob Shell Setup

Bob is IBM's AI assistant. The workflow is configured to install Bob Shell following IBM's official documentation.

Reference: https://internal.bob.ibm.com/docs/shell/getting-started/install-and-setup

## Installation in GitHub Actions

The workflow automatically installs Bob Shell using:

```bash
curl -fsSL https://internal.bob.ibm.com/install.sh | bash
```

## Required Secrets

### BOB_API_KEY (Optional but Recommended)

If Bob Shell requires authentication:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add:
   - **Name:** `BOB_API_KEY`
   - **Value:** Your Bob API key from IBM

### How to Get Bob API Key

1. Visit IBM Bob's internal portal
2. Go to your profile/settings
3. Generate or copy your API key
4. Add it to GitHub Secrets

## Workflow Steps

The GitHub Actions workflow:

1. **Installs Bob Shell**
   ```bash
   curl -fsSL https://internal.bob.ibm.com/install.sh | bash
   ```

2. **Adds Bob to PATH**
   ```bash
   export PATH="$HOME/.bob/bin:$PATH"
   ```

3. **Configures Bob** (if API key available)
   ```bash
   bob config set api-key "$BOB_API_KEY"
   ```

4. **Runs Code Review**
   ```bash
   npm run review <pr-number>
   ```

## Verification

After setup, the workflow should show:

```
Installing Bob Shell...
✅ Bob Shell installed successfully
Bob Shell version: x.x.x
Configuring Bob Shell...
🤖 Generating review with Bob CLI...
   Executing Bob CLI...
📤 Posting review to GitHub...
✅ Review posted successfully!
```

## Troubleshooting

### Bob Shell Installation Fails

**Symptom:**
```
⚠️  Bob Shell installation failed
Will use pattern-based review as fallback
```

**Possible Causes:**
1. GitHub Actions runner cannot access IBM internal network
2. Installation script URL is incorrect
3. Network connectivity issues

**Solutions:**
1. Verify the runner has access to IBM internal resources
2. Check if you need to use IBM-specific GitHub runners
3. Contact IBM support for CI/CD setup assistance
4. Use pattern-based review as fallback (works automatically)

### Authentication Issues

**Symptom:**
```
⚠️  BOB_API_KEY not set in secrets
Bob Shell may have limited functionality
```

**Solution:**
1. Add `BOB_API_KEY` to GitHub repository secrets
2. Verify the key is valid
3. Check Bob's authentication requirements

### Bob Command Not Found

**Symptom:**
```
bob: command not found
```

**Solutions:**
1. Verify PATH includes `$HOME/.bob/bin`
2. Check Bob Shell was installed successfully
3. Restart the workflow step

## Network Requirements

### IBM Internal Access

Bob Shell installation requires access to IBM internal resources:
- `https://internal.bob.ibm.com`

**For GitHub Actions:**
- Use IBM-hosted runners if available
- Or configure network access to IBM internal resources
- Or use self-hosted runners within IBM network

### Alternative: Self-Hosted Runners

If GitHub-hosted runners cannot access IBM internal resources:

1. Set up self-hosted runner within IBM network
2. Configure runner in your repository
3. Update workflow to use self-hosted runner:

```yaml
jobs:
  code-review:
    runs-on: self-hosted  # Use IBM internal runner
```

## Testing

### Test Locally First

```bash
# Install Bob Shell
curl -fsSL https://internal.bob.ibm.com/install.sh | bash

# Add to PATH
export PATH="$HOME/.bob/bin:$PATH"

# Verify installation
bob --version

# Test code review
npm run review 123
```

### Test in GitHub Actions

1. Ensure secrets are configured
2. Push workflow changes
3. Create a test PR
4. Check Actions tab for logs
5. Verify Bob Shell installation and review

## Current Fallback

Until Bob Shell is properly configured, the system uses **pattern-based review**:
- ✅ Works automatically
- ✅ No IBM access required
- ✅ Comprehensive security, quality, performance checks
- ✅ Posts detailed reviews

## IBM-Specific Configuration

### Using IBM GitHub Enterprise

If using IBM's GitHub Enterprise:

```yaml
# May need to specify IBM-specific settings
env:
  IBM_GITHUB_TOKEN: ${{ secrets.IBM_GITHUB_TOKEN }}
  BOB_API_KEY: ${{ secrets.BOB_API_KEY }}
```

### IBM Network Proxy

If behind IBM proxy:

```yaml
- name: Configure Proxy
  run: |
    export HTTP_PROXY=http://proxy.ibm.com:8080
    export HTTPS_PROXY=http://proxy.ibm.com:8080
```

## Support

- **Bob Documentation:** https://internal.bob.ibm.com/docs
- **IBM Support:** Contact your IBM support team
- **GitHub Actions:** Check repository Actions tab for logs

## Summary

The workflow is configured to:
1. ✅ Install Bob Shell automatically
2. ✅ Configure with API key (if provided)
3. ✅ Run AI-powered code reviews
4. ✅ Fall back to pattern-based review if needed

**No manual steps required** - just add `BOB_API_KEY` to secrets and the workflow handles everything!

---

**Note:** If Bob Shell cannot be installed in GitHub Actions (network restrictions), the pattern-based review provides excellent automated code analysis as a reliable fallback.