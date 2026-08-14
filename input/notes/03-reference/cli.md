---
display_name: CLI Reference
last_update: 2025-01-31
---

# Command Line Interface

Reference for all command line options.

## Basic Usage

```bash
python3 grimoire.py [options]
```

## Options

### --config

Specify a custom configuration file:

```bash
python3 grimoire.py --config custom-config.json
```

Default: `config.json`

### --input

Override the content directory:

```bash
python3 grimoire.py --input ./docs
```

Alias: `--content-dir`

### --output

Override the output directory:

```bash
python3 grimoire.py --output ./dist
```

### --template

Select a built-in template or specify a custom path:

```bash
# Use built-in template by name
python3 grimoire.py --template default

# Use custom template path
python3 grimoire.py --template /path/to/my-theme
```

**Built-in template** (in `templates/` folder):
- `default` - Purple/indigo theme

Community templates can be installed into `templates/` and selected by name.

The template directory should contain:
- `template.html` - HTML template
- `css/style.css` - Stylesheet
- `js/app.js` - JavaScript
- `img/` - Images (favicon, og-image)

## Examples

### Basic Generation

```bash
python3 grimoire.py
```

### Custom Paths

```bash
python3 grimoire.py --input ./my-docs --output ./public
```

### Different Config

```bash
python3 grimoire.py --config production.json --output ./build
```

### Full Example

```bash
python3 grimoire.py --config mysite.json --input /path/to/notes --output /var/www/html --template ./custom-theme
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error (check console output) |
