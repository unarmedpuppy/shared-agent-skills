---
name: beads-task-management
description: Manage tasks with Beads distributed issue tracker. Use when creating, updating, or querying tasks in any repository with .beads/ directory.
---

# Beads Task Management

Manage tasks using the Beads distributed issue tracker.

## Overview

Beads is a git-backed issue tracker that stores tasks in `.beads/issues.jsonl`. Tasks sync automatically via git pull/push.

## Quick Reference

```bash
# Find work
bd ready                 # Unblocked tasks
bd list                  # All tasks
bd blocked               # Show blocked tasks

# Create tasks
bd create "Title" -p 1 -t task -d "Description"
# Types: task, bug, feature, epic, chore
# Priority: 0 (critical), 1 (high), 2 (medium), 3 (low)

# Update tasks
bd update <id> --status in_progress
bd close <id> --reason "Completed"

# Dependencies
bd dep add <blocked> <blocker> --type blocks
bd dep tree <id>
```

## Session Workflow

### Start of Session

```bash
git pull origin main
bd ready                        # Find unblocked work
bd list --status in_progress    # Check in-progress
```

### Claim a Task

```bash
bd update <id> --status in_progress
git add .beads/ && git commit -m "claim: <id>" && git push
```

### Complete a Task

```bash
bd close <id> --reason "Implemented in commit abc123"
git add .beads/ && git commit -m "close: <id>" && git push
```

## Task States

| State | Meaning |
|-------|---------|
| `open` | Ready to work |
| `in_progress` | Currently being worked on |
| `closed` | Completed |
| `blocked` | Has unresolved dependencies |

## Labels

Use labels to categorize tasks:

```bash
bd create "Task" -l "backend,urgent"
bd list --label backend
```

## Troubleshooting

### "bd: command not found"

Install Beads:
```bash
curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash
```

### Sync conflicts

```bash
git pull --rebase
bd sync
git push
```

## Resources

- [Beads GitHub](https://github.com/steveyegge/beads)
- [Full CLI Reference](https://github.com/steveyegge/beads/blob/main/docs/cli.md)
