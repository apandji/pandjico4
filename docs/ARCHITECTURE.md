# Architecture Decision: Vanilla JS vs 11ty

## Current System (Vanilla JS + Dynamic Loading)

### ✅ What Works Well

1. **Single Source of Truth**: `projects.json` centralizes all metadata
2. **No Build Step**: Edit JSON, refresh browser - instant feedback
3. **Simple Deployment**: Just upload files, no build process
4. **Progressive Enhancement**: Works without JS (though degraded)
5. **Easy Content Updates**: Edit JSON file, done
6. **Component System**: Sidebar/menu load dynamically, reusable

### ⚠️ Current Limitations

1. **Client-Side Rendering**: 
   - Components load via `fetch()` - slight delay on first load
   - Projects.json loads via `fetch()` - content appears after JS runs
   - Empty HTML initially, then populates

2. **SEO Concerns**:
   - Content loaded via JavaScript may not be indexed as well
   - Search engines see empty `<main>` initially
   - Social sharing previews might miss content

3. **Manual File Creation**:
   - Still need to create `works/project-slug.html` files manually
   - Need to copy template for each new project
   - Template structure must match data attributes

4. **No Build-Time Optimization**:
   - No minification
   - No image optimization
   - No CSS purging

5. **JavaScript Dependency**:
   - Site works without JS, but content doesn't populate
   - Requires modern browser with fetch support

6. **Performance**:
   - Multiple fetch requests on each page load
   - No caching strategy (beyond browser cache)
   - Larger initial JS bundle

## 11ty Alternative

### ✅ What 11ty Would Provide

1. **Pre-rendered HTML**: 
   - All content in HTML at build time
   - No client-side loading delays
   - Better SEO - content immediately available

2. **Automatic Page Generation**:
   - Generate all project pages from `projects.json`
   - No manual file creation needed
   - Template system handles all pages

3. **Build-Time Optimizations**:
   - Minification, compression
   - Image optimization
   - CSS purging

4. **Better Developer Experience**:
   - Markdown support for content
   - Template inheritance
   - Collections and filters

5. **Performance**:
   - Faster initial load (no JS needed for content)
   - Better Core Web Vitals
   - Smaller JS bundle (only for interactivity)

### ⚠️ 11ty Trade-offs

1. **Build Step Required**:
   - Need Node.js installed
   - Must run `npm run build` to see changes
   - More complex deployment (build + deploy)

2. **Learning Curve**:
   - Learn 11ty templating (Liquid/Nunjucks)
   - Understand data files, collections, pagination
   - More abstraction layers

3. **Development Workflow**:
   - Edit content → Build → Preview
   - Slower iteration (though watch mode helps)
   - More moving parts

4. **Complexity**:
   - More files to manage (config, templates, layouts)
   - Build configuration
   - Potential for build errors

## Recommendation: **Stick with Current System (For Now)**

### Why?

1. **You're Procrastinating Content**: 
   - Current system removes friction - just edit JSON
   - 11ty adds friction - need to understand build process
   - Focus should be on writing, not tooling

2. **15 Projects is Manageable**:
   - Current system handles this fine
   - Manual file creation isn't a huge burden at this scale
   - Can always migrate later

3. **Simplicity Wins**:
   - Current system is easy to understand and debug
   - No build step = faster iteration
   - Anyone can edit JSON, not everyone knows 11ty

4. **SEO Can Be Addressed**:
   - Can add server-side rendering later
   - Or use a service like Netlify/Vercel with prerendering
   - Or add a simple build script that pre-renders

### When to Consider 11ty

Migrate when you hit these thresholds:

- **20+ projects**: Manual file creation becomes tedious
- **Content-heavy**: Need markdown, complex content structure
- **SEO Critical**: Need perfect SEO scores
- **Team Collaboration**: Multiple people editing content
- **Performance Issues**: Current system becomes slow
- **Complex Content**: Need collections, taxonomies, relationships

### Hybrid Approach (Best of Both Worlds)

You could add a **simple build script** that:
1. Reads `projects.json`
2. Generates HTML files from template
3. Pre-populates content (no client-side loading)
4. Keeps the vanilla JS approach

This gives you:
- ✅ Pre-rendered HTML (better SEO)
- ✅ Automatic page generation
- ✅ Still simple - just run script before deploy
- ✅ No 11ty learning curve

## Conclusion

**Current system is sufficient** for your needs right now. Focus on content, not tooling. When you hit pain points (too many projects, SEO issues, performance), then consider 11ty or a simple build script.

The trade-off is worth it: **Simplicity and speed of iteration > Perfect SEO and build-time optimization** (at this stage).
