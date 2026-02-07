# Quick Start: Writing Your Projects

## Get Writing in 3 Steps

### 1. Create a Markdown File

Create `works/content/your-project-slug.md` with frontmatter:

```markdown
---
title: Your Project Title
slug: your-project-slug
tags: [tag1, tag2]
date: 2026
blurb: short description for cards
description: longer description for project pages
image: path/to/image.jpg
featured: true
links:
  - label: view project
    url: https://example.com
---

## Your Content Here

Write your project content in markdown below the frontmatter.

Use headers, images, links, lists - everything works!
```

### 2. Build

```bash
npm run build
```

This generates `works/your-project-slug.html`

### 3. Sync Metadata (Optional)

To update `projects.json` from your markdown frontmatter:

```bash
npm run build:sync
```

## Workflow Tips

- **Write in iAWriter**: Open `works/content/` folder
- **Edit frontmatter**: Update metadata at top of markdown file
- **Build**: Run `npm run build` to generate HTML
- **Sync**: Run `npm run build:sync` to update JSON from frontmatter

## See Also

- `docs/WRITING_GUIDE.md` - Complete writing guide
- `docs/MARKDOWN_WORKFLOW.md` - Technical details
