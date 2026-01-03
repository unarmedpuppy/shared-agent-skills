# Shared Agent Skills

Shared AI agent skills for cross-repository use. Published via Harbor npm registry.

## Overview

This repository contains reusable agent skills that can be consumed by any project via npm. Skills are automatically linked into consuming repos via git hooks.

**Package**: `@jenquist/shared-agent-skills`  
**Registry**: `harbor.server.unarmedpuppy.com/npm/`

## Quick Start

### For Consumers

```bash
# Install the package
npm install @jenquist/shared-agent-skills --registry https://harbor.server.unarmedpuppy.com/npm/

# Link skills to .claude/skills/
npx link-skills

# Install git hook for auto-updates
npx install-skill-hooks
```

After setup, skills auto-update on every `git pull`.

### For Contributors

```bash
# Clone this repo
cd ~/repos/personal/shared-agent-skills

# Add a new skill
mkdir -p skills/my-skill
# Create skills/my-skill/SKILL.md with proper frontmatter

# Publish new version
npm version patch
npm run publish:harbor
```

## Directory Structure

```
shared-agent-skills/
├── skills/                  # Shared skills
│   ├── beads-task-management/
│   │   └── SKILL.md
│   ├── skill-creator/
│   │   └── SKILL.md
│   └── ...
├── bin/                     # CLI tools
│   ├── link-skills.js       # Symlink generator
│   └── install-hooks.js     # Git hook installer
├── hooks/                   # Git hook templates
│   └── post-merge           # Auto-update on pull
├── agents/                  # Agent documentation
│   └── plans/               # Implementation plans
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
| `npx install-skill-hooks` | Install post-merge hook |

## How It Works

1. **Publishing**: Skills are packaged and published to Harbor npm registry
2. **Installation**: Consuming repos install as npm dependency
3. **Linking**: `npx link-skills` creates symlinks from `.claude/skills/` to `node_modules/`
4. **Auto-update**: Post-merge hook runs `npm update` + `link-skills` on every `git pull`

```
git pull
  └─> .git/hooks/post-merge
        ├─> npm update @jenquist/shared-agent-skills
        └─> npx link-skills
              └─> .claude/skills/*.md → node_modules/.../skills/*/SKILL.md
```

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
```

### 4. Publish

```bash
npm version patch  # or minor/major
npm run publish:harbor
```

## Skill Format

Skills follow the [Anthropic Skills Specification](https://github.com/anthropics/skills):

- **SKILL.md** is required (YAML frontmatter + markdown)
- **name**: hyphen-case, max 64 characters, matches directory
- **description**: Must include "Use when..." trigger
- Optional: `scripts/`, `references/`, `assets/`

## Available Skills

| Skill | Description |
|-------|-------------|
| `beads-task-management` | Manage tasks with Beads distributed issue tracker |
| `skill-creator` | Create new agent skills following standard format |

## Consuming Repos Setup

### Initial Setup

```bash
# Add to package.json
npm install @jenquist/shared-agent-skills --save-dev \
  --registry https://harbor.server.unarmedpuppy.com/npm/

# Link skills
npx link-skills

# Install auto-update hook
npx install-skill-hooks

# Commit
git add .
git commit -m "feat: add shared agent skills"
```

### Manual Update

```bash
npm update @jenquist/shared-agent-skills
npx link-skills
```

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

### "Package not found"

Ensure Harbor registry is configured:
```bash
npm config set @jenquist:registry https://harbor.server.unarmedpuppy.com/npm/
```

### "Symlinks not working on Windows"

Enable Developer Mode or run as Administrator.

### "Hook not running"

Check hook is executable:
```bash
chmod +x .git/hooks/post-merge
```

## Harbor Registry

**URL**: https://harbor.server.unarmedpuppy.com  
**NPM endpoint**: https://harbor.server.unarmedpuppy.com/npm/

To publish:
1. Login to Harbor
2. Create robot account with push permissions
3. `npm login --registry https://harbor.server.unarmedpuppy.com/npm/`
4. `npm publish`
