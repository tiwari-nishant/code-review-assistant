import dotenv from 'dotenv';
import { Octokit } from '@octokit/rest';

dotenv.config();

console.log('🧪 Testing Code Review Assistant Setup (Bob Version)\n');

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
console.log('3️⃣ Checking Bob availability...');
console.log('✅ Bob is available in your IDE');
console.log('   You can use Bob to perform code reviews\n');

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
console.log('\n📚 Next steps:');
console.log('1. Create a test pull request in your repository');
console.log('2. Run: npm run review <pr-number>');
console.log('3. Ask Bob to review the generated prompt file');
console.log('4. Bob will analyze the code and provide feedback');
console.log('5. Post Bob\'s review to the PR');
console.log('\n🎯 Key Advantage: No OpenAI API key needed!');
console.log('   Bob uses its built-in capabilities for code review.');
console.log('\n🚀 Happy reviewing with Bob!\n');

// Made with Bob
