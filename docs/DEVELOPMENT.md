# Development

ClubRate is a Vite + React + TypeScript app. The package name is still `testproject`, but the browser title and product name are ClubRate.

## Prerequisites

- Node.js with npm (use a current LTS release).
- Access to the Supabase project and its public client values for local data reads.
- A browser with JavaScript enabled.

Check the tools:

```sh
node --version
npm --version
```

## Install

From the repository root:

```sh
npm ci
```

`package-lock.json` is committed, so `npm ci` keeps dependency versions reproducible. Use `npm install` only when intentionally changing dependencies or the lockfile.

## Environment

Create a local `.env.local` file in the repository root. Do not commit it:

```sh
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-public-key
```

Vite exposes only variables prefixed with `VITE_` to browser code. These values configure the Supabase browser client in `src/utils/supabase.ts`; detailed tables, queries, permissions, and rating behavior belong in [Data and Supabase](DATA_AND_SUPABASE.md).

Restart Vite after changing environment values. Never put a service-role or other secret key in a `VITE_` variable.

## Run locally

```sh
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). Vite watches `src/` and reloads the page as files change.

## Production validation

There is currently no `build` or `typecheck` npm script in `package.json`. Run the installed tools directly:

```sh
npx tsc --noEmit
npx vite build
```

The first command checks TypeScript. The second creates the production bundle in `dist/`. `dist/` is generated output; do not hand-edit it. If dependencies are not installed, run `npm ci` first.

## Project map

```text
index.html                 Vite entry document and page title
src/main.tsx               React root, StrictMode, ThemeProvider
src/App.tsx                Page routing/state and shared controls
src/PageContext.tsx        Current page number context
src/components/            Header, home, search, detail, create, ratings, controls
src/data/                  Browse categories and Cal Poly major lists
src/icons/                 Favicon SVG
src/theme/                 Theme context and localStorage persistence
src/types/                 Shared TypeScript domain types
src/utils/                 Supabase client and approved-club data access/cache
src/styles/                Global and create-page styles
public/images/             Category and club imagery referenced by URL
vite.config.ts             React and React Compiler/Babel plugins
tsconfig.json              Bundler-mode TypeScript configuration
```

The main user flow is home (page 1), create club (2), club listings (3), and club detail (4). `App.tsx` owns navigation history and passes callbacks into page components; CSS is colocated with most components.

## Troubleshooting

### `Permission denied` when starting Vite

Prefer the package script, which invokes the local dependency:

```sh
npm run dev
```

If a checked-out dependency binary lost its executable bit, reinstall dependencies without changing source files:

```sh
rm -rf node_modules
npm ci
```

If the repository itself is not writable or is on a mounted drive, move it to a writable workspace or fix directory permissions before retrying.

### `ImportMeta.env` or `ImportMeta` typing errors

`tsconfig.json` includes `"types": ["vite/client"]`, which supplies Vite's `import.meta.env` types. Keep that setting and ensure `vite` is installed. If adding custom environment names, declare them in a `src/vite-env.d.ts` file using Vite's `ImportMetaEnv` augmentation; keep runtime values prefixed `VITE_`.

### Supabase values are undefined or requests fail

Confirm `.env.local` is at the repository root, names match exactly, and the dev server was restarted. Check the browser console and Supabase policies. Do not “fix” this by exposing a secret key; see [Data and Supabase](DATA_AND_SUPABASE.md).

### Changes do not appear

Check that the edited file is imported by the active page, then stop and restart Vite. Hard-refresh the browser if an old asset remains. For images, confirm the URL matches a file under `public/` (for example `/images/fun-friends.png`).

## Safe change checklist

1. Read the relevant component, its CSS, and shared types before editing.
2. Keep product behavior and data access changes separate when possible.
3. Preserve keyboard labels, visible focus states, responsive gutters, and all three theme modes.
4. Keep secrets out of source and tracked `.env` files. Only public browser values belong in `VITE_` variables.
5. Run `npx tsc --noEmit` and `npx vite build`.
6. Run `npm run dev` and manually exercise the changed flow at desktop and narrow widths.
7. Review `git diff` and `git status`; do not commit generated `dist/` or unrelated files.
