# Skill Consolidation Plan

**Created**: 2026-01-03  
**Status**: Planning  
**Goal**: Organize skills across repos - shared vs. repo-specific

---

## Current State

| Location | Skills | Purpose |
|----------|--------|---------|
| `shared-agent-skills/skills/` | 3 | Cross-repo reusable skills |
| `home-server/agents/skills/` | 50 | Server management + mixed |
| `shua-ledger/agents/skills/` | 8 | Personal life management |

---

## Skill Classification

### Tier 1: Move to shared-agent-skills (Generic/Reusable)

These skills are useful across multiple repos and have no server-specific dependencies:

| Skill | Why Shared |
|-------|------------|
| `skill-creator` | ✅ Already in shared |
| `beads-task-management` | ✅ Already in shared |
| `setup-gitea-workflow` | ✅ Already in shared |
| `plan-creator` | Generic planning workflow |
| `http-api-requests` | Generic API calling |
| `terminal-ui-design` | Generic UI patterns |
| `custom-chatgpt-dropdown` | Generic UI component pattern |
| `n8n-workflow-creation` | Generic n8n patterns |
| `upgrade-workflow` | Generic migration pattern |

### Tier 2: Keep in home-server (Server-Specific)

These skills require server access or home-server context:

| Skill | Why Server-Specific |
|-------|---------------------|
| `connect-server` | SSH to specific server |
| `connect-gaming-pc` | SSH to gaming PC |
| `backup-server` | Server backup scripts |
| `restore-server` | Server restore scripts |
| `backup-configurator` | jenquist-cloud specific |
| `check-backup-health` | Server backup validation |
| `manage-b2-backup` | B2 cloud backup config |
| `enable-rsnapshot` | Server rsnapshot config |
| `deploy-new-service` | Server Docker deployment |
| `standard-deployment` | Server deployment pattern |
| `configure-traefik-labels` | Traefik on this server |
| `docker-container-management` | Server Docker ops |
| `check-service-health` | Server health checks |
| `system-health-check` | Server system checks |
| `cleanup-disk-space` | Server disk cleanup |
| `troubleshoot-disk-full` | Server disk issues |
| `troubleshoot-container-failure` | Server Docker debug |
| `troubleshoot-stuck-downloads` | Server media stack |
| `troubleshoot-traefik-certificates` | Server Traefik |
| `monitor-drive-health` | Server drive monitoring |
| `zfs-pool-recovery` | Server ZFS recovery |
| `security-audit` | Server security |
| `validate-secrets` | Server secrets |
| `fix-hardcoded-credentials` | Server compose files |
| `verify-dns-setup` | Server DNS config |
| `update-homepage-groups` | Server homepage |
| `edit-wiki-content` | Server wiki |
| `git-server-sync` | Server git sync |
| `add-gitea-mirror` | Server Gitea config |

### Tier 3: Move to App-Specific Repos

These skills belong with their respective applications:

| Skill | Move To | Reason |
|-------|---------|--------|
| `deploy-polymarket-bot` | polyjuiced | App-specific deployment |
| `polymarket-user-activity` | polyjuiced | App-specific API |
| `update-polymarket-strategy-docs` | polyjuiced | App-specific docs |
| `deploy-homelab-ai-service` | homelab-ai | App-specific deployment |
| `homelab-ai-api-keys` | homelab-ai | App-specific config |
| `agent-endpoint-usage` | homelab-ai | App-specific API |
| `test-local-ai-router` | homelab-ai | App-specific testing |
| `gaming-pc-manager` | chatterbox-tts-service or new repo | Gaming PC specific |
| `test-tts` | chatterbox-tts-service | App-specific testing |
| `bird-bookmark-processor` | (new bird repo?) | App-specific |
| `query-bird-posts` | (new bird repo?) | App-specific |
| `post-to-mattermost` | mattermost-gateway or agent-gateway | App-specific |
| `n8n-workflow-import` | n8n-specific or shared | Could be either |

---

## Migration Priority

### Phase 1: Quick Wins (Do Now)
1. Move `plan-creator` to shared-agent-skills
2. Move `http-api-requests` to shared-agent-skills
3. Move `terminal-ui-design` to shared-agent-skills

### Phase 2: App-Specific Cleanup
1. Move polymarket skills to polyjuiced repo
2. Move homelab-ai skills to homelab-ai repo
3. Decide on bird/gaming-pc repo structure

### Phase 3: Evaluate Remaining
1. Review which server skills could be generalized
2. Consider `docker-container-management` for shared (very generic)
3. Consider `n8n-workflow-creation` for shared

---

## Shared Skills Package Structure

```
shared-agent-skills/
├── skills/
│   ├── beads-task-management/     # ✅ Done
│   ├── skill-creator/             # ✅ Done
│   ├── setup-gitea-workflow/      # ✅ Done
│   ├── plan-creator/              # Phase 1
│   ├── http-api-requests/         # Phase 1
│   ├── terminal-ui-design/        # Phase 1
│   ├── n8n-workflow-creation/     # Phase 3
│   └── docker-management/         # Phase 3 (generalized)
├── reference/
│   └── deployment.md              # Cross-repo deployment patterns
└── ...
```

---

## Implementation Steps

### To Move a Skill to Shared:

```bash
# 1. Copy skill to shared-agent-skills
cp -r home-server/agents/skills/SKILL_NAME shared-agent-skills/skills/

# 2. Remove server-specific references
# Edit SKILL.md to remove home-server paths

# 3. Test in shared context
cd shared-agent-skills && npm run link -- --verbose

# 4. Commit and publish
cd shared-agent-skills
git add skills/SKILL_NAME
git commit -m "feat: add SKILL_NAME skill"
npm version patch
npm run publish:harbor

# 5. Remove from home-server (optional - can keep symlink)
rm -rf home-server/agents/skills/SKILL_NAME
```

### To Move a Skill to App Repo:

```bash
# 1. Copy skill to app repo
cp -r home-server/agents/skills/SKILL_NAME APP_REPO/agents/skills/

# 2. Update paths in SKILL.md for new context

# 3. Remove from home-server
rm -rf home-server/agents/skills/SKILL_NAME

# 4. Commit in app repo
cd APP_REPO
git add agents/skills/SKILL_NAME
git commit -m "feat: add SKILL_NAME skill from home-server"
```

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-03 | Created consolidation plan | Audit showed 50+ skills need organization |
| | Keep server skills in home-server | They require server context/access |
| | Move generic skills to shared | Enables cross-repo reuse |
| | Move app skills to app repos | Keeps related code together |

---

## Open Questions

1. **Bird repos**: Create dedicated bird-viewer/bird-processor repos or keep in home-server?
2. **Gaming PC**: Dedicated repo for gaming PC management or keep as home-server skill?
3. **n8n**: Is n8n-workflow-creation generic enough for shared, or too n8n-specific?
4. **Docker skills**: Is docker-container-management worth generalizing?

---

## Next Actions

- [ ] Move `plan-creator` to shared-agent-skills
- [ ] Move `http-api-requests` to shared-agent-skills  
- [ ] Move `terminal-ui-design` to shared-agent-skills
- [ ] Move polymarket skills to polyjuiced
- [ ] Move homelab-ai skills to homelab-ai
- [ ] Publish new shared-agent-skills version
