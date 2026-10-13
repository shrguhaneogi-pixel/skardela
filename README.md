# Skardela

Daily Puzzle Web Application built with React 19, React Router 8, and Vite 8.

## Deployment

The application deploys to Netlify as a Single Page Application (SPA).

### Netlify Configuration

Configuration is located in `netlify.toml`:

- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Node Version:** Node 24 (`[build.environment]` `NODE_VERSION = "24"`)
- **SPA Routing Fallback:** Wildcard rewrite rule (`/* -> /index.html` with status `200`) ensures client-side routing works for all URLs.

### CI/CD Pipeline

The GitHub Actions workflow at `.github/workflows/deploy-netlify.yml` automates testing and deployment:

1. Runs automatically on each push to the `main` branch.
2. Checks out code using `actions/checkout@v4` and configures Node 24 using `actions/setup-node@v4`.
3. Runs all validation checks via `npm run check` (formatting, linting, typechecking, tests, and production build).
4. Deploys the built application to Netlify production using `npx netlify-cli deploy --prod --dir=dist`.

### Required GitHub Secrets

To enable automated deployments, configure the following repository secrets under **Settings > Secrets and variables > Actions**:

| Secret Name          | Description                                           |
| -------------------- | ----------------------------------------------------- |
| `NETLIFY_AUTH_TOKEN` | Netlify Personal Access Token for API authentication. |
| `NETLIFY_SITE_ID`    | API ID of the target Netlify site.                    |
