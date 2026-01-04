# Shared Agent Skills

Shared AI agent skills for cross-repository use.

## Overview

This repository contains reusable agent skills that can be consumed by any project via npm. Skills are symlinked into consuming repos for Claude auto-discovery.

**Package**: `shared-agent-skills`  
**Registry**: Gitea (`gitea.server.unarmedpuppy.com`)  
**Git**: `ssh://git@192.168.86.47:2223/unarmedpuppy/shared-agent-skills.git`

## Directory Structure

```
shared-agent-skills/
├── skills/                  # Shared skills
│   ├── plan-creator/
│   ├── http-api-requests/
│   ├── terminal-ui-design/
│   ├── skill-creator/
│   ├── setup-gitea-workflow/
│   └── beads-task-management/
├── bin/                     # CLI tools
│   ├── link-skills.js
│   └── install-hooks.js
├── hooks/                   # Git hook templates
├── agents/
│   ├── reference/
│   │   └── installation.md  # How to install in other repos
│   └── plans/
└── package.json
```

## Available Skills

| Skill | Description |
|-------|-------------|
| `plan-creator` | Create implementation plans with interactive wizard, validation, and export |
| `http-api-requests` | curl-based HTTP request patterns for APIs |
| `terminal-ui-design` | TUI design guidelines and best practices |
| `skill-creator` | Create new agent skills following standard format |
| `setup-gitea-workflow` | Set up Gitea Actions CI/CD for Docker builds |
| `beads-task-management` | Manage tasks with Beads distributed issue tracker |

## Quick Reference

### Install in another repo

See [agents/reference/installation.md](agents/reference/installation.md)

```bash
npm init -y
npm install git+ssh://git@192.168.86.47:2223/unarmedpuppy/shared-agent-skills.git
npx link-skills
```

### Add a new skill

```bash
mkdir -p skills/my-skill
# Create skills/my-skill/SKILL.md with YAML frontmatter
npm version patch
git push
```

### Publish to Gitea registry

```bash
npm run publish:gitea
```

## Skill Format

Skills follow the Anthropic Skills Specification:

- **SKILL.md** required with YAML frontmatter
- **name**: hyphen-case, matches directory
- **description**: includes "Use when..." trigger

```yaml
---
name: my-skill
description: What this does. Use when [trigger].
---

# My Skill

Instructions...
```

## Boundaries

### Always Do
- Use YAML frontmatter with `name` and `description`
- Keep SKILL.md under 500 lines
- Bump version before publishing

### Never Do
- Commit node_modules
- Use README.md in skill directories (use SKILL.md)
