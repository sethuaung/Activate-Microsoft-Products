---
display_name: Config Reference
last_update: 2025-02-11
---

# Configuration Reference

Complete reference for `config.json` options.

## Site Section

```json
{
  "site": {
    "name": "string",
    "url": "string",
    "description": "string",
    "github_url": "string"
  }
}
```

| Option | Type | Description |
|--------|------|-------------|
| `name` | string | Site title displayed in header |
| `url` | string | Base URL for canonical links and sitemap |
| `description` | string | Tagline under site name |
| `github_url` | string | Link to GitHub repository |

## Paths Section

```json
{
  "paths": {
    "content_folder": "input/notes",
    "pages_folder": "input/pages",
    "template_folder": "templates/default",
    "output_folder": "output",
    "exclusions": [".trash", ".obsidian", ".git", "__pycache__", "node_modules"]
  }
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `content_folder` | `input/notes` | Directory containing Markdown content |
| `pages_folder` | `input/pages` | Directory for static pages (About, Contribute) |
| `output_folder` | `output` | Where generated HTML is placed |
| `template_folder` | `templates/default` | Template directory (default or custom path) |
| `exclusions` | `[".trash", ".obsidian", ".git", "__pycache__", "node_modules"]` | Files and folders to skip during processing. Matches against all path components — both folder names and filenames |

**Built-in template:**
- `templates/default` - Purple/indigo theme

Community templates can be installed into `templates/` and selected by folder name.

> **Note:** The legacy key `exclude_folders` is still supported for backward compatibility.

## SEO Section

```json
{
  "seo": {
    "index_description": "string",
    "page_description_template": "string",
    "keywords": "string"
  }
}
```

| Option | Type | Description |
|--------|------|-------------|
| `index_description` | string | Meta description for homepage |
| `page_description_template` | string | Template for page descriptions |
| `keywords` | string | Meta keywords for all pages |

Template variables: `{title}`, `{category}`, `{site_name}`

## Generator Section

```json
{
  "generator": {
    "generate_sitemap": true
  }
}
```

## UI Section

```json
{
  "ui": {
    "show_recent": true,
    "show_bookmarks": true,
    "show_contribute": true,
    "contribute_text": "Contribute",
    "contribute_url": "./contribute.html",
    "strip_number_prefix": true,
    "pin_to_top": ["overview", "index"],
    "category_icons": {
      "category-name": "fas fa-icon"
    },
    "default_icon": "fas fa-folder"
  }
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `show_recent` | boolean | `true` | Show "Recent" section in sidebar |
| `show_bookmarks` | boolean | `true` | Show "Bookmarks" section in sidebar |
| `show_contribute` | boolean | `true` | Show "Contribute" button in header and footer |
| `contribute_text` | string | `"Contribute"` | Custom text for the contribute button |
| `contribute_url` | string | `"./contribute.html"` | URL for contribute link |
| `strip_number_prefix` | boolean | `true` | Format names (strip prefixes, capitalize). Set `false` to keep names unchanged |
| `pin_to_top` | array | `["overview", "index"]` | Filenames (without `.md`) to pin to top of navigation. Array order = display order. Within folders, pinned files appear first. At root level, pinned pages appear above all categories |
| `category_icons` | object | `{}` | Map category names (after prefix stripping) to FontAwesome icons |
| `default_icon` | string | `"fas fa-folder"` | Fallback icon for unmapped categories |

### Navigation Sort Order

Pages within each folder are sorted by:
1. **Pinned pages first** — files listed in `pin_to_top`, in array order
2. **Filename stem** — `01-overview` sorts before `02-installation`, preserving number prefixes even after they are stripped from display names

This means you can control navigation order by numbering your files (`01-`, `02-`, etc.) without affecting how they display.

### Category Icons

Icons are resolved by looking up the folder name **after** stripping number prefixes. For example, `01-fundamentals` is looked up as `fundamentals` in the `category_icons` map.

## Formatting Section

```json
{
  "formatting": {
    "acronyms": ["api", "html", "css", "sql", "http", "json", "cli"],
    "display_name_overrides": {
      "tcp-ip": "TCP/IP",
      "ios": "iOS"
    },
    "lowercase_words": ["and", "or", "the", "a", "an", "in", "on", "at", "to", "for", "of", "with"]
  }
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `acronyms` | array | `[]` | Words to uppercase in display names (e.g. `api` → `API`) |
| `display_name_overrides` | object | `{}` | Exact folder/file name → display name mappings. Checked before and after prefix stripping |
| `lowercase_words` | array | `[]` | Words to keep lowercase unless first word (e.g. `rules-of-engagement` → "Rules of Engagement"). If empty, all words are Title Cased |

### Display Name Examples

With `acronyms: ["api", "sql"]` and `lowercase_words: ["of", "the", "in"]`:

| Filename | Display Name |
|----------|-------------|
| `api-reference` | API Reference |
| `rules-of-engagement` | Rules of Engagement |
| `sql-injection` | SQL Injection |
| `the-basics` | The Basics (first word always capitalized) |

## Footer Section

```json
{
  "footer": {
    "show_copyright": true,
    "show_timestamp": true,
    "show_powered_by": true,
    "copyright_text": ""
  }
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `show_copyright` | boolean | `true` | Show copyright notice |
| `show_timestamp` | boolean | `true` | Show generation timestamp |
| `show_powered_by` | boolean | `true` | Show "Made with Grimoire" credit |
| `copyright_text` | string | `""` | Custom copyright text (use `{year}` and `{site_name}` placeholders) |

Example custom copyright:

```json
{
  "footer": {
    "copyright_text": "Copyright {year} My Company. All rights reserved."
  }
}
```
