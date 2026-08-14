---
display_name: Configuration
last_update: 2025-02-11
---

# Configuration Guide

Learn how to configure your documentation site with `config.json`.

## Basic Configuration

Create a `config.json` file in your project root:

```json
{
  "site": {
    "name": "My Documentation",
    "description": "Project docs",
    "url": "https://docs.example.com"
  },
  "paths": {
    "content_folder": "input/notes",
    "output_folder": "output"
  }
}
```

## Site Settings

| Setting | Description | Required |
|---------|-------------|----------|
| `site.name` | Your site title | Yes |
| `site.description` | Tagline shown in header | Yes |
| `site.url` | Base URL for sitemap | No |

## Path Settings

Configure where your content lives and where output goes:

- `content_folder` - Directory containing your Markdown files
- `output_folder` - Where generated HTML will be placed
- `pages_folder` - Static pages like About, Contribute
- `exclusions` - Files and folders to skip (matches both folder names and filenames)

## Folder Organization

Grimoire supports **unlimited folder depth** for organizing your content:

```
input/notes/
├── 01-getting-started/
│   └── installation.md
├── 02-guides/
│   ├── basics/
│   │   └── quickstart.md
│   └── advanced/
│       ├── security/
│       │   ├── authentication/
│       │   │   └── oauth.md      ← 5 levels deep
│       │   └── encryption.md
│       └── performance.md
└── 03-reference/
    └── api.md
```

Folders can be nested as deep as needed. The navigation will automatically create collapsible sections for each level.

## Number Prefixes & Sort Order

By default, number prefixes control **sort order** and are stripped from display names:
- `01-overview.md` → Overview (sorts 1st)
- `02-installation.md` → Installation (sorts 2nd)
- `api-reference.md` → API Reference (sorts alphabetically after numbered files)

To keep names exactly as-is (no formatting):

```json
{
  "ui": {
    "strip_number_prefix": false
  }
}
```

## Pinning Pages to Top

Use `pin_to_top` to force specific pages to appear first in navigation, regardless of their filename:

```json
{
  "ui": {
    "pin_to_top": ["overview", "index", "disclaimer"]
  }
}
```

Array order = display order. Pinned pages take priority over number prefixes. At the root level, pinned pages appear above all categories.

## Icon Configuration

Customize category icons in `ui.category_icons`. Icons are looked up by the folder name **after** stripping number prefixes:

```json
{
  "ui": {
    "category_icons": {
      "getting-started": "fas fa-rocket",
      "guides": "fas fa-book"
    }
  }
}
```

For example, `01-getting-started` is looked up as `getting-started`.

## Display Name Formatting

Control how folder and file names display in navigation:

```json
{
  "formatting": {
    "acronyms": ["api", "sql", "html"],
    "lowercase_words": ["and", "or", "the", "of", "in"],
    "display_name_overrides": {
      "tcp-ip": "TCP/IP"
    }
  }
}
```

- **acronyms** - Words to uppercase (e.g. `api` → `API`)
- **lowercase_words** - Words to keep lowercase unless first word (e.g. `rules-of-engagement` → "Rules of Engagement"). If empty, all words are Title Cased
- **display_name_overrides** - Exact mappings that bypass all other formatting

## Sidebar Features

Control which sidebar sections are visible:

```json
{
  "ui": {
    "show_recent": true,
    "show_bookmarks": true
  }
}
```

Set either to `false` to hide that section.

## Footer Options

Customize the footer display:

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

| Option | Description |
|--------|-------------|
| `show_copyright` | Display "© Year Site Name" |
| `show_timestamp` | Display "Generated on Date" |
| `show_powered_by` | Display "Made with Grimoire" |
| `copyright_text` | Custom text (use `{year}` and `{site_name}`) |

See the [Config Reference](../03-reference/config.md) for complete options.
