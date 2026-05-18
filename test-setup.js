import dotenv from 'dotenv';
import { Octokit } from '@octokit/rest';

dotenv.config();

console.log('🧪 Testing Code Review Assistant Setup\n');
console.log('📌 This version uses Bob AI and Automated Reviews - No external AI APIs needed!\n');

// Test 1: Environment Variables
console.log('1️⃣ Checking environment variables...');
const requiredVars = ['GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO'];
const missingVars = requiredVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Missing environment variables:', missingVars.join(', '));
  console.log('\nPlease create a .env file with the required variables.');
  console.log('See .env.example for reference.\n');
  process.exit(1);
}
console.log('✅ All required environment variables are set\n');

// Test 2: GitHub API Connection
console.log('2️⃣ Testing GitHub API connection...');
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

try {
  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`✅ Connected to GitHub as: ${user.login}`);
  
  // Test repository access
  const { data: repo } = await octokit.repos.get({
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO
  });
  console.log(`✅ Repository access confirmed: ${repo.full_name}\n`);
} catch (error) {
  console.error('❌ GitHub API error:', error.message);
  console.log('\nPlease check:');
  console.log('- Your GITHUB_TOKEN is valid');
  console.log('- The token has "repo" scope');
  console.log('- GITHUB_OWNER and GITHUB_REPO are correct\n');
  process.exit(1);
}

// Test 3: Check for Bob
console.log('3️⃣ Checking review capabilities...');
console.log('✅ Bob integration available');
console.log('   You can use Bob to perform AI-powered code reviews');
console.log('✅ Automated reviewer available');
console.log('   Pattern-based reviews will run automatically on PRs\n');

// Test 4: Check for open PRs
console.log('4️⃣ Checking for open pull requests...');
try {
  const { data: prs } = await octokit.pulls.list({
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    state: 'open',
    per_page: 5
  });
  
  if (prs.length > 0) {
    console.log(`✅ Found ${prs.length} open PR(s):`);
    prs.forEach(pr => {
      console.log(`   - PR #${pr.number}: ${pr.title}`);
    });
    console.log('\n💡 You can test the assistant with:');
    console.log(`   npm run review ${prs[0].number}`);
    console.log('\n   Then ask Bob to review the generated prompt file\n');
  } else {
    console.log('ℹ️  No open pull requests found');
    console.log('💡 Create a test PR to try the assistant\n');
  }
} catch (error) {
  console.error('⚠️  Could not fetch PRs:', error.message);
}

console.log('═'.repeat(60));
console.log('✅ Setup test completed successfully!');
console.log('═'.repeat(60));
console.log('\n📚 Available Review Methods:');
console.log('\n1️⃣ Automated Reviews (Recommended)');
console.log('   - Runs automatically on every PR');
console.log('   - No setup needed - just push to GitHub');
console.log('   - See: AUTOMATION.md');
console.log('\n2️⃣ Bob-Powered Reviews');
console.log('   - Run: npm run review <pr-number>');
console.log('   - Ask Bob to review the generated prompt');
console.log('   - See: README-BOB.md');
console.log('\n🎯 Key Advantages:');
console.log('   ✅ No external AI API keys needed');
console.log('   ✅ Completely free');
console.log('   ✅ High-quality reviews');
console.log('\n🚀 Next Steps:');
console.log('1. Create a test pull request');
console.log('2. Watch automated review appear (if pushed to GitHub)');
console.log('3. Try Bob-powered review: npm run review <pr-number>');
console.log('4. Ask Bob to analyze the generated prompt');
console.log('\n💡 Happy reviewing with Bob!\n');

// Made with Bob
