#!/usr/bin/env node

/**
 * Simple build script to generate project HTML files from:
 * - projects.json (metadata)
 * - project markdown files (content)
 * 
 * Usage: node build.js
 */

const fs = require('fs');
const path = require('path');

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

// Load markdown content for a project
function loadMarkdownContent(slug) {
    // Check in works/content/ first (organized structure)
    const mdPath = path.join(__dirname, 'works', 'content', `${slug}.md`);
    if (fs.existsSync(mdPath)) {
        return fs.readFileSync(mdPath, 'utf8');
    }
    // Fallback to works/ for backwards compatibility
    const fallbackPath = path.join(__dirname, 'works', `${slug}.md`);
    if (fs.existsSync(fallbackPath)) {
        return fs.readFileSync(fallbackPath, 'utf8');
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
    
    // Replace description
    if (project.description) {
        html = html.replace(/<div class="project-description" data-project-description>[\s\S]*?<\/div>/i,
            `<div class="project-description" data-project-description>\n            <p>${project.description}</p>\n        </div>`);
    } else {
        html = html.replace(/<div class="project-description" data-project-description>[\s\S]*?<\/div>/i, '');
    }
    
    // Replace content with markdown-parsed content
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

// Main build function
function build() {
    console.log('🚀 Building project pages...\n');
    
    const projects = loadProjects();
    const worksDir = path.join(__dirname, 'works');
    
    // Ensure works directory exists
    if (!fs.existsSync(worksDir)) {
        fs.mkdirSync(worksDir, { recursive: true });
    }
    
    let built = 0;
    let skipped = 0;
    
    projects.forEach(project => {
        if (project.category !== 'works') {
            return; // Only build works projects for now
        }
        
        const outputPath = path.join(worksDir, `${project.slug}.html`);
        const markdownContent = loadMarkdownContent(project.slug);
        
        if (markdownContent) {
            console.log(`✅ Building ${project.slug}.html (from markdown)`);
        } else if (project.content) {
            console.log(`✅ Building ${project.slug}.html (from JSON)`);
        } else {
            console.log(`⏭️  Skipping ${project.slug}.html (no content)`);
            skipped++;
            return;
        }
        
        const html = generateProjectHTML(project, markdownContent);
        fs.writeFileSync(outputPath, html, 'utf8');
        built++;
    });
    
    console.log(`\n✨ Build complete! ${built} files built, ${skipped} skipped.`);
}

// Run build
build();
