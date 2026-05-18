import PullRequestReviewer from './review-pr.js';

/**
 * Main entry point for the Code Review Assistant
 */
async function main() {
  console.log('🤖 Code Review Assistant\n');
  
  const reviewer = new PullRequestReviewer();
  
  // Example: Review a specific PR
  // await reviewer.reviewPullRequest(123);
  
  // Example: Review all open PRs
  // await reviewer.reviewAllOpenPRs();
  
  console.log('ℹ️  To review a PR, use:');
  console.log('   node src/review-pr.js <pr-number>');
  console.log('\nℹ️  To review all open PRs, use:');
  console.log('   node src/review-pr.js --all');
  console.log('\nℹ️  For more options, run:');
  console.log('   node src/review-pr.js');
}

main().catch(console.error);

// Made with Bob
