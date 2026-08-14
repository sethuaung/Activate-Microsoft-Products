---
display_name: Your First Project
last_update: 2025-01-30
---

# Tutorial: Your First Project

Build a complete documentation site from scratch.

## What You'll Build

A documentation site with:
- Multiple categories
- Nested navigation
- Custom styling
- Deployed to GitHub Pages

## Prerequisites

- Python 3.8+
- pip
- Git
- GitHub account

## Step 1: Set Up Project

```bash
mkdir my-awesome-docs
cd my-awesome-docs
git init
```

## Step 2: Add Grimoire

Copy the generator files:

```
my-awesome-docs/
├── grimoire.py
├── config.json
└── template/
    ├── template.html
    ├── css/style.css
    └── js/app.js
```

## Step 3: Configure

Edit `config.json`:

```json
{
  "site": {
    "name": "Awesome Docs",
    "description": "Documentation for awesome things",
    "url": "https://yourusername.github.io/my-awesome-docs"
  }
}
```

## Step 4: Create Content Structure

```bash
mkdir -p input/notes/01-intro
mkdir -p input/notes/02-usage
mkdir -p input/pages
```

## Step 5: Write Content

Create `input/notes/01-intro/welcome.md`:

```markdown
# Welcome

This is the intro section.

## Getting Started

Begin your journey here.
```

## Step 6: Add Static Pages

Create `input/pages/about.md`:

```markdown
---
title: About
---

# About This Project

Information about your project.
```

## Step 7: Generate

```bash
pip install markdown pyyaml
python3 grimoire.py
```

## Step 8: Preview Locally

```bash
cd output
python3 -m http.server 8000
```

## Step 9: Deploy

Push to GitHub and enable Pages:

```bash
git add .
git commit -m "Initial docs"
git push origin main
```

## Congratulations!

You've built and deployed your first documentation site!
