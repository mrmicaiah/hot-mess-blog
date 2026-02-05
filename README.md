# The Hot Mess

> Still tripping. Still forgiven. Still showing up.

A blog powered by [11ty](https://www.11ty.dev/) and deployed via GitHub Pages.

## Setup

```bash
npm install
npm run dev    # Local development
npm run build  # Production build
```

## Deployment

Automatic via GitHub Actions on push to `main`. Deploys to GitHub Pages at `the-hot-mess.untitledpublishers.com`.

## Structure

```
src/
├── _data/site.json    # Site configuration
├── _layouts/          # Nunjucks layouts
├── css/               # Stylesheets
├── js/                # Client-side JavaScript
├── posts/             # Blog posts (Markdown)
├── index.njk          # Home page
├── archive.njk        # Archive page
├── about.njk          # About page
├── feed.njk           # RSS feed
└── sitemap.njk        # XML sitemap
```

## Part of UP Blogs

This blog uses the [UP Blog Template](https://github.com/mrmicaiah/up-blog-template) by Untitled Publishers.