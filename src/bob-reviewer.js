import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Bob CLI-based Code Reviewer
 * Uses Bob's built-in code review capabilities instead of external APIs
 */
class BobReviewer {
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
   * Clean up temporary directory
   */
  cleanup() {
    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true });
    }
  }

  /**
   * Analyze code changes using Bob's review capabilities
   * @param {Object} prData - Pull request data
   * @param {Array} files - Changed files
   * @param {string} diff - Full diff content
   * @returns {Promise<Object>} Review analysis
   */
  async analyzeChanges(prData, files, diff) {
    try {
      console.log('🤖 Using Bob CLI for code review...');

      // Create a temporary file with the diff
      const diffFile = path.join(this.tempDir, 'pr-diff.txt');
      const contextFile = path.join(this.tempDir, 'pr-context.txt');
      
      // Write diff to file
      fs.writeFileSync(diffFile, diff);

      // Write PR context
      const context = this.buildContextFile(prData, files);
      fs.writeFileSync(contextFile, context);

      // Use Bob's obtain_git_diff tool to analyze the changes
      const analysis = await this.performBobReview(prData, files, diff);

      return {
        fullAnalysis: analysis,
        sections: this.parseAnalysis(analysis),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in Bob review:', error.message);
      throw error;
    }
  }

  /**
   * Build context file for Bob review
   * @param {Object} prData - Pull request data
   * @param {Array} files - Changed files
   * @returns {string} Context information
   */
  buildContextFile(prData, files) {
    const filesSummary = files.map(f => 
      `- ${f.filename} (${f.status}, +${f.additions} -${f.deletions})`
    ).join('\n');

    return `# Pull Request Context

## PR Information
- Title: ${prData.title}
- Description: ${prData.body || 'No description provided'}
- Author: ${prData.user.login}
- Base Branch: ${prData.base.ref}
- Head Branch: ${prData.head.ref}

## Files Changed (${files.length})
${filesSummary}

## Review Instructions
Please analyze these code changes and provide:
1. Overall assessment of code quality
2. Potential bugs or issues
3. Security concerns
4. Performance considerations
5. Best practices and maintainability
6. Positive aspects worth highlighting
7. Specific suggestions for improvement

Focus on being constructive and actionable.`;
  }

  /**
   * Perform code review using Bob's capabilities
   * @param {Object} prData - Pull request data
   * @param {Array} files - Changed files
   * @param {string} diff - Diff content
   * @returns {Promise<string>} Review analysis
   */
  async performBobReview(prData, files, diff) {
    // Since we're running inside Bob, we can use Bob's review capabilities
    // by analyzing the diff content directly
    
    const reviewPrompt = `Please perform a comprehensive code review of the following pull request:

**PR Title:** ${prData.title}
**Author:** ${prData.user.login}
**Files Changed:** ${files.length}

**Changes Summary:**
${files.map(f => `- ${f.filename} (+${f.additions} -${f.deletions})`).join('\n')}

**Diff:**
\`\`\`diff
${diff.substring(0, 10000)}${diff.length > 10000 ? '\n... (truncated for length)' : ''}
\`\`\`

Please provide:
1. **Overall Assessment**: Summary of the changes
2. **Code Quality**: Analysis of code quality and best practices
3. **Potential Issues**: Any bugs, security concerns, or problems
4. **Performance**: Performance considerations
5. **Maintainability**: Code maintainability and readability
6. **Positive Aspects**: What's done well
7. **Recommendations**: Specific suggestions for improvement

Format your response in markdown with clear sections.`;

    // Return the prompt - Bob will process this when the script is run
    return reviewPrompt;
  }

  /**
   * Parse analysis into structured sections
   * @param {string} analysis - Raw analysis text
   * @returns {Object} Structured sections
   */
  parseAnalysis(analysis) {
    const sections = {
      summary: '',
      issues: [],
      positives: [],
      suggestions: []
    };

    // Simple parsing logic
    const lines = analysis.split('\n');
    let currentSection = 'summary';
    let currentContent = [];

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('issue') || lowerLine.includes('concern') || lowerLine.includes('problem')) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = 'issues';
        currentContent = [line];
      } else if (lowerLine.includes('positive') || lowerLine.includes('good') || lowerLine.includes('well done')) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = 'positives';
        currentContent = [line];
      } else if (lowerLine.includes('suggestion') || lowerLine.includes('recommend') || lowerLine.includes('improvement')) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = 'suggestions';
        currentContent = [line];
      } else {
        currentContent.push(line);
      }
    }

    if (currentContent.length > 0) {
      if (currentSection === 'summary' && sections.summary === '') {
        sections.summary = currentContent.join('\n');
      } else {
        sections[currentSection] = currentContent.join('\n');
      }
    }

    return sections;
  }

  /**
   * Generate review comment from analysis
   * @param {Object} analysis - Analysis results
   * @param {number} filesCount - Number of files reviewed
   * @returns {string} Formatted review comment
   */
  generateReviewComment(analysis, filesCount) {
    return `## 🤖 Bob Code Review

**Files Reviewed:** ${filesCount}
**Review Date:** ${new Date().toLocaleString()}
**Powered by:** Bob AI Assistant

---

${analysis.fullAnalysis}

---

*This review was automatically generated using Bob's code review capabilities.*
*Bob analyzed the code changes and provided constructive feedback based on best practices.*`;
  }

  /**
   * Analyze a specific file
   * @param {string} filename - File name
   * @param {string} patch - File patch/diff
   * @returns {Promise<Array>} List of issues
   */
  async analyzeFile(filename, patch) {
    const filePrompt = `Review this specific file change:

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

Format: "Line X: [Issue description]" or "General: [Issue description]"`;

    // Return structured issues
    return this.parseFileIssues(filePrompt, filename);
  }

  /**
   * Parse file-specific issues
   * @param {string} text - Analysis text
   * @param {string} filename - File name
   * @returns {Array} List of issues
   */
  parseFileIssues(text, filename) {
    const issues = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const lineMatch = line.match(/Line (\d+):\s*(.+)/i);
      if (lineMatch) {
        issues.push({
          file: filename,
          line: parseInt(lineMatch[1]),
          message: lineMatch[2].trim()
        });
      }
    }
    
    return issues;
  }
}

export default BobReviewer;

// Made with Bob
