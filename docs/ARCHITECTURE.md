# ClubRate application architecture

ClubRate is a small React/Vite single-page app. It uses a numeric page state instead of a router, Supabase for club and review data, and CSS files colocated with most components.

## Startup and top-level tree

`src/main.tsx` finds the `#root` element, imports global CSS, and renders:

```text
StrictMode
└─ ThemeProvider
   └─ App
      └─ PageProvider
         └─ PageContainer
```

`ThemeProvider` owns the saved theme. `PageProvider` owns the current page number. `PageContainer` owns navigation history, the selected club, search filters, and randomization state, then renders the persistent header and floating controls around the active page.

## Page flow

There are four page numbers in `src/App.tsx`:

| Page | Component | Purpose |
| --- | --- | --- |
| 1 | `HomePage` | Search entry, top-rated shortcut, six category cards, and add-club shortcut |
| 2 | `CreatePage` | Form for submitting a club for approval |
| 3 | `ClubListingsPage` | Loads, filters, sorts, and displays approved clubs |
| 4 | `ClubDetail` | Shows one club and its community reviews |

`navigateTo` pushes the current page into a `useRef` history array before changing `pageNum`. The header's Back button pops that array; on a fresh non-home page it falls back to page 1. The selected club is kept in `PageContainer`, so opening a listing card sets it before switching to page 4.

The home search and category callbacks both navigate to page 3. Category searches add a term such as `#sport`, `#art`, `#culture`, `#fun`, or `#academic` to the shared `ClubFilters.query`. The “Major Specific” card opens a local picker; choosing a major sends its name as the query. The random button first fetches a random approved club and opens its detail page. If that fetch fails, it switches page 3 into seeded randomized-list mode.

## Shared data and Supabase boundary

`src/types/clubs.ts` contains the small shared vocabulary:

- `CategoryId` and `BrowseCategory` identify browse choices.
- `ClubFilters` is `{ query, commitment, minimumRating }`.
- `Category` is `{ id, name, description }`.

`src/data/categories.ts` supplies the six home cards. `src/data/majors.ts` supplies the three grouped major lists used by both the home picker and create form.

`src/utils/supabase.ts` creates the Supabase client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

`src/utils/approvedClubs.ts` is the read-through directory cache. `getApprovedClubRows()` selects approved rows from `public.clubs`, then fetches ratings for those IDs and calculates a mean enjoyment rating plus review count and a separately validated (integer 1–5) community commitment mean/count. Results are cached for 60 seconds; simultaneous callers share one pending promise. A ratings-query failure leaves club rows usable without aggregates. This function is called once in `PageContainer` on startup (warming the cache), then by the listings page and randomizer.

`clubFromRow` in `ClubListingsPage.tsx` converts a database row into the UI `Club` shape. It normalizes commitment labels, tags, majors, image URL, contact links, and optional rating fields. Invalid contact records and non-finite rating values are ignored.

## Home page components

`HomePage` receives the shared filters and four callbacks. `SearchFilter` is a labeled search form; submit opens the top-rated listing view. `TopRatedCard` is a single button shortcut. `CategoryCard` renders one `Category` as a button with a photo background and calls `onOpen(category.id)`. The create prompt calls `onCreateClub`.

`HomePage.css` provides the centered 1120px content width, category grid (3 columns, then 2 at 800px, then 1 at 560px), modal backdrop, and major-picker chips. `CategoryCard.css` maps each category to an image in `public/images`, adds a dark overlay for readable white text, and reduces card height on small screens. `TopRatedCard.css` uses the gold rating surface. `SearchFilter.css` styles the green-bordered search bar; its older filter-panel rules remain in the file but the current `SearchFilter.tsx` only renders the query input and submit button.

## Club listings

`ClubListingsPage` loads approved clubs in an effect and guards updates after unmount. It has local state for the loaded clubs, submitted query, loading/error display, sort mode, and sort-menu visibility. The toolbar updates the shared `ClubFilters`; submitting or blurring commits the query used for filtering.

Filtering searches name, description, tags, majors, and community commitment labels. Commitment filters group `none/low`, `moderate`, or `high/serious` using the community average; clubs without one are excluded from a commitment filter. Minimum rating compares against the aggregate, treating missing ratings as zero. Random mode shuffles with a deterministic linear-congruential generator and limits the result to ten. Finally, the list sorts by rating or community commitment average.

Each internal `ClubCard` is an accessible keyboard- and click-activated article. It shows `ClubLogo`, name, description, commitment pill, tags, optional major chips, rating stars/count, and a “View club” affordance. The ellipsis button expands majors without activating the card. `RatingStars` is read-only here. Loading, Supabase error, and no-results states are rendered as centered empty panels.

`Club-Listings.css` defines the wide listing layout, bordered cards, right-side rating column, dropdown menu, chips, focus rings, and the one-column mobile card layout at 720px. `ClubListingsPage` has no independent router; its optional `onClubClick` callback is supplied by `PageContainer`.

## Club detail and ratings

`ClubDetail` accepts an optional `Club`; absent data uses a sample robotics fallback. It displays a hero logo/initials, title, tags, description, and an Add a review button. The right rail contains, from top to bottom:

- Contact links: icon buttons for Instagram, Discord, GroupMe, and website.
- Official details: only the club-provided commitment level.
- Community details: enjoyment and commitment means calculated from loaded reviews, with numeric commitment average and nearest label/color. Missing commitment data is shown explicitly. There is no official enjoyment rating.

On mount (when the club ID is numeric), it selects that club's rows from `ratings`, ordered newest first. The review dialog collects a five-level weekly commitment, a 0.5-step enjoyment rating from 0.5 to 4, and a required note. `addReview` validates input, converts the stars into integer half-star units from 1 to 8, inserts an anonymous row, converts the returned value back to stars, and prepends the review to local state. Errors stay in the dialog; closing resets its fields.

`ClubDetail.css` lays out the two-column hero/detail grid, cards, commitment color scale, review list, contact icons, modal, and responsive single-column view at 760px. Some older rating/commitment class rules are retained for compatibility, but the current JSX uses community metrics and the official-details card.

## RatingStars

`RatingStars.tsx` draws each star as an inline SVG with an empty path and a clipped gold fill. `value` is clamped to the star count (default four), so fractional values render partial stars. `useId` makes clip-path IDs safe across multiple instances. Without `onChange` it renders an accessible `role="img"`; with `onChange` it renders a radiogroup with two transparent half-star buttons per star and Arrow/Home/End keyboard controls. `RatingStars.css` supplies the gold surface, outlines, hover/focus states, and disabled appearance.

## Add-a-club form

`src/components/createpage/createpage.tsx` keeps all form state locally: image preview/file, name, description, tags, available tags, targeted majors, commitment index, club type, contacts, submission status, and errors. It loads approved clubs' tags to extend the default tag menu.

The form is organized into four visual steps: basic information, commitment spectrum, club type, and contact links. Image selection creates a local preview; on submit, an image (if supplied) is uploaded to the `club_icons` bucket, then a `clubs` row is inserted with `approved: false`, JSON commitment/majors, tags (including `#clubType`), and cleaned contact URLs. The success message says approval is required, and the button is disabled after success.

The form imports `/src/components/createpage/createpagestyle.css` directly. That file is a large legacy-style sheet with its own generic selectors (`nav`, `h1`, `.layout`, `.field`, etc.), followed by theme-token overrides. `src/styles/createpagestyle.css` contains a second copy of the legacy form styles and is not imported by the current entry point. The current component uses `createpagestyle.css`, so generic rules should be edited cautiously.

## Header, randomizer, and theme

`AppHeader` is rendered for every page. Its `app-header__brand` is absolutely centered in the 1120px header content; the Back button remains in normal left flow when `canGoBack` is true. `AppHeader.css` loads Fraunces and sets the logo to 700 weight and 42px, while the rest of the app uses the Inter/system stack.

`RandomizeButton` is a fixed green dice button at bottom-left. `ThemeSwitch` is a fixed Light/System/Dark radio group at bottom-right. Both remain mounted across page changes. Their CSS files handle hover/focus states and smaller 560px offsets.

`ThemeProvider` stores `light`, `system`, or `dark` under `clubrate-theme` in local storage, writes `data-theme` and `color-scheme` on `<html>`, and exposes `useTheme`. `src/styles/global.css` defines light tokens (canvas, surfaces, green, gold, text, borders, shadows) plus dark and system variants. Component sheets use those variables, with a few fixed colors for commitment/status artwork. The current implementation supports dark/system modes even though the design brief describes a light-first experience.

## File coverage check

The architecture review covered every application source file returned by `rg --files` under `src/`: `main.tsx`, `App.tsx`, `PageContext.tsx`, theme provider, shared types/data/utilities, all TSX components, and every colocated/global CSS file, including both create-form style sheets and `clubrate-icon.svg`. The root `index.html`, `package.json`, `vite.config.ts`, `tsconfig.json`, and `README.md` were also checked for startup/build context. Public image files were identified from the category CSS; they are static assets rather than executable architecture.
