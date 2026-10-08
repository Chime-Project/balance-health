# Balance Health — website

Static site on GitHub Pages. Pushing to `main` deploys to
<https://chime-project.github.io/balance-health/>.

- **Stack:** vanilla HTML/CSS/JS, no build step.
- **Design tokens:** `tokens/colors.css` and `tokens/type.css`, taken from the Brand Book 2026. Page CSS uses
  the variables only.
- **Fonts:** self-hosted in `assets/fonts/`. Zalando Sans Expanded (display) and Lato (body).
- **Logo:** `assets/brand/*.svg`, converted path-for-path from the master `.ai` artwork. Don't retype the
  wordmark.
- **Cache busting:** every CSS/JS/asset URL carries `?v=N`. N only goes up. Current max: `1000`.
- **Preview:** `python3 -m http.server 8792` from the repo root, then open <http://localhost:8792/>.

## Pages

| Page | Folder / file | Stack | Notes | `?v=` |
|---|---|---|---|---|
| Homepage (demo) | `index.html` | Vanilla | Copy is from the approved homepage with the brand name changed. `noindex`. Flags below. | 1000 |
| Page index | `page-index.html` | Static | Client-facing list of pages. | 1000 |

### Homepage flags (stand-ins for the client to confirm)

1. The hero headline "Find Your Balance. Better Health." is a stand-in. The source headline was a pun on the
   old brand name.
2. The SMS consent names "Balance Health Group LLC". The legal entity needs confirming.
3. The contact email is the placeholder `hello@XXXXXXXX.com`.
4. Every Start Assessment / Discover link points to `#` until the assessment URL is confirmed.
5. The LegitScript seal is a placeholder.
6. The service jurisdictions list came over from the source site and needs confirming.
7. The "Launching soon" copy needs confirming.
8. Footer legal links point to `#` until the legal pages exist.
9. The cookie banner is left out because the demo sets no cookies and has no analytics.
10. The early-access form has no backend. Answers are kept in `sessionStorage` and passed to
    `window.balanceSubmitEarlyAccess(payload)`.
