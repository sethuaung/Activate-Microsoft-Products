---
display_name: Frontmatter
last_update: 2025-01-31
---

# Frontmatter

Add metadata to your Markdown files using frontmatter.

## YAML Format

Place YAML between triple dashes at the start of your file:

```markdown
---
display_name: My Page Title
last_update: 2025-01-30
description: A brief description
---

# Content starts here
```

## Percent Format

Alternative format using `%` prefix:

```markdown
% Display name: My Page Title
% Last update: 2025-01-30
% Description: A brief description

# Content starts here
```

## Supported Fields

| Field | Description |
|-------|-------------|
| `display_name` | Override the page title |
| `title` | Alternative to display_name |
| `last_update` | Date of last modification |
| `description` | SEO meta description |
| `icon` | FontAwesome icon class |

## Examples

### Custom Title

```yaml
---
display_name: Getting Started with APIs
---
```

### With Description

```yaml
---
display_name: API Reference
description: Complete API documentation with examples
last_update: 2025-01-30
---
```

## Tips

- Frontmatter is optional
- If no title is specified, the filename becomes the title
- Both YAML and % formats are supported
