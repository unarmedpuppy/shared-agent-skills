---
name: generate-digest
description: Generate AI learning blog digests from Bird bookmarks. Use when creating daily summaries of AI content with media.
---

# Generate Digest

Generate rich AI learning blog digests from Bird bookmark data, including relevant media.

## Overview

This skill creates analytical blog posts summarizing AI-related content from your Twitter/X likes and bookmarks stored in Bird. It evaluates posts, groups them by theme, and embeds relevant images and videos.

## Usage

```
/generate-digest [date]
```

**Arguments:**
- `date` (optional): Date in YYYY-MM-DD format. Defaults to today.

**Examples:**
```
/generate-digest              # Generate for today
/generate-digest 2026-01-13   # Generate for specific date
```

## What It Does

1. Fetches AI-categorized posts from Bird API for the specified date
2. Analyzes posts and groups by theme (Claude Code, AI Agents, Vibe Coding, etc.)
3. Evaluates media attachments for relevance
4. Generates rich markdown with:
   - Overview of major themes
   - Themed sections with key quotes and attribution
   - Embedded images/videos where relevant
   - Key takeaways
5. Saves digest to Bird database

## Implementation Steps

### Step 1: Fetch Posts for Date

```bash
# Get posts for the date with their media
curl -s "https://bird-api.server.unarmedpuppy.com/digests/{date}/posts" | jq
```

If no digest exists yet, fetch AI posts directly:

```bash
curl -s "https://bird-api.server.unarmedpuppy.com/posts?category=ai" | jq '.posts[] | select(.tweet_created_at | startswith("{date}"))'
```

### Step 2: Analyze Content and Media

For each post, examine:
- **Content**: Tweet text, linked article titles/excerpts
- **Media**: Check `local_media_paths` (preferred) or `media_urls`
- **Theme**: Match against theme keywords

**Theme Keywords:**
| Theme | Keywords |
|-------|----------|
| Claude Code | claude code, clawdbot, claude.md |
| AI Agents | agent, mcp, orchestrat, agentic, harness |
| Vibe Coding | vibe cod, vibe-cod |
| IDE Tools | cursor, copilot, windsurf, cline |
| Models | opus, gpt, gemini, sonnet, o1, o3 |
| New Tools | shipped, introducing, launched, announcing |

### Step 3: Select Media for Inclusion

Include media when it:
- Shows a UI/screenshot of a tool being discussed
- Contains a diagram or visualization
- Is a video demo of functionality
- Directly illustrates the post's point

**Skip media that:**
- Is just a profile picture or avatar
- Is a generic stock image
- Doesn't add information beyond the text

### Step 4: Generate Markdown

Structure:
```markdown
# AI Learnings - {formatted_date}

## Overview
{2-3 sentence summary of themes covered}

## {Theme Name}

- **[@author](tweet_url)**: "{key quote from post}"

![Description](media_url)

{Continue for each theme...}

## Key Takeaways

1. {Insight 1}
2. {Insight 2}
3. {Insight 3}

---
*Curated from {N} posts*
```

**Media Embedding:**
```markdown
# For images (local)
![Alt text](/api/media/{post_id}/image_0.jpg)

# For images (remote fallback)
![Alt text](https://pbs.twimg.com/media/xxx.jpg)

# For videos (local)
<video controls src="/api/media/{post_id}/video_0.mp4"></video>

# For videos (remote/tweet link)
[View video on X](https://x.com/user/status/123)
```

### Step 5: Save Digest

The digest should be saved via the Bird API or database. Output the generated markdown for review before saving.

## API Reference

**Bird API Base:** `https://bird-api.server.unarmedpuppy.com`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/posts` | GET | List posts with filters |
| `/posts?category=ai` | GET | AI-categorized posts |
| `/posts/{id}/media` | GET | Get media info for post |
| `/digests` | GET | List existing digests |
| `/digests/{date}` | GET | Get digest by date |
| `/media/{post_id}/{filename}` | GET | Serve media file |

## Output

The skill outputs:
1. Generated markdown content (displayed for review)
2. Summary of media included
3. Confirmation when saved to database

## Notes

- Posts are grouped by `tweet_created_at`, not `fetched_at`
- Days with fewer than 3 posts should be combined with adjacent days
- Finance/trading content is excluded from AI digests
- Local media paths are preferred over remote URLs when available
