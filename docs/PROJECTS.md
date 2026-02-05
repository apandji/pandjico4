# Project Data System

This site uses a single source of truth for all project metadata: `data/projects.json`.

## Structure

All project information is stored in `data/projects.json`. Each project has:

```json
{
  "id": "unique_id",
  "title": "Display Title",
  "slug": "url_slug",
  "category": "works|play|writings",
  "tags": ["tag1", "tag2"],
  "date": "2026",
  "description": "Short description",
  "content": "Full project content (supports paragraphs separated by \\n\\n)",
  "image": "url_or_path",
  "links": [
    {"label": "link text", "url": "https://..."}
  ],
  "featured": true|false
}
```

## How It Works

1. **Sidebar Generation**: The sidebar project list is automatically generated from `projects.json` when the page loads
2. **Featured Projects**: The homepage featured projects section is generated from projects marked `"featured": true`
3. **Project Pages**: Project pages use the template (`works/project-template.html`) and are populated from `projects.json` based on the URL slug

## Adding a New Project

1. Add project data to `data/projects.json`:
   ```json
   {
     "id": "my_new_project",
     "title": "My New Project",
     "slug": "my_new_project",
     "category": "works",
     "tags": ["ux", "research"],
     "date": "2026",
     "description": "A brief description",
     "content": "Full content here\\n\\nWith multiple paragraphs.",
     "image": "path/to/image.jpg",
     "links": [],
     "featured": false
   }
   ```

2. Create the project page file: `works/my_new_project.html`
   - Copy `works/project-template.html`
   - The page will automatically populate from `projects.json` based on the slug

3. The sidebar will automatically include it (if category is "works")
4. Set `"featured": true` to show it on the homepage

## Updating Project Content

Just edit `data/projects.json` - no need to touch HTML files! The system will automatically:
- Update the sidebar list
- Update featured projects
- Update project pages when viewed

## Benefits

- ✅ Single source of truth - all metadata in one place
- ✅ Easy to add/edit projects - just JSON
- ✅ Consistent structure across all projects
- ✅ No duplicate data - sidebar, featured, and pages all use same data
- ✅ Scalable - add as many projects as you want

## Future Enhancements

- Generate project HTML files automatically from the JSON
- Add content management UI
- Support for markdown in content field
- Image optimization pipeline
