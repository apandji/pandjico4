# Weekend Setup: Get Your Projects Live

## ✅ What's Ready

1. **Blurb colors fixed** - White on mobile (first card) and desktop (all cards)
2. **Markdown workflow** - Write content in markdown files with frontmatter
3. **Build script** - Generates HTML from markdown + frontmatter
4. **Sync option** - Update projects.json from markdown frontmatter

## 🚀 Quick Start

### Step 1: Create Your Project Files

For each project, create a markdown file in `works/content/`:

**Example: `works/content/driftpad.md`**

```markdown
---
title: Driftpad
slug: driftpad
tags: [haptics, interaction-design]
date: 2025
blurb: exploring spatial haptics through touch
description: A research project exploring spatial haptic feedback.
image: images/driftpad-hero.jpg
featured: true
links:
  - label: view project
    url: https://example.com
---

## Introduction

Your project content here...

![Screenshot](images/screenshot.jpg)

## More sections...

Write naturally in markdown!
```

### Step 2: Build Your Pages

```bash
npm run build
```

This generates HTML files in `works/` directory.

### Step 3: Sync Metadata (Optional)

If you want to update `projects.json` from your markdown frontmatter:

```bash
npm run build:sync
```

## 📝 Writing Workflow

### Option A: Write Everything in Markdown (Recommended)

1. Create `works/content/project-slug.md`
2. Add frontmatter with all metadata
3. Write content below
4. Run `npm run build`
5. Done!

**Benefits:**
- Everything in one file
- Easy to edit in iAWriter
- Version control friendly
- No need to edit JSON

### Option B: Keep Metadata in JSON

1. Keep metadata in `data/projects.json`
2. Write content in `works/content/project-slug.md` (no frontmatter needed)
3. Run `npm run build`
4. Done!

**Benefits:**
- Separates metadata from content
- Good if you prefer JSON editing

## 📚 Documentation

- **`docs/QUICK_START.md`** - 3-step quick start
- **`docs/WRITING_GUIDE.md`** - Complete writing guide with examples
- **`docs/MARKDOWN_WORKFLOW.md`** - Technical workflow details

## 🎯 This Weekend's Goal

Get your projects up on the site:

1. **Create markdown files** for each project in `works/content/`
2. **Add frontmatter** with project metadata
3. **Write your content** in markdown
4. **Run build**: `npm run build`
5. **Preview**: Open generated HTML files
6. **Deploy**: Push to GitHub (if using GitHub Pages)

## 💡 Tips

- **Use iAWriter**: Open `works/content/` folder, edit markdown files
- **Frontmatter format**: YAML-style at top of file between `---`
- **Images**: Use relative paths like `images/photo.jpg` or full URLs
- **Build often**: Run `npm run build` to see changes
- **Example file**: See `works/content/sail_pattern_lab.md` for reference

## 🔧 Commands

```bash
# Build HTML files
npm run build

# Build + sync frontmatter to projects.json
npm run build:sync

# Build + serve locally
npm run dev
```

## ✅ Checklist

- [ ] Create markdown files for all projects
- [ ] Add frontmatter with metadata
- [ ] Write project content
- [ ] Run `npm run build`
- [ ] Preview generated HTML files
- [ ] Test links and images
- [ ] Deploy to production

## 🆘 Troubleshooting

**Build fails?**
- Check frontmatter YAML syntax
- Ensure `slug` matches filename (without `.md`)
- Check that arrays use proper YAML format

**Content not showing?**
- Make sure there's a blank line after frontmatter `---`
- Check markdown syntax

**Metadata not updating?**
- Run `npm run build:sync` to sync frontmatter to JSON
- Or manually update `projects.json`

## 🎉 You're Ready!

Start writing your project content in markdown files. Everything is set up and ready to go!
