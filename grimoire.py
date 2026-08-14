#!/usr/bin/env python3
"""
Grimoire - Static Site Generator
===============================
https://github.com/TristanInSec/Grimoire

Converts Markdown files into a professional documentation website
with hierarchical navigation and AJAX page loading.

See README.md for full feature list and documentation.

Usage:
    python3 grimoire.py                           # Use config.json defaults
    python3 grimoire.py --input ./docs            # Override content directory
    python3 grimoire.py --output ./dist           # Override output directory
    python3 grimoire.py --config other.json       # Use different config
    python3 grimoire.py --template mytheme        # Use specific template
"""

import os
import sys
import shutil
import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
import re
import html

import markdown
import yaml


# =============================================================================
# DISPLAY NAME HANDLING
# =============================================================================


def strip_number_prefix(name: str) -> str:
    """
    Strip leading number prefix from folder/file names.
    Examples: 
        '01-fundamentals' -> 'fundamentals'
        '02_guides' -> 'guides'
        '03. Reference' -> 'Reference'
        '04 - Notes' -> 'Notes'
    """
    # Match: digits followed by any combo of dash, underscore, dot, space
    return re.sub(r'^\d+[\-_.\s]+', '', name)


def capitalize_with_acronyms(text: str, acronyms: set = None, lowercase_words: set = None) -> str:
    """
    Capitalize text with proper handling of acronyms and lowercase words.
    'api testing' -> 'API Testing' (if 'api' in acronyms)
    'rules of engagement' -> 'Rules of Engagement' (if 'of' in lowercase_words)
    """
    if acronyms is None:
        acronyms = set()
    if lowercase_words is None:
        lowercase_words = set()
    words = text.split()
    result = []
    
    for i, word in enumerate(words):
        word_lower = word.lower()
        
        # Check if it's a known acronym
        if word_lower in acronyms:
            result.append(word.upper())
        # Preserve words that are already all uppercase (2+ chars)
        elif len(word) >= 2 and word.isupper():
            result.append(word)
        # First word is always capitalized
        elif i == 0:
            result.append(word.capitalize())
        # Keep lowercase if in lowercase_words list
        elif word_lower in lowercase_words:
            result.append(word_lower)
        else:
            result.append(word.capitalize())
    
    return " ".join(result)


def format_display_name(name: str, strip_prefix: bool = True, acronyms: set = None, 
                        overrides: dict = None, lowercase_words: set = None) -> str:
    """
    Convert a folder/file name to a human-readable display name.
    
    Args:
        name: The folder or file name to format
        strip_prefix: If True, format the name (strip numbers, capitalize, etc.)
                     If False, return the name unchanged
        acronyms: Set of words to uppercase (from config)
        overrides: Dict of exact name -> display name mappings (from config)
        lowercase_words: Set of words to keep lowercase unless first word (from config)
    """
    if not strip_prefix:
        return name
    
    if overrides is None:
        overrides = {}
    
    # Check overrides first (before stripping numbers)
    if name in overrides:
        return overrides[name]
    
    # Strip number prefix
    stripped = strip_number_prefix(name)
    
    # Check overrides again (after stripping)
    if stripped in overrides:
        return overrides[stripped]
    
    # Convert hyphens/underscores to spaces and capitalize with acronyms
    display = stripped.replace('-', ' ').replace('_', ' ')
    return capitalize_with_acronyms(display, acronyms, lowercase_words)


# =============================================================================
# MAIN CONVERTER CLASS
# =============================================================================

class MarkdownToHtmlConverter:
    """
    Core converter class that processes Markdown files and generates HTML output.
    
    The converter handles:
        - Directory scanning and file discovery
        - Markdown parsing with YAML frontmatter extraction
        - Navigation tree generation with multi-level hierarchy
        - Template rendering with placeholder substitution
        - Asset copying and path resolution
    
    Attributes:
        site_name: Display name for the documentation site
        description: Site tagline/description shown in header
        output_dir: Target directory for generated files
        all_pages: List of processed page data dictionaries
        categories: Mapping of category names to their pages
    """
    
    def __init__(self, site_name='Documentation', description='Documentation Platform', output_dir='output'):
        self.site_name = site_name
        self.description = description
        self.output_dir = Path(output_dir)
        self.all_pages = []
        self.categories = {}
        self.config = {}
        self.site_url = ''
        
        # Initialize markdown converter
        self.md = markdown.Markdown(extensions=[
            'extra',
            'fenced_code',
            'tables',
            'toc'
        ])
    
    @property
    def strip_prefix(self) -> bool:
        """Get strip_number_prefix setting from config (default: True)"""
        return self.config.get('ui', {}).get('strip_number_prefix', True)
    
    @property
    def acronyms(self) -> set:
        """Get acronyms set from config"""
        return set(self.config.get('formatting', {}).get('acronyms', []))
    
    @property
    def display_overrides(self) -> dict:
        """Get display name overrides from config"""
        return self.config.get('formatting', {}).get('display_name_overrides', {})
    
    @property
    def lowercase_words(self) -> set:
        """Get lowercase words set from config (words to keep lowercase unless first word)"""
        configured = self.config.get('formatting', {}).get('lowercase_words', [])
        return set(configured)
    
    @property
    def pin_to_top(self) -> list:
        """Get list of filenames (without extension) to pin to top of navigation"""
        return self.config.get('ui', {}).get('pin_to_top', ['overview', 'index'])
    
    # =========================================================================
    # SEO HELPER METHODS
    # =========================================================================
    
    def generate_page_title(self, page: Dict[str, Any] = None, page_type: str = 'content') -> str:
        """Generate SEO-optimized page title"""
        if page_type == 'index':
            return f"{self.site_name} - {self.description}"
        elif page_type == 'static':
            return f"{page.get('title', 'Page')} | {self.site_name}"
        else:
            title = page.get('title', 'Article')
            levels = page.get('levels', [])
            if levels:
                return f"{title} - {levels[0]} | {self.site_name}"
            return f"{title} | {self.site_name}"
    
    def generate_meta_description(self, page: Dict[str, Any] = None, page_type: str = 'content') -> str:
        """Generate meta description for SEO"""
        seo_config = self.config.get('seo', {})
        
        if page_type == 'index':
            template = seo_config.get('index_description', 
                f"{self.site_name} - comprehensive documentation and guides.")
            return template.replace('{site_name}', self.site_name)[:160]
        
        # Try to get description from frontmatter
        if page and page.get('frontmatter', {}).get('description'):
            return page['frontmatter']['description'][:160]
        
        # Generate from page hierarchy
        if page:
            title = page.get('title', '')
            levels = page.get('levels', [])
            
            template = seo_config.get('page_description_template',
                "Learn about {title} in {category}. Documentation from {site_name}.")
            
            # Use deepest level as category, or first level, or 'General'
            category = levels[-1] if levels else 'General'
            
            return template.replace('{title}', title).replace(
                '{category}', category).replace('{site_name}', self.site_name)[:160]
        
        return self.description[:160]
    
    def generate_meta_keywords(self, page: Dict[str, Any] = None, page_type: str = 'content') -> str:
        """Generate meta keywords"""
        seo_config = self.config.get('seo', {})
        # Use single 'keywords' field (fallback to old fields for backward compatibility)
        base_keywords = seo_config.get('keywords', seo_config.get('base_keywords', 'documentation, guides, tutorials'))
        
        if page_type == 'index':
            return base_keywords
        
        if page:
            keywords = [base_keywords]
            # Add all levels as keywords
            for level in page.get('levels', []):
                keywords.append(level.lower())
            if page.get('title'):
                keywords.append(page['title'].lower())
            return ', '.join(keywords)
        
        return base_keywords
    
    def generate_canonical_url(self, page_url: str = '') -> str:
        """Generate canonical URL"""
        base_url = self.site_url.rstrip('/')
        if not page_url:
            return base_url
        return f"{base_url}/{page_url.lstrip('/')}"
    
    def generate_og_image_url(self, assets_path: str = '') -> str:
        """Generate absolute OG image URL"""
        base_url = self.site_url.rstrip('/')
        return f"{base_url}/assets/img/og-image.jpg"
    
    def generate_json_ld(self, page: Dict[str, Any] = None, page_type: str = 'content', page_url: str = '') -> str:
        """Generate JSON-LD structured data"""
        base_url = self.site_url.rstrip('/')
        
        if page_type == 'index':
            json_ld = {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": self.site_name,
                "description": self.description,
                "url": base_url,
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": f"{base_url}/?q={{search_term_string}}",
                    "query-input": "required name=search_term_string"
                }
            }
        else:
            canonical = self.generate_canonical_url(page_url)
            json_ld = {
                "@context": "https://schema.org",
                "@type": "TechArticle",
                "headline": page.get('title', 'Article') if page else 'Article',
                "description": self.generate_meta_description(page, page_type),
                "url": canonical,
                "author": {
                    "@type": "Organization",
                    "name": self.site_name
                },
                "publisher": {
                    "@type": "Organization",
                    "name": self.site_name,
                    "logo": {
                        "@type": "ImageObject",
                        "url": f"{base_url}/assets/img/og-image.jpg"
                    }
                },
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": canonical
                }
            }
            
            if page and page.get('levels'):
                json_ld["articleSection"] = page['levels'][0]
        
        return f'<script type="application/ld+json">\n{json.dumps(json_ld, indent=2)}\n</script>'
    
    def generate_sitemap(self) -> str:
        """Generate sitemap.xml content"""
        base_url = self.site_url.rstrip('/')
        today = datetime.now().strftime('%Y-%m-%d')
        
        urls = []
        
        # Homepage
        urls.append(f'''  <url>
    <loc>{base_url}/</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>''')
        
        # Static pages
        for static_page in ['about.html', 'contribute.html']:
            urls.append(f'''  <url>
    <loc>{base_url}/{static_page}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>''')
        
        # Content pages
        for page in self.all_pages:
            page_url = page['url']
            urls.append(f'''  <url>
    <loc>{base_url}/{page_url}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>''')
        
        sitemap = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>'''
        
        return sitemap
    
    def generate_robots_txt(self) -> str:
        """Generate robots.txt content"""
        base_url = self.site_url.rstrip('/')
        return f'''# Robots.txt - Generated by Grimoire
User-agent: *
Allow: /

# Sitemap
Sitemap: {base_url}/sitemap.xml

# Crawl-delay (optional)
Crawl-delay: 1
'''
    
    def get_seo_replacements(self, page: Dict[str, Any] = None, page_type: str = 'content', 
                              page_url: str = '', assets_path: str = 'assets/') -> Dict[str, str]:
        """Get all SEO-related template replacements"""
        return {
            '{{PAGE_TITLE}}': self.generate_page_title(page, page_type),
            '{{META_DESCRIPTION}}': self.generate_meta_description(page, page_type),
            '{{META_KEYWORDS}}': self.generate_meta_keywords(page, page_type),
            '{{CANONICAL_URL}}': self.generate_canonical_url(page_url),
            '{{OG_TITLE}}': page.get('title', self.site_name) if page else self.site_name,
            '{{OG_IMAGE_URL}}': self.generate_og_image_url(assets_path),
            '{{JSON_LD}}': self.generate_json_ld(page, page_type, page_url)
        }
    
    def parse_frontmatter(self, content: str) -> tuple[Dict[str, Any], str]:
        """Parse frontmatter from markdown content (YAML --- or % format)"""
        
        # Handle YAML frontmatter (---)
        if content.startswith('---'):
            try:
                parts = content.split('---', 2)
                if len(parts) >= 3:
                    frontmatter = yaml.safe_load(parts[1]) or {}
                    markdown_content = parts[2].strip()
                    return frontmatter, markdown_content
            except Exception as e:
                print(f"[!] Frontmatter parsing error: {e}")
            return {}, content
        
        # Handle % prefix frontmatter (alternative format)
        if content.startswith('%'):
            frontmatter = {}
            lines = content.split('\n')
            content_start = 0
            
            for i, line in enumerate(lines):
                if line.startswith('%'):
                    # Parse "% Key: Value" format
                    line_content = line[1:].strip()
                    if ':' in line_content:
                        key, value = line_content.split(':', 1)
                        key = key.strip().lower().replace(' ', '_')
                        frontmatter[key] = value.strip()
                    content_start = i + 1
                else:
                    # First non-% line ends frontmatter
                    break
            
            markdown_content = '\n'.join(lines[content_start:]).strip()
            return frontmatter, markdown_content
        
        return {}, content
    
    def extract_title_from_markdown(self, content: str) -> Optional[str]:
        """Extract title from first H1 in markdown"""
        match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        return match.group(1) if match else None
    
    def format_category_name(self, name: str) -> str:
        """Format folder name to display name."""
        if not name:
            return ''
        return format_display_name(name, self.strip_prefix, self.acronyms, self.display_overrides, self.lowercase_words)
    
    def get_page_hierarchy(self, file_path: Path, root_dir: Path) -> Dict[str, Any]:
        """
        Extract page hierarchy from file path.
        Returns levels as arrays for unlimited depth support.
        """
        relative_path = file_path.relative_to(root_dir)
        parts = [p for p in relative_path.parts[:-1]]  # All folders except filename
        
        # Build levels arrays
        levels_raw = parts  # Raw folder names
        levels = [format_display_name(p, self.strip_prefix, self.acronyms, self.display_overrides, self.lowercase_words) for p in parts]  # Display names
        
        # Build category string (all levels joined)
        category = ' > '.join(levels) if levels else 'General'
        
        return {
            'levels_raw': levels_raw,
            'levels': levels,
            'category': category,
            'depth': len(levels)
        }
    
    def generate_page_id(self, file_path: Path, root_dir: Path) -> str:
        """Generate unique page ID from file path"""
        relative_path = file_path.relative_to(root_dir)
        return str(relative_path.with_suffix('')).replace('/', '-').replace('\\', '-')
    
    def generate_page_url(self, file_path: Path, root_dir: Path) -> str:
        """Generate page URL based on file path"""
        relative_path = file_path.relative_to(root_dir)
        return str(relative_path.with_suffix('.html')).replace('\\', '/')
    
    def fix_prism_language_classes(self, html_content: str) -> str:
        """Fix Prism.js language classes for better compatibility."""
        language_mappings = {
            'language-http': 'language-none',
            'language-plaintext': 'language-none',
        }
        
        for old_class, new_class in language_mappings.items():
            html_content = html_content.replace(f'class="{old_class}"', f'class="{new_class}"')
        
        return html_content
    
    def calculate_reading_time(self, content: str) -> int:
        """Calculate estimated reading time in minutes"""
        words = len(content.split())
        return max(1, round(words / 200))
    
    def process_markdown_file(self, file_path: Path, root_dir: Path) -> Dict[str, Any]:
        """Process individual markdown file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            frontmatter, markdown_content = self.parse_frontmatter(content)
            hierarchy = self.get_page_hierarchy(file_path, root_dir)
            
            title = (
                frontmatter.get('display_name') or
                frontmatter.get('title') or
                format_display_name(file_path.stem, self.strip_prefix, self.acronyms, self.display_overrides, self.lowercase_words)
            )
            
            html_content = self.md.convert(markdown_content)
            html_content = self.fix_prism_language_classes(html_content)
            html_content = re.sub(r'href="([^"]+)\.md"', r'href="\1.html"', html_content) # Convert .md links to .html links
            
            page_id = self.generate_page_id(file_path, root_dir)
            page_url = self.generate_page_url(file_path, root_dir)
            reading_time = self.calculate_reading_time(markdown_content)
            
            icon = frontmatter.get('icon', '')
            
            page_data = {
                'id': page_id,
                'url': page_url,
                'title': title,
                'icon': icon,
                'levels_raw': hierarchy['levels_raw'],
                'levels': hierarchy['levels'],
                'depth': hierarchy['depth'],
                'category': hierarchy['category'],
                'html_content': html_content,
                'reading_time': reading_time,
                'file_path': file_path,
                'relative_path': file_path.relative_to(root_dir),
                'frontmatter': frontmatter
            }
            
            return page_data
            
        except Exception as e:
            print(f"[!] Error processing {file_path}: {e}")
            return None
    
    def scan_directory(self, content_dir: Path) -> List[Dict[str, Any]]:
        """Scan directory for markdown files and process them"""
        pages = []
        
        if not content_dir.exists():
            print(f"[!] Content directory not found: {content_dir}")
            return pages
        
        # Get exclusion list from config (supports legacy 'exclude_folders' key)
        exclusions = self.config.get('paths', {}).get('exclusions', 
            self.config.get('paths', {}).get('exclude_folders', [
                '.trash', '.obsidian', '.git', '__pycache__', 'node_modules'
            ])
        )
        
        def is_valid_name(name: str) -> bool:
            """Check if a name is valid (not just separators/special chars)"""
            # Remove extension if present
            name_without_ext = name.rsplit('.', 1)[0] if '.' in name else name
            # Strip common separator characters
            stripped = name_without_ext.strip('-_=. ')
            # Must have at least some alphanumeric content
            return bool(stripped) and any(c.isalnum() for c in stripped)
        
        # Find all markdown files, excluding specified folders
        md_files = []
        for f in content_dir.rglob('*.md'):
            if f.name == 'index.md':
                continue
            # Check if any parent folder is in exclusion list
            if any(excluded in f.parts for excluded in exclusions):
                continue
            # Skip files with invalid names (just separators)
            if not is_valid_name(f.stem):
                continue
            # Skip files in folders with invalid names
            if any(not is_valid_name(part) for part in f.relative_to(content_dir).parts[:-1]):
                continue
            md_files.append(f)
        
        for md_file in sorted(md_files):
            page_data = self.process_markdown_file(md_file, content_dir)
            if page_data:
                pages.append(page_data)
                
                # Use first level for categorization
                level1 = page_data['levels_raw'][0] if page_data['levels_raw'] else 'General'
                if level1 not in self.categories:
                    self.categories[level1] = []
                self.categories[level1].append(page_data)
        
        return pages
    
    def get_category_icon(self, category: str) -> str:
        """Get FontAwesome icon class for a category."""
        config_icons = self.config.get('ui', {}).get('category_icons', {})
        
        category_lower = category.lower()
        category_stripped = strip_number_prefix(category_lower).replace('-', ' ')
        category_hyphen = strip_number_prefix(category_lower)
        
        for key in [category_lower, category_stripped, category_hyphen, category]:
            if key in config_icons:
                return config_icons[key]
        
        # Generic fallback icons
        default_icons = {
            'getting started': 'fas fa-rocket',
            'getting-started': 'fas fa-rocket',
            'guides': 'fas fa-book',
            'tutorials': 'fas fa-graduation-cap',
            'api': 'fas fa-plug',
            'api reference': 'fas fa-plug',
            'examples': 'fas fa-code',
            'tools': 'fas fa-tools',
            'reference': 'fas fa-bookmark',
            'configuration': 'fas fa-cog',
            'deployment': 'fas fa-rocket',
            'security': 'fas fa-shield-alt',
        }
        
        for key in [category_stripped, category_hyphen]:
            if key in default_icons:
                return default_icons[key]
        
        return self.config.get('ui', {}).get('default_icon', 'fas fa-folder')
    
    def generate_navigation_html_for_depth(self, depth: int = 0) -> str:
        """Generate hierarchical navigation HTML with collapsible categories (unlimited depth)."""
        
        # Check if bookmarks are enabled
        show_bookmarks = self.config.get('ui', {}).get('show_bookmarks', True)
        
        def build_tree(pages):
            """Build a recursive tree structure from flat page list."""
            tree = {}
            for page in pages:
                levels_raw = page['levels_raw']
                levels = page['levels']
                
                if not levels_raw:
                    # Root level page
                    if '__pages__' not in tree:
                        tree['__pages__'] = []
                    tree['__pages__'].append(page)
                else:
                    # Navigate/create path in tree
                    current = tree
                    for i, level_raw in enumerate(levels_raw):
                        if level_raw not in current:
                            current[level_raw] = {
                                '__display__': levels[i],
                                '__pages__': [],
                            }
                        current = current[level_raw]
                    current['__pages__'].append(page)
            return tree
        
        def render_sublevel(node, parent_id, level_depth, url_prefix):
            """Recursively render a sublevel of navigation."""
            html_parts = []
            
            # Get subfolders and pages
            subfolders = {k: v for k, v in sorted(node.items()) if not k.startswith('__')}
            
            # Sort pages: pinned first (by pin order), then by filename stem
            # Stem sorting preserves number prefixes (01-overview before 02-osint)
            pin_list = self.pin_to_top
            pages = sorted(node.get('__pages__', []), key=lambda p: (
                pin_list.index(p['file_path'].stem) if p['file_path'].stem in pin_list else len(pin_list),
                p['file_path'].stem
            ))

            for folder_raw, folder_data in subfolders.items():
                folder_display = folder_data.get('__display__', folder_raw)
                folder_id = f"{parent_id}-{folder_raw.lower().replace(' ', '-').replace('&', 'and')}"
                
                # Choose styling based on depth
                if level_depth == 1:
                    # Second level (subcategory)
                    html_parts.append(f'''
                        <div class="nav-subcategory">
                            <button class="subcategory-header" data-category="{folder_id}">
                                <span><i class="fas fa-folder-open"></i> {html.escape(folder_display)}</span>
                                <i class="fas fa-chevron-right subcategory-chevron"></i>
                            </button>
                            <div class="subcategory-items" id="{folder_id}">''')
                else:
                    # Deeper levels (level 3+)
                    html_parts.append(f'''
                                <div class="nav-level-deep" data-depth="{level_depth}">
                                    <button class="deep-header" data-category="{folder_id}">
                                        <span><i class="fas fa-angle-right deep-chevron"></i> {html.escape(folder_display)}</span>
                                    </button>
                                    <div class="deep-items" id="{folder_id}">''')
                
                # Recursively render children
                html_parts.append(render_sublevel(folder_data, folder_id, level_depth + 1, url_prefix))
                
                # Close tags
                if level_depth == 1:
                    html_parts.append('''
                            </div>
                        </div>''')
                else:
                    html_parts.append('''
                                    </div>
                                </div>''')
            
            # Render pages at this level
            for page in pages:
                page_url = url_prefix + page['url']
                indent_class = f"nav-item-depth-{level_depth}" if level_depth > 0 else "nav-item"
                bookmark_btn = f'<button class="bookmark-btn" data-page="{page["id"]}"><i class="far fa-bookmark"></i></button>' if show_bookmarks else ''
                html_parts.append(f'''
                                <a href="{page_url}" class="nav-item {indent_class}" data-page="{page['id']}">
                                    <span class="nav-item-text">{html.escape(page['title'])}</span>
                                    {bookmark_btn}
                                </a>''')
            
            return ''.join(html_parts)
        
        # Build tree and generate HTML
        tree = build_tree(self.all_pages)
        prefix = '../' * depth if depth > 0 else ''
        nav_html = []
        
        # Get top-level categories
        categories = {k: v for k, v in sorted(tree.items()) if not k.startswith('__')}
        
        # Split root pages into pinned (display before categories) and unpinned (after)
        pin_list = self.pin_to_top
        all_root_pages = tree.get('__pages__', [])
        pinned_pages = sorted(
            [p for p in all_root_pages if p['file_path'].stem in pin_list],
            key=lambda p: (pin_list.index(p['file_path'].stem), p['file_path'].stem)
        )
        unpinned_pages = sorted(
            [p for p in all_root_pages if p['file_path'].stem not in pin_list],
            key=lambda p: p['file_path'].stem
        )
        
        # Render pinned root pages BEFORE categories
        for page in pinned_pages:
            page_url = prefix + page['url']
            bookmark_btn = f'<button class="bookmark-btn" data-page="{page["id"]}"><i class="far fa-bookmark"></i></button>' if show_bookmarks else ''
            nav_html.append(f'''
                <a href="{page_url}" class="nav-item nav-item-pinned" data-page="{page['id']}">
                    <span class="nav-item-text">{html.escape(page['title'])}</span>
                    {bookmark_btn}
                </a>''')
        
        for level1_raw, level1_data in categories.items():
            icon_class = self.get_category_icon(level1_raw)
            level1_id = level1_raw.lower().replace(' ', '-').replace('&', 'and')
            level1_display = level1_data.get('__display__', level1_raw)
            
            nav_html.append(f'''
                <div class="nav-category">
                    <button class="category-header" data-category="{level1_id}">
                        <span>
                            <i class="{icon_class} category-icon"></i>
                            {html.escape(level1_display)}
                        </span>
                        <i class="fas fa-chevron-right category-chevron"></i>
                    </button>
                    <div class="category-items" id="{level1_id}">''')
            
            # Render all sublevels recursively
            nav_html.append(render_sublevel(level1_data, level1_id, 1, prefix))
            
            nav_html.append('''
                    </div>
                </div>''')
        
        # Remaining root pages (unpinned) after categories
        for page in unpinned_pages:
            page_url = prefix + page['url']
            bookmark_btn = f'<button class="bookmark-btn" data-page="{page["id"]}"><i class="far fa-bookmark"></i></button>' if show_bookmarks else ''
            nav_html.append(f'''
                <a href="{page_url}" class="nav-item" data-page="{page['id']}">
                    <span class="nav-item-text">{html.escape(page['title'])}</span>
                    {bookmark_btn}
                </a>''')
        
        return ''.join(nav_html)
    
    def escape_js_string(self, s: str) -> str:
        """Escape a string for safe inclusion in JavaScript"""
        if s is None:
            return ''
        return s.replace('\\', '\\\\').replace("'", "\\'").replace('"', '\\"').replace('\n', '\\n').replace('\r', '\\r')
    
    def generate_page_data_js(self) -> str:
        """Generate JavaScript page data with full hierarchy info for breadcrumbs"""
        js_data = "window.pageData = {\n"
        for page in self.all_pages:
            title_escaped = self.escape_js_string(page['title'])
            category_escaped = self.escape_js_string(page['category'])
            levels_escaped = [self.escape_js_string(l) for l in page['levels']]
            levels_js = "[" + ", ".join(f"'{l}'" for l in levels_escaped) + "]"
            
            js_data += f"    '{page['id']}': {{\n"
            js_data += f"        page: '{title_escaped}',\n"
            js_data += f"        category: '{category_escaped}',\n"
            js_data += f"        url: '{page['url']}',\n"
            js_data += f"        levels: {levels_js},\n"
            js_data += f"        reading_time: {page['reading_time']}\n"
            js_data += "    },\n"
        js_data += "};\n"
        return js_data
    
    def generate_site_config_js(self) -> str:
        """Generate JavaScript configuration object"""
        return f'''window.siteConfig = {{
    siteName: '{self.escape_js_string(self.site_name)}',
    siteUrl: '{self.escape_js_string(self.site_url)}'
}};
'''
    
    def generate_shared_data_file(self, site_config_js: str, page_data_js: str):
        """Generate shared site-data.js file containing config, page data, and navigation HTML.

        This avoids embedding ~250KB of identical data into every HTML page.
        Instead, each page loads this single cached file via <script src>.
        """
        # Collect unique navigation HTML per depth level
        depths = set()
        for page in self.all_pages:
            depth = len(page['relative_path'].parts) - 1
            depths.add(depth)
        depths.add(0)  # index + static pages always use depth 0

        nav_data_js = "window.navData = {\n"
        for depth in sorted(depths):
            nav_html = self.generate_navigation_html_for_depth(depth)
            escaped = nav_html.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
            nav_data_js += f"    {depth}: `{escaped}`,\n"
        nav_data_js += "};\n"

        shared_content = site_config_js + page_data_js + nav_data_js

        output_file = self.output_dir / 'assets' / 'js' / 'site-data.js'
        output_file.parent.mkdir(parents=True, exist_ok=True)
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(shared_content)
        print(f"[+] Generated: {output_file} ({len(shared_content) // 1024}KB shared data)")

    def generate_recent_section(self) -> str:
        """Generate Recent section HTML if enabled in config"""
        show_recent = self.config.get('ui', {}).get('show_recent', True)
        if not show_recent:
            return ''
        
        return '''<!-- Recent -->
            <div class="quick-access">
                <div class="quick-access-title" id="recentTitle" data-section="recent">
                    <div class="title-left">
                        <button class="collapse-btn" id="collapseRecent">
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <span class="title-text">Recent</span>
                    </div>
                    <button class="clear-btn" id="clearRecent">Clear</button>
                </div>
                <div class="collapsible-content" id="recentContent">
                    <div id="recentItems"></div>
                </div>
            </div>'''
    
    def generate_bookmarks_section(self) -> str:
        """Generate Bookmarks section HTML if enabled in config"""
        show_bookmarks = self.config.get('ui', {}).get('show_bookmarks', True)
        if not show_bookmarks:
            return ''
        
        return '''<!-- Bookmarks -->
            <div class="favorites-section">
                <div class="quick-access-title" id="bookmarksTitle" data-section="bookmarks">
                    <div class="title-left">
                        <button class="collapse-btn" id="collapseBookmarks">
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <span class="title-text">Bookmarks</span>
                    </div>
                    <button class="clear-btn" id="clearBookmarks">Clear</button>
                </div>
                <div class="collapsible-content" id="bookmarksContent">
                    <div id="bookmarkedItems"></div>
                </div>
            </div>'''
    
    def generate_footer_bottom(self, generation_date: str, current_year: int) -> str:
        """Generate footer bottom HTML based on config"""
        footer_config = self.config.get('footer', {})
        show_copyright = footer_config.get('show_copyright', True)
        show_timestamp = footer_config.get('show_timestamp', True)
        show_powered_by = footer_config.get('show_powered_by', True)
        custom_copyright = footer_config.get('copyright_text', '')
        
        lines = []
        
        # Copyright line
        if show_copyright:
            if custom_copyright:
                copyright_text = custom_copyright.replace('{year}', str(current_year)).replace('{site_name}', self.site_name)
            else:
                copyright_text = f"&copy; {current_year} {html.escape(self.site_name)}"
            
            if show_timestamp:
                copyright_text += f". Generated on {generation_date}."
            else:
                copyright_text += "."
            
            lines.append(f'<p>{copyright_text}</p>')
        elif show_timestamp:
            lines.append(f'<p>Generated on {generation_date}.</p>')
        
        # Powered by line
        if show_powered_by:
            lines.append('<p class="powered-by">Made with <i class="fas fa-heart heart-icon"></i> using <a href="https://github.com/TristanInSec/Grimoire" target="_blank" rel="noopener">Grimoire</a></p>')
        
        if not lines:
            return ''
        
        return f'''<div class="footer-bottom">
            <div class="footer-bottom-content">
                {chr(10).join(' ' * 16 + line for line in lines)}
            </div>
        </div>'''
    
    def generate_contribute_button(self, contribute_url: str) -> str:
        """Generate contribute button HTML if enabled in config"""
        ui_config = self.config.get('ui', {})
        show_contribute = ui_config.get('show_contribute', True)
        if not show_contribute:
            return ''
        
        contribute_text = ui_config.get('contribute_text', 'Contribute')
        return f'''<a href="{contribute_url}" class="contribute-btn" id="contributeBtn">
                <i class="fas fa-edit"></i>
                <span class="contribute-text">{html.escape(contribute_text)}</span>
            </a>'''
    
    def generate_contribute_footer_link(self, contribute_url: str) -> str:
        """Generate contribute footer link HTML if enabled in config"""
        ui_config = self.config.get('ui', {})
        show_contribute = ui_config.get('show_contribute', True)
        if not show_contribute:
            return ''
        
        contribute_text = ui_config.get('contribute_text', 'Contribute')
        return f'<li><a href="{contribute_url}">{html.escape(contribute_text)}</a></li>'
    
    def load_index_md(self):
        """Load and convert index.md if it exists"""
        index_path = self.content_dir / 'index.md'
        if not index_path.exists():
            return None
        
        with open(index_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                content = parts[2].strip()
        
        md = markdown.Markdown(extensions=['extra', 'fenced_code', 'tables'])
        html_content = md.convert(content)
        return f'<div class="article-content">{html_content}</div>'

    def generate_breadcrumb_html(self, page: Dict[str, Any], home_url: str, generation_date: str) -> str:
        """Generate breadcrumb HTML for a specific page (unlimited levels)"""
        levels = page.get('levels', [])
        
        # Build breadcrumb parts
        breadcrumb_parts = [f'''<a href="{home_url}" class="breadcrumb-home" data-page="welcome">
                        <i class="fas fa-home"></i> {html.escape(self.site_name)}
                    </a>''']
        
        for i, level in enumerate(levels):
            breadcrumb_parts.append(f'''<span class="breadcrumb-separator">›</span>
                    <span class="breadcrumb-level" data-level="{i+1}">{html.escape(level)}</span>''')
        
        # Add page title
        breadcrumb_parts.append(f'''<span class="breadcrumb-separator">›</span>
                    <span class="breadcrumb-page" id="breadcrumbPage">{html.escape(page['title'])}</span>''')
        
        breadcrumb_html = f'''<nav class="breadcrumb-nav">
                <div class="breadcrumb" id="breadcrumb">
                    {''.join(breadcrumb_parts)}
                </div>
                <div class="breadcrumb-meta" id="breadcrumbMeta">
                    <span class="reading-time"><i class="fas fa-clock"></i> {page['reading_time']} min read</span>
                    <span id="lastUpdated">Generated {generation_date}</span>
                </div>
            </nav>'''
        
        return breadcrumb_html
    
    def generate_index_content(self, generation_date: str) -> str:
        """Generate welcome content for index.html"""
        # Check for custom index.md
        custom_content = self.load_index_md()
        if custom_content:
            breadcrumb = f'''<nav class="breadcrumb-nav">
                <div class="breadcrumb" id="breadcrumb">
                    <span class="breadcrumb-home">
                        <i class="fas fa-home"></i> {html.escape(self.site_name)}
                    </span>
                </div>
                <div class="breadcrumb-meta" id="breadcrumbMeta">
                    <span id="lastUpdated">Generated {generation_date}</span>
                </div>
            </nav>'''
            return breadcrumb + custom_content
        
        # Default welcome content
        category_count = len([c for c in self.categories if c != 'General'])
        page_count = len(self.all_pages)
        
        # Generate quick links
        quick_links = []
        for i, (cat_raw, pages) in enumerate(sorted(self.categories.items())[:6]):
            cat_display = format_display_name(cat_raw, self.strip_prefix, self.acronyms, self.display_overrides)
            icon = self.get_category_icon(cat_raw)
            if pages:
                first_page = pages[0]
                quick_links.append(f'''
                    <a href="{first_page['url']}" class="welcome-card" data-page="{first_page['id']}">
                        <i class="{icon}"></i>
                        <span>{html.escape(cat_display)}</span>
                    </a>''')

        return f'''<nav class="breadcrumb-nav">
            <div class="breadcrumb" id="breadcrumb">
                <span class="breadcrumb-home">
                    <i class="fas fa-home"></i> {html.escape(self.site_name)}
                </span>
            </div>
            <div class="breadcrumb-meta" id="breadcrumbMeta">
                <span id="lastUpdated">Generated {generation_date}</span>
            </div>
        </nav>
        <div class="article-content">
            <div class="welcome-section">
                <h1 class="welcome-title">
                    <span class="title-icon"><i class="fas fa-book-open"></i></span>
                    Welcome to {html.escape(self.site_name)}
                </h1>
                <p class="welcome-description">
                    {html.escape(self.description)}. Browse {page_count} articles across {category_count} categories.
                </p>

                <div class="welcome-cards">
                    {''.join(quick_links)}
                </div>

                <div class="welcome-search-prompt">
                    <p><i class="fas fa-lightbulb"></i> Use the search bar or browse categories to find what you need.</p>
                </div>
            </div>
        </div>'''
    
    def generate_index(self, template: str, navigation_html: str, site_config_js: str, 
                       page_data_js: str, generation_date: str, current_year: int, site_name_initial: str):
        """Generate index.html"""
        index_content = self.generate_index_content(generation_date)
        
        seo_replacements = self.get_seo_replacements(None, 'index', '', 'assets/')
        
        index_html = template
        replacements = {
            '{{SITE_NAME}}': self.site_name,
            '{{SITE_DESCRIPTION}}': self.description,
            '{{NAVIGATION_HTML}}': '',
            '{{DYNAMIC_PAGE_DATA}}': "window.currentPageId = 'welcome'; window.pageDepth = 0;",
            '{{GENERATION_DATE}}': generation_date,
            '{{CURRENT_YEAR}}': str(current_year),
            '{{SITE_NAME_INITIAL}}': site_name_initial,
            '{{DYNAMIC_CONTENT_PLACEHOLDER}}': index_content,
            '{{TOTAL_PAGES}}': str(len(self.all_pages)),
            '{{TOTAL_CATEGORIES}}': str(len([c for c in self.categories if c != 'General'])),
            '{{HOME_URL}}': './index.html',
            '{{ASSETS_PATH}}': 'assets/',
            '{{CONTRIBUTE_URL}}': self.config.get('ui', {}).get('contribute_url', './contribute.html'),
            '{{CONTRIBUTE_BUTTON}}': self.generate_contribute_button('./contribute.html'),
            '{{CONTRIBUTE_FOOTER_LINK}}': self.generate_contribute_footer_link('./contribute.html'),
            '{{ABOUT_URL}}': './about.html',
            '{{GITHUB_URL}}': self.config.get('site', {}).get('github_url', '#'),
            '{{RECENT_SECTION}}': self.generate_recent_section(),
            '{{BOOKMARKS_SECTION}}': self.generate_bookmarks_section(),
            '{{FOOTER_BOTTOM}}': self.generate_footer_bottom(generation_date, current_year),
            **seo_replacements
        }

        for placeholder, replacement in replacements.items():
            index_html = index_html.replace(placeholder, replacement)

        # Replace per-category article counts: {{CATEGORY_COUNT:category_name}}
        for cat_name, cat_pages in self.categories.items():
            index_html = index_html.replace(f'{{{{CATEGORY_COUNT:{cat_name}}}}}', str(len(cat_pages)))

        output_file = self.output_dir / 'index.html'
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(index_html)
        
        print(f"[+] Generated: {output_file}")
    
    def generate_page(self, page: Dict[str, Any], template: str, site_config_js: str, 
                      page_data_js: str, generation_date: str, current_year: int, site_name_initial: str):
        """Generate individual HTML page"""
        relative_parts = page['relative_path'].parts
        depth = len(relative_parts) - 1
        
        assets_path = '../' * depth + 'assets/' if depth > 0 else 'assets/'
        home_url = '../' * depth + 'index.html' if depth > 0 else './index.html'
        contribute_url = '../' * depth + 'contribute.html' if depth > 0 else './contribute.html'
        about_url = '../' * depth + 'about.html' if depth > 0 else './about.html'
        
        breadcrumb_html = self.generate_breadcrumb_html(page, home_url, generation_date)

        page_content = f'''
            {breadcrumb_html}
            <div class="article-content">
                {page['html_content']}
            </div>
        '''

        seo_replacements = self.get_seo_replacements(page, 'content', page['url'], assets_path)

        page_html = template
        replacements = {
            '{{SITE_NAME}}': self.site_name,
            '{{SITE_DESCRIPTION}}': self.description,
            '{{NAVIGATION_HTML}}': '',
            '{{DYNAMIC_PAGE_DATA}}': f"window.currentPageId = '{page['id']}'; window.pageDepth = {depth};",
            '{{GENERATION_DATE}}': generation_date,
            '{{CURRENT_YEAR}}': str(current_year),
            '{{SITE_NAME_INITIAL}}': site_name_initial,
            '{{DYNAMIC_CONTENT_PLACEHOLDER}}': page_content,
            '{{TOTAL_PAGES}}': str(len(self.all_pages)),
            '{{TOTAL_CATEGORIES}}': str(len([c for c in self.categories if c != 'General'])),
            '{{HOME_URL}}': home_url,
            '{{ASSETS_PATH}}': assets_path,
            '{{CONTRIBUTE_URL}}': contribute_url,
            '{{CONTRIBUTE_BUTTON}}': self.generate_contribute_button(contribute_url),
            '{{CONTRIBUTE_FOOTER_LINK}}': self.generate_contribute_footer_link(contribute_url),
            '{{ABOUT_URL}}': about_url,
            '{{GITHUB_URL}}': self.config.get('site', {}).get('github_url', '#'),
            '{{RECENT_SECTION}}': self.generate_recent_section(),
            '{{BOOKMARKS_SECTION}}': self.generate_bookmarks_section(),
            '{{FOOTER_BOTTOM}}': self.generate_footer_bottom(generation_date, current_year),
            **seo_replacements
        }

        for placeholder, replacement in replacements.items():
            page_html = page_html.replace(placeholder, replacement)
        
        output_path = self.output_dir / page['url']
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(page_html)

        print(f"[+] Generated: {output_path}")

    def setup_assets(self, template_dir: Path, css_file: Path, js_file: Path):
        """Copy assets to output directory"""
        assets_dir = self.output_dir / 'assets'
        assets_dir.mkdir(parents=True, exist_ok=True)
        
        # Copy CSS
        css_dest = assets_dir / 'css'
        css_dest.mkdir(exist_ok=True)
        if css_file.exists():
            shutil.copy2(css_file, css_dest / 'style.css')
            print(f"[+] Copied: {css_file} -> assets/css/style.css")
        
        # Copy JS
        js_dest = assets_dir / 'js'
        js_dest.mkdir(exist_ok=True)
        if js_file.exists():
            shutil.copy2(js_file, js_dest / 'app.js')
            print(f"[+] Copied: {js_file} -> assets/js/app.js")
        
        # Copy additional JS files (e.g., prism-custom.js)
        js_src_dir = template_dir / 'js'
        if js_src_dir.exists():
            for extra_js in js_src_dir.iterdir():
                if extra_js.is_file() and extra_js.suffix == '.js' and extra_js.name != 'app.js':
                    shutil.copy2(extra_js, js_dest / extra_js.name)
                    print(f"[+] Copied: {extra_js.name} -> assets/js/{extra_js.name}")
        
        # Copy images
        img_src = template_dir / 'img'
        if img_src.exists():
            img_dest = assets_dir / 'img'
            img_dest.mkdir(exist_ok=True)
            img_count = 0
            for img_file in img_src.iterdir():
                if img_file.is_file():
                    shutil.copy2(img_file, img_dest / img_file.name)
                    img_count += 1
            if img_count > 0:
                print(f"[+] Copied: {img_count} images -> assets/img/")

    def load_template(self, template_path: Path) -> str:
        """Load HTML template"""
        with open(template_path, 'r', encoding='utf-8') as f:
            return f.read()

    def generate_site(self, content_dir: Path, template_path: Path, css_file: Path = None, js_file: Path = None):
        """Generate the complete static site"""
        print("[*] Generating documentation site...")

        self.content_dir = content_dir
        self.all_pages = self.scan_directory(content_dir)
        
        if not self.all_pages:
            print("[!] No markdown files found!")
            return
        
        if css_file is None:
            css_file = Path.cwd() / 'template' / 'css' / 'style.css'
        if js_file is None:
            js_file = Path.cwd() / 'template' / 'js' / 'app.js'
        
        self.setup_assets(template_path.parent, css_file, js_file)
        
        template = self.load_template(template_path)
        
        site_config_js = self.generate_site_config_js()
        page_data_js = self.generate_page_data_js()
        generation_date = datetime.now().strftime('%B %d, %Y')
        current_year = datetime.now().year
        site_name_initial = self.site_name[0].upper() if self.site_name else 'D'

        # Generate shared data file (site config + page data + navigation per depth)
        self.generate_shared_data_file(site_config_js, page_data_js)

        navigation_html_index = self.generate_navigation_html_for_depth(0)
        self.generate_index(template, navigation_html_index, site_config_js, page_data_js,
                           generation_date, current_year, site_name_initial)

        for page in self.all_pages:
            self.generate_page(page, template, site_config_js, page_data_js,
                              generation_date, current_year, site_name_initial)

        pages_folder = self.config.get('paths', {}).get('pages_folder', 'input/pages')
        pages_dir = Path(pages_folder)
        if pages_dir.exists():
            self.generate_static_pages(pages_dir, template, navigation_html_index, site_config_js,
                                       page_data_js, generation_date, current_year, site_name_initial)
        
        if self.config.get('generator', {}).get('generate_sitemap', True):
            sitemap_content = self.generate_sitemap()
            sitemap_path = self.output_dir / 'sitemap.xml'
            with open(sitemap_path, 'w', encoding='utf-8') as f:
                f.write(sitemap_content)
            print(f"[+] Generated: {sitemap_path}")
        
        robots_content = self.generate_robots_txt()
        robots_path = self.output_dir / 'robots.txt'
        with open(robots_path, 'w', encoding='utf-8') as f:
            f.write(robots_content)
        print(f"[+] Generated: {robots_path}")
        
        print(f"[+] Site generated successfully!")
        print(f"[*] Output: {self.output_dir}")

    def generate_static_pages(self, pages_dir: Path, template: str, navigation_html: str, 
                              site_config_js: str, page_data_js: str, generation_date: str, 
                              current_year: int, site_name_initial: str):
        """Generate static pages (about, contribute, etc.) at root level"""
        md_files = list(pages_dir.glob('*.md'))
        
        for md_file in md_files:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            frontmatter, markdown_content = self.parse_frontmatter(content)
            
            html_content = self.md.convert(markdown_content)
            
            title = frontmatter.get('title', md_file.stem.replace('-', ' ').title())
            
            breadcrumb_html = f'''<nav class="breadcrumb-nav">
                <div class="breadcrumb" id="breadcrumb">
                    <a href="./index.html" class="breadcrumb-home" data-page="welcome">
                        <i class="fas fa-home"></i> {html.escape(self.site_name)}
                    </a>
                    <span class="breadcrumb-separator">›</span>
                    <span class="breadcrumb-category" id="breadcrumbCategory">{html.escape(title)}</span>
                </div>
                <div class="breadcrumb-meta" id="breadcrumbMeta">
                    <span id="lastUpdated">Generated {generation_date}</span>
                </div>
            </nav>'''
            
            page_content = f'''
                {breadcrumb_html}
                <div class="article-content">
                    {html_content}
                </div>
            '''
            
            static_page_data = {
                'title': title,
                'frontmatter': frontmatter,
                'levels': [],
                'levels_raw': []
            }
            
            page_url = f"{md_file.stem}.html"
            seo_replacements = self.get_seo_replacements(static_page_data, 'static', page_url, 'assets/')
            
            page_html = template
            replacements = {
                '{{SITE_NAME}}': self.site_name,
                '{{SITE_DESCRIPTION}}': self.description,
                '{{NAVIGATION_HTML}}': '',
                '{{DYNAMIC_PAGE_DATA}}': f"window.currentPageId = '{md_file.stem}'; window.pageDepth = 0;",
                '{{GENERATION_DATE}}': generation_date,
                '{{CURRENT_YEAR}}': str(current_year),
                '{{SITE_NAME_INITIAL}}': site_name_initial,
                '{{DYNAMIC_CONTENT_PLACEHOLDER}}': page_content,
                '{{TOTAL_PAGES}}': str(len(self.all_pages)),
                '{{TOTAL_CATEGORIES}}': str(len([c for c in self.categories if c != 'General'])),
                '{{HOME_URL}}': './index.html',
                '{{ASSETS_PATH}}': 'assets/',
                '{{CONTRIBUTE_URL}}': './contribute.html',
                '{{CONTRIBUTE_BUTTON}}': self.generate_contribute_button('./contribute.html'),
                '{{CONTRIBUTE_FOOTER_LINK}}': self.generate_contribute_footer_link('./contribute.html'),
                '{{ABOUT_URL}}': './about.html',
                '{{GITHUB_URL}}': self.config.get('site', {}).get('github_url', '#'),
                '{{RECENT_SECTION}}': self.generate_recent_section(),
                '{{BOOKMARKS_SECTION}}': self.generate_bookmarks_section(),
                '{{FOOTER_BOTTOM}}': self.generate_footer_bottom(generation_date, current_year),
                **seo_replacements
            }

            for placeholder, replacement in replacements.items():
                page_html = page_html.replace(placeholder, replacement)

            output_file = self.output_dir / f"{md_file.stem}.html"
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(page_html)
            
            print(f"[+] Generated: {output_file}")


def load_config(config_path: str = 'config.json') -> dict:
    """Load configuration from JSON file"""
    if not Path(config_path).exists():
        print(f"[!] Config file not found: {config_path}")
        return {}
    
    with open(config_path, 'r') as f:
        return json.load(f)


def main():
    parser = argparse.ArgumentParser(description='Convert Markdown documentation to HTML')
    parser.add_argument('--config', default='config.json', help='Path to config file')
    parser.add_argument('--input', '--content-dir', dest='input_dir', help='Override content directory')
    parser.add_argument('--output', help='Override output directory')
    parser.add_argument('--template', dest='template_dir', help='Template name (e.g., default) or path')
    
    args = parser.parse_args()
    
    config = load_config(args.config)
    
    site_name = config.get('site', {}).get('name', 'Documentation')
    description = config.get('site', {}).get('description', 'Documentation Platform')
    
    content_dir = Path(args.input_dir) if args.input_dir else Path(config.get('paths', {}).get('content_folder', 'input/notes'))
    output_dir = args.output if args.output else config.get('paths', {}).get('output_folder', 'output')
    
    # Template paths (can be overridden with --template)
    if args.template_dir:
        # Check if it's a template name (e.g., "default") or a full path
        template_path = Path(args.template_dir)
        if not template_path.exists():
            # Try as template name in templates/ folder
            template_path = Path('templates') / args.template_dir
        template_base = template_path
    else:
        # Use config template_folder or fall back to templates/default
        template_base = Path(config.get('paths', {}).get('template_folder', 'templates/default'))
    
    template_file = template_base / 'template.html'
    css_file = template_base / 'css' / 'style.css'
    js_file = template_base / 'js' / 'app.js'
    
    converter = MarkdownToHtmlConverter(site_name, description, output_dir)
    converter.site_url = config.get('site', {}).get('url', '')
    converter.config = config
    
    # Header
    print(f"[*] Grimoire")
    print(f"    Config:   {args.config}")
    print(f"    Input:    {content_dir}")
    print(f"    Output:   {output_dir}")
    print(f"    Template: {template_base}")
    
    converter.generate_site(content_dir, template_file, css_file, js_file)
    
    # Footer
    print(f"[+] Done! Generated {len(converter.all_pages)} pages")


if __name__ == '__main__':
    main()
