# Shared Agent Skills

npm package containing reusable agent skills for cross-repository use.

**Git**: `git@github.com:unarmedpuppy/shared-agent-skills.git`  
**Mirror**: `ssh://git@192.168.86.47:2223/unarmedpuppy/shared-agent-skills.git` (Gitea, auto-syncs every 8h)  
**Registry**: `gitea.server.unarmedpuppy.com`

## Installing This Package

See [home-server/agents/reference/shared-skills.md](../home-server/agents/reference/shared-skills.md)

## Commands

```bash
# Setup (no dependencies required)
npm install

# Validate all skills have correct format
npm run validate

# List skills and create symlinks (for testing)
npm run link

# Publish to Gitea registry
npm version patch && npm run publish:gitea
```

## Directory Structure

```
shared-agent-skills/
├── skills/                  # The skills (this is the content)
│   ├── plan-creator/
│   ├── http-api-requests/
│   ├── terminal-ui-design/
│   ├── skill-creator/
│   ├── setup-gitea-workflow/
│   └── beads-task-management/
├── bin/                     # CLI tools
│   ├── link-skills.js       # Creates symlinks in consuming repos
│   └── install-hooks.js     # Installs git hooks
├── hooks/
│   └── post-merge           # Auto-update hook template
├── package.json
└── index.js
```

## Adding a New Skill

### 1. Create skill directory

```bash
mkdir -p skills/my-skill
```

### 2. Create SKILL.md

```yaml
---
name: my-skill
description: What this does. Use when [trigger condition].
---

# My Skill

Instructions...
```

### 3. Test locally

```bash
npx link-skills --list
```

### 4. Commit and push

```bash
git add skills/my-skill
git commit -m "feat: add my-skill"
git push
```

Consumers using git install get updates automatically on `npm update`.

### 5. Optionally publish to registry

```bash
npm version patch
npm run publish:gitea
```

## Publishing to Gitea Registry

```bash
# One-time setup: Add auth token to ~/.npmrc
# Create token at: https://gitea.server.unarmedpuppy.com/user/settings/applications
# Select "package:write" scope
echo "//gitea.server.unarmedpuppy.com/api/packages/unarmedpuppy/npm/:_authToken=YOUR_TOKEN" >> ~/.npmrc

# Publish
npm run publish:gitea
```

## Skill Format

Skills follow the Anthropic Skills Specification:

- **SKILL.md** required with YAML frontmatter
- **name**: hyphen-case, matches directory name
- **description**: includes "Use when..." trigger
- Keep under 500 lines
- Optional: `scripts/`, `templates/`, `assets/`

## Boundaries

### Allowed (do freely)
- Create new skills in `skills/` directory
- Edit existing skill content (SKILL.md, scripts, templates)
- Add supporting files to skills (scripts/, templates/, assets/)
- Run `npm run validate` and `npm run link`

### Ask First
- Modify `bin/` scripts (affects all consumers)
- Change package.json (version, dependencies, scripts)
- Modify `hooks/` (affects consuming repos)
- Delete or rename existing skills

### Always Do
- Use YAML frontmatter with `name` and `description`
- Include "Use when..." in description
- Run `npm run validate` after skill changes
- Bump version before publishing to registry

### Never Do
- Commit node_modules
- Use README.md in skill directories (use SKILL.md)
- Publish without testing `npx link-skills --list`
- Create skills over 500 lines (split into multiple skills)

## Definition of Done

A skill is complete when:
- [ ] SKILL.md has valid YAML frontmatter (`name`, `description`)
- [ ] Description includes "Use when..." trigger condition
- [ ] `npm run validate` passes
- [ ] Tested with `npm run link` in a consuming repo (if applicable)

## Anti-Goals

Do not touch:
- `index.js` - Simple exports, rarely needs changes
- `agents/plans/` - Planning docs, delete when done
- Other repos' `.agent-skills/` symlinks - Managed by consuming repos
