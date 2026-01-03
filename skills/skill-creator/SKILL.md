---
name: skill-creator
description: Create new agent skills following the standard format. Use when adding reusable workflows to any repository.
---

# Skill Creator

Create new agent skills following the Anthropic Skills Specification.

## Quick Start

Create a new skill:

```bash
mkdir -p agents/skills/my-skill
cat > agents/skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: Brief description. Use when [trigger condition].
---

# My Skill

Instructions here...
EOF
```

## Skill Structure

```
skill-name/
├── SKILL.md          # Required: YAML frontmatter + instructions
├── scripts/          # Optional: automation scripts
├── references/       # Optional: detailed documentation
└── assets/           # Optional: templates, configs
```

## YAML Frontmatter

Required fields:

```yaml
---
name: skill-name           # hyphen-case, max 64 chars
description: What it does. Use when [condition].
---
```

Optional fields:

```yaml
---
name: skill-name
description: Description with when to use.
script: scripts/run.sh     # Associated script
allowed-tools: [bash, read] # Pre-approved tools
---
```

## Best Practices

1. **Name**: Use hyphen-case, match directory name
2. **Description**: Include "Use when..." trigger
3. **Instructions**: Use imperative form ("Run X", not "Runs X")
4. **Length**: Keep SKILL.md under 500 lines
5. **References**: Move detailed docs to `references/`

## Examples

### Minimal Skill

```yaml
---
name: hello-world
description: Print hello message. Use when testing skill setup.
---

# Hello World

Run:
```bash
echo "Hello, World!"
```
```

### Skill with Script

```yaml
---
name: deploy-app
description: Deploy application to server. Use after code changes are committed.
script: scripts/deploy.sh
---

# Deploy App

Run the deployment script:
```bash
bash scripts/deploy.sh
```
```

## Validation

Check skill follows standards:

- Name is hyphen-case
- Name matches directory
- Description includes "when to use"
- No README.md (use SKILL.md)
- Under 500 lines

## Claude Skills Integration

For Claude Code auto-discovery, create symlink:

```bash
mkdir -p .claude/skills
ln -sf ../../agents/skills/my-skill/SKILL.md .claude/skills/my-skill.md
```
