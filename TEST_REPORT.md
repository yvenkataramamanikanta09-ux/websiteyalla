# Test report

Date: 2026-09-01

## Automated checks

- Canonical JSON parses and passes required-field validation.
- Duplicate IDs across content collections are rejected.
- Missing referenced local assets are rejected with their field paths.
- Unsafe absolute and parent-directory asset references are rejected.
- Hidden records and numeric display ordering are controlled by JSON.
- Empty optional project links do not invalidate content or create UI actions.
- Production build is generated only after validation.

## Implementation checks

- Profile content, labels, navigation order, section visibility, skills, education, projects, certifications, résumé, contacts, and SEO values originate in `content/portfolio.json`.
- Project search and category filtering use visible JSON records.
- Project details use a native keyboard-accessible dialog with a labeled close control.
- Navigation, theme controls, links, and dialogs use keyboard-accessible native controls with visible focus styles.
- CSS includes mobile/tablet/desktop layouts and reduced-motion handling.
- Images use dimensions and project/certificate images use lazy loading.
- JSON strings are assigned through `textContent`; they are not injected as executable HTML.
- Local paths remain relative for GitHub Pages project subpaths.

## Remaining verification / limitations

- The included records are sample content and must be replaced with approved real content and public assets.
- No live GitHub workflow or Pages URL has been verified because no target repository, branch, visibility, or deployment authorization has been confirmed.
- Final visual, keyboard, preview, and download checks should be repeated with the real images and documents in a browser after content replacement.
- Browser settings may override the HTML download hint for PDFs.
