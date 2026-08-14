---
display_name: Quick Start
last_update: 2025-01-30
---

# Quick Start Guide

Get up and running in under 5 minutes.

## Step 1: Create Project Structure

```
my-docs/
├── grimoire.py
├── config.json
├── template/
│   ├── template.html
│   ├── css/style.css
│   └── js/app.js
└── input/
    └── notes/
        └── your-content.md
```

## Step 2: Add Your Content

Create a Markdown file in `input/notes/`:

```markdown
# My First Article

This is my documentation content.

## Section One

Some content here.

## Section Two

More content with **bold** and *italic* text.
```

## Step 3: Generate Site

Run the generator:

```bash
python3 grimoire.py
```

## Step 4: Preview

Start a local server:

```bash
cd output
python3 -m http.server 8000
```

Open http://localhost:8000 in your browser.

## That's It!

You now have a fully functional documentation site.
