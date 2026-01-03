#!/usr/bin/env node

/**
 * install-hooks.js
 * 
 * Installs git hooks for automatic skill updates on git pull.
 * 
 * Usage:
 *   npx install-skill-hooks
 */

const fs = require('fs');
const path = require('path');

function findGitRoot(startDir) {
  let dir = startDir;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, '.git'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

function main() {
  const cwd = process.cwd();
  const gitRoot = findGitRoot(cwd);
  
  if (!gitRoot) {
    console.error('Error: Not in a git repository');
    process.exit(1);
  }

  const hooksDir = path.join(gitRoot, '.git', 'hooks');
  const postMergeTarget = path.join(hooksDir, 'post-merge');
  
  // Find our hook template
  const possibleSources = [
    path.join(__dirname, '..', 'hooks', 'post-merge'),
    path.join(cwd, 'node_modules', '@jenquist', 'shared-agent-skills', 'hooks', 'post-merge'),
  ];
  
  let hookSource = null;
  for (const src of possibleSources) {
    if (fs.existsSync(src)) {
      hookSource = src;
      break;
    }
  }
  
  if (!hookSource) {
    console.error('Error: Could not find post-merge hook template');
    process.exit(1);
  }

  // Check for existing hook
  if (fs.existsSync(postMergeTarget)) {
    const existing = fs.readFileSync(postMergeTarget, 'utf8');
    if (existing.includes('shared-agent-skills')) {
      console.log('Hook already installed.');
      process.exit(0);
    }
    
    // Backup existing hook
    const backup = postMergeTarget + '.backup';
    fs.copyFileSync(postMergeTarget, backup);
    console.log(`Backed up existing hook to: ${backup}`);
    
    // Append our hook content
    const ourHook = fs.readFileSync(hookSource, 'utf8');
    const combined = existing + '\n\n# --- Added by @jenquist/shared-agent-skills ---\n' + ourHook;
    fs.writeFileSync(postMergeTarget, combined);
    fs.chmodSync(postMergeTarget, '755');
    console.log('Appended skill update to existing post-merge hook.');
  } else {
    // Copy our hook
    fs.copyFileSync(hookSource, postMergeTarget);
    fs.chmodSync(postMergeTarget, '755');
    console.log('Installed post-merge hook.');
  }
  
  console.log('\nSkills will now auto-update on `git pull`.');
}

main();
