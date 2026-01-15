# Shared Agent Skills

Reusable AI agent skills for Claude Code, Cursor, Copilot, and other LLM-powered coding assistants.

## What is this?

This package provides **skills** - structured markdown instructions that teach AI agents how to perform specific tasks consistently across your projects. Instead of re-explaining workflows in every conversation, install this package and your agent automatically knows how to:

- Create implementation plans
- Make HTTP API requests
- Design terminal UIs
- Set up CI/CD workflows
- Manage distributed tasks
- Generate AI blog digests
- Update skills across all repos

## Installation

### Option 1: npm Package (Recommended)

```bash
# Install from Gitea registry
npm install shared-agent-skills \
  --registry https://gitea.server.unarmedpuppy.com/api/packages/unarmedpuppy/npm/

# Link skills to your project's .claude/skills/
npx link-skills
```

### Option 2: Direct Symlinks (Non-npm projects)

For Python or other non-npm projects, create symlinks directly:

```bash
mkdir -p .claude/skills
ln -s /path/to/shared-agent-skills/skills/generate-digest/SKILL.md .claude/skills/generate-digest.md
```

### Option 3: Claude-Harness (Automatic)

If using the claude-harness container, skills are installed automatically on startup via `entrypoint.sh`. The container:

1. Installs `shared-agent-skills@latest` globally
2. Links skills to all workspace repos with `.claude/` or `CLAUDE.md`
3. Updates on every container restart

## Available Skills

| Skill | Command | Description |
|-------|---------|-------------|
| **plan-creator** | `/plan` | Create implementation plans for features, bugs, refactoring |
| **http-api-requests** | - | Make HTTP requests using curl |
| **terminal-ui-design** | - | Design production-grade terminal UIs |
| **setup-gitea-workflow** | `/setup-gitea-workflow` | Add CI/CD for Docker builds |
| **beads-task-management** | - | Manage tasks with Beads distributed tracker |
| **skill-creator** | `/skill-creator` | Create new skills following the standard format |
| **generate-digest** | `/generate-digest` | Generate AI blog digests from Bird bookmarks |
| **update-skills** | `/update-skills` | Update skills across all repos and claude-harness |

## Updating Skills

After publishing a new version:

### Local Development

```bash
# Update npm-based repos
cd your-repo
npm update shared-agent-skills
npx link-skills

# Symlink-based repos update automatically when you pull shared-agent-skills
cd ~/repos/personal/shared-agent-skills
git pull
```

### Claude-Harness

```bash
# Option A: Restart container (recommended)
ssh server 'cd ~/server/apps/claude-harness && docker compose restart claude-harness'

# Option B: Update in-place
ssh server 'docker exec claude-harness npm install -g shared-agent-skills@latest \
  --registry https://gitea.server.unarmedpuppy.com/api/packages/unarmedpuppy/npm/'
```

### All Repos at Once

Use the `/update-skills` skill which provides a complete update script.

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
npx link-skills          # Create symlinks in .claude/skills/
npx link-skills --list   # List available skills
npx link-skills --check  # Verify symlinks are correct
npx link-skills --clean  # Remove symlinks
npm run validate         # Check all skills have valid format
```

## Claude-Harness Integration

The `claude-harness` container (homelab-ai) automatically integrates shared-agent-skills:

```bash
# In entrypoint.sh
setup_shared_skills() {
    # Install globally
    npm install -g shared-agent-skills@latest \
        --registry https://gitea.server.unarmedpuppy.com/api/packages/unarmedpuppy/npm/

    # Link to all workspace repos
    for repo in /workspace/*/; do
        if [ -d "$repo/.claude" ] || [ -f "$repo/CLAUDE.md" ]; then
            (cd "$repo" && link-skills --verbose)
        fi
    done
}
```

This runs on every container startup, ensuring skills stay current.

## Project Structure

```
shared-agent-skills/
├── skills/              # The skills
│   ├── plan-creator/
│   ├── generate-digest/
│   ├── update-skills/
│   ├── http-api-requests/
│   ├── terminal-ui-design/
│   └── ...
├── bin/                 # CLI tools
│   ├── link-skills.js
│   └── install-hooks.js
├── hooks/               # Git hooks
│   └── post-merge
└── package.json
```

## Publishing New Versions

```bash
# Bump version
npm version minor  # or patch/major

# Publish to Gitea
npm run publish:gitea

# Tag release
git tag -a v0.x.0 -m "Description"
git push --tags

# Update everywhere
/update-skills
```

## License

MIT
