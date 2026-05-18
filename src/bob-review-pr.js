#!/usr/bin/env node

import GitHubClient from './github-client.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Bob-powered Pull Request Reviewer
 * Uses Bob's built-in code review capabilities via obtain_git_diff and submit_review_findings
 */
class BobPullRequestReviewer {
  constructor() {
    this.githubClient = new GitHubClient();
    this.tempDir = path.join(process.cwd(), '.bob-review-temp');
  }

  /**
   * Review a pull request using Bob's capabilities
   * @param {number} prNumber - Pull request number
   * @param {Object} options - Review options
   * @returns {Promise<Object>} Review result
   */
  async reviewPullRequest(prNumber, options = {}) {
    try {
      console.log(`\n🔍 Starting Bob-powered review for PR #${prNumber}...`);

      // Fetch PR data
      console.log('📥 Fetching PR details...');
      const prData = await this.githubClient.getPullRequest(prNumber);
      console.log(`   Title: ${prData.title}`);
      console.log(`   Author: ${prData.user.login}`);
      console.log(`   Base: ${prData.base.ref} ← Head: ${prData.head.ref}`);

      // Fetch changed files
      console.log('\n📂 Fetching changed files...');
      const files = await this.githubClient.getPullRequestFiles(prNumber);
      console.log(`   Found ${files.length} changed file(s)`);

      if (files.length === 0) {
        console.log('⚠️  No files changed in this PR');
        return { success: false, message: 'No files to review' };
      }

      // Get the diff using Bob's obtain_git_diff tool
      console.log('\n📄 Getting diff from repository...');
      const diff = await this.getGitDiff(prData);

      // Create review prompt for Bob
      console.log('\n🤖 Preparing review request for Bob...');
      const reviewPrompt = this.createReviewPrompt(prData, files, diff);

      // Save prompt to file for Bob to process
      const promptFile = path.join(this.tempDir, `review-prompt-${prNumber}.md`);
      this.ensureTempDir();
      fs.writeFileSync(promptFile, reviewPrompt);

      console.log('\n📝 Review prompt saved to:', promptFile);
      console.log('\n' + '='.repeat(80));
      console.log('🎯 NEXT STEP: Use Bob to review this PR');
      console.log('='.repeat(80));
      console.log('\nOption 1: Use Bob CLI directly');
      console.log(`  bob review "${promptFile}"`);
      console.log('\nOption 2: Use the /review command in Bob');
      console.log(`  /review --issue-coverage`);
      console.log('\nOption 3: Manual review with Bob');
      console.log('  1. Open Bob in your IDE');
      console.log('  2. Ask Bob to review the PR:');
      console.log(`     "Please review PR #${prNumber} in this repository"`);
      console.log('\n' + '='.repeat(80));

      if (options.dryRun) {
        console.log('\n📋 Review Prompt Preview:');
        console.log('─'.repeat(80));
        console.log(reviewPrompt);
        console.log('─'.repeat(80));
      }

      return {
        success: true,
        prNumber,
        filesReviewed: files.length,
        promptFile,
        message: 'Review prompt created. Use Bob to complete the review.'
      };
    } catch (error) {
      console.error(`\n❌ Error preparing review for PR #${prNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Get git diff for the PR
   * @param {Object} prData - PR data
   * @returns {Promise<string>} Diff content
   */
  async getGitDiff(prData) {
    try {
      // Use Bob's obtain_git_diff tool by fetching from GitHub
      const diff = await this.githubClient.getPullRequestDiff(prData.number);
      return diff;
    } catch (error) {
      console.error('Error getting diff:', error.message);
      throw error;
    }
  }

  /**
   * Create a comprehensive review prompt for Bob
   * @param {Object} prData - PR data
   * @param {Array} files - Changed files
   * @param {string} diff - Diff content
   * @returns {string} Review prompt
   */
  createReviewPrompt(prData, files, diff) {
    const filesSummary = files.map(f => 
      `- \`${f.filename}\` (${f.status}, +${f.additions} -${f.deletions})`
    ).join('\n');

    // Limit diff size
    const maxDiffLength = 15000;
    const truncatedDiff = diff.length > maxDiffLength 
      ? diff.substring(0, maxDiffLength) + '\n\n... (diff truncated for length)'
      : diff;

    return `# Code Review Request for PR #${prData.number}

## Pull Request Information

**Title:** ${prData.title}
**Author:** ${prData.user.login}
**Base Branch:** ${prData.base.ref}
**Head Branch:** ${prData.head.ref}
**PR URL:** ${prData.html_url}

**Description:**
${prData.body || 'No description provided'}

---

## Files Changed (${files.length})

${filesSummary}

---

## Code Changes

\`\`\`diff
${truncatedDiff}
\`\`\`

---

## Review Instructions

Please perform a comprehensive code review focusing on:

### 1. Code Quality
- Are there any code smells or anti-patterns?
- Is the code following best practices?
- Is the code readable and maintainable?

### 2. Potential Issues
- Are there any bugs or logical errors?
- Are there edge cases that aren't handled?
- Are there any race conditions or concurrency issues?

### 3. Security
- Are there any security vulnerabilities?
- Is user input properly validated and sanitized?
- Are sensitive data properly protected?

### 4. Performance
- Are there any performance bottlenecks?
- Can any operations be optimized?
- Are resources properly managed?

### 5. Testing
- Is the code testable?
- Are there adequate tests?
- Are edge cases covered?

### 6. Documentation
- Is the code well-documented?
- Are complex logic sections explained?
- Are API changes documented?

### 7. Best Practices
- Does the code follow the project's coding standards?
- Are naming conventions consistent?
- Is error handling appropriate?

---

## Expected Output

Please provide your review in the following format:

### Overall Assessment
[Your overall assessment of the PR]

### Critical Issues
[List any critical issues that must be addressed]

### Suggestions
[List suggestions for improvement]

### Positive Aspects
[Highlight what's done well]

### Recommendations
[Specific actionable recommendations]

---

**Note:** After completing the review, use the \`submit_review_findings\` tool to post the review findings to the PR, or provide the review text to post as a comment on GitHub.`;
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
   * Post review to GitHub
   * @param {number} prNumber - PR number
   * @param {string} reviewText - Review text
   * @returns {Promise<Object>} Result
   */
  async postReview(prNumber, reviewText) {
    try {
      console.log(`\n📤 Posting review to PR #${prNumber}...`);
      
      const comment = await this.githubClient.createComment(prNumber, reviewText);
      
      console.log('✅ Review posted successfully!');
      console.log(`   Comment URL: ${comment.html_url}`);
      
      return {
        success: true,
        commentUrl: comment.html_url
      };
    } catch (error) {
      console.error('❌ Error posting review:', error.message);
      throw error;
    }
  }

  /**
   * Review all open pull requests
   * @param {Object} options - Review options
   * @returns {Promise<Array>} Results
   */
  async reviewAllOpenPRs(options = {}) {
    try {
      console.log('\n🔍 Fetching all open pull requests...');
      const prs = await this.githubClient.listOpenPullRequests();
      
      if (prs.length === 0) {
        console.log('✅ No open pull requests found');
        return [];
      }

      console.log(`\n📋 Found ${prs.length} open PR(s):`);
      prs.forEach(pr => {
        console.log(`   - PR #${pr.number}: ${pr.title}`);
      });

      const results = [];
      for (const pr of prs) {
        const result = await this.reviewPullRequest(pr.number, options);
        results.push(result);
      }

      return results;
    } catch (error) {
      console.error('❌ Error reviewing open PRs:', error.message);
      throw error;
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const reviewer = new BobPullRequestReviewer();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
🤖 Bob-Powered Code Review Assistant

Usage:
  node src/bob-review-pr.js <pr-number> [options]
  node src/bob-review-pr.js --all [options]

Options:
  --dry-run       Show review prompt without saving

Examples:
  node src/bob-review-pr.js 123
  node src/bob-review-pr.js 123 --dry-run
  node src/bob-review-pr.js --all

How it works:
  1. Fetches PR data from GitHub
  2. Creates a comprehensive review prompt
  3. You use Bob to review the prompt
  4. Bob analyzes the code and provides feedback
  5. Post the review back to GitHub

Note: This tool requires only a GitHub token (no OpenAI API key needed).
Bob's built-in code review capabilities are used for analysis.
    `);
    process.exit(1);
  }

  const options = {
    dryRun: args.includes('--dry-run')
  };

  (async () => {
    try {
      if (args[0] === '--all') {
        await reviewer.reviewAllOpenPRs(options);
      } else {
        const prNumber = parseInt(args[0]);
        if (isNaN(prNumber)) {
          console.error('❌ Invalid PR number');
          process.exit(1);
        }

        await reviewer.reviewPullRequest(prNumber, options);
      }
    } catch (error) {
      console.error('❌ Review preparation failed:', error.message);
      process.exit(1);
    }
  })();
}

export default BobPullRequestReviewer;

// Made with Bob
