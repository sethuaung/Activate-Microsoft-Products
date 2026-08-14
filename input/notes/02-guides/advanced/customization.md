---
display_name: Customization
last_update: 2026-02-22
---

# Customization Guide

Customize the look and feel of your documentation site by editing CSS variables in `templates/<theme>/css/style.css`.

## Quick Start

Open `templates/default/css/style.css` (or your custom template's CSS) - all customizable variables are at the top in the **THEME CUSTOMIZATION** section (first ~70 lines).

## Accent Color

Change your brand color - affects links, buttons, active states:

```css
:root {
    --accent-primary: #6366f1;      /* Main accent (buttons, links) */
    --accent-secondary: #818cf8;    /* Hover states */
    --accent-dim: #4f46e5;          /* Darker shade */
    --accent-highlight: #a5b4fc;    /* Lighter shade */
}
```

**Examples:**
- Blue: `#3b82f6`
- Green: `#10b981`
- Purple: `#8b5cf6`
- Orange: `#f97316`
- Cyan: `#06b6d4`

## Content Styling

Control how your Markdown content renders:

```css
:root {
    /* Heading sizes */
    --content-h1-size: 2.25rem;     /* # Heading 1 */
    --content-h2-size: 1.5rem;      /* ## Heading 2 */
    --content-h3-size: 1.25rem;     /* ### Heading 3 */
    --content-h4-size: 1.1rem;      /* #### Heading 4 */
    
    /* Text */
    --content-text-size: 1rem;      /* Paragraph text */
    --content-line-height: 1.7;     /* Line spacing */
    --content-code-size: 0.875em;   /* Inline code */
}
```

## Navigation Sizing

Customize sidebar navigation:

```css
:root {
    --nav-category-size: 0.9rem;    /* Top-level folders */
    --nav-subcategory-size: 0.85rem;/* Sub-folders */
    --nav-item-size: 0.8rem;        /* File links */
}
```

## Layout

```css
:root {
    --sidebar-width: 320px;
    --header-height: 70px;
}
```

## Dark Theme Colors

```css
:root {
    --primary-bg: #0f0f1a;          /* Main background */
    --secondary-bg: #16162a;        /* Sidebar, cards */
    --tertiary-bg: #1e1e3a;         /* Hover states, inputs */
    --code-block-bg: #12121f;       /* Code blocks */
    
    --text-primary: #f1f5f9;        /* Headings, bold */
    --text-secondary: #94a3b8;      /* Body text */
    --text-tertiary: #64748b;       /* Muted text */
    
    --border-color: #2d2d4a;
    --border-light: #3d3d5c;
}
```

## Light Theme Colors

```css
[data-theme="light"] {
    --primary-bg: #ffffff;
    --secondary-bg: #f8fafc;
    --tertiary-bg: #f1f5f9;
    --code-block-bg: #f8fafc;
    
    --text-primary: #1e293b;
    --text-secondary: #475569;
    --text-tertiary: #94a3b8;
    
    --border-color: #e2e8f0;
    --border-light: #f1f5f9;
}
```

## Syntax Highlighting

Code block colors are defined in the **Prism.js Syntax Highlighting Overrides** section (near end of CSS file ~line 1665):

```css
/* Comments */
.token.comment { color: var(--text-tertiary); }

/* Strings */
.token.string { color: #a5f3fc; }

/* Keywords */
.token.keyword { color: var(--accent-secondary); }

/* Functions */
.token.function { color: #c4b5fd; }

/* Numbers */
.token.number { color: #795eff; }
```

## Config-Based Customization

### Navigation Icons

Add custom icons for categories in `config.json`:

```json
{
  "ui": {
    "category_icons": {
      "my-category": "fas fa-star",
      "security": "fas fa-shield-alt"
    },
    "default_icon": "fas fa-folder"
  }
}
```

### Footer Options

```json
{
  "footer": {
    "show_copyright": true,
    "show_timestamp": true,
    "show_powered_by": true,
    "copyright_text": "My Company"
  }
}
```

### Sidebar Features

```json
{
  "ui": {
    "show_recent": true,
    "show_bookmarks": true,
    "strip_number_prefix": true
  }
}
```

## Custom Templates

When creating a custom template, your `template.html` must include the shared data loader and navigation injection scripts. Grimoire generates a single `site-data.js` file containing site config, page metadata, and navigation HTML — each page only embeds its own page ID and depth.

### Required Script Block

Add this at the bottom of your template, before `app.js`:

```html
<!-- Theme persistence (prevents flash on load) -->
<body data-theme="dark">
    <script>
        (function(){
            var t = localStorage.getItem('doc-platform-theme');
            if (t) document.body.setAttribute('data-theme', t);
        })();
    </script>

    <!-- ... your page content ... -->

    <!-- Page ID + shared data + nav injection -->
    <script>
        {{DYNAMIC_PAGE_DATA}}
    </script>
    <script src="{{ASSETS_PATH}}js/site-data.js"></script>
    <script>
        (function(){
            var d = window.pageDepth || 0;
            var n = document.querySelector('.nav-section');
            if (n && window.navData && window.navData[d])
                n.innerHTML = window.navData[d];
        })();
    </script>
    <script src="{{ASSETS_PATH}}js/app.js"></script>
```

### What Each Part Does

- **Theme persistence** — reads saved theme from localStorage before first render, preventing a dark-to-light flash.
- **`{{DYNAMIC_PAGE_DATA}}`** — injects `window.currentPageId` and `window.pageDepth` (two small variables).
- **`site-data.js`** — auto-generated file with `window.siteConfig`, `window.pageData`, and `window.navData` (navigation HTML per depth level). Cached by the browser.
- **Nav injection** — reads `window.navData[pageDepth]` and inserts it into the `.nav-section` element.

## CSS File Structure

```
templates/<theme>/css/style.css
├── 🎨 THEME CUSTOMIZATION (lines 1-70)
│   ├── Accent colors
│   ├── Content styling
│   ├── Navigation sizing
│   └── Layout
├── Dark theme colors
├── Light theme colors
├── Base styles
├── Header & navigation
├── Sidebar
├── Article content
├── Code blocks
├── Tables
├── Footer
└── Prism.js Syntax Highlighting (~line 1665)
```

## Tips

- Always backup `style.css` before major changes
- Use browser DevTools to test changes live
- Keep accent color contrast accessible (WCAG guidelines)
- Test both dark and light themes after changes
