#!/usr/bin/env node

/**
 * Bob CLI Reviewer
 * Uses Bob CLI to programmatically generate code reviews
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import GitHubClient from './github-client.js';

class BobCLIReviewer {
  constructor() {
    this.githubClient = new GitHubClient();
    this.tempDir = path.join(process.cwd(), '.bob-review-temp');
    this.ensureTempDir();
  }

  /**
   * Ensure temporary directory exists
   */
  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Review a pull request using Bob CLI
   * @param {number} prNumber - Pull request number
   * @param {Object} options - Review options
   * @returns {Promise<Object>} Review result
   */
  async reviewPullRequest(prNumber, options = {}) {
    try {
      console.log(`\n🔍 Starting Bob CLI review for PR #${prNumber}...`);

      // Fetch PR data
      console.log('📥 Fetching PR details...');
      const prData = await this.githubClient.getPullRequest(prNumber);
      console.log(`   Title: ${prData.title}`);
      console.log(`   Author: ${prData.user.login}`);

      // Fetch changed files
      console.log('\n📂 Fetching changed files...');
      const files = await this.githubClient.getPullRequestFiles(prNumber);
      console.log(`   Found ${files.length} changed file(s)`);

      if (files.length === 0) {
        console.log('⚠️  No files changed in this PR');
        return { success: false, message: 'No files to review' };
      }

      // Get diff
      console.log('\n📄 Fetching PR diff...');
      const diff = await this.githubClient.getPullRequestDiff(prNumber);

      // Create review prompt
      const prompt = this.createReviewPrompt(prData, files, diff);
      const promptFile = path.join(this.tempDir, `review-prompt-${prNumber}.md`);
      fs.writeFileSync(promptFile, prompt);

      // Use Bob CLI to generate review
      console.log('\n🤖 Generating review with Bob CLI...');
      const review = await this.generateReviewWithBob(promptFile);

      if (!review) {
        console.log('⚠️  Bob CLI did not generate a review');
        return { success: false, message: 'Review generation failed' };
      }

      // Post review to GitHub
      if (!options.dryRun) {
        console.log('\n📤 Posting review to GitHub...');
        const comment = await this.githubClient.createComment(prNumber, review);
        console.log(`✅ Review posted successfully!`);
        console.log(`   Comment URL: ${comment.html_url}`);

        return {
          success: true,
          prNumber,
          reviewUrl: comment.html_url,
          filesReviewed: files.length
        };
      } else {
        console.log('\n🔍 DRY RUN - Review (not posted):');
        console.log('─'.repeat(80));
        console.log(review);
        console.log('─'.repeat(80));

        return {
          success: true,
          prNumber,
          filesReviewed: files.length,
          dryRun: true
        };
      }
    } catch (error) {
      console.error(`\n❌ Error reviewing PR #${prNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Generate review using Bob CLI
   * @param {string} promptFile - Path to prompt file
   * @returns {Promise<string>} Generated review
   */
  async generateReviewWithBob(promptFile) {
    try {
      // Check if Bob CLI is available
      try {
        execSync('which bob', { stdio: 'pipe' });
      } catch (error) {
        console.log('⚠️  Bob CLI not found in PATH');
        console.log('   Using fallback: prompt file created for manual review');
        return this.generateFallbackReview(promptFile);
      }

      // Execute Bob CLI with the prompt
      console.log('   Executing Bob CLI...');
      const bobCommand = `bob review "${promptFile}"`;
      
      try {
        const output = execSync(bobCommand, {
          encoding: 'utf-8',
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
          timeout: 60000 // 60 second timeout
        });

        return this.formatBobOutput(output);
      } catch (error) {
        console.log('⚠️  Bob CLI execution failed, using fallback');
        return this.generateFallbackReview(promptFile);
      }
    } catch (error) {
      console.error('Error generating review with Bob:', error.message);
      return this.generateFallbackReview(promptFile);
    }
  }

  /**
   * Format Bob CLI output
   * @param {string} output - Raw Bob output
   * @returns {string} Formatted review
   */
  formatBobOutput(output) {
    return `## 🤖 Bob AI Code Review

${output}

---

*This review was generated using Bob AI Assistant via CLI.*
*Review Date: ${new Date().toLocaleString()}*`;
  }

  /**
   * Generate fallback review when Bob CLI is not available
   * @param {string} promptFile - Path to prompt file
   * @returns {string} Fallback review
   */
  generateFallbackReview(promptFile) {
    return `## 🤖 Code Review Ready

A comprehensive review prompt has been prepared for this PR.

**Review Prompt:** \`${promptFile}\`

**To complete the review:**

1. **Using Bob in your IDE:**
   \`\`\`
   "Please review the file ${promptFile} and provide a comprehensive code review"
   \`\`\`

2. **Using Bob CLI (if installed):**
   \`\`\`bash
   bob review "${promptFile}"
   \`\`\`

3. **Manual Review:**
   - Open the prompt file
   - Review the code changes
   - Provide feedback

**What will be reviewed:**
- Code quality and best practices
- Potential bugs or issues
- Security vulnerabilities
- Performance concerns
- Code maintainability
- Documentation quality

---

*Automated review preparation completed. Waiting for Bob analysis.*
*Review Date: ${new Date().toLocaleString()}*`;
  }

  /**
   * Create review prompt
   * @param {Object} prData - PR data
   * @param {Array} files - Changed files
   * @param {string} diff - Diff content
   * @returns {string} Review prompt
   */
  createReviewPrompt(prData, files, diff) {
    const filesSummary = files.map(f => 
      `- ${f.filename} (${f.status}, +${f.additions} -${f.deletions})`
    ).join('\n');

    const maxDiffLength = 15000;
    const truncatedDiff = diff.length > maxDiffLength 
      ? diff.substring(0, maxDiffLength) + '\n\n... (diff truncated for length)'
      : diff;

    return `# Code Review Request - PR #${prData.number}

## PR Information
- **Title:** ${prData.title}
- **Author:** ${prData.user.login}
- **Base:** ${prData.base.ref}
- **Head:** ${prData.head.ref}

## Description
${prData.body || 'No description provided'}

## Files Changed (${files.length})
${filesSummary}

## Code Changes
\`\`\`diff
${truncatedDiff}
\`\`\`

## Review Instructions

Please provide a comprehensive code review in markdown format with the following sections:

### 1. Overall Assessment
Brief summary of the changes and overall code quality.

### 2. Critical Issues
Any critical bugs, security vulnerabilities, or blocking issues.

### 3. Suggestions
Recommendations for improvements, optimizations, or best practices.

### 4. Positive Aspects
What's done well in this PR.

### 5. Recommendations
Specific, actionable next steps.

Focus on being constructive and actionable. Provide specific examples and line references where applicable.`;
  }

  /**
   * Clean up temporary files
   */
  cleanup() {
    if (fs.existsSync(this.tempDir)) {
      const files = fs.readdirSync(this.tempDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(this.tempDir, file));
      });
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const reviewer = new BobCLIReviewer();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
🤖 Bob CLI Code Review Assistant

Usage:
  node src/bob-cli-reviewer.js <pr-number> [options]

Options:
  --dry-run       Show review without posting

Examples:
  node src/bob-cli-reviewer.js 123
  node src/bob-cli-reviewer.js 123 --dry-run

How it works:
  1. Fetches PR data from GitHub
  2. Creates review prompt
  3. Uses Bob CLI to generate review
  4. Posts review to GitHub automatically

Note: Requires Bob CLI to be installed and available in PATH.
If Bob CLI is not available, creates a prompt file for manual review.
    `);
    process.exit(1);
  }

  const prNumber = parseInt(args[0]);
  const options = {
    dryRun: args.includes('--dry-run')
  };

  if (isNaN(prNumber)) {
    console.error('❌ Invalid PR number');
    process.exit(1);
  }

  (async () => {
    try {
      await reviewer.reviewPullRequest(prNumber, options);
    } catch (error) {
      console.error('❌ Review failed:', error.message);
      process.exit(1);
    }
  })();
}

export default BobCLIReviewer;

// Made with Bob
