#!/usr/bin/env node

/**
 * Automated Code Reviewer
 * Performs automated code review without requiring external AI APIs
 * Designed to run in GitHub Actions
 */

import fs from 'fs';
import path from 'path';

class AutomatedReviewer {
  constructor() {
    this.issues = [];
    this.suggestions = [];
    this.positives = [];
  }

  /**
   * Analyze code diff and generate review
   * @param {string} diff - Git diff content
   * @param {Array} files - List of changed files
   * @returns {Object} Review results
   */
  analyzeDiff(diff, files = []) {
    const lines = diff.split('\n');
    let currentFile = '';
    let lineNumber = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Track current file
      if (line.startsWith('diff --git')) {
        const match = line.match(/b\/(.+)$/);
        if (match) currentFile = match[1];
        lineNumber = 0;
      }

      // Track line numbers
      if (line.startsWith('@@')) {
        const match = line.match(/\+(\d+)/);
        if (match) lineNumber = parseInt(match[1]);
      }

      // Only analyze added lines
      if (line.startsWith('+') && !line.startsWith('+++')) {
        lineNumber++;
        this.analyzeLine(line, currentFile, lineNumber);
      }
    }

    return this.generateReview(files);
  }

  /**
   * Analyze a single line of code
   * @param {string} line - Code line
   * @param {string} file - File name
   * @param {number} lineNum - Line number
   */
  analyzeLine(line, file, lineNum) {
    const content = line.substring(1).trim();

    // Security checks
    this.checkSecurity(content, file, lineNum);

    // Code quality checks
    this.checkCodeQuality(content, file, lineNum);

    // Best practices
    this.checkBestPractices(content, file, lineNum);

    // Performance
    this.checkPerformance(content, file, lineNum);
  }

  /**
   * Check for security issues
   */
  checkSecurity(line, file, lineNum) {
    // Hardcoded credentials
    if (line.match(/(password|api[_-]?key|secret|token|auth)\s*[=:]\s*['"][^'"]+['"]/i)) {
      this.issues.push({
        file,
        line: lineNum,
        severity: 'critical',
        category: 'security',
        message: 'Possible hardcoded credential detected. Use environment variables instead.',
        suggestion: 'Move sensitive data to environment variables or a secure vault.'
      });
    }

    // SQL injection risk
    if (line.match(/execute\s*\(\s*['"].*\$\{.*\}.*['"]/i) || 
        line.match(/query\s*\(\s*['"].*\+.*['"]/i)) {
      this.issues.push({
        file,
        line: lineNum,
        severity: 'high',
        category: 'security',
        message: 'Potential SQL injection vulnerability. Use parameterized queries.',
        suggestion: 'Use prepared statements or ORM methods instead of string concatenation.'
      });
    }

    // Eval usage
    if (line.match(/\beval\s*\(/)) {
      this.issues.push({
        file,
        line: lineNum,
        severity: 'high',
        category: 'security',
        message: 'Use of eval() is dangerous and should be avoided.',
        suggestion: 'Find alternative approaches that don\'t require eval().'
      });
    }

    // Insecure random
    if (line.match(/Math\.random\(\)/)) {
      this.suggestions.push({
        file,
        line: lineNum,
        severity: 'medium',
        category: 'security',
        message: 'Math.random() is not cryptographically secure.',
        suggestion: 'For security-sensitive operations, use crypto.randomBytes() or crypto.getRandomValues().'
      });
    }
  }

  /**
   * Check code quality
   */
  checkCodeQuality(line, file, lineNum) {
    // Console.log
    if (line.match(/console\.(log|debug|info|warn|error)/)) {
      this.issues.push({
        file,
        line: lineNum,
        severity: 'low',
        category: 'quality',
        message: 'Console statement found. Remove before merging or use proper logging.',
        suggestion: 'Use a logging library or remove debug statements.'
      });
    }

    // TODO comments
    if (line.match(/\/\/\s*TODO/i) || line.match(/\/\*\s*TODO/i)) {
      this.suggestions.push({
        file,
        line: lineNum,
        severity: 'low',
        category: 'quality',
        message: 'TODO comment found.',
        suggestion: 'Consider creating a GitHub issue to track this work.'
      });
    }

    // Very long lines
    if (line.length > 120) {
      this.suggestions.push({
        file,
        line: lineNum,
        severity: 'low',
        category: 'quality',
        message: `Line is ${line.length} characters long.`,
        suggestion: 'Consider breaking long lines for better readability (recommended: 80-120 chars).'
      });
    }

    // Commented code
    if (line.match(/^\/\/\s*[a-z]+\s*\(/i)) {
      this.suggestions.push({
        file,
        line: lineNum,
        severity: 'low',
        category: 'quality',
        message: 'Commented-out code detected.',
        suggestion: 'Remove commented code or explain why it\'s kept.'
      });
    }
  }

  /**
   * Check best practices
   */
  checkBestPractices(line, file, lineNum) {
    // var usage (JavaScript)
    if (line.match(/\bvar\s+\w+/)) {
      this.suggestions.push({
        file,
        line: lineNum,
        severity: 'low',
        category: 'best-practices',
        message: 'Use of "var" keyword.',
        suggestion: 'Use "const" or "let" instead of "var" for better scoping.'
      });
    }

    // == instead of ===
    if (line.match(/[^=!]==[^=]/) || line.match(/!=[^=]/)) {
      this.suggestions.push({
        file,
        line: lineNum,
        severity: 'low',
        category: 'best-practices',
        message: 'Use of loose equality (== or !=).',
        suggestion: 'Use strict equality (=== or !==) to avoid type coercion issues.'
      });
    }

    // Empty catch blocks
    if (line.match(/catch\s*\([^)]*\)\s*\{\s*\}/)) {
      this.issues.push({
        file,
        line: lineNum,
        severity: 'medium',
        category: 'best-practices',
        message: 'Empty catch block detected.',
        suggestion: 'Handle errors appropriately or at least log them.'
      });
    }
  }

  /**
   * Check performance
   */
  checkPerformance(line, file, lineNum) {
    // Nested loops
    if (line.match(/for\s*\([^)]*\)\s*\{[^}]*for\s*\(/)) {
      this.suggestions.push({
        file,
        line: lineNum,
        severity: 'medium',
        category: 'performance',
        message: 'Nested loops detected.',
        suggestion: 'Consider if there\'s a more efficient algorithm (O(n²) complexity).'
      });
    }

    // Synchronous file operations
    if (line.match(/fs\.\w+Sync\(/)) {
      this.suggestions.push({
        file,
        line: lineNum,
        severity: 'medium',
        category: 'performance',
        message: 'Synchronous file operation.',
        suggestion: 'Use async file operations to avoid blocking the event loop.'
      });
    }
  }

  /**
   * Generate comprehensive review
   * @param {Array} files - Changed files
   * @returns {Object} Review data
   */
  generateReview(files) {
    const criticalIssues = this.issues.filter(i => i.severity === 'critical');
    const highIssues = this.issues.filter(i => i.severity === 'high');
    const mediumIssues = this.issues.filter(i => i.severity === 'medium');
    const lowIssues = this.issues.filter(i => i.severity === 'low');

    let review = `## 🤖 Automated Code Review\n\n`;
    review += `**Files Analyzed:** ${files.length}\n`;
    review += `**Review Date:** ${new Date().toLocaleString()}\n\n`;
    review += `---\n\n`;

    // Summary
    const totalIssues = this.issues.length;
    const totalSuggestions = this.suggestions.length;

    if (totalIssues === 0 && totalSuggestions === 0) {
      review += `### ✅ No Issues Found\n\n`;
      review += `Great job! The automated analysis didn't find any obvious issues.\n\n`;
      review += `**Note:** This is an automated review focusing on common patterns. `;
      review += `Human review is still recommended for logic, architecture, and business requirements.\n\n`;
    } else {
      review += `### 📊 Summary\n\n`;
      review += `- **Issues Found:** ${totalIssues}\n`;
      review += `- **Suggestions:** ${totalSuggestions}\n\n`;

      if (criticalIssues.length > 0) {
        review += `### 🚨 Critical Issues (${criticalIssues.length})\n\n`;
        criticalIssues.forEach(issue => {
          review += `**${issue.file}:${issue.line}** - ${issue.message}\n`;
          review += `> 💡 ${issue.suggestion}\n\n`;
        });
      }

      if (highIssues.length > 0) {
        review += `### ⚠️ High Priority Issues (${highIssues.length})\n\n`;
        highIssues.forEach(issue => {
          review += `**${issue.file}:${issue.line}** - ${issue.message}\n`;
          review += `> 💡 ${issue.suggestion}\n\n`;
        });
      }

      if (mediumIssues.length > 0) {
        review += `### 📋 Medium Priority Issues (${mediumIssues.length})\n\n`;
        mediumIssues.forEach(issue => {
          review += `- **${issue.file}:${issue.line}** - ${issue.message}\n`;
        });
        review += `\n`;
      }

      if (lowIssues.length > 0) {
        review += `<details>\n<summary>📝 Low Priority Issues (${lowIssues.length})</summary>\n\n`;
        lowIssues.forEach(issue => {
          review += `- **${issue.file}:${issue.line}** - ${issue.message}\n`;
        });
        review += `\n</details>\n\n`;
      }

      if (this.suggestions.length > 0) {
        review += `<details>\n<summary>💡 Suggestions (${this.suggestions.length})</summary>\n\n`;
        this.suggestions.forEach(suggestion => {
          review += `- **${suggestion.file}:${suggestion.line}** - ${suggestion.message}\n`;
        });
        review += `\n</details>\n\n`;
      }
    }

    review += `---\n\n`;
    review += `### ✅ Review Checklist\n\n`;
    review += `Please ensure:\n`;
    review += `- [ ] Code follows project style guidelines\n`;
    review += `- [ ] Tests are included and passing\n`;
    review += `- [ ] Documentation is updated\n`;
    review += `- [ ] No sensitive data is exposed\n`;
    review += `- [ ] Performance impact is acceptable\n`;
    review += `- [ ] All review comments are addressed\n\n`;
    review += `---\n\n`;
    review += `*This automated review was generated by the Code Review Assistant.*\n`;
    review += `*It checks for common issues, security vulnerabilities, and best practices.*\n`;

    return {
      review,
      issues: this.issues,
      suggestions: this.suggestions,
      summary: {
        total: totalIssues + totalSuggestions,
        critical: criticalIssues.length,
        high: highIssues.length,
        medium: mediumIssues.length,
        low: lowIssues.length
      }
    };
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const diffFile = process.argv[2];
  
  if (!diffFile) {
    console.error('Usage: node automated-reviewer.js <diff-file>');
    process.exit(1);
  }

  const diff = fs.readFileSync(diffFile, 'utf8');
  const reviewer = new AutomatedReviewer();
  const result = reviewer.analyzeDiff(diff);
  
  console.log(result.review);
  
  // Write to file if output specified
  if (process.argv[3]) {
    fs.writeFileSync(process.argv[3], result.review);
  }
}

export default AutomatedReviewer;

// Made with Bob
