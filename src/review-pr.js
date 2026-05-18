import GitHubClient from './github-client.js';
import CodeAnalyzer from './code-analyzer.js';

class PullRequestReviewer {
  constructor() {
    this.githubClient = new GitHubClient();
    this.codeAnalyzer = new CodeAnalyzer();
  }

  /**
   * Review a pull request and post comments
   * @param {number} prNumber - Pull request number
   * @param {Object} options - Review options
   * @returns {Promise<Object>} Review result
   */
  async reviewPullRequest(prNumber, options = {}) {
    try {
      console.log(`\n🔍 Starting review for PR #${prNumber}...`);

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

      // Fetch diff
      console.log('\n📄 Fetching PR diff...');
      const diff = await this.githubClient.getPullRequestDiff(prNumber);

      // Analyze the changes
      console.log('\n🤖 Analyzing code changes with AI...');
      const analysis = await this.codeAnalyzer.analyzeChanges(prData, files, diff);

      // Generate review comment
      console.log('\n✍️  Generating review comment...');
      const reviewComment = this.codeAnalyzer.generateReviewComment(analysis, files.length);

      // Post the review
      if (!options.dryRun) {
        console.log('\n📤 Posting review to GitHub...');
        const review = await this.githubClient.createComment(prNumber, reviewComment);
        console.log(`✅ Review posted successfully!`);
        console.log(`   Comment URL: ${review.html_url}`);

        return {
          success: true,
          prNumber,
          reviewUrl: review.html_url,
          filesReviewed: files.length,
          analysis
        };
      } else {
        console.log('\n🔍 DRY RUN - Review comment (not posted):');
        console.log('─'.repeat(80));
        console.log(reviewComment);
        console.log('─'.repeat(80));

        return {
          success: true,
          prNumber,
          filesReviewed: files.length,
          analysis,
          dryRun: true
        };
      }
    } catch (error) {
      console.error(`\n❌ Error reviewing PR #${prNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Review multiple pull requests
   * @param {Array<number>} prNumbers - Array of PR numbers
   * @param {Object} options - Review options
   * @returns {Promise<Array>} Array of review results
   */
  async reviewMultiplePRs(prNumbers, options = {}) {
    const results = [];
    
    for (const prNumber of prNumbers) {
      try {
        const result = await this.reviewPullRequest(prNumber, options);
        results.push(result);
        
        // Add delay between reviews to avoid rate limiting
        if (prNumbers.length > 1) {
          console.log('\n⏳ Waiting 5 seconds before next review...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (error) {
        results.push({
          success: false,
          prNumber,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Review all open pull requests
   * @param {Object} options - Review options
   * @returns {Promise<Array>} Array of review results
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

      const prNumbers = prs.map(pr => pr.number);
      return await this.reviewMultiplePRs(prNumbers, options);
    } catch (error) {
      console.error('❌ Error reviewing open PRs:', error.message);
      throw error;
    }
  }

  /**
   * Perform detailed file-by-file review
   * @param {number} prNumber - Pull request number
   * @param {Object} options - Review options
   * @returns {Promise<Object>} Detailed review result
   */
  async detailedReview(prNumber, options = {}) {
    try {
      console.log(`\n🔍 Starting detailed review for PR #${prNumber}...`);

      const prData = await this.githubClient.getPullRequest(prNumber);
      const files = await this.githubClient.getPullRequestFiles(prNumber);

      console.log(`\n📂 Analyzing ${files.length} file(s) individually...`);

      const fileReviews = [];
      const maxFiles = parseInt(process.env.MAX_FILES_PER_REVIEW) || 20;
      const filesToReview = files.slice(0, maxFiles);

      for (const file of filesToReview) {
        console.log(`\n   Analyzing: ${file.filename}`);
        
        if (file.patch) {
          const issues = await this.codeAnalyzer.analyzeFile(
            file.filename,
            file.patch,
            file.patch
          );
          
          fileReviews.push({
            filename: file.filename,
            status: file.status,
            additions: file.additions,
            deletions: file.deletions,
            issues
          });

          console.log(`      Found ${issues.length} issue(s)`);
        }
      }

      // Generate detailed review comment
      const detailedComment = this.generateDetailedComment(prData, fileReviews);

      if (!options.dryRun) {
        console.log('\n📤 Posting detailed review to GitHub...');
        const review = await this.githubClient.createComment(prNumber, detailedComment);
        console.log(`✅ Detailed review posted successfully!`);

        return {
          success: true,
          prNumber,
          reviewUrl: review.html_url,
          fileReviews
        };
      } else {
        console.log('\n🔍 DRY RUN - Detailed review (not posted):');
        console.log('─'.repeat(80));
        console.log(detailedComment);
        console.log('─'.repeat(80));

        return {
          success: true,
          prNumber,
          fileReviews,
          dryRun: true
        };
      }
    } catch (error) {
      console.error(`\n❌ Error in detailed review for PR #${prNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Generate detailed review comment from file reviews
   * @param {Object} prData - PR data
   * @param {Array} fileReviews - File review results
   * @returns {string} Formatted comment
   */
  generateDetailedComment(prData, fileReviews) {
    let comment = `## 🤖 Detailed Code Review\n\n`;
    comment += `**PR:** ${prData.title}\n`;
    comment += `**Files Reviewed:** ${fileReviews.length}\n`;
    comment += `**Review Date:** ${new Date().toLocaleString()}\n\n`;
    comment += `---\n\n`;

    const totalIssues = fileReviews.reduce((sum, fr) => sum + fr.issues.length, 0);

    if (totalIssues === 0) {
      comment += `### ✅ No Issues Found\n\n`;
      comment += `Great job! The code changes look good. All files passed the automated review.\n\n`;
    } else {
      comment += `### 📋 Issues Found: ${totalIssues}\n\n`;

      for (const fileReview of fileReviews) {
        if (fileReview.issues.length > 0) {
          comment += `#### 📄 \`${fileReview.filename}\`\n\n`;
          comment += `*Status: ${fileReview.status}, +${fileReview.additions} -${fileReview.deletions}*\n\n`;

          for (const issue of fileReview.issues) {
            if (issue.line) {
              comment += `- **Line ${issue.line}:** ${issue.message}\n`;
            } else {
              comment += `- ${issue.message}\n`;
            }
          }
          comment += `\n`;
        }
      }
    }

    comment += `---\n\n`;
    comment += `*This detailed review was automatically generated by the Code Review Assistant.*\n`;

    return comment;
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const reviewer = new PullRequestReviewer();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage:
  node src/review-pr.js <pr-number> [options]
  node src/review-pr.js --all [options]

Options:
  --dry-run       Show review without posting
  --detailed      Perform detailed file-by-file review

Examples:
  node src/review-pr.js 123
  node src/review-pr.js 123 --dry-run
  node src/review-pr.js 123 --detailed
  node src/review-pr.js --all
    `);
    process.exit(1);
  }

  const options = {
    dryRun: args.includes('--dry-run'),
    detailed: args.includes('--detailed')
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

        if (options.detailed) {
          await reviewer.detailedReview(prNumber, options);
        } else {
          await reviewer.reviewPullRequest(prNumber, options);
        }
      }
    } catch (error) {
      console.error('❌ Review failed:', error.message);
      process.exit(1);
    }
  })();
}

export default PullRequestReviewer;

// Made with Bob
