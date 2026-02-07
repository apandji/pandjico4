# Project Images Directory

## Structure

Place project images in subdirectories organized by project slug:

```
works/
├── content/              (Your markdown files)
│   ├── sail_pattern_lab.md
│   └── ...
└── images/              (Project images - this directory)
    ├── sail_pattern_lab/
    │   ├── hero.jpg          (Hero image for top of project page)
    │   ├── screenshot-1.jpg  (Inline content images)
    │   └── screenshot-2.jpg
    ├── driftpad/
    │   ├── hero.jpg
    │   └── ...
```

## Usage in Markdown

### Hero Image (Top of Page)

Add to frontmatter:
```markdown
---
hero_image: images/sail_pattern_lab/hero.jpg
---
```

### Inline Images (Within Content)

Use standard markdown syntax:
```markdown
![Alt text](images/sail_pattern_lab/screenshot-1.jpg)
```

**Note:** Paths are relative to the markdown file location (`works/content/`), so `images/` refers to `works/images/`.

## Image Guidelines

- **Hero images:** Recommended 1200-1600px wide, landscape orientation
- **Content images:** 800-1200px wide, any orientation
- **Formats:** JPG for photos, PNG for graphics/screenshots
- **Optimization:** Compress before adding (use tools like ImageOptim, TinyPNG)

## Workflow

1. Create project folder: `works/images/[project-slug]/`
2. Add images to folder
3. Reference in markdown (from `works/content/[slug].md`):
   - Hero: `hero_image: images/[slug]/hero.jpg`
   - Inline: `![alt](images/[slug]/image.jpg)`
4. Run `npm run build`

## Example

If you have a project `sail_pattern_lab`:
- Markdown file: `works/content/sail_pattern_lab.md`
- Images folder: `works/images/sail_pattern_lab/`
- In markdown: `images/sail_pattern_lab/hero.jpg` (relative path)
