#!/usr/bin/env node

/**
 * link-skills.js
 * 
 * Creates symlinks from consuming repo's .claude/skills/ to shared skills in node_modules.
 * Also supports agents/skills/ directory pattern.
 * 
 * Usage:
 *   npx link-skills              # Create/update all symlinks
 *   npx link-skills --check      # Verify symlinks are correct (exit 1 if not)
 *   npx link-skills --clean      # Remove all managed symlinks
 *   npx link-skills --list       # List available skills
 *   npx link-skills --target agents/skills  # Custom target directory
 */

const fs = require('fs');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2);
const flags = {
  check: args.includes('--check'),
  clean: args.includes('--clean'),
  list: args.includes('--list'),
  verbose: args.includes('--verbose') || args.includes('-v'),
  help: args.includes('--help') || args.includes('-h'),
};

// Get target directory from args or default
const targetArgIndex = args.indexOf('--target');
const targetDir = targetArgIndex !== -1 ? args[targetArgIndex + 1] : '.claude/skills';

// Find package root (where node_modules lives)
function findPackageRoot(startDir) {
  let dir = startDir;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

// Find skills directory in node_modules
function findSkillsPackage(packageRoot) {
  const possiblePaths = [
    path.join(packageRoot, 'node_modules', '@jenquist', 'shared-agent-skills', 'skills'),
    path.join(packageRoot, 'node_modules', 'shared-agent-skills', 'skills'),
  ];
  
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

// Get list of skills
function getSkills(skillsDir) {
  if (!fs.existsSync(skillsDir)) {
    return [];
  }
  return fs.readdirSync(skillsDir).filter(name => {
    const skillPath = path.join(skillsDir, name, 'SKILL.md');
    return fs.existsSync(skillPath);
  });
}

// Create symlink (cross-platform)
function createSymlink(target, linkPath) {
  // Remove existing link/file if exists
  if (fs.existsSync(linkPath) || fs.lstatSync(linkPath).isSymbolicLink()) {
    fs.unlinkSync(linkPath);
  }
  
  // Create relative symlink
  const relativeTarget = path.relative(path.dirname(linkPath), target);
  fs.symlinkSync(relativeTarget, linkPath);
}

// Check if symlink is valid
function isValidSymlink(linkPath, expectedTarget) {
  try {
    if (!fs.lstatSync(linkPath).isSymbolicLink()) {
      return false;
    }
    const actualTarget = fs.readlinkSync(linkPath);
    const resolvedActual = path.resolve(path.dirname(linkPath), actualTarget);
    const resolvedExpected = path.resolve(expectedTarget);
    return resolvedActual === resolvedExpected;
  } catch {
    return false;
  }
}

// Main
function main() {
  if (flags.help) {
    console.log(`
link-skills - Symlink shared agent skills into your project

Usage:
  npx link-skills              Create/update all symlinks
  npx link-skills --check      Verify symlinks are correct
  npx link-skills --clean      Remove all managed symlinks
  npx link-skills --list       List available skills
  npx link-skills --target DIR Target directory (default: .claude/skills)

Options:
  --verbose, -v    Show detailed output
  --help, -h       Show this help
`);
    process.exit(0);
  }

  const cwd = process.cwd();
  const packageRoot = findPackageRoot(cwd);
  
  if (!packageRoot) {
    console.error('Error: Could not find package.json. Run from within a Node.js project.');
    process.exit(1);
  }

  const skillsPackagePath = findSkillsPackage(packageRoot);
  
  if (!skillsPackagePath) {
    console.error('Error: @jenquist/shared-agent-skills not found in node_modules.');
    console.error('Run: npm install @jenquist/shared-agent-skills');
    process.exit(1);
  }

  const skills = getSkills(skillsPackagePath);
  
  if (flags.list) {
    console.log('Available skills:');
    skills.forEach(s => console.log(`  - ${s}`));
    console.log(`\nTotal: ${skills.length} skills`);
    process.exit(0);
  }

  const targetPath = path.join(packageRoot, targetDir);
  
  if (flags.clean) {
    console.log(`Cleaning symlinks from ${targetDir}/...`);
    if (fs.existsSync(targetPath)) {
      skills.forEach(skill => {
        const linkPath = path.join(targetPath, `${skill}.md`);
        if (fs.existsSync(linkPath)) {
          fs.unlinkSync(linkPath);
          if (flags.verbose) console.log(`  Removed: ${skill}.md`);
        }
      });
    }
    console.log('Done.');
    process.exit(0);
  }

  // Ensure target directory exists
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
    if (flags.verbose) console.log(`Created directory: ${targetDir}/`);
  }

  let hasErrors = false;
  const results = { created: 0, updated: 0, valid: 0, errors: 0 };

  skills.forEach(skill => {
    const skillMdPath = path.join(skillsPackagePath, skill, 'SKILL.md');
    const linkPath = path.join(targetPath, `${skill}.md`);
    
    if (flags.check) {
      if (isValidSymlink(linkPath, skillMdPath)) {
        results.valid++;
        if (flags.verbose) console.log(`  OK: ${skill}.md`);
      } else {
        results.errors++;
        console.error(`  MISMATCH: ${skill}.md`);
        hasErrors = true;
      }
    } else {
      try {
        const existed = fs.existsSync(linkPath);
        
        // Remove existing if it's a file or broken symlink
        try {
          const stat = fs.lstatSync(linkPath);
          if (stat.isSymbolicLink() || stat.isFile()) {
            fs.unlinkSync(linkPath);
          }
        } catch {
          // Doesn't exist, that's fine
        }
        
        // Create relative symlink
        const relativeTarget = path.relative(targetPath, skillMdPath);
        fs.symlinkSync(relativeTarget, linkPath);
        
        if (existed) {
          results.updated++;
          if (flags.verbose) console.log(`  Updated: ${skill}.md`);
        } else {
          results.created++;
          if (flags.verbose) console.log(`  Created: ${skill}.md`);
        }
      } catch (err) {
        results.errors++;
        console.error(`  Error linking ${skill}: ${err.message}`);
        hasErrors = true;
      }
    }
  });

  // Summary
  if (flags.check) {
    console.log(`\nSymlink check: ${results.valid} valid, ${results.errors} errors`);
    process.exit(hasErrors ? 1 : 0);
  } else {
    console.log(`\nLinked ${skills.length} skills to ${targetDir}/`);
    if (results.created) console.log(`  Created: ${results.created}`);
    if (results.updated) console.log(`  Updated: ${results.updated}`);
    if (results.errors) console.log(`  Errors: ${results.errors}`);
    process.exit(hasErrors ? 1 : 0);
  }
}

main();
