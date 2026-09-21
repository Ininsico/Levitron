# Levitron

**An open-source presentation and PDF generator driven by AI.**

Describe a talk in a sentence, a document or a repository, and get back a designed, export-ready
deck. Self-hostable, themeable, MIT licensed — you own the pipeline, not a subscription.

- **Frontend** — React 19, Vite 8, Tailwind CSS v4, `react-router-dom` 7
- **Icons** — [lucide-react](https://lucide.dev) (v1)
- **Backend** — Node, Express 5, MongoDB via Mongoose 8
- **Auth** — email + password, scrypt hashing, JWT bearer sessions

---

## Project status

This repository currently contains the **product shell**: the marketing site, the account system
and the API foundation. Being upfront about it:

| Area                                        | State            |
| ------------------------------------------- | ---------------- |
| Landing page (React + Vite + Tailwind)       | Built            |
| User accounts (register / login / session)   | Built and tested |
| Waitlist signup persisted to MongoDB         | Built and tested |
| Health, stats and auth REST API              | Built and tested |
| Design system (`main.css`)                   | Built            |
| **Deck generation, theming engine, PDF/PPTX export** | **Not built yet** |

Everything on the landing page describing deck generation is the intended product, not a
screenshot of something that exists. There is no fake data behind it: `/api/stats` serves the
numbers it serves, and the `/app` page reads your real account back out of MongoDB.

---

## Repository layout

```
Levitron/
├── .gitignore                    one root ignore file; .env is never committed
├── frontend/                     React + Vite app
│   ├── .npmrc                    pins include=dev (see note at the end)
│   ├── index.html                document head, fonts, meta
│   ├── vite.config.js            React + Tailwind plugins, /api proxy to :4000
│   └── src/
│       ├── main.jsx              entry: BrowserRouter → AuthProvider → App
│       ├── App.jsx               route table
│       ├── main.css              THE design system — colours, fonts, components
│       ├── config.js             repo URL (single source of truth)
│       ├── pages/
│       │   ├── Landing.jsx       composes all landing sections
│       │   ├── Login.jsx         sign in / create account
│       │   └── AppHome.jsx       protected workspace page
│       ├── components/
│       │   ├── Navbar.jsx  Hero.jsx  Features.jsx  HowItWorks.jsx
│       │   ├── Stats.jsx  OpenSource.jsx  Faq.jsx  CallToAction.jsx  Footer.jsx
│       │   ├── Logo.jsx          the wordmark (hand-drawn)
│       │   ├── icons.jsx         maps semantic names → Lucide components
│       │   ├── RequireAuth.jsx   route guard
│       │   ├── ScrollToTop.jsx   resets scroll on navigation
│       │   └── SectionHeading.jsx
│       ├── context/AuthContext.jsx
│       ├── hooks/useReveal.js    IntersectionObserver scroll reveals
│       ├── data/content.js       every string on the landing page
│       └── lib/
│           ├── api.js            fetch wrapper, injects the bearer token
│           └── session.js        localStorage session store
└── backend/                      Express API
    └── src/
        ├── server.js             boot: check secret → connect Mongo → listen
        ├── app.js                express app, CORS, JSON, 404 + error handlers
        ├── db.js                 Mongoose connection
        ├── models/               User.js, WaitlistSubscriber.js
        ├── lib/                  password.js (scrypt), tokens.js (JWT)
        ├── middleware/           requireAuth.js, requireDatabase.js
        ├── routes/               index.js, auth.js, waitlist.js
        └── data/stats.js         numbers served by /api/stats
```

---

## Quick start

You need **Node.js 20.6+** (the backend uses `--env-file-if-exists`) and a **MongoDB** database
(local or Atlas). Two terminals, backend first.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then fill it in
npm run dev
```

`backend/.env`:

```dotenv
PORT=4000
NODE_ENV=development

MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/levitron
MONGO_DB=

JWT_SECRET=
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
```

Generate `JWT_SECRET` with:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Serves on **http://localhost:4000**. The process validates `JWT_SECRET` and connects to MongoDB
*before* it starts listening, so missing or wrong config fails loudly at boot rather than on the
first request.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Serves on **http://localhost:5173**. Vite proxies `/api/*` to `http://localhost:4000`, so the
browser only ever talks to one origin in development. Start the backend first — otherwise the
stats band reports `offline fallback` and login will fail.

Open `http://localhost:5173`, click **Start building**, create an account, and you land on `/app`
with your record read back from MongoDB.

---

## Environment variables

### Backend (`backend/.env`)

| Variable         | Required | Default                 | Notes                                                        |
| ---------------- | -------- | ----------------------- | ------------------------------------------------------------ |
| `PORT`           | no       | `4000`                  |                                                              |
| `MONGO_URI`      | **yes**  | —                       | Server refuses to boot without it                            |
| `MONGO_DB`       | no       | name in the URI         | Override if your URI has no database path                    |
| `JWT_SECRET`     | **yes**  | —                       | Server refuses to boot without it                            |
| `JWT_EXPIRES_IN` | no       | `7d`                    | Any `jsonwebtoken` duration string                           |
| `CORS_ORIGIN`    | no       | `http://localhost:5173` | Comma-separated list of allowed origins                      |

### Frontend (`frontend/.env`, optional)

| Variable       | Default | Notes                                                    |
| -------------- | ------- | -------------------------------------------------------- |
| `VITE_API_URL` | `/api`  | Point at a deployed API. Leave unset to use the Vite proxy |

---

## API reference

Base URL `http://localhost:4000/api`. All responses are JSON. Protected routes expect
`Authorization: Bearer <token>`.

### `GET /health`

```json
{ "status": "ok", "database": "connected", "uptime": 12.34, "timestamp": "2026-09-21T13:08:42.566Z" }
```

### `GET /stats`

Presentation numbers consumed by the landing page stats band.

```json
{
  "data": {
    "name": "Levitron", "version": "0.1.0", "license": "MIT",
    "decksGenerated": 128400, "slidesGenerated": 1932000,
    "contributors": 84, "averageRenderMs": 2400
  }
}
```

### `POST /auth/register`

```json
{ "name": "Ada Lovelace", "email": "ada@example.com", "password": "at-least-8-chars" }
```

`201` on success, `400` on validation failure, `409` if the email is taken.

```json
{ "data": { "token": "<jwt>", "user": { "id": "…", "name": "Ada Lovelace", "email": "ada@example.com", "createdAt": "…" } } }
```

### `POST /auth/login`

```json
{ "email": "ada@example.com", "password": "at-least-8-chars" }
```

`200` with the same payload shape, or `401` with `{ "error": "Incorrect email or password." }`.

### `GET /auth/me` 🔒

`200` with `{ "data": { "user": { … } } }`, or `401` when the token is missing, invalid or expired.

### `GET /waitlist`

```json
{ "data": { "count": 42 } }
```

### `POST /waitlist`

```json
{ "email": "someone@example.com" }
```

`201` when newly added, `200` when the address is already on the list, `400` on an invalid address.

Any endpoint that needs the database returns `503` with a clear message when MongoDB is
disconnected, instead of hanging on a buffered query.

---

## How authentication works

**Passwords.** Hashed with **scrypt** from `node:crypto` — a random 16-byte salt per user, 64-byte
derived key, stored as `scrypt$<salt>$<hash>`. Verification uses `timingSafeEqual`. The
`passwordHash` field is `select: false`, so it is never loaded unless a query explicitly asks for
it, and it can never leak through a response by accident.

**Sessions.** Stateless **JWTs** (HS256) signed with `JWT_SECRET`, carrying the user id in `sub`,
expiring after `JWT_EXPIRES_IN`. `requireAuth` verifies the signature *and* re-checks that the user
still exists, so deleting an account invalidates its sessions immediately.

**No account enumeration.** `POST /auth/login` returns the identical error for an unknown email and
a wrong password, so the endpoint cannot be used to discover which addresses are registered.

**Client side.** The token lives in `localStorage` (`levitron.session`) and `lib/api.js` attaches it
to every request; `AuthContext` holds the reactive copy and a 401 clears the session so guarded
routes bounce to `/login`.

> **Before production:** `localStorage` is readable by any script on the page, so it is
> XSS-exposed. Move to httpOnly cookies with `SameSite`, or keep the access token in memory behind a
> refresh flow. Also consider rate limiting on the auth endpoints, and email verification.

---

## Frontend architecture

| Path     | Page              | Notes                                                         |
| -------- | ----------------- | ------------------------------------------------------------- |
| `/`      | `Landing`         | Hero, features, how it works, stats, open source, FAQ, waitlist |
| `/login` | `Login`           | Sign in / create account — the target of "Start building"      |
| `/app`   | `AppHome`         | Wrapped in `RequireAuth`; redirects to `/login` when signed out |
| `*`      | —                 | Redirects to `/`                                               |

**Data flow.** `lib/api.js` is the only module that calls `fetch`. It reads the bearer token from
`lib/session.js` and throws an `Error` carrying `status`, so callers can distinguish a 401 (session
gone) from a 503 (database down). `AuthContext` exposes `user`, `isAuthenticated`, `signIn`,
`signUp`, `signOut` and `refresh` through `useAuth()`.

**Landing copy** lives entirely in `src/data/content.js` — features, steps, FAQs, footer columns and
nav links — so text edits never require touching a component.

**Scrolling.** `ScrollToTop` resets the viewport on route change but leaves hash links alone, so
in-page anchors still scroll smoothly.

Because the app uses the History API, a production host must rewrite unknown paths to
`index.html`. `vite preview` already does this locally.

---

## Design system

The entire visual language lives in one file: **`frontend/src/main.css`**. Cream-paper surfaces,
black ink — monochrome on purpose, so contrast carries the design instead of a colour accent.

| Token               | Value     | Used for                |
| ------------------- | --------- | ----------------------- |
| `--color-cream-50`  | `#fffdf8` | page background (paper) |
| `--color-cream-100` | `#fbf6ec` | soft section background |
| `--color-ink-950`   | `#000000` | buttons, headings, ink  |
| `--color-ink-600`   | `#555555` | body copy               |
| `--color-ink-400`   | `#909090` | muted labels            |

Each token is defined once in Tailwind's `@theme` block, which means every one of them is *also* a
utility: `bg-ink-950`, `text-ink-600`, `border-cream-300`. On top of that the file defines the
reusable `.btn` (`-primary`, `-light`, `-outline`, `-ghost`, `-lg`, `-block`), `.card`, `.chip`,
`.field`, `.eyebrow`, `.hairline`, `.grid-lines` and `.shell` classes, the `drift`/`ember`
animations, and the `.reveal` scroll-in transition (which honours `prefers-reduced-motion`).

`.btn-primary` is black on cream. `.btn-light` is its inverse, for the two dark panels (open source
and the waitlist form). Form fields are rounded rectangles rather than pills, so they read as fields
instead of search boxes.

**Type.** `Plus Jakarta Sans` for everything, `JetBrains Mono` for code. Self-hosted via Google
Fonts in `index.html`.

**Icons.** Every icon is a [Lucide](https://lucide.dev) component, funnelled through
`src/components/icons.jsx` so semantic names (`spark`, `chart`, `arrow`, …) map onto Lucide exports
in one place. They fill their wrapper via `h-full w-full` and inherit colour from `currentColor`.

> Note: Lucide v1 dropped brand logos, so there is no `Github` icon — the GitHub buttons use
> `Star`. The Levitron mark itself is `frontend/public/logo.png`, rendered through
> `src/components/Logo.jsx`; passing `tone="light"` puts it on a cream chip so it stays visible on
> the dark panels.

**Repo link.** The GitHub URL is defined once in `src/config.js` and derived from there everywhere
(navbar, open-source section, footer's Issues / Pull requests / Releases links).

---

## npm scripts

| Directory  | Command         | Does                                        |
| ---------- | --------------- | ------------------------------------------- |
| `backend`  | `npm run dev`   | `node --watch` with `.env` loaded           |
| `backend`  | `npm start`     | Same, without file watching                 |
| `frontend` | `npm run dev`   | Vite dev server on `:5173` with HMR          |
| `frontend` | `npm run build` | Production build → `frontend/dist`          |
| `frontend` | `npm run preview` | Serve the built output locally            |
| `frontend` | `npm run lint`  | ESLint                                      |

---

## Roadmap

- [x] Landing page and design system
- [x] Account system: register, login, JWT sessions, protected route
- [x] Waitlist persisted in MongoDB
- [x] REST foundation: health, stats, error and DB-state handling
- [ ] Prompt → outline generation through an OpenAI-compatible endpoint
- [ ] Theme engine (palette, type scale, grid) driven by CSS tokens
- [ ] PDF export with embedded fonts and vector charts
- [ ] PPTX handoff export
- [ ] CLI (`levitron build talk.yaml --out talk.pdf`) and Docker image

---

## Contributing

Issues and pull requests are welcome at
[github.com/Ininsico/Levitron](https://github.com/Ininsico/Levitron).

Before opening a PR: run `npm run build` and `npm run lint` in `frontend/`, and make sure
`/api/health` reports `"database": "connected"` locally.

Never commit a real `.env`. The root `.gitignore` ignores `.env` at every level and keeps
`.env.example` tracked — add new variables to the example file, with placeholder values only.

---

## Note for machines with `NODE_ENV=production`

If `NODE_ENV=production` is set globally, npm treats it as `--omit=dev` and silently skips
devDependencies, so `vite`, `tailwindcss` and `eslint` never install and `npm run build` fails with
"'vite' is not recognized". `frontend/.npmrc` pins `include=dev` so the project installs correctly
regardless of the host environment.

---

## License

MIT
