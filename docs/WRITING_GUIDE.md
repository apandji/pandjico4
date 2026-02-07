# Quick Writing Guide

## Overview

Write your project content in markdown files with frontmatter metadata. Everything stays in one file - easy to edit in iAWriter or any markdown editor.

## File Structure

Create markdown files in `works/content/`:
- `works/content/sail_pattern_lab.md`
- `works/content/driftpad.md`
- etc.

## Markdown File Format

Each markdown file has two parts:

### 1. Frontmatter (Metadata) - Top of file

```markdown
---
title: SAIL Patterns App
slug: sail_pattern_lab
tags: [research, haptics, ux]
date: 2026
blurb: platform for biohaptics testing
description: As part of the Sensory & Ambient Interfaces Lab at WashU, we are exploring technology-enabled test protocols to measure, categorize and qualify different haptic patterns.
image: https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg
featured: true
links:
  - label: view project
    url: https://example.com
  - label: case study
    url: https://example.com/case-study
---

### 2. Content - Below frontmatter

Write your project content here in markdown.

Building on past work with active haptic feedback systems...

![SAIL Patterns App interface](https://via.placeholder.com/800x400)

## Research Approach

We're exploring technology-enabled test protocols...

## Key Findings

Initial studies show promising results...
```

## Quick Start

1. **Create a new markdown file**: `works/content/my_project.md`
2. **Add frontmatter** with your project metadata (see format above)
3. **Write your content** below the frontmatter
4. **Run build**: `npm run build`
5. **Preview**: Open `works/my_project.html` in browser

## Frontmatter Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `title` | ✅ | Project title | `SAIL Patterns App` |
| `slug` | ✅ | URL slug (no spaces) | `sail_pattern_lab` |
| `tags` | ✅ | Array of tags | `[research, haptics, ux]` |
| `date` | ❌ | Year or date | `2026` or `2026-01-15` |
| `blurb` | ❌ | Short blurb for cards | `platform for biohaptics testing` |
| `description` | ❌ | Longer description | Full paragraph... |
| `image` | ❌ | Featured image URL | `https://...` or `images/project.jpg` |
| `featured` | ❌ | Show on homepage | `true` or `false` |
| `links` | ❌ | Array of links | See format above |

## Writing Tips

### Images

**Hero Image (Top of Page):**
Add to frontmatter:
```markdown
---
hero_image: images/sail_pattern_lab/hero.jpg
---
```

**Inline Images (Within Content):**
Use standard markdown syntax:
```markdown
![Alt text](images/sail_pattern_lab/screenshot.jpg)
```

**Image Organization:**
- Place images in `works/images/[project-slug]/`
- Paths in markdown: `images/[slug]/image.jpg` (relative to `works/content/`)
- Hero images: 1200-1600px wide, landscape
- Content images: 800-1200px wide
- Use relative paths or full URLs

### Headers
- `# H1` → becomes `<h2>` (project title is H1)
- `## H2` → section headers
- `### H3` → subsections

### Lists
- Bullet lists: `- item` or `* item`
- Numbered: `1. item`
- Nested: indent with 2 spaces

### Emphasis
- **Bold**: `**text**`
- *Italic*: `*text*`
- Links: `[text](https://url.com)`

### Paragraphs
- Separate paragraphs with blank lines
- Single line breaks become spaces

## Workflow

1. **Write in markdown** - Use iAWriter, VS Code, or any editor
2. **Save file** - `works/content/project-slug.md`
3. **Run build** - `npm run build` (or `npm run build:watch` for auto-rebuild)
4. **Preview** - Open generated HTML file
5. **Commit** - Markdown files are your source of truth

## Example: Complete Project File

```markdown
---
title: Driftpad
slug: driftpad
tags: [haptics, interaction-design, research]
date: 2025
blurb: exploring spatial haptics through touch
description: A research project exploring how spatial haptic feedback can enhance touch interactions.
image: images/driftpad-hero.jpg
featured: true
links:
  - label: view project
    url: https://driftpad.example.com
---

## Introduction

Driftpad explores the boundaries of spatial haptics...

![Driftpad interface](images/driftpad-interface.jpg)

## Research Questions

- How do users perceive spatial haptic patterns?
- What interaction paradigms emerge?

## Findings

Our research revealed...
```

## Editing in iAWriter

1. Open `works/content/` folder in iAWriter
2. Create/edit `.md` files
3. Frontmatter will show as metadata panel (if supported)
4. Write content naturally below
5. Save and run `npm run build`

## Build Commands

- `npm run build` - Build all projects once
- `npm run build:watch` - Auto-rebuild on file changes (if available)

## Troubleshooting

**Build fails?**
- Check frontmatter syntax (must be valid YAML)
- Ensure `slug` matches filename (without `.md`)
- Check that `category` is `works` or `play`

**Content not showing?**
- Make sure there's a blank line after frontmatter `---`
- Check markdown syntax (headers, images, etc.)

**Metadata not updating?**
- Run `npm run build` after editing frontmatter
- Check that frontmatter is at the very top of file
- Ensure YAML syntax is correct (indentation matters for arrays)

## Next Steps

1. Set up your projects as markdown files
2. Write your content
3. Run build
4. Deploy!
