---
display_name: Deployment
last_update: 2025-01-30
---

# Deployment Guide

Deploy your generated documentation to various platforms.

## GitHub Pages

### Method 1: Manual Deploy

1. Generate your site
2. Push the `output/` folder to your repository
3. Enable GitHub Pages in repository settings

### Method 2: GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Docs
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.x'
      - run: pip install markdown pyyaml
      - run: python3 grimoire.py
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./output
```

## Netlify

1. Connect your repository
2. Set build command: `pip install markdown pyyaml && python3 grimoire.py`
3. Set publish directory: `output`

## Vercel

Create `vercel.json`:

```json
{
  "buildCommand": "pip install markdown pyyaml && python3 grimoire.py",
  "outputDirectory": "output"
}
```

## Static Hosting

The `output/` folder is fully static. Upload to any web server:

- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Blob Storage
- Any traditional web host
