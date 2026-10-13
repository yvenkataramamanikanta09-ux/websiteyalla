# JSON-driven personal portfolio

A lightweight, accessible portfolio built with HTML, CSS, and JavaScript. **All editable portfolio content lives in [`content/portfolio.json`](content/portfolio.json).** The project entries are based on the supplied résumé; the profile and education still contain clearly labeled sample text.

## First-time setup

1. Install Node.js 20 or newer.
2. Review the project descriptions and replace the remaining sample profile and education values in `content/portfolio.json` with approved public information.
3. Put public files in the matching folders:
   - images: `assets/images/`
   - résumés: `assets/documents/resumes/`
   - certificates: `assets/documents/certificates/`
   - project reports: `assets/documents/reports/`
4. Reference each file with a relative path such as `assets/documents/resumes/resume.pdf`.
5. Run `npm test` and `npm run build`.

Public certificates and résumés can expose addresses, phone numbers, signatures, credential IDs, or other personal data. Use redacted copies where appropriate. Never commit secrets, private contact information, unpublished work, or GitHub tokens.

## Preview locally

The site loads JSON with `fetch`, so opening `index.html` directly is not supported. Build and serve it from a local HTTP server:

```bash
npm run build
npx serve dist
```

Then open the local URL printed by the server. If you do not want to use `npx`, any static HTTP server can serve the `dist` folder.

## Update content

To add a project or certification:

1. Add its image/document files under `assets/`.
2. Add one record to the relevant array in `content/portfolio.json`.
3. Run `npm test`, then commit and push.

No HTML or JavaScript change is required. Every record needs a unique, stable `id`. Set `visible` to `false` to hide it, and use `order` to control its position. Optional URLs/files may be empty; their buttons will not render. Empty optional sections are hidden according to `sectionVisibility`, while an intentionally visible empty certifications section displays a neutral empty state.

Changing an **uncommitted local file does not change the public website**. GitHub Pages publishes only after the change is committed, pushed to the configured branch, validated, built, and deployed successfully.

## Résumé and certificate actions

Set `resume.visible` to `true` and `resume.file` to a public local PDF path to show résumé access. Locally hosted document links get separate preview and download controls. Browsers may preview, download, or open a file in a new tab depending on the file type and user settings; the `download` attribute is a request, not an absolute guarantee.

Certificate records support `certificateFile` and `verificationUrl`. Empty values never create broken actions.

## Validation and build

`npm run validate` catches malformed JSON, missing required content, duplicate IDs across collections, unsafe paths, and missing referenced assets. `npm test` also checks invalid JSON, duplicates, missing assets, optional fields, visibility, and ordering. `npm run build` validates first, generates SEO metadata from the canonical JSON, and copies the deployable site to `dist/`.

The JSON Schema at `content/portfolio.schema.json` provides editor guidance. The executable validation script is authoritative and includes file-system checks that JSON Schema alone cannot perform.

## Deploy to GitHub Pages

Before creating or changing anything on GitHub, confirm the intended repository, branch, and whether the repository will be public. Then:

1. Create or select the confirmed GitHub repository.
2. Commit these files and push them to its `main` branch (or update `.github/workflows/pages.yml` if another branch is intended).
3. In **Repository settings → Pages**, choose **GitHub Actions** as the source.
4. Watch the **Validate and deploy portfolio** workflow. Invalid content stops before deployment and prints actionable errors.
5. Add the verified live URL to `site.url` in `content/portfolio.json` so generated Open Graph metadata includes it.

Relative asset paths work on GitHub Pages project subpaths because the site never assumes it is hosted at `/`. GitHub Pages is static hosting: a public page cannot securely write changes back to a repository without an authenticated backend or external service. This project intentionally has no pretend admin dashboard and never embeds a GitHub token.

## Troubleshooting

- **Content does not load locally:** serve `dist/` over HTTP; do not open the file directly.
- **Validation reports a missing asset:** check spelling, capitalization, and the relative path. GitHub’s Linux runner is case-sensitive.
- **A section is missing:** check `sectionVisibility`, the record’s `visible` value, and `sectionOrder`.
- **A button is missing:** its optional URL/file is empty, or the parent record is hidden.
- **Pages workflow does not run:** confirm the pushed branch matches `main` and GitHub Actions is enabled.
- **Download opens instead:** browser and PDF settings can override the download hint; users can save from the preview.

## Roll back

Revert the problematic commit with `git revert <commit>` and push the new revert commit. This preserves history and triggers a fresh validated deployment. GitHub Actions also retains prior deployment records, but a source revert is the clearest long-term record.

## Contact forms

There is no contact form because a static form cannot deliver messages by itself. Add an approved external form service or backend only after reviewing its cost, privacy terms, spam protection, and data handling. Email and social links work without pretending a message was delivered.
