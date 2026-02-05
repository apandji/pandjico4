# Pandjico Portfolio

Personal portfolio site with a brutalist/minimal aesthetic.

## Project Structure

```
pandjico4/
├── docs/                    # Documentation
│   ├── PRD.md              # Product Requirements Document
│   ├── PROJECTS.md         # Project data system guide
│   ├── ARCHITECTURE.md     # Architecture decisions
│   └── MARKDOWN_WORKFLOW.md # Markdown content workflow
│
├── src/                     # Source code
│   └── js/
│       └── script.js        # Main JavaScript
│
├── components/              # Reusable HTML components
│   ├── sidebar.html
│   └── mobile-menu.html
│
├── data/                    # Data/config files
│   └── projects.json        # Project metadata (single source of truth)
│
├── works/                   # Project pages
│   ├── content/            # Markdown content files
│   │   └── *.md
│   ├── project-template.html # Template for generation
│   └── *.html              # Generated HTML (gitignored)
│
├── build.js                 # Build script (generates HTML from markdown)
├── styles.css               # Main stylesheet
├── index.html               # Homepage
└── package.json             # NPM scripts
```

## Quick Start

1. **Install dependencies**: None required (pure vanilla JS)

2. **Build project pages**: 
   ```bash
   npm run build
   ```

3. **Start dev server**:
   ```bash
   npm run serve
   ```

4. **View site**: Open `http://localhost:8000`

## Adding a Project

1. Add metadata to `data/projects.json`
2. Create markdown file: `works/content/my-project.md`
3. Run `npm run build`
4. Done!

See `docs/PROJECTS.md` and `docs/MARKDOWN_WORKFLOW.md` for details.

## Development

- **Edit content**: `works/content/*.md`
- **Edit metadata**: `data/projects.json`
- **Edit styles**: `styles.css`
- **Edit scripts**: `src/js/script.js`
- **Rebuild**: `npm run build`

## Documentation

- `docs/PRD.md` - Product requirements and design vision
- `docs/PROJECTS.md` - Project data system guide
- `docs/ARCHITECTURE.md` - Architecture decisions (vanilla vs 11ty)
- `docs/MARKDOWN_WORKFLOW.md` - How to write content in markdown
