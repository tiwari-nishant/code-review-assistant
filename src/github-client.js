import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

class GitHubClient {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    this.owner = process.env.GITHUB_OWNER;
    this.repo = process.env.GITHUB_REPO;
  }

  /**
   * Get pull request details
   * @param {number} prNumber - Pull request number
   * @returns {Promise<Object>} Pull request data
   */
  async getPullRequest(prNumber) {
    try {
      const { data } = await this.octokit.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber
      });
      return data;
    } catch (error) {
      console.error(`Error fetching PR #${prNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Get files changed in a pull request
   * @param {number} prNumber - Pull request number
   * @returns {Promise<Array>} List of changed files
   */
  async getPullRequestFiles(prNumber) {
    try {
      const { data } = await this.octokit.pulls.listFiles({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        per_page: 100
      });
      return data;
    } catch (error) {
      console.error(`Error fetching PR files for #${prNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Get the diff for a pull request
   * @param {number} prNumber - Pull request number
   * @returns {Promise<string>} Diff content
   */
  async getPullRequestDiff(prNumber) {
    try {
      const { data } = await this.octokit.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        mediaType: {
          format: 'diff'
        }
      });
      return data;
    } catch (error) {
      console.error(`Error fetching PR diff for #${prNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Post a review comment on a pull request
   * @param {number} prNumber - Pull request number
   * @param {string} body - Comment body
   * @param {string} event - Review event type (COMMENT, APPROVE, REQUEST_CHANGES)
   * @param {Array} comments - Line-specific comments
   * @returns {Promise<Object>} Review data
   */
  async createReview(prNumber, body, event = 'COMMENT', comments = []) {
    try {
      const { data } = await this.octokit.pulls.createReview({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        body,
        event,
        comments
      });
      return data;
    } catch (error) {
      console.error(`Error creating review for PR #${prNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Post a general comment on a pull request
   * @param {number} prNumber - Pull request number
   * @param {string} body - Comment body
   * @returns {Promise<Object>} Comment data
   */
  async createComment(prNumber, body) {
    try {
      const { data } = await this.octokit.issues.createComment({
        owner: this.owner,
        repo: this.repo,
        issue_number: prNumber,
        body
      });
      return data;
    } catch (error) {
      console.error(`Error creating comment for PR #${prNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Get file content from repository
   * @param {string} path - File path
   * @param {string} ref - Git reference (branch, commit, tag)
   * @returns {Promise<string>} File content
   */
  async getFileContent(path, ref) {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref
      });
      
      if (data.content) {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      return null;
    } catch (error) {
      console.error(`Error fetching file content for ${path}:`, error.message);
      return null;
    }
  }

  /**
   * List open pull requests
   * @returns {Promise<Array>} List of open PRs
   */
  async listOpenPullRequests() {
    try {
      const { data } = await this.octokit.pulls.list({
        owner: this.owner,
        repo: this.repo,
        state: 'open',
        per_page: 30
      });
      return data;
    } catch (error) {
      console.error('Error listing open PRs:', error.message);
      throw error;
    }
  }
}

export default GitHubClient;

// Made with Bob
