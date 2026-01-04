# Shared Agent Skills

Shared AI agent skills for cross-repository use. Published via Gitea package registry.

## Overview

This repository contains reusable agent skills that can be consumed by any project via npm. Skills are symlinked into consuming repos for Claude auto-discovery.

**Package**: `shared-agent-skills`  
**Registry**: Gitea (`gitea.server.unarmedpuppy.com`)  
**Git**: `ssh://git@192.168.86.47:2223/unarmedpuppy/shared-agent-skills.git`

## Installing in a Repo

### Quick Setup

```bash
# If no package.json exists
npm init -y

# Install from git (recommended - no auth needed)
npm install git+ssh://git@192.168.86.47:2223/unarmedpuppy/shared-agent-skills.git

# Create .claude/skills/ symlinks
npx link-skills

# Add to .gitignore
echo -e "\nnode_modules/\npackage-lock.json" >> .gitignore

# Commit
git add .gitignore package.json .claude/
git commit -m "feat: add shared-agent-skills"
```

### What Gets Created

```
your-repo/
├── package.json              # tracks dependency
├── node_modules/             # gitignored
│   └── @jenquist/shared-agent-skills/
└── .claude/skills/           # committed (symlinks)
    ├── plan-creator.md → ../../node_modules/.../SKILL.md
    ├── http-api-requests.md
    ├── terminal-ui-design.md
    ├── skill-creator.md
    ├── setup-gitea-workflow.md
    └── beads-task-management.md
```

### Updating Skills

```bash
npm update
npx link-skills  # recreate symlinks if new skills added
```

### After Cloning (on another machine)

```bash
npm install      # restores node_modules
npx link-skills  # recreates symlinks
```

## Alternative: Install from Gitea Registry

```bash
# Add auth token to ~/.npmrc (create token at Gitea → Settings → Applications)
echo "//gitea.server.unarmedpuppy.com/api/packages/unarmedpuppy/npm/:_authToken=YOUR_TOKEN" >> ~/.npmrc

# Install from registry
npm install shared-agent-skills --registry https://gitea.server.unarmedpuppy.com/api/packages/unarmedpuppy/npm/
```

## Directory Structure

```
shared-agent-skills/
├── skills/                  # Shared skills
│   ├── plan-creator/
│   │   ├── SKILL.md
│   │   ├── scripts/
│   │   └── templates/
│   ├── http-api-requests/
│   │   └── SKILL.md
│   ├── terminal-ui-design/
│   │   └── SKILL.md
│   ├── skill-creator/
│   │   └── SKILL.md
│   ├── setup-gitea-workflow/
│   │   └── SKILL.md
│   └── beads-task-management/
│       └── SKILL.md
├── bin/                     # CLI tools
│   ├── link-skills.js       # Symlink generator
│   └── install-hooks.js     # Git hook installer
├── hooks/                   # Git hook templates
│   └── post-merge           # Auto-update on pull
├── package.json
├── index.js                 # Programmatic API
└── AGENTS.md                # This file
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `npx link-skills` | Create symlinks to skills |
| `npx link-skills --check` | Verify symlinks are correct |
| `npx link-skills --clean` | Remove managed symlinks |
| `npx link-skills --list` | List available skills |
| `npx link-skills --target DIR` | Custom target directory |
| `npx install-skill-hooks` | Install post-merge hook |

## How It Works

### How `npx link-skills` works

1. **bin field in package.json** tells npm to expose the command:
   ```json
   "bin": { "link-skills": "./bin/link-skills.js" }
   ```

2. **npm creates a symlink** in `node_modules/.bin/`:
   ```
   node_modules/.bin/link-skills → ../shared-agent-skills/bin/link-skills.js
   ```

3. **The script**:
   - Finds skills in `node_modules/.../skills/`
   - Creates `.claude/skills/` directory
   - Creates relative symlinks: `.claude/skills/plan-creator.md → ../../node_modules/.../SKILL.md`

4. **Relative symlinks** work on any machine - when someone clones and runs `npm install`, symlinks still resolve.

## Available Skills

| Skill | Description |
|-------|-------------|
| `plan-creator` | Create implementation plans with interactive wizard, validation, and export |
| `http-api-requests` | curl-based HTTP request patterns for APIs |
| `terminal-ui-design` | TUI design guidelines and best practices |
| `skill-creator` | Create new agent skills following standard format |
| `setup-gitea-workflow` | Set up Gitea Actions CI/CD for Docker builds |
| `beads-task-management` | Manage tasks with Beads distributed issue tracker |

## Adding New Skills

### 1. Create Skill Directory

```bash
mkdir -p skills/my-new-skill
```

### 2. Create SKILL.md

```yaml
---
name: my-new-skill
description: What this skill does. Use when [trigger condition].
---

# My New Skill

Instructions here...
```

### 3. Test Locally

```bash
npm run link -- --verbose
npx link-skills --list
```

### 4. Publish

```bash
# Bump version
npm version patch  # or minor/major

# Push to git (consumers using git install get updates automatically)
git push

# Optionally publish to Gitea registry
npm run publish:gitea
```

## Skill Format

Skills follow the [Anthropic Skills Specification](https://github.com/anthropics/skills):

- **SKILL.md** is required (YAML frontmatter + markdown)
- **name**: hyphen-case, max 64 characters, matches directory
- **description**: Must include "Use when..." trigger
- Optional: `scripts/`, `references/`, `assets/`

## Boundaries

### Always Do

- Use YAML frontmatter with `name` and `description`
- Include "Use when..." in description
- Use imperative form in instructions
- Keep SKILL.md under 500 lines

### Never Do

- Create README.md in skill directories (use SKILL.md)
- Use camelCase or snake_case in skill names
- Commit node_modules
- Publish without version bump

## Troubleshooting

### "Package not found" after git install

Ensure SSH key is configured for Gitea access:
```bash
ssh -T git@192.168.86.47 -p 2223
```

### "Symlinks broken after npm install"

Re-run link-skills:
```bash
npx link-skills
```

### "Command not found: link-skills"

Ensure package is installed:
```bash
npm install
npx link-skills
```

### "Symlinks not working on Windows"

Enable Developer Mode or run as Administrator.

## Publishing to Gitea Registry

```bash
# One-time: Add auth token to ~/.npmrc
# Create token at: https://gitea.server.unarmedpuppy.com/user/settings/applications
# Select "package:write" scope
echo "//gitea.server.unarmedpuppy.com/api/packages/unarmedpuppy/npm/:_authToken=YOUR_TOKEN" >> ~/.npmrc

# Publish
npm run publish:gitea
```
