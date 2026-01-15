---
name: update-skills
description: Update shared-agent-skills package across all local repos and remote claude-harness. Use after publishing new skills.
---

# Update Skills

Batch update the shared-agent-skills package across all repositories.

## Overview

After publishing a new version of shared-agent-skills, use this skill to propagate updates to:
- All local repos in ~/repos/personal/
- Remote claude-harness container workspace

## Usage

```
/update-skills
```

## What It Does

1. Updates shared-agent-skills npm package in all local repos
2. Re-links skills to pick up new/changed skill files
3. SSHs to claude-harness and updates there too

## Implementation

### Step 1: Update Local Repos

Run these commands to update all local repositories:

```bash
# Repos with npm (have package.json with shared-agent-skills)
for repo in pokedex shua-ledger; do
  echo "=== Updating $repo ==="
  cd ~/repos/personal/homelab/$repo
  npm update shared-agent-skills --registry https://gitea.server.unarmedpuppy.com/api/packages/unarmedpuppy/npm/
  npx link-skills --verbose
done

# Repos with symlinks (no npm, direct symlink to shared-agent-skills)
for repo in bird homelab-ai; do
  echo "=== Updating symlinks in $repo ==="
  cd ~/repos/personal/homelab/$repo
  # Symlinks point to ../shared-agent-skills/skills/*, so just pull shared-agent-skills
done

# Update the shared-agent-skills source
cd ~/repos/personal/shared-agent-skills
git pull origin main
```

### Step 2: Update Remote Claude-Harness

SSH to the claude-harness container and trigger skill update:

```bash
# Option A: Restart container (triggers entrypoint.sh which updates skills)
ssh server 'cd ~/server/apps/claude-harness && docker compose restart claude-harness'

# Option B: Update in-place without restart
ssh server 'docker exec claude-harness bash -c "
  npm install -g shared-agent-skills@latest \
    --registry https://gitea.server.unarmedpuppy.com/api/packages/unarmedpuppy/npm/
  cd /workspace
  for repo in */; do
    [ -d \"\$repo/.claude\" ] && (cd \"\$repo\" && link-skills --verbose 2>/dev/null) || true
  done
"'
```

### Step 3: Verify Updates

Check that skills are linked correctly:

```bash
# Local
ls -la ~/repos/personal/homelab/bird/.claude/skills/

# Remote
ssh server 'docker exec claude-harness ls -la /workspace/bird/.claude/skills/'
```

## Full Update Script

For convenience, here's a complete script:

```bash
#!/bin/bash
set -e

echo "=== Updating shared-agent-skills ==="

# Pull latest shared-agent-skills source
cd ~/repos/personal/shared-agent-skills
git pull origin main

# Update npm-based repos
for repo in ~/repos/personal/homelab/{pokedex,shua-ledger}; do
  if [ -f "$repo/package.json" ] && grep -q "shared-agent-skills" "$repo/package.json" 2>/dev/null; then
    echo "Updating $(basename $repo)..."
    (cd "$repo" && npm update shared-agent-skills && npx link-skills) || true
  fi
done

# Symlink-based repos auto-update when shared-agent-skills is pulled

# Update remote claude-harness
echo "Updating claude-harness..."
ssh server 'cd ~/server/apps/claude-harness && docker compose restart claude-harness'

echo "=== Done ==="
```

## When to Use

Run `/update-skills` after:
- Publishing a new version of shared-agent-skills
- Adding a new skill
- Modifying an existing skill
- Setting up a new development environment

## Notes

- Claude-harness auto-updates on container restart via `entrypoint.sh`
- Local symlink-based repos update automatically when shared-agent-skills is pulled
- npm-based repos need explicit `npm update` to get new versions
