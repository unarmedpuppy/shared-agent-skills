# Shared Agent Skills

Reusable AI agent skills for Claude, Cursor, Copilot, and other LLM-powered coding assistants.

## What is this?

This package provides **skills** - structured markdown instructions that teach AI agents how to perform specific tasks consistently across your projects. Instead of re-explaining workflows in every conversation, install this package and your agent automatically knows how to:

- Create implementation plans
- Make HTTP API requests  
- Design terminal UIs
- Set up CI/CD workflows
- Manage distributed tasks
- Create new skills

## Installation

```bash
# Install from GitHub
npm install git+ssh://git@github.com:unarmedpuppy/shared-agent-skills.git

# Link skills to your project
npx link-skills
```

This creates symlinks in `.agent-skills/` pointing to the installed skills.

## Available Skills

| Skill | Description |
|-------|-------------|
| **plan-creator** | Create implementation plans for features, bugs, and refactoring |
| **http-api-requests** | Make HTTP requests using curl |
| **terminal-ui-design** | Design production-grade terminal UIs |
| **setup-gitea-workflow** | Add CI/CD for Docker builds |
| **beads-task-management** | Manage tasks with Beads distributed tracker |
| **skill-creator** | Create new skills following the standard format |

## How Skills Work

Each skill is a `SKILL.md` file with:

1. **YAML frontmatter** - name, description, trigger conditions
2. **Instructions** - step-by-step guidance for the agent
3. **Examples** - code snippets, templates, patterns

When your AI agent encounters a task matching a skill's trigger (e.g., "create a plan for..."), it loads and follows the skill instructions.

## Skill Format

```markdown
---
name: my-skill
description: What this does. Use when [trigger condition].
---

# My Skill

Instructions for the agent...
```

## Creating Your Own Skills

```bash
# Create skill directory
mkdir -p skills/my-skill

# Create SKILL.md with frontmatter
cat > skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: Does X. Use when Y.
---

# My Skill

Instructions...
EOF

# Validate
npm run validate
```

## Commands

```bash
npm run link      # Create symlinks in consuming project
npm run validate  # Check all skills have valid format
```

## Project Structure

```
shared-agent-skills/
├── skills/           # The skills
│   ├── plan-creator/
│   ├── http-api-requests/
│   ├── terminal-ui-design/
│   └── ...
├── bin/              # CLI tools
│   └── link-skills.js
└── package.json
```

## License

MIT
