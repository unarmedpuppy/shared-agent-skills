/**
 * @jenquist/shared-agent-skills
 * 
 * Shared AI agent skills for cross-repository use.
 * 
 * Usage:
 *   npx link-skills           # Create symlinks in consuming repo
 *   npx link-skills --check   # Verify symlinks are up to date
 */

const path = require('path');
const fs = require('fs');

const SKILLS_DIR = path.join(__dirname, 'skills');

/**
 * Get list of available skills
 * @returns {string[]} Array of skill names
 */
function getSkills() {
  if (!fs.existsSync(SKILLS_DIR)) {
    return [];
  }
  return fs.readdirSync(SKILLS_DIR).filter(name => {
    const skillPath = path.join(SKILLS_DIR, name, 'SKILL.md');
    return fs.existsSync(skillPath);
  });
}

/**
 * Get path to a specific skill
 * @param {string} skillName 
 * @returns {string} Absolute path to skill directory
 */
function getSkillPath(skillName) {
  return path.join(SKILLS_DIR, skillName);
}

/**
 * Get path to skills directory
 * @returns {string} Absolute path to skills directory
 */
function getSkillsDir() {
  return SKILLS_DIR;
}

module.exports = {
  getSkills,
  getSkillPath,
  getSkillsDir
};
