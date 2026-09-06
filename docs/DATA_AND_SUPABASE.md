# ClubRate data and Supabase

This is a hand-written map of the data path in the current app. It describes
what the source actually does first, then calls out database details that are
inferred and therefore need checking in the Supabase dashboard.

## Client setup and environment

`src/utils/supabase.ts` creates one browser client:

```ts
createClient(import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
```

Vite exposes only variables prefixed with `VITE_`. Set these in the local
`.env`/`.env.local` file (never commit that file):

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-or-anon-key>
```

The key is intentionally a public browser key; it is not a service-role key.
Database and storage RLS policies are the security boundary. The source does
not check that either variable exists before calling `createClient`.

## Tables and columns used

The following is directly observed from `select`, `insert`, and filter calls.
The table names are `public.clubs` and `public.ratings` (the ratings calls omit
`.schema("public")`, but the default client schema is public).

### `public.clubs`

| Column | How the app uses it |
| --- | --- |
| `id` | Numeric club id; converted to a string in the UI. |
| `name` | Displayed and inserted after trimming. |
| `description` | Displayed and inserted after trimming. |
| `image` | URL string or null; rendered as the club logo. |
| `approved` | Directory filters `true`; submissions insert `false`. |
| `club_statistics` | JSON/object; reads `commitment_level` and `majors`. |
| `tags` | String array; used for filtering, category, and tag chips. |
| `contact_links` | JSON/array of `{ platform, url }`; validated loosely on read. |
| `club_info_last_updated` | Submission writes an ISO timestamp. |
| `meeting_info` | Submission writes an empty array; current detail page does not read it. |
| `created_at` | Directory orders newest first. |

### `public.ratings`

| Column | How the app uses it |
| --- | --- |
| `id` | Numeric review id. |
| `created_at` | Sorts reviews newest first and is displayed as a date. |
| `name` | Displayed, but new reviews always use `"Anonymous"`. |
| `rating` | Enjoyment score stored as an integer half-star unit from 1–8 (for example, `1` = 0.5 stars, `3` = 1.5 stars, and `8` = 4 stars). The UI converts this to 0.5–4 stars by dividing by 2 before display and aggregation. |
| `review` | Required by the UI as a non-empty note, then displayed. |
| `club_id` | Links a rating to `clubs.id`. |
| `commitment` | Numeric 1–5, displayed as a commitment label. |

These types are not generated from Supabase. They are hand-written TypeScript
casts, so a schema/type mismatch will only be noticed at runtime.

## Approved-club directory read and cache

`getApprovedClubRows()` in `src/utils/approvedClubs.ts`:

1. Reads `clubs` with the narrow select
   `id, name, description, image, club_statistics, tags, contact_links`.
2. Keeps only `approved = true` and orders by `created_at DESC`.
3. Fetches `ratings(club_id, rating, commitment)` for the returned ids.
4. Validates stored ratings as integers in the inclusive range 1–8, converts
   them to UI stars by dividing by 2, and calculates a client-side average and
   count. It separately validates commitments as integers in the inclusive range
   1–5 and calculates a `community_commitment` mean/count. Invalid values are skipped;
   official club commitment is never used for this aggregate. These aggregates are not
   written back to `clubs`.
5. Caches the resulting array for 60 seconds per browser session. Concurrent
   callers share one pending promise. If the ratings read fails, clubs still
   return without rating fields; if the clubs read fails, the promise rejects.

The app starts this request on the home page (`App.tsx`) and listings map each
row through `clubFromRow()` (`ClubListingsPage.tsx`): numeric ids become string
ids/slugs; the first tag is the category; commitment is inferred from the
`club_statistics.commitment_level` text; `majors` is retained only when it is
an array of strings; and malformed contact-link entries are dropped.

## Club submission and image upload

`src/components/createpage/createpage.tsx` loads existing approved `tags` to
extend a default tag list. Before submit, the browser requires a trimmed name,
description, and club type. It appends a `#<type>` tag if missing.

If an image was selected, it uploads to Storage bucket `club_icons` at:

```text
clubs/<crypto.randomUUID()>.<lowercase-file-extension>
```

The upload uses the browser file MIME type, `cacheControl: "3600"`, and
`upsert: false`. It then calls `getPublicUrl()` and stores that URL in
`clubs.image`. The source does not enforce file size, dimensions, MIME type,
or extension safety beyond the file-picker's `accept="image/*"` hint.

The inserted club payload is effectively:

```js
{
  name, description, approved: false, image,
  club_statistics: { commitment_level, majors },
  club_info_last_updated: new Date().toISOString(),
  meeting_info: [], tags,
  contact_links: nonEmptyLinks.map(({platform, value}) => ({platform, url: value.trim()}))
}
```

There is no approval UI or admin call in this repository. A separate trusted
workflow must set `approved = true`.

## Review reads and inserts

On a detail page, the app reads all ratings for the selected numeric
`club_id`, selecting the columns above and ordering by `created_at DESC`.
The detail-page enjoyment average is calculated from the loaded review list.
The listing-page averages are calculated by the shared directory helper, so both
enjoyment and commitment are community aggregates; missing community commitment
is shown explicitly and never falls back to official data.

Posting requires a valid club id, a selected enjoyment value, and a trimmed
note. The browser converts the selected UI rating (`0.5`–`4` stars) to an
integer half-star unit (`1`–`8`) before inserting the anonymous row, and
selected `commitment`, then immediately requests the inserted row with
`.select(...).single()`. The new row is prepended locally after success. There
is no authentication, duplicate-review prevention, server-side validation, or
moderation workflow in the source.

## Inferred schema and policy checklist

The following is guidance inferred from the calls, not verified database
metadata. Confirm names, types, defaults, and constraints before applying it.

Likely shape:

```sql
-- Verify rather than blindly run; JSONB is inferred from the source.
clubs(id bigint generated by default as identity primary key,
      name text, description text, image text, approved boolean,
      club_statistics jsonb, tags text[], contact_links jsonb,
      club_info_last_updated timestamptz, meeting_info jsonb,
      created_at timestamptz default now());

ratings(id bigint generated by default as identity primary key,
        created_at timestamptz default now(), name text, rating integer,
        review text, club_id bigint references clubs(id), commitment integer);
```

For the current unauthenticated browser behavior to work, policies would need
to permit public `SELECT` on approved clubs (and the tag query), public
`SELECT` on ratings, and public `INSERT` on ratings. Because posting uses
`insert(...).select().single()`, the inserting client also needs a matching
`SELECT` policy for the inserted rating. Submitting a club needs public
`INSERT` on `clubs`; the policy should force or check `approved = false` so a
client cannot self-approve. Storage bucket `club_icons` must permit the public
upload path used by this form, and must be public (or otherwise readable by
the browser) if `getPublicUrl()` images are expected to render. These broad
anonymous write policies have abuse risk; authenticated users, server-side
validation, moderation, and rate limits are safer production choices.

Useful verification queries (run in the Supabase SQL editor):

```sql
select column_name, data_type, udt_name
from information_schema.columns
where table_schema = 'public' and table_name in ('clubs', 'ratings')
order by table_name, ordinal_position;

select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename in ('clubs', 'ratings');
```

## Common failures

- Missing/wrong Vite variables: the client cannot reach the project. Restart
  the Vite dev server after changing `.env` values.
- `clubs` read denied or a missing column: listings show “Could not load
  clubs”; the home-page prefetch silently ignores its error.
- `ratings` read denied: listings still load, but ratings are absent; detail
  pages show the review-load error.
- Review insert denied, or insert lacks a readable returning row: the dialog
  shows the Supabase error and does not add the review locally.
- Club insert denied: the submission stays on the form with the database
  error. If upload succeeded first, the image object is left orphaned.
- Storage upload denied or bucket missing: submission stops before inserting;
  the user sees the upload error.
- Non-public bucket or invalid image URL: the row inserts, but the logo cannot
  render in the browser.
- Stored ratings outside integer 1–8 or non-numeric values are ignored by both
  directory aggregation and detail-page display.
- Unexpected JSON shapes are tolerated for tags, majors, and contact links,
  but may produce empty UI fields rather than a visible schema error.

## Files inspected

`src/utils/supabase.ts`, `src/utils/approvedClubs.ts`,
`src/components/createpage/createpage.tsx`,
`src/components/ClubDetail/ClubDetail.tsx`,
`src/components/clubview/ClubListingsPage.tsx`, `src/App.tsx`,
`src/types/clubs.ts`, `package.json`, and `README.md`.
