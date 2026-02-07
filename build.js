#!/usr/bin/env node

/**
 * Enhanced build script to generate project HTML files from:
 * - projects.json (metadata - fallback)
 * - project markdown files with frontmatter (metadata + content)
 * 
 * Frontmatter in markdown files takes precedence over projects.json
 * 
 * Usage: 
 *   node build.js           - Build HTML files
 *   node build.js --sync    - Build HTML files + sync frontmatter to projects.json
 */

const fs = require('fs');
const path = require('path');

// Simple YAML frontmatter parser (handles basic cases)
function parseFrontmatter(content) {
    if (!content || !content.startsWith('---')) {
        return { frontmatter: {}, content: content || '' };
    }
    
    const lines = content.split('\n');
    if (lines[0] !== '---') {
        return { frontmatter: {}, content };
    }
    
    let i = 1;
    const frontmatterLines = [];
    while (i < lines.length && lines[i] !== '---') {
        frontmatterLines.push(lines[i]);
        i++;
    }
    
    if (i >= lines.length) {
        return { frontmatter: {}, content };
    }
    
    const frontmatter = {};
    const frontmatterText = frontmatterLines.join('\n');
    const contentText = lines.slice(i + 1).join('\n').trim();
    
    // Parse line by line to handle nested structures
    let currentKey = null;
    let inArray = false;
    let inLinks = false;
    let links = [];
    
    frontmatterLines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        
        // Check if we're starting a links array
        if (trimmed === 'links:' || trimmed.startsWith('links:')) {
            inLinks = true;
            links = [];
            return;
        }
        
        // Parse links array items
        if (inLinks) {
            if (trimmed.startsWith('-')) {
                // New link item
                const labelMatch = line.match(/label:\s*(.+)/);
                const urlMatch = frontmatterLines[idx + 1]?.match(/url:\s*(.+)/);
                if (labelMatch && urlMatch) {
                    links.push({
                        label: labelMatch[1].trim().replace(/^["']|["']$/g, ''),
                        url: urlMatch[1].trim().replace(/^["']|["']$/g, '')
                    });
                }
            } else if (trimmed && !trimmed.startsWith(' ') && trimmed.includes(':')) {
                // New key, end links
                frontmatter.links = links;
                inLinks = false;
            }
        }
        
        // Handle regular key: value pairs
        const keyValueMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.+)$/);
        if (keyValueMatch && !inLinks) {
            currentKey = keyValueMatch[1];
            let value = keyValueMatch[2].trim();
            
            // Check if it's an inline array: [item1, item2]
            if (value.startsWith('[') && value.endsWith(']')) {
                value = value.slice(1, -1)
                    .split(',')
                    .map(v => v.trim().replace(/^["']|["']$/g, ''));
                frontmatter[currentKey] = value;
                inArray = false;
            } else {
                // Check if next line starts with - (multi-line array)
                const nextLine = frontmatterLines[idx + 1]?.trim();
                if (nextLine && nextLine.startsWith('-')) {
                    // Multi-line array
                    const array = [];
                    for (let j = idx + 1; j < frontmatterLines.length; j++) {
                        const arrLine = frontmatterLines[j].trim();
                        if (arrLine.startsWith('-')) {
                            array.push(arrLine.slice(1).trim().replace(/^["']|["']$/g, ''));
                        } else if (arrLine && !arrLine.startsWith(' ') && arrLine.includes(':')) {
                            break;
                        }
                    }
                    frontmatter[currentKey] = array;
                    inArray = true;
                } else {
                    // Simple value
                    // Handle booleans
                    if (value === 'true') value = true;
                    else if (value === 'false') value = false;
                    // Handle numbers
                    else if (/^\d+$/.test(value)) value = parseInt(value);
                    // Handle null
                    else if (value === 'null') value = null;
                    // Remove quotes
                    else value = value.replace(/^["']|["']$/g, '');
                    
                    frontmatter[currentKey] = value;
                    inArray = false;
                }
            }
        }
    });
    
    // Close links if still open
    if (inLinks && links.length > 0) {
        frontmatter.links = links;
    }
    
    return { frontmatter, content: contentText };
}

// Simple markdown parser (handles paragraphs, headers, images, links)
function parseMarkdown(md) {
    if (!md) return '';
    
    // Split into blocks (paragraphs, headers, etc.)
    const blocks = md.split(/\n\n+/).filter(b => b.trim());
    
    const htmlBlocks = blocks.map(block => {
        block = block.trim();
        
        // Headers (must be at start of line)
        if (block.match(/^### /)) {
            return `<h3>${block.replace(/^### /, '').trim()}</h3>`;
        }
        if (block.match(/^## /)) {
            return `<h2>${block.replace(/^## /, '').trim()}</h2>`;
        }
        if (block.match(/^# /)) {
            return `<h2>${block.replace(/^# /, '').trim()}</h2>`;
        }
        
        // Process inline markdown within paragraphs
        let html = block;
        
        // Convert markdown images: ![alt](src) to <img>
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
        
        // Convert markdown links: [text](url) to <a>
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        
        // Convert bold: **text** to <strong>
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Convert italic: *text* to <em>
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Handle single newlines within paragraphs (convert to space)
        html = html.replace(/\n/g, ' ');
        
        // Wrap in paragraph tag
        return `<p>${html}</p>`;
    });
    
    return htmlBlocks.join('\n\n');
}

// Load projects.json
function loadProjects() {
    const projectsPath = path.join(__dirname, 'data', 'projects.json');
    const data = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
    return data.projects;
}

// Load markdown content and frontmatter for a project
function loadMarkdownFile(slug) {
    // Check in works/content/ first (organized structure)
    const mdPath = path.join(__dirname, 'works', 'content', `${slug}.md`);
    if (fs.existsSync(mdPath)) {
        const content = fs.readFileSync(mdPath, 'utf8');
        return parseFrontmatter(content);
    }
    // Fallback to works/ for backwards compatibility
    const fallbackPath = path.join(__dirname, 'works', `${slug}.md`);
    if (fs.existsSync(fallbackPath)) {
        const content = fs.readFileSync(fallbackPath, 'utf8');
        return parseFrontmatter(content);
    }
    return null;
}

// Generate HTML for a project
function generateProjectHTML(project, markdownContent) {
    const templatePath = path.join(__dirname, 'works', 'project-template.html');
    let html = fs.readFileSync(templatePath, 'utf8');
    
    // Replace title
    html = html.replace(/<title[^>]*>.*?<\/title>/i, `<title>${project.title} — pandjico</title>`);
    html = html.replace(/data-project-title[^>]*>.*?<\/h1>/i, `data-project-title>${project.title}</h1>`);
    
    // Generate tags HTML
    const tagsHTML = project.tags.map(tag => 
        `<button class="tag" data-tag="${tag}">#${tag}</button>`
    ).join('\n                    ');
    html = html.replace(/<div class="project-tags" data-project-tags>[\s\S]*?<\/div>/i, 
        `<div class="project-tags" data-project-tags>\n                    ${tagsHTML}\n                </div>`);
    
    // Replace date
    if (project.date) {
        html = html.replace(/data-project-date[^>]*>.*?<\/time>/i, 
            `data-project-date>${project.date}</time>`);
    } else {
        html = html.replace(/<time[^>]*data-project-date[^>]*>.*?<\/time>/i, '');
    }
    
    // Add hero image if present (before description)
    let heroImageHTML = '';
    if (project.hero_image) {
        heroImageHTML = `\n        <div class="project-hero-image" data-project-hero-image>\n            <img src="${project.hero_image}" alt="${project.title || 'Project hero image'}" />\n        </div>`;
    }
    
    // Replace description (hero image goes before description)
    if (project.description) {
        html = html.replace(/<div class="project-description" data-project-description>[\s\S]*?<\/div>/i,
            `${heroImageHTML}\n        <div class="project-description" data-project-description>\n            <p>${project.description}</p>\n        </div>`);
    } else {
        // If no description, hero image still goes after header
        if (heroImageHTML) {
            html = html.replace(/<div class="project-description" data-project-description>[\s\S]*?<\/div>/i, heroImageHTML);
        } else {
            html = html.replace(/<div class="project-description" data-project-description>[\s\S]*?<\/div>/i, '');
        }
    }

    // Replace content with markdown-parsed content (no hero image here - it's already above description)
    if (markdownContent) {
        const parsedContent = parseMarkdown(markdownContent);
        html = html.replace(/<div class="project-content" data-project-content>[\s\S]*?<\/div>/i,
            `<div class="project-content" data-project-content>\n            ${parsedContent}\n        </div>`);
    } else if (project.content) {
        // Fallback to JSON content if no markdown file
        const paragraphs = project.content.split('\n\n').filter(p => p.trim());
        const contentHTML = paragraphs.map(p => `<p>${p.trim()}</p>`).join('\n            ');
        html = html.replace(/<div class="project-content" data-project-content>[\s\S]*?<\/div>/i,
            `<div class="project-content" data-project-content>\n            ${contentHTML}\n        </div>`);
    } else {
        // No content
        html = html.replace(/<div class="project-content" data-project-content>[\s\S]*?<\/div>/i, '');
    }
    
    // Replace links
    if (project.links && project.links.length > 0) {
        const linksHTML = project.links.map(link => 
            `<a href="${link.url}" class="project-link">${link.label}</a>`
        ).join('\n            ');
        html = html.replace(/<div class="project-links" data-project-links>[\s\S]*?<\/div>/i,
            `<div class="project-links" data-project-links>\n            ${linksHTML}\n        </div>`);
    } else {
        html = html.replace(/<div class="project-links" data-project-links>[\s\S]*?<\/div>/i, '');
    }
    
    return html;
}

// Merge frontmatter with project data (frontmatter takes precedence)
function mergeProjectData(project, frontmatter) {
    const merged = { ...project };
    
    // Merge frontmatter fields
    if (frontmatter.title) merged.title = frontmatter.title;
    if (frontmatter.slug) merged.slug = frontmatter.slug;
    if (frontmatter.tags) merged.tags = frontmatter.tags;
    if (frontmatter.date !== undefined) merged.date = frontmatter.date;
    if (frontmatter.blurb !== undefined) merged.blurb = frontmatter.blurb;
    if (frontmatter.description !== undefined) merged.description = frontmatter.description;
    if (frontmatter.image !== undefined) merged.image = frontmatter.image;
    if (frontmatter.hero_image !== undefined) merged.hero_image = frontmatter.hero_image;
    if (frontmatter.featured !== undefined) merged.featured = frontmatter.featured;
    if (frontmatter.links !== undefined) merged.links = frontmatter.links;
    
    return merged;
}

// Main build function
function build(syncJson = false) {
    console.log('🚀 Building project pages...\n');
    
    const projects = loadProjects();
    const worksDir = path.join(__dirname, 'works');
    const projectsPath = path.join(__dirname, 'data', 'projects.json');
    
    // Ensure works directory exists
    if (!fs.existsSync(worksDir)) {
        fs.mkdirSync(worksDir, { recursive: true });
    }
    
    let built = 0;
    let skipped = 0;
    const updatedProjects = [];
    
    projects.forEach(project => {
        // Build ALL projects regardless of tags
        
        const outputPath = path.join(worksDir, `${project.slug}.html`);
        const markdownFile = loadMarkdownFile(project.slug);
        
        let finalProject = project;
        let markdownContent = null;
        
        if (markdownFile) {
            // Merge frontmatter with project data
            finalProject = mergeProjectData(project, markdownFile.frontmatter);
            markdownContent = markdownFile.content;
            
            if (markdownContent) {
                console.log(`✅ Building ${finalProject.slug}.html (from markdown + frontmatter)`);
            } else {
                console.log(`✅ Building ${finalProject.slug}.html (frontmatter only, no content)`);
            }
        } else if (project.content) {
            console.log(`✅ Building ${project.slug}.html (from JSON)`);
        } else {
            console.log(`⏭️  Skipping ${project.slug}.html (no content)`);
            skipped++;
            updatedProjects.push(project);
            return;
        }
        
        const html = generateProjectHTML(finalProject, markdownContent);
        fs.writeFileSync(outputPath, html, 'utf8');
        built++;
        
        // Add merged project to updated list
        updatedProjects.push(finalProject);
    });
    
    // Sync frontmatter back to projects.json if requested
    if (syncJson) {
        console.log('\n📝 Syncing frontmatter to projects.json...');
        const projectsData = { projects: updatedProjects };
        fs.writeFileSync(projectsPath, JSON.stringify(projectsData, null, 2) + '\n', 'utf8');
        console.log('✅ projects.json updated');
    }
    
    console.log(`\n✨ Build complete! ${built} files built, ${skipped} skipped.`);
    if (syncJson) {
        console.log('💡 Tip: Run without --sync to build without updating JSON');
    } else {
        console.log('💡 Tip: Run with --sync to update projects.json from frontmatter');
    }
}

// Run build
const syncJson = process.argv.includes('--sync');
build(syncJson);
