# Markdown Content Workflow

## Overview

Write project content in markdown files (`works/project-slug.md`) and combine with metadata from `projects.json` to generate HTML files.

## How It Works

1. **Metadata** stays in `projects.json` (title, tags, date, description, links)
2. **Content** goes in markdown files (`works/sail_pattern_lab.md`, etc.)
3. **Build script** (`build.js`) combines them to generate HTML

## Workflow

### Adding/Editing a Project

1. **Add metadata to `projects.json`**:
   ```json
   {
     "id": "my_project",
     "title": "My Project",
     "slug": "my_project",
     "category": "works",
     "tags": ["ux", "research"],
     "date": "2026",
     "description": "Brief description for homepage",
     "content": "", // Leave empty - use markdown file instead
     "image": "path/to/image.jpg",
     "links": [{"label": "view project", "url": "https://..."}],
     "featured": false
   }
   ```

2. **Create markdown file**: `works/content/my_project.md`
   ```markdown
   This is the full project content. Write naturally in markdown.

   ## Section Header

   More content here. You can use:

   - Lists
   - **Bold** and *italic*
   - [Links](https://example.com)
   - Images: ![Alt text](image.jpg)

   ![Project screenshot](images/screenshot.jpg)

   More paragraphs and content...
   ```

3. **Run build**: `npm run build`
   - Generates `works/my_project.html` automatically
   - Combines metadata + markdown content

4. **Preview**: Open the generated HTML file or use `npm run dev`

## Supported Markdown Features

- **Paragraphs**: Just write normally
- **Headers**: `# H1`, `## H2`, `### H3`
- **Images**: `![alt text](image.jpg)` or `![alt text](path/to/image.jpg)`
- **Links**: `[link text](https://url.com)`
- **Bold/Italic**: `**bold**` and `*italic*` (basic support)

## File Structure

```
works/
├── project-template.html   (template)
├── sail_pattern_lab.html   (generated - gitignored)
├── content/                (your markdown files)
│   ├── sail_pattern_lab.md
│   └── my_project.md
└── ...

data/
└── projects.json           (metadata/config)
```

## Benefits

✅ **Write in markdown** - faster, more natural  
✅ **Images inline** - see them as you write  
✅ **Version control friendly** - markdown diffs are readable  
✅ **Single source of truth** - metadata in JSON, content in MD  
✅ **No HTML knowledge needed** - just write markdown  

## Risks & Mitigations

### Risk: Build Step Required
- **Impact**: Must run `npm run build` before seeing changes
- **Mitigation**: 
  - Can add watch mode: `npm run build -- --watch`
  - Or use a markdown previewer while writing
  - Build is fast (< 1 second)

### Risk: Markdown Parser Limitations
- **Impact**: Simple parser, not full CommonMark
- **Mitigation**: 
  - Can upgrade to `marked` or `markdown-it` library later
  - Current parser handles basics (paragraphs, images, links, headers)
  - Easy to extend

### Risk: Generated Files Can Be Overwritten
- **Impact**: Manual edits to HTML get lost on rebuild
- **Mitigation**: 
  - **Don't edit generated HTML files directly**
  - Edit markdown files instead
  - Generated files are in `.gitignore` (optional)

### Risk: Deployment Requires Build
- **Impact**: Must run build before deploying
- **Mitigation**: 
  - Add to deployment script
  - Or commit generated files (if you prefer)
  - Build is fast and reliable

## Tips

1. **Keep markdown files in version control** - they're your source
2. **Don't edit generated HTML** - it will be overwritten
3. **Use relative paths for images** - `images/photo.jpg` not `/images/photo.jpg`
4. **Run build before committing** - or add to pre-commit hook
5. **Write freely** - markdown is forgiving, focus on content

## Example Project

See `works/content/sail_pattern_lab.md` for a complete example with images and sections.
