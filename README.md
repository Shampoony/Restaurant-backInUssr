# Back in the USSR — Restaurant Website

Vue 3 + TypeScript + Vite on the frontend, with Express + TypeScript on the backend.

The design, fonts and colour palette were carried over from the original static version of the website, which is preserved in the `legacy/` directory for reference.

## Getting Started

```bash
npm install
npm run dev
```

Website: [back-in-ussr.netlify.app](https://back-in-ussr.netlify.app/)

The administrator login, password and port can be configured in `.env`. A template is provided in `.env.example`.

Other commands:

```bash
npm run build      # Build the frontend into dist/, including type checking
npm run typecheck  # Run type checking only
npm run start:api  # Start the API only, without Vite
```

## Deploying to Netlify

The backend is deployed alongside the website. The configuration in `netlify.toml` runs the entire REST API through a single serverless function and stores data in Netlify Blobs.

No separate server or second account is required.

1. **Build the project locally at least once** using `npm run build` to confirm that the build succeeds.
2. **Import the repository into Netlify** through Add new site → Import an existing project. Build settings are read from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
3. **Set the environment variables** under Site configuration → Environment variables → Add a variable:

   | Variable | Value |
   | --- | --- |
   | `ADMIN_LOGIN` | Administrator username |
   | `ADMIN_PASSWORD` | Administrator password |
   | `ADMIN_SECRET` | A long random string used as the token-signing key |

   The website also works without `ADMIN_SECRET`. In that case, the signing key is derived from the username and password. Changing either credential invalidates all previously issued tokens.

4. **Redeploy the website** through Deploys → Trigger deploy → Clear cache and deploy site so that the function picks up the environment variables.
5. **Check the health endpoint:** `https://<your-site>.netlify.app/api/health` should return a response containing:

   ```json
   {"status":"ok","storage":"blobs"}
   ```

The Blobs store is created automatically on the first request and populated with initial data: a menu containing 69 dishes, three reviews and placeholder contact details. Reviews, reservations and changes made through the admin panel are persisted and survive redeployment.

To run the complete setup locally, including the serverless function:

```bash
npx netlify dev
```

The original deployment notes list free-plan allowances of 125,000 function invocations and 100 function execution hours per month, plus Blobs storage, and describe these as sufficient for the restaurant website. Current plan limits should be checked before deployment.

### If the Website Was Previously Deployed

Two deployment issues are now addressed in `netlify.toml`:

- Requests to `/api/...` previously had no backend to handle them on Netlify.
- Reloading `/menu`, `/about` or `/admin` returned a 404 because an SPA redirect to `index.html` was missing.

## Project Structure

```text
netlify.toml           Deployment: static assets, API function and SPA redirects
netlify/functions/     Serverless wrapper around the same Express application
shared/types.ts        Shared frontend and API types — a single source of truth
server/
  src/app.ts           Express application shared by local and Netlify environments
  src/index.ts         Local server
  src/routes/          Endpoints: menu, reviews, reservations, contacts and auth
  src/db.ts            Storage: local JSON file or Netlify Blobs in production
  src/auth.ts          Authentication using an HMAC-signed token
  src/validation.ts    Form validation with field-specific errors
  src/menu-seed.ts     12 categories and 69 dishes extracted from the old menu.html
src/
  api/                 All HTTP communication: client.ts and endpoint definitions
  stores/              Pinia stores: language, authentication, contacts and notifications
  composables/         useAsyncData, useMediaQuery and useBodyLock
  directives/          Animation directives: v-reveal, v-tilt and v-parallax
  components/          ui/, layout/, home/, menu/, reviews/ and booking/
  views/               Website and admin pages
  locales/             RU/EN dictionaries with type-checked keys
  styles/              Design tokens, base styles, layout, animations and admin styles
```

## API

### Public Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/menu` | Menu categories and dishes |
| GET | `/api/menu/featured` | Featured dishes for the homepage |
| GET | `/api/reviews` | Approved reviews |
| POST | `/api/reviews` | Submit a guest review for moderation |
| POST | `/api/reservations` | Submit a table reservation |
| GET | `/api/contacts` | Address, telephone number and opening hours |
| POST | `/api/auth/login` | Sign in to the admin panel |

### Admin Endpoints

These endpoints require an `Authorization: Bearer <token>` header:

- `GET/PATCH /api/admin/menu`
- `GET/PATCH/DELETE /api/admin/reviews`
- `GET/PATCH /api/admin/reservations`
- `PUT /api/admin/contacts`

## Backend Architecture and Extension Points

- The frontend communicates exclusively through `src/api`. Moving to a different server requires changes in a single module.
- Storage is abstracted behind the `StorageDriver` interface in `server/src/db.ts`. Two drivers are currently available: file storage and Netlify Blobs. PostgreSQL or MongoDB support can be added through a third driver implementing the same `read` and `write` methods.
- The Express application is assembled in `server/src/app.ts` independently of how it is launched: by the local server, a Netlify function or another hosting environment.
- Authentication in `server/src/auth.ts` is already stateless and uses an HMAC-signed token. Migrating to JWT-based authentication with roles would be confined to this module.
- Table reservations are already submitted to the API and saved in storage. Reservation confirmation and an admin reservation-management screen remain to be added; the required endpoints already exist.

## Animations

- `v-reveal` — Reveals sections as they enter the viewport, with `:left`, `:right`, `:scale` and `:mask` variants and staggered delays.
- `AnimatedText` — Reveals headings word by word from behind a mask.
- `CountUp` — Animates numerical facts when they enter the viewport.
- `v-tilt` — Applies a cursor-following 3D tilt effect to cards and photographs.
- `v-parallax` — Moves the “1959” watermark more slowly than the page.
- Hover effects — Left-to-right button fills, navigation underlines, raised dish cards, animated photo placeholders and rotating social media icons.
- Transitions — Page transitions and transitions between review carousel slides and menu categories.
- Reduced motion — All animations are disabled when the system’s `prefers-reduced-motion` setting is enabled.
