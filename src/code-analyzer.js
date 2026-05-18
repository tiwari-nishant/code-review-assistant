import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

class CodeAnalyzer {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.model = process.env.REVIEW_MODEL || 'gpt-4';
  }

  /**
   * Analyze code changes and provide review feedback
   * @param {Object} prData - Pull request data
   * @param {Array} files - Changed files
   * @param {string} diff - Full diff content
   * @returns {Promise<Object>} Review analysis
   */
  async analyzeChanges(prData, files, diff) {
    try {
      const prompt = this.buildReviewPrompt(prData, files, diff);
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert code reviewer. Analyze the provided code changes and provide constructive feedback focusing on:
- Code quality and best practices
- Potential bugs or issues
- Security vulnerabilities
- Performance concerns
- Code maintainability
- Documentation and comments
- Test coverage

Provide specific, actionable feedback with line references where applicable.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const analysis = response.choices[0].message.content;
      return this.parseAnalysis(analysis, files);
    } catch (error) {
      console.error('Error analyzing code:', error.message);
      throw error;
    }
  }

  /**
   * Build the review prompt from PR data
   * @param {Object} prData - Pull request data
   * @param {Array} files - Changed files
   * @param {string} diff - Full diff content
   * @returns {string} Formatted prompt
   */
  buildReviewPrompt(prData, files, diff) {
    const filesSummary = files.map(f => 
      `- ${f.filename} (${f.status}, +${f.additions} -${f.deletions})`
    ).join('\n');

    // Limit diff size to avoid token limits
    const maxDiffLength = 8000;
    const truncatedDiff = diff.length > maxDiffLength 
      ? diff.substring(0, maxDiffLength) + '\n\n... (diff truncated for length)'
      : diff;

    return `# Pull Request Review

## PR Information
- Title: ${prData.title}
- Description: ${prData.body || 'No description provided'}
- Author: ${prData.user.login}
- Base Branch: ${prData.base.ref}
- Head Branch: ${prData.head.ref}

## Files Changed (${files.length})
${filesSummary}

## Code Changes
\`\`\`diff
${truncatedDiff}
\`\`\`

Please provide a comprehensive code review with:
1. Overall assessment
2. Specific issues or concerns (with file and line references if possible)
3. Positive aspects worth highlighting
4. Suggestions for improvement

Format your response in markdown.`;
  }

  /**
   * Parse the AI analysis into structured feedback
   * @param {string} analysis - Raw analysis text
   * @param {Array} files - Changed files
   * @returns {Object} Structured review data
   */
  parseAnalysis(analysis, files) {
    // Extract sections from the analysis
    const sections = {
      summary: '',
      issues: [],
      positives: [],
      suggestions: []
    };

    // Simple parsing - can be enhanced with more sophisticated logic
    const lines = analysis.split('\n');
    let currentSection = 'summary';
    let currentContent = [];

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('issue') || lowerLine.includes('concern')) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = 'issues';
        currentContent = [line];
      } else if (lowerLine.includes('positive') || lowerLine.includes('good')) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = 'positives';
        currentContent = [line];
      } else if (lowerLine.includes('suggestion') || lowerLine.includes('recommend')) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = 'suggestions';
        currentContent = [line];
      } else {
        currentContent.push(line);
      }
    }

    // Add remaining content
    if (currentContent.length > 0) {
      if (currentSection === 'summary' && sections.summary === '') {
        sections.summary = currentContent.join('\n');
      } else {
        sections[currentSection] = currentContent.join('\n');
      }
    }

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
    try {
      const prompt = `Analyze this file change and identify specific issues:

File: ${filename}

Changes:
\`\`\`diff
${patch}
\`\`\`

Provide a list of specific issues with line numbers if applicable. Focus on:
- Bugs or logical errors
- Security vulnerabilities
- Performance issues
- Code style violations
- Missing error handling

Format each issue as: "Line X: [Issue description]" or "General: [Issue description]"`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a code reviewer. Identify specific, actionable issues in code changes.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      });

      const issues = this.parseFileIssues(response.choices[0].message.content, filename);
      return issues;
    } catch (error) {
      console.error(`Error analyzing file ${filename}:`, error.message);
      return [];
    }
  }

  /**
   * Parse file-specific issues from AI response
   * @param {string} text - AI response text
   * @param {string} filename - File name
   * @returns {Array} List of parsed issues
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
      } else if (line.trim().startsWith('-') || line.trim().match(/^\d+\./)) {
        const message = line.replace(/^[-\d.]\s*/, '').trim();
        if (message.length > 10) {
          issues.push({
            file: filename,
            line: null,
            message
          });
        }
      }
    }
    
    return issues;
  }

  /**
   * Generate a summary review comment
   * @param {Object} analysis - Analysis results
   * @param {number} filesCount - Number of files reviewed
   * @returns {string} Formatted review comment
   */
  generateReviewComment(analysis, filesCount) {
    const { fullAnalysis, sections } = analysis;
    
    return `## 🤖 Automated Code Review

**Files Reviewed:** ${filesCount}
**Review Date:** ${new Date().toLocaleString()}

---

${fullAnalysis}

---

*This review was automatically generated by the Code Review Assistant. Please review the suggestions and use your judgment.*`;
  }
}

export default CodeAnalyzer;

// Made with Bob
