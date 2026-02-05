# Pandjico Portfolio Site - Product Requirements Document

## Project Overview
A living, breathing repository showcasing work as a product designer and creative technologist. The site serves as both a professional portfolio and a sandbox for creative exploration.

## Design Vision

### Inspiration
- [Digital Solitude's Carrier Bag](https://webresidencies.akademie-solitude.de/carrier-bag/) - Randomized, searchable knowledge repository with tactile exploration
- [Mingu Hong MFG](https://minguhongmfg.com) - Minimal, brutalist aesthetic
- [Luzi Type Messina Sans](https://www.luzi-type.ch/messina-sans) - Clean, modernist typography, International Style

### Design Principles
- **Brutalist/Minimal**: Raw, unadorned, functional
- **Calming & Grounding**: Tactile feeling, comfortable to navigate
- **System Monospace**: Consistent typographic voice (already implemented)
- **Tactile**: Feels physical, textured, intentional

### Visual Language
- Monospace typography (system fonts)
- Generous white space
- Raw HTML/CSS aesthetic (embrace the medium)
- Subtle, intentional interactions
- High contrast, clear hierarchy
- Minimal color palette (explore: black/white, subtle earth tones?)

## Core Features

### 1. Navigation & Layout

#### Sidebar Navigation
- **Fixed/Sticky sidebar** containing project list
- Scrollable project list
- Active project highlighting
- Persistent across navigation (maintains scroll position, active state)
- Categories: `works`, `play`, `writings`, `about me`, `about pandjico`

#### Navigation Behavior
- **Approach**: Multi-page with progressive enhancement
- Each project = separate HTML page
- JavaScript intercepts clicks for smooth transitions (SPA-like feel)
- Fallback: Traditional page navigation if JS fails
- URL structure: `/works/sail_pattern_lab.html` or `/works/sail_pattern_lab/`

### 2. Project Tagging System

#### Tag Structure
- Projects can have multiple tags
- Tags: `#ux`, `#play`, `#health`, `#research`, `#experimental`, etc.
- Tags stored in HTML data attributes or JSON metadata

#### Filtering
- **URL-based filtering**: `/#filter=ux,health` or `/?tags=ux&tags=health`
- Filter buttons/links in sidebar or header
- Multiple tag selection (AND logic: show projects with ALL selected tags)
- Clear/reset filter option
- Visual indication of active filters
- Shareable filtered views

#### Implementation
- Start with HTML data attributes: `<li data-tags="ux health">project_name</li>`
- Consider migrating to `projects.json` as complexity grows
- Client-side filtering with JavaScript

### 3. Project Pages

#### Consistent Components
- **Header**: Project title, tags, date (optional)
- **Content Area**: Project description, images, media, links
- **Navigation**: Back to index, next/previous project (optional)
- **Sidebar**: Persistent navigation (same as index)

#### Content Structure
Each project page should have:
- Project title
- Tags (displayed as clickable filter links)
- Description/context
- Media (images, videos, interactive demos)
- Links (if applicable)
- Metadata (date, collaborators, etc.)

### 4. Componentization Strategy (Vanilla Approach)

#### Phase 1: Shared CSS Components
- Create reusable CSS classes for:
  - `.project-header`
  - `.project-content`
  - `.sidebar`
  - `.tag`
  - `.filter-button`
  - `.project-card` (for index page grid/list view)
- All project pages import the same `styles.css`

#### Phase 2: HTML Structure Consistency
- Manual copy-paste of sidebar HTML across pages (initially)
- Document standard structure in comments or separate reference file
- Consistent class names and structure ensure visual consistency

#### Phase 3: JavaScript Component Loading (Optional Enhancement)
- Create `components/sidebar.html` with sidebar markup
- Use JavaScript `fetch()` to load and inject sidebar into each page
- Falls back gracefully if JavaScript fails (sidebar still works)
- Alternative: Simple build script that copies shared HTML before serving

#### Future Consideration
- If project count grows significantly (20+ projects), consider static site generator
- For now, vanilla approach keeps things simple and maintainable

## Technical Architecture

### File Structure
```
pandjico4/
├── index.html
├── styles.css
├── script.js
├── components/
│   └── sidebar.html (optional, for JS loading)
├── works/
│   ├── sail_pattern_lab.html
│   ├── sonic_scroller.html
│   └── ...
├── play/
│   ├── aqi_historical_record.html
│   └── ...
├── writings/
├── projects.json (optional, for metadata - can be loaded via JS for filtering)
└── PRD.md
```

### Technology Stack (Vanilla)
- **HTML5**: Semantic markup
- **CSS**: Vanilla CSS (consider CSS custom properties for theming)
- **JavaScript**: Vanilla JS (no frameworks, no build tools)
- **Build**: Simple HTTP server (Python) for development
- **Approach**: Pure vanilla - no build step, no compilation, just HTML/CSS/JS

### Progressive Enhancement
- Base: Works without JavaScript (traditional multi-page navigation)
- Enhanced: JavaScript adds smooth transitions, dynamic filtering, SPA-like feel
- Accessibility: Semantic HTML, keyboard navigation, screen reader friendly

## User Experience Flow

### Landing Page (index.html)
1. User sees sidebar with all projects organized by category
2. Can scroll through project list
3. Can click tags to filter projects
4. Can click project name to navigate to project page

### Project Page
1. Sidebar remains visible and functional
2. Project content displayed in main area
3. Tags are clickable (filter and return to index with filter applied)
4. Smooth transition back to index (if JS enabled)

### Filtering Flow
1. User clicks tag (e.g., `#ux`)
2. URL updates: `/#filter=ux` or `/?tags=ux`
3. Projects filter to show only those with `#ux` tag
4. Active filter highlighted
5. User can add more filters (AND logic)
6. Clear filters button returns to full list

## Content Strategy

### Project Categories
- **works**: Professional projects, client work, research
- **play**: Experimental projects, creative exploration
- **writings**: Articles, essays, thoughts
- **about me**: Personal introduction
- **about pandjico**: Site philosophy, meta information

### Project Metadata
Each project should include:
- Title
- Category
- Tags (array)
- Description
- Date (optional)
- Media (images, videos, links)
- Links to external resources (optional)

## Design Specifications

### Typography
- **Primary**: System monospace (already implemented)
  - `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace`
- **Hierarchy**: Size, weight, spacing (no font changes)
- **Line height**: Generous (1.6-1.8 for body text)
- **Letter spacing**: Consider slight increase for headings

### Color Palette
- **Base**: Black text on white/off-white (or reverse for dark mode?)
- **Accents**: Explore subtle earth tones, muted colors
- **Links**: Underline or subtle color change
- **Tags**: Distinct styling (background, border, or color)

### Spacing & Layout
- **Grid**: Consider simple grid system (CSS Grid or Flexbox)
- **Margins**: Generous white space (brutalist but not cramped)
- **Sidebar width**: Fixed or flexible? (explore both)
- **Content width**: Max-width for readability (e.g., 65-75ch)

### Interactions
- **Hover states**: Subtle, intentional (underline, slight color shift)
- **Transitions**: Smooth but not excessive (200-300ms)
- **Scrolling**: Smooth scroll behavior
- **Focus states**: Clear keyboard navigation indicators

## Implementation Phases

### Phase 1: Foundation ✅
- [x] Basic HTML structure
- [x] System monospace font
- [ ] Sidebar layout and styling
- [ ] Basic project page template

### Phase 2: Navigation
- [ ] Multi-page structure (create project HTML files manually)
- [ ] Sidebar HTML structure (copy-paste across pages, or JS load)
- [ ] Navigation JavaScript (progressive enhancement)
- [ ] Active state management

### Phase 3: Tagging & Filtering
- [ ] Add tags to projects (data attributes)
- [ ] Filter UI (buttons/links)
- [ ] Filter logic (JavaScript)
- [ ] URL-based filtering (History API)
- [ ] Filter state persistence

### Phase 4: Polish
- [ ] Refine typography and spacing
- [ ] Add subtle interactions
- [ ] Responsive design (mobile considerations)
- [ ] Performance optimization
- [ ] Accessibility audit

### Phase 5: Content & Iteration
- [ ] Add all project content
- [ ] Refine based on usage
- [ ] Optimize vanilla approach (consider JS component loading if manual copy-paste becomes tedious)

## Open Questions

1. **Color scheme**: Stick with black/white or introduce subtle colors?
2. **Dark mode**: Should we support it?
3. **Sidebar behavior**: Fixed, sticky, or collapsible on mobile?
4. **Project media**: How to handle images/videos? Inline or lightbox?
5. **Search**: Do we want full-text search beyond tag filtering?
6. **Project ordering**: Chronological, alphabetical, or manual?
7. **Animations**: How much motion? (brutalist = minimal, but some sites use subtle transitions)

## Success Metrics

- **Usability**: Easy to navigate, find projects, understand filtering
- **Aesthetic**: Achieves calming, grounding, tactile feeling
- **Performance**: Fast load times, smooth interactions
- **Maintainability**: Easy to add new projects, update content
- **Accessibility**: Works for all users, keyboard navigable

## Notes & References

### Design Inspiration
- Carrier Bag: Randomized discovery, tactile exploration, metadata on tap
- Mingu Hong: Brutalist minimalism, raw HTML aesthetic
- Messina Sans: Clean International Style, modernist clarity

### Technical References
- [CSS Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [Progressive Enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement)

---

**Last Updated**: February 3, 2026
**Status**: In Progress
