/**
 * Code Analyzer - Bob Integration
 * This module prepares code for Bob to analyze
 * No external AI APIs required - uses Bob's built-in capabilities
 */

import fs from 'fs';
import path from 'path';

class CodeAnalyzer {
  constructor() {
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
   * Analyze code changes by preparing a prompt for Bob
   * @param {Object} prData - Pull request data
   * @param {Array} files - Changed files
   * @param {string} diff - Full diff content
   * @returns {Promise<Object>} Review analysis structure
   */
  async analyzeChanges(prData, files, diff) {
    try {
      const prompt = this.buildReviewPrompt(prData, files, diff);
      
      // Save prompt for Bob to review
      const promptFile = path.join(this.tempDir, `review-${prData.number}.md`);
      fs.writeFileSync(promptFile, prompt);

      const analysis = `# Code Review Prepared for Bob

This PR has been analyzed and a review prompt has been created.

**Next Steps:**
1. Ask Bob to review the file: \`${promptFile}\`
2. Bob will analyze the code changes
3. Bob will provide comprehensive feedback

**Prompt File:** ${promptFile}

**To review with Bob:**
\`\`\`
"Please review the file ${promptFile} and provide a comprehensive code review"
\`\`\`

Bob will analyze:
- Code quality and best practices
- Potential bugs or issues
- Security vulnerabilities
- Performance concerns
- Code maintainability
- Documentation quality
`;

      return this.parseAnalysis(analysis, files);
    } catch (error) {
      console.error('Error preparing review for Bob:', error.message);
      throw error;
    }
  }

  /**
   * Build the review prompt from PR data
   * @param {Object} prData - Pull request data
   * @param {Array} files - Changed files
   * @param {string} diff - Full diff content
   * @returns {string} Formatted prompt for Bob
   */
  buildReviewPrompt(prData, files, diff) {
    const filesSummary = files.map(f => 
      `- ${f.filename} (${f.status}, +${f.additions} -${f.deletions})`
    ).join('\n');

    // Limit diff size
    const maxDiffLength = 15000;
    const truncatedDiff = diff.length > maxDiffLength 
      ? diff.substring(0, maxDiffLength) + '\n\n... (diff truncated for length)'
      : diff;

    return `# Pull Request Review Request

## PR Information
- **Title:** ${prData.title}
- **Description:** ${prData.body || 'No description provided'}
- **Author:** ${prData.user.login}
- **Base Branch:** ${prData.base.ref}
- **Head Branch:** ${prData.head.ref}
- **PR Number:** #${prData.number}

## Files Changed (${files.length})
${filesSummary}

## Code Changes
\`\`\`diff
${truncatedDiff}
\`\`\`

## Review Instructions

Please provide a comprehensive code review focusing on:

1. **Overall Assessment**
   - Summary of the changes
   - Overall code quality

2. **Code Quality**
   - Are there any code smells or anti-patterns?
   - Is the code following best practices?
   - Is the code readable and maintainable?

3. **Potential Issues**
   - Are there any bugs or logical errors?
   - Are there edge cases that aren't handled?
   - Are there any race conditions or concurrency issues?

4. **Security**
   - Are there any security vulnerabilities?
   - Is user input properly validated and sanitized?
   - Are sensitive data properly protected?

5. **Performance**
   - Are there any performance bottlenecks?
   - Can any operations be optimized?
   - Are resources properly managed?

6. **Testing**
   - Is the code testable?
   - Are there adequate tests?
   - Are edge cases covered?

7. **Documentation**
   - Is the code well-documented?
   - Are complex logic sections explained?
   - Are API changes documented?

8. **Best Practices**
   - Does the code follow the project's coding standards?
   - Are naming conventions consistent?
   - Is error handling appropriate?

Please format your response in markdown with clear sections.`;
  }

  /**
   * Parse the analysis into structured feedback
   * @param {string} analysis - Raw analysis text
   * @param {Array} files - Changed files
   * @returns {Object} Structured review data
   */
  parseAnalysis(analysis, files) {
    const sections = {
      summary: analysis,
      issues: [],
      positives: [],
      suggestions: []
    };

    return {
      fullAnalysis: analysis,
      sections,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Analyze a specific file for issues
   * @param {string} filename - File name
   * @param {string} content - File content
   * @param {string} patch - File patch/diff
   * @returns {Promise<Array>} List of issues found
   */
  async analyzeFile(filename, content, patch) {
    const prompt = `Please analyze this file change:

**File:** ${filename}

**Changes:**
\`\`\`diff
${patch}
\`\`\`

Identify specific issues with line numbers if applicable. Focus on:
- Bugs or logical errors
- Security vulnerabilities
- Performance issues
- Code style violations
- Missing error handling

Format each issue as: "Line X: [Issue description]" or "General: [Issue description]"`;

    // Save prompt for Bob
    const promptFile = path.join(this.tempDir, `file-review-${filename.replace(/\//g, '-')}.md`);
    fs.writeFileSync(promptFile, prompt);

    return [{
      file: filename,
      line: null,
      message: `Review prompt created at: ${promptFile}. Ask Bob to review this file.`
    }];
  }

  /**
   * Generate a summary review comment
   * @param {Object} analysis - Analysis results
   * @param {number} filesCount - Number of files reviewed
   * @returns {string} Formatted review comment
   */
  generateReviewComment(analysis, filesCount) {
    return `## 🤖 Code Review with Bob

**Files Reviewed:** ${filesCount}
**Review Date:** ${new Date().toLocaleString()}

---

${analysis.fullAnalysis}

---

*This review was prepared for Bob AI Assistant.*
*Bob will analyze the code changes and provide detailed feedback.*`;
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

export default CodeAnalyzer;

// Made with Bob
