# Changelog

All notable changes to Grimoire are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/).

---

## [1.2] - 2026-02-22

### Added

- **Shared data extraction (`site-data.js`)** — site config, page metadata, and navigation HTML are now generated into a single cached JavaScript file (`assets/js/site-data.js`) instead of being embedded in every HTML page. Each page only injects two small variables (`window.currentPageId`, `window.pageDepth`). The browser caches the shared file, dramatically reducing total site size.
- **`window.pageDepth` variable** — each page now exposes its folder depth (0 = root, 1 = section, 2+ = nested). Used internally by the nav injection script and available for template customization.
- **Theme persistence on page load** — inline `<script>` immediately after `<body>` reads the saved theme from localStorage and applies it before the browser renders, eliminating the dark-to-light flash on page load.
- **Footer link depth-awareness during AJAX navigation** — `loadPage()` in `app.js` now updates footer links with the correct relative path prefix when navigating between pages at different depths. Fixes broken footer links after AJAX page transitions.
- **Sidebar collapse persistence on page load** — inline `<script>` after sidebar sections reads collapsed states from localStorage and applies them before the browser renders, eliminating the brief open-then-close flash on Recent/Bookmarks sections.

### Fixed

- **Category count excluded "General"** — root-level files (e.g. `overview.md`, `report-error.md`) were counted as a "General" category, inflating `{{TOTAL_CATEGORIES}}` by one. Root-level files are no longer counted as a category.

### Changed

- **Templates updated** — the `default` template now loads `site-data.js` and injects navigation from `window.navData[pageDepth]` via inline script. `{{NAVIGATION_HTML}}` in templates is now empty (navigation injected client-side).
- **`{{DYNAMIC_PAGE_DATA}}`** — reduced from full site config + page data + navigation (~250 KB per page) to just two variables: `window.currentPageId` and `window.pageDepth` (~80 bytes per page).

### Backward Compatibility

Template update required: templates must now include `site-data.js` and the nav injection script (see updated `default` template). Custom templates from v1.1 will show empty navigation until updated.

---

## [1.1] - 2025-02-11

### Added

- **`formatting.lowercase_words`** — configurable list of words to keep lowercase in display names unless first word (e.g. `rules-of-engagement` → "Rules of Engagement"). Replaces hardcoded `LOWERCASE_WORDS` constant. Empty by default; populate in config to activate.
- **`ui.pin_to_top`** — pin specific filenames to the top of navigation. Array order = display order. Works both within folders and at root level (pinned root pages appear above all categories). Defaults to `["overview", "index"]`, preserving previous behavior.
- **`paths.exclusions`** — renamed from `exclude_folders` to accurately reflect that it matches both folder names and filenames. Legacy key `exclude_folders` is still supported for backward compatibility.
- **Stem-based navigation sorting** — pages within folders now sort by filename stem instead of display title. This means number prefixes (`01-`, `02-`) control nav order even after being stripped from display names.
- **`nav-item-pinned` CSS class** — pinned root-level pages get this class for optional styling (separator, icon, etc.).

### Changed

- **Script docstring** — trimmed to description + usage only. Feature list moved exclusively to README to prevent drift.
- **README.md** — rewritten with combined feature list (script + README aligned), full configuration reference for all options, and updated folder naming / sort order documentation.
- **Default `config.json`** — updated with all new options (`exclusions`, `pin_to_top`, `lowercase_words`), matching the input/ demo folder structure.
- **Input docs** — `config.md` (reference) fully rewritten. `configuration.md` (getting started) updated with new features.

### Removed

- **Hardcoded `LOWERCASE_WORDS` module-level constant** — replaced by `formatting.lowercase_words` in config. If the config key is absent or empty, all words are Title Cased (no implicit lowercase rules).
- **Hardcoded overview/index sort priority** — replaced by `ui.pin_to_top`. Same default behavior, now configurable.

### Backward Compatibility

All changes are backward compatible. Existing v1.0 configs work without modification:
- `exclude_folders` still works (falls back if `exclusions` is not present)
- `pin_to_top` defaults to `["overview", "index"]` (matches v1.0 hardcoded behavior)
- `lowercase_words` defaults to empty (Title Cases everything, which is the behavior you get if you weren't relying on the old hardcoded list)

---

## [1.0] - 2025-01-31

### Added

- **Initial release** — Markdown to HTML static site generator for documentation websites.
- **Hierarchical navigation** — unlimited folder depth with collapsible sections and automatic sort by filename.
- **Frontmatter parsing** — YAML (`---`) and `%`-prefix formats supported. Fields: `display_name`, `title`, `last_update`, `description`, `icon`.
- **Smart display names** — number prefix stripping (`01-setup` → "Setup"), acronym capitalization (`api` → "API"), and `display_name_overrides` for exact mappings.
- **AJAX navigation** — smooth page transitions with browser history support (back/forward). No full page reloads.
- **Full-text search** — real-time filtering with result highlighting across all pages.
- **Auto table of contents** — per-page TOC generated from h2/h3 headings with scroll-aware highlighting.
- **Bookmarks and recent items** — persistent via localStorage. Collapsible sidebar sections.
- **Dark/light theme toggle** — saved to localStorage for persistence across sessions.
- **Mobile-responsive** — slide-out sidebar navigation on small screens.
- **Syntax highlighting** — Prism.js with autoloader for automatic language detection.
- **SEO** — meta tags, Open Graph, Twitter Cards, JSON-LD structured data, `sitemap.xml`, `robots.txt`.
- **Automatic breadcrumbs** — generated from folder hierarchy with reading time.
- **FontAwesome category icons** — configurable per category via `ui.category_icons` with a `default_icon` fallback.
- **HTML export** — download any page as a standalone, print-friendly HTML file.
- **Configurable footer** — copyright notice, generation timestamp, and "Powered by Grimoire" (all toggleable).
- **Contribute button** — optional header/footer link with configurable text and URL.
- **Built-in template** — `default` (purple/indigo theme). Custom templates can be installed into `templates/` and selected by name or path.
- **CLI** — `--config`, `--input`, `--output`, `--template` options for flexible builds.
- **Static pages** — `input/pages/` directory for standalone pages (about, contribute, etc.) rendered at root level.
- **`strip_number_prefix`** — toggle to keep raw filenames as-is instead of formatting display names.
