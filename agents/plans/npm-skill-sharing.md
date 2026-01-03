# Plan: NPM-Based Skill Sharing

**Status**: In Progress  
**Created**: 2024-12-31  
**Goal**: Enable cross-repository skill sharing via npm package published to Harbor registry

## Problem

Skills are duplicated across multiple repositories:
- home-server
- polymarket-bot
- trading-bot
- life-os
- etc.

Changes to shared skills require manual updates in each repo.

## Solution

Publish skills as an npm package (`@jenquist/shared-agent-skills`) to Harbor registry. Consuming repos install the package and use a git hook to auto-update on pull.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    shared-agent-skills                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                        │
│  │ skill-1 │ │ skill-2 │ │ skill-N │                        │
│  └─────────┘ └─────────┘ └─────────┘                        │
│                     │                                        │
│              npm publish                                     │
│                     ▼                                        │
│  ┌──────────────────────────────────────┐                   │
│  │        Harbor NPM Registry            │                   │
│  │  harbor.server.unarmedpuppy.com/npm   │                   │
│  └──────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
                          │
                    npm install
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Consuming Repo                            │
│                                                              │
│  package.json:                                               │
│    "@jenquist/shared-agent-skills": "^1.0.0"                │
│                                                              │
│  .git/hooks/post-merge:                                      │
│    npm update @jenquist/shared-agent-skills                  │
│    npx link-skills                                           │
│                                                              │
│  .claude/skills/                                             │
│    skill-1.md → node_modules/.../skills/skill-1/SKILL.md    │
│    skill-2.md → node_modules/.../skills/skill-2/SKILL.md    │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Package Setup ✅

- [x] Create repo structure
- [x] Create package.json with Harbor config
- [x] Create bin/link-skills.js
- [x] Create bin/install-hooks.js
- [x] Create hooks/post-merge template
- [x] Add example skills
- [x] Create AGENTS.md

### Phase 2: Harbor Setup

- [ ] Configure Harbor npm repository
- [ ] Create robot account for publishing
- [ ] Test npm login to Harbor
- [ ] First publish

### Phase 3: Migrate Skills

- [ ] Identify universal skills from home-server
- [ ] Copy skills to shared-agent-skills
- [ ] Validate skill format
- [ ] Publish v1.0.0

### Phase 4: Consumer Integration

- [ ] Add to home-server as first consumer
- [ ] Test git hook workflow
- [ ] Document any issues
- [ ] Roll out to other repos

### Phase 5: Cleanup

- [ ] Remove duplicated skills from individual repos
- [ ] Update AGENTS.md in each repo to reference shared skills
- [ ] Create migration guide for future repos

## Skills to Migrate

**Universal (migrate immediately)**:
- beads-task-management
- skill-creator
- plan-creator

**Evaluate for sharing**:
- standard-deployment (may need parameterization)
- system-health-check (generic parts)

**Project-specific (keep local)**:
- deploy-polymarket-bot
- connect-server (home-server specific)
- configure-traefik-labels (home-server specific)

## Harbor NPM Setup

### Create NPM Repository in Harbor

1. Login to Harbor: https://harbor.server.unarmedpuppy.com
2. Create project: `npm`
3. Configure as npm registry

### Configure npm

```bash
# Set registry for @jenquist scope
npm config set @jenquist:registry https://harbor.server.unarmedpuppy.com/npm/

# Login
npm login --registry https://harbor.server.unarmedpuppy.com/npm/

# Verify
npm whoami --registry https://harbor.server.unarmedpuppy.com/npm/
```

### First Publish

```bash
cd ~/repos/personal/shared-agent-skills
npm publish
```

## Rollback Plan

If issues arise:
1. Remove package from consuming repos: `npm uninstall @jenquist/shared-agent-skills`
2. Remove hook: `rm .git/hooks/post-merge`
3. Restore local skills from git history

## Success Criteria

- [ ] Skills published to Harbor
- [ ] At least 2 repos consuming shared skills
- [ ] Auto-update working on git pull
- [ ] No skill duplication across repos
- [ ] Clear process for adding new shared skills

## Open Questions

1. **Versioning strategy**: Semver? Auto-bump on merge?
2. **Skill selection**: How do consumers pick which skills to link?
3. **Local overrides**: Can a repo override a shared skill locally?

## Notes

- Harbor may need npm repository type enabled
- Windows symlink support requires Developer Mode
- Consider CI/CD for auto-publish on merge
