# FLIGHT400 Lab — GitHub Pages Instructor Guide

> This file is committed to the repository but is **never served by GitHub Pages**.
> GitHub Pages only publishes the `docs/` folder. Everything in `instructor-setup/` is
> visible only to people with repo access — not reachable from any public URL.

---

## 1. Repo Layout

```
docs/                       ← GitHub Pages root (everything here is public)
  index.html                ← Generic landing page (no company branding)
  css/styles.css            ← Shared styles — used by all event subfolders
  js/app.js                 ← Shared JS — used by all event subfolders
  tracks/                   ← Shared exercise partials — used by all event subfolders
    setup.html
    track-1.html … track-7.html
  img/                      ← Shared images

  _template/                ← ⚠️ NEVER EDIT — copy this for each new event
    index.html              ← DO NOT EDIT — identical copy for every event
    js/config.js            ← DO NOT EDIT — this is the template you copy, not fill in

  first-acceptance/         ← Example filled-in event (First Acceptance Bobathon 2026)
    index.html
    js/config.js

instructor-setup/           ← THIS FOLDER — repo only, never public
  Github-Pages-Instructor-Guide.md
```

**Key rule:** GitHub Pages publishes everything inside `docs/`. The `instructor-setup/` folder at the repo root is private to collaborators.

> ⚠️ **NEVER modify `docs/_template/` directly.** It is the master template. Always copy it to a new folder for your event and edit the copy. If you edit `_template/` itself you will corrupt the starting point for all future events.

---

## 2. How It Works

Each company subfolder (e.g. `docs/first-acceptance/`) contains only **two files**:

| File | What it does |
|---|---|
| `index.html` | Identical copy of `docs/_template/index.html` — loads shared CSS, JS, and tracks from `../` — **never edit this** |
| `js/config.js` | The **only file you edit** — company name, event date, colors, agenda, attendee table, Box folder URL |

All CSS, JS, track partials, and images live in `docs/` and are shared across every event subfolder via relative `../` paths. Updating a track exercise in `docs/tracks/` automatically updates every company event page.

---

## 3. Setting Up GitHub Pages

1. In your GitHub repo, go to **Settings → Pages**.
2. Set **Source** to **Deploy from a branch**.
3. Set **Branch** to your working branch (e.g. `github-pages-cameron`).
4. Set **Folder** to `/docs`.
5. Click **Save**.

GitHub Pages publishes everything inside `docs/` to:
```
https://<org>.github.io/<repo>/
```

The URLs for each event are then:
```
https://<org>.github.io/<repo>/                    ← generic (no company branding)
https://<org>.github.io/<repo>/first-acceptance/   ← First Acceptance example
https://<org>.github.io/<repo>/contoso/            ← Contoso event (when you add it)
```

You give attendees the company-specific URL. The `_template/` and `instructor-setup/` paths exist in the repo but are not meaningful pages to share.

---

## 4. Adding a New Company Event

### Step 1 — Copy the template (never edit _template directly)

```bash
cp -r docs/_template docs/contoso
```

> ⚠️ Always copy — **never edit `docs/_template/` itself**. The template must stay clean so future events start from a known-good baseline.

### Step 2 — Edit `docs/contoso/js/config.js` only

This is the **only file you touch in the new folder**. Do not edit `index.html`. Fill in every field:

```js
window.FLIGHT400_CONFIG = {

  companyName:  'Contoso',
  eventName:    'Contoso Dev Day 2026',
  eventDate:    'Thursday, November 5, 2026',

  primaryColor: '#0078D4',   // Contoso blue — optional
  accentColor:  '#FFB900',   // Contoso gold — optional

  // URL to the Box folder containing IBM i credentials & ssh_private_key.pem.
  // Shown as a link in Setup step 5. Set to null to hide.
  boxFolderUrl: 'https://ibm.ent.box.com/folder/YOUR_FOLDER_ID',

  agendaItems: [
    { time: '10:00 – 10:15', title: 'Welcome', bullets: ['...'] },
    // add more sessions...
  ],

  attendeeTable: [
    { student: 1, attendeeName: 'Alice Smith',  library: 'FLGHT401', devPort: 3001, reactUrl: 'http://localhost:3001' },
    { student: 2, attendeeName: 'Bob Jones',    library: 'FLGHT402', devPort: 3002, reactUrl: 'http://localhost:3002' },
    // add all attendees...
  ]
};
```

### Step 3 — Commit and push

```bash
git add docs/contoso/
git commit -m "add Contoso Dev Day 2026 event"
git push
```

GitHub Pages redeploys automatically (usually within 1–2 minutes).

### Step 4 — Share the URL with attendees

```
https://<org>.github.io/<repo>/contoso/
```

---

## 5. Filling in the Attendee Table

The `attendeeTable` array populates the assignment table on the Setup card. Add one row per attendee.

### Field reference

| Field | Required | Description |
|---|---|---|
| `student` | ✅ | Sequential row number: 1, 2, 3… |
| `library` | ✅ | IBM i library assigned to this attendee — e.g. `'FLGHT401'` |
| `devPort` | ✅ | Dev server port — e.g. `3001` |
| `reactUrl` | ✅ | Full URL for the React app — typically `'http://localhost:' + devPort` |
| `attendeeName` | optional | Attendee's display name — when **any** row includes this field, a **Name** column is automatically added to the table header and all rows. Omit from every row to hide the column entirely. |

### Library and port numbering

The library name and port are not required to follow a strict sequential pattern — assign whatever your IBM i environment actually has provisioned. The typical convention is:

| Field | Typical Pattern |
|---|---|
| `library` | `'FLGHT4'` + zero-padded number matching the IBM i setup — e.g. `FLGHT401`, `FLGHT402`… `FLGHT410`, `FLGHT411`… |
| `devPort` | Matches the library suffix: `3001`, `3002`… |
| `reactUrl` | `'http://localhost:'` + devPort |

> ⚠️ Always confirm the actual library names and ports from your IBM i administrator or TechZone provisioning details before filling in the table. Do not guess or assume they start at `01`.

### Example for 5 attendees with names

```js
attendeeTable: [
  { student: 1, attendeeName: 'Alice Smith',   library: 'FLGHT401', devPort: 3001, reactUrl: 'http://localhost:3001' },
  { student: 2, attendeeName: 'Bob Jones',     library: 'FLGHT402', devPort: 3002, reactUrl: 'http://localhost:3002' },
  { student: 3, attendeeName: 'Carol White',   library: 'FLGHT403', devPort: 3003, reactUrl: 'http://localhost:3003' },
  { student: 4, attendeeName: 'Dan Brown',     library: 'FLGHT404', devPort: 3004, reactUrl: 'http://localhost:3004' },
  { student: 5, attendeeName: 'Eve Martinez',  library: 'FLGHT405', devPort: 3005, reactUrl: 'http://localhost:3005' }
]
```

### Example without names (hides the Name column)

```js
attendeeTable: [
  { student: 1, library: 'FLGHT401', devPort: 3001, reactUrl: 'http://localhost:3001' },
  { student: 2, library: 'FLGHT402', devPort: 3002, reactUrl: 'http://localhost:3002' },
  { student: 3, library: 'FLGHT403', devPort: 3003, reactUrl: 'http://localhost:3003' }
]
```

---

## 6. Track Content — Defaults, Overrides, and Filtering

Track content is loaded at runtime by `app.js` using a **local-first, shared-fallback** strategy. Each event folder is fully isolated from every other.

### How track loading works

For each track slug, `app.js`:
1. Tries to fetch `<eventslug>/tracks/<slug>.html` (local to that event folder).
2. If that returns a 404, falls back to the shared `docs/tracks/<slug>.html`.
3. If both fail, skips that track with a console warning.

This means a fresh template copy with no local track files works out of the box — all tracks come from the shared folder. Local files are opt-in overrides.

---

### Scenario A — Default (no action required)

Copy the template, edit `config.js`, deploy. All 8 tracks load from the shared `docs/tracks/` folder automatically.

---

### Scenario B — Company-specific track content

To customise a single track for one event without affecting any other:

```bash
# Create the local tracks folder
mkdir -p docs/contoso/tracks

# Copy the track you want to customise
cp docs/tracks/track-1.html docs/contoso/tracks/track-1.html

# Edit the copy — the shared original is untouched
```

`docs/contoso/` now serves its own `track-1.html`; all other tracks still come from `docs/tracks/`. Every other event folder is completely unaffected.

---

### Scenario C — Show only a subset of tracks

Add the `tracks` field to `config.js`. This is a **complete replacement** of the default list — only the slugs you specify will load, in the order you specify them.

```js
// In docs/contoso/js/config.js
tracks: ['setup', 'track-1', 'track-3', 'track-4']
```

Valid slugs: `'setup'`, `'track-1'`, `'track-2'`, `'track-3'`, `'track-4'`, `'track-5'`, `'track-6'`, `'track-7'`

Omit the `tracks` field entirely to show all 8 in the default order.

---

### Updating shared tracks

Editing a file in `docs/tracks/` still affects all events that have **not** placed a local override for that slug. This is usually desirable (a bug fix propagates everywhere), but coordinate before pushing changes during an active Bobathon.

---

## 7. What Attendees Can and Cannot See

| URL | Visible to attendees? |
|---|---|
| `…/<repo>/` | ✅ Generic landing page |
| `…/<repo>/first-acceptance/` | ✅ First Acceptance event page |
| `…/<repo>/_template/` | ⚠️ Reachable URL but shows placeholder config (no real company data) |
| `instructor-setup/Github-Pages-Instructor-Guide.md` | ❌ Not inside `docs/` — never served |

> ✅ Each company's attendee table is only in that company's `config.js`. Attendees at one event cannot see another event's table — as long as you don't share the wrong URL.

---

## 8. Per-Event Checklist

- [ ] `cp -r docs/_template docs/<eventslug>` — **copy, never edit `_template/` itself**
- [ ] Edit `docs/<eventslug>/js/config.js` only — do not touch `index.html`:
  - [ ] `companyName`
  - [ ] `eventName`
  - [ ] `eventDate`
  - [ ] `primaryColor` / `accentColor` *(optional)*
  - [ ] `boxFolderUrl` — Box folder with IBM i credentials & key *(set to `null` to hide)*
  - [ ] `agendaItems[]` *(remove array or set to `[]` to hide Agenda button)*
  - [ ] `attendeeTable[]` — one row per attendee; confirm library names & ports from IBM i admin
  - [ ] `tracks: [...]` — *(optional)* list only the slugs needed; omit to show all 8
- [ ] *(optional)* For company-specific track content: `mkdir -p docs/<eventslug>/tracks` and copy + edit the relevant `docs/tracks/<slug>.html` files into it
- [ ] Commit and push
- [ ] Verify site at `https://<org>.github.io/<repo>/<eventslug>/`
- [ ] Share URL with attendees — do NOT share this guide
