---
name: ibmi-react-vite
description: >
  Use when the user wants to scaffold, build, or run a React + Vite application
  in the IBM i PASE IFS environment. Covers creating the project, installing
  Carbon Design System (@carbon/react), patching esbuild for os400 ppc64 BE,
  configuring SCSS themes, and producing a clean production build. Activate
  whenever the user mentions "React on IBM i", "Vite on IBM i", "PASE frontend",
  "Carbon React on IBM i", or hits esbuild platform errors on os400.
---

# React + Vite on IBM i PASE

This skill guides every step of building a React 18 + Vite 4 single-page application
inside PASE on IBM i (os400, ppc64 BE). Follow the steps in order; each section calls
out the exact command, the reason it is needed, and the gotchas that will otherwise
silently break the build.

---

## 0 — Gather requirements first

Before writing any files use `ask_followup_question` to confirm:

1. **Screen / page name** — becomes the project directory and Vite `<screen-name>`.
   Must be lowercase-kebab (e.g. `create-order`, `flight-list`).
2. **Target IFS path** — default is `$HOME/flight400-frontend-apps/<screen-name>/`.
   Confirm the parent directory exists or create it with `mkdir -p`.
3. **Carbon version wanted** — default `@carbon/react ^1.x` (v1 = Carbon 11).
4. **Theme** — default `g100` (dark). Other options: `white`, `g10`, `g90`.
5. **Dev-server port** — default `3000`; choose one that is not already in use on the IBM i.

---

## 1 — Check the environment

```bash
node --version   # must be >= 18
npm --version    # must be >= 9
```

Run this with `execute_pase_command`. If Node is missing, stop and ask the user to
install the IBM i Open Source Node.js package (`yum install nodejs22`).

---

## 2 — Scaffold with Vite

```bash
cd <parent-dir>
npm create vite@4 <screen-name> -- --template react
```

`npm create vite@4` scaffolds with `@vitejs/plugin-react`, `vite ^4`, and a minimal
`src/` tree. Accept the defaults — do **not** install yet.

---

## 3 — Write `package.json` (all deps in one shot)

Overwrite the generated `package.json` with the full dependency list before installing,
so a single `npm install` fetches everything:

```json
{
  "name": "<screen-name>",
  "private": true,
  "version": "1.0.0",
  "description": "<description>",
  "type": "module",
  "scripts": {
    "dev":     "ESBUILD_BINARY_PATH=$(node -e \"require.resolve('esbuild-wasm/bin/esbuild')\" | xargs) vite --host 0.0.0.0 --port <port>",
    "build":   "ESBUILD_BINARY_PATH=$(node -e \"require.resolve('esbuild-wasm/bin/esbuild')\" | xargs) vite build",
    "preview": "vite preview --host 0.0.0.0 --port 4173"
  },
  "dependencies": {
    "@carbon/icons-react": "^11.0.0",
    "@carbon/react": "^1.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "sass": "^1.63.6"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "esbuild-wasm": "^0.18.20",
    "vite": "^4.4.5"
  }
}
```

Key points:
- `esbuild-wasm` **must** be a devDependency — it is the WASM-based fallback for
  the native esbuild binary that does not exist on os400 ppc64 BE.
- `sass` is required for Carbon SCSS compilation.
- The `dev` and `build` scripts set `ESBUILD_BINARY_PATH` via command substitution.
  This covers the Vite *transform* pipeline, but **not** Vite's internal
  config-bundling step — see Step 5 for the patch that fixes the remaining gap.

---

## 4 — Install dependencies

```bash
cd <project-dir>
npm install --ignore-scripts
```

Always pass `--ignore-scripts`. Without it, esbuild's own `postinstall` tries to
download a native ppc64 BE binary, which either fails or hangs indefinitely on os400.

---

## 5 — Patch esbuild for os400 (CRITICAL — never skip)

This is the single most important step. Vite 4 uses esbuild internally to **bundle
its own `vite.config.js`** before the `ESBUILD_BINARY_PATH` env var is evaluated.
Without this patch every build fails with:

```
Error: Unsupported platform: os400 ppc64 BE
```

### Why the env var alone is not enough

`esbuild/lib/main.js` reads `ESBUILD_BINARY_PATH` at module-load time:

```js
var ESBUILD_BINARY_PATH = process.env.ESBUILD_BINARY_PATH || ESBUILD_BINARY_PATH;
```

The right-hand `ESBUILD_BINARY_PATH` is a **compile-time constant** that esbuild
injects into its own bundle. For the npm package it resolves to `undefined`. When
Vite loads esbuild to bundle the config file, the env var set in the shell does
not survive into the Node.js module scope, so `ESBUILD_BINARY_PATH` stays
`undefined`, esbuild falls through to the platform lookup, and throws for `os400`.

### The fix — write and run `patch-esbuild.cjs`

Write this file to the project root with `write_stream_file`, then run it once:

```js
// patch-esbuild.cjs  — re-run after every npm install
'use strict';
const fs = require('fs');
const wasmPath = require.resolve('esbuild-wasm/bin/esbuild');
const mainPath = require.resolve('esbuild/lib/main.js');
let src = fs.readFileSync(mainPath, 'utf8');
const OLD = 'var ESBUILD_BINARY_PATH = process.env.ESBUILD_BINARY_PATH || ESBUILD_BINARY_PATH;';
const NEW =
  `var ESBUILD_BINARY_PATH = process.env.ESBUILD_BINARY_PATH || ` +
  `(require('os').platform() === 'os400' ? '${wasmPath}' : ESBUILD_BINARY_PATH);`;
if (src.includes(OLD)) {
  fs.writeFileSync(mainPath, src.replace(OLD, NEW));
  console.log('esbuild patched for os400 ->', wasmPath);
} else {
  console.log('pattern not found — already patched or esbuild version changed');
}
```

Run it:

```bash
node patch-esbuild.cjs
```

Verify the patch applied cleanly:

```bash
node -e "require('./node_modules/esbuild/lib/main.js'); console.log('esbuild OK')"
```

> **Re-run `node patch-esbuild.cjs` after every `npm install` or `npm ci`**
> that regenerates `node_modules`, and after any esbuild version bump.
> Do NOT add it to `postinstall` in `package.json` — `--ignore-scripts` would
> prevent it from running and the failure would be silent.

---

## 6 — Write `vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],

  server:  { host: '0.0.0.0', port: <port> },
  preview: { host: '0.0.0.0', port: 4173 },

  css: {
    preprocessorOptions: {
      scss: {
        // Let Sass resolve bare @use '@carbon/*' paths from node_modules
        loadPaths: [path.resolve(__dirname, 'node_modules')],
        // Suppress Sass 1.x deprecation noise from Carbon internals
        quietDeps: true,
        silenceDeprecations: [
          'color-functions',
          'global-builtin',
          'import',
          'legacy-js-api',
        ],
      },
    },
  },

  build: {
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Split Carbon into its own chunks for better browser cache utilisation
        manualChunks: {
          carbon: ['@carbon/react'],
          icons:  ['@carbon/icons-react'],
        },
      },
    },
  },
});
```

Key points:
- `host: '0.0.0.0'` is required so the dev server is reachable from outside the
  IBM i partition (e.g. a developer's browser on the LAN).
- `loadPaths` lets the SCSS compiler find `@carbon/*` without needing `~` tildes.
- Do **not** include `'mixed-decls'` in `silenceDeprecations` — it was removed from
  Sass and listing it produces its own warning.

---

## 7 — Write the Carbon SCSS entry point

Create `src/styles/theme.scss`:

```scss
// ── 1. Set theme BEFORE importing component styles (order is mandatory) ──────
@use '@carbon/react/scss/themes' as themes;
@use '@carbon/react/scss/theme' with (
  $theme: themes.$g100   // swap for $white / $g10 / $g90 as needed
);

// ── 2. All Carbon component styles ───────────────────────────────────────────
@use '@carbon/react/scss/components';

// ── 3. Carbon grid / layout utilities (optional) ─────────────────────────────
@use '@carbon/react/scss/grid';

// ── App-level resets ──────────────────────────────────────────────────────────
*, *::before, *::after { box-sizing: border-box; }

html, body, #root {
  height: 100%;
  margin: 0;
  background-color: var(--cds-background);
  color: var(--cds-text-primary);
  font-family: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;
}
```

**Critical ordering rule:** `@use '@carbon/react/scss/theme' with ($theme: ...)` must
appear **before** `@use '@carbon/react/scss/components'`. Reversing the order silently
falls back to the white theme regardless of the `$theme` value.

Then import this file as the **first** import in `src/main.jsx`:

```jsx
import './styles/theme.scss';  // MUST be first
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// ...
```

---

## 8 — Find the correct Carbon icon names

Carbon icon exports are case-sensitive and do not always match intuitive names.
A wrong name causes a hard Rollup build error:

```
"Airplane" is not exported by node_modules/@carbon/icons-react/es/index.js
```

Run this snippet to discover the correct name before adding any icon import:

```bash
node -e "
const icons = require('./node_modules/@carbon/icons-react/es/index.js');
const names = Object.keys(icons);
['plane','air','user','refresh','renew','check','location','flight'].forEach(term =>
  console.log(term + ':', names.filter(n => n.toLowerCase().includes(term)).slice(0,6).join(', '))
);
"
```

Common names that differ from intuition:

| What you might guess | Correct export name |
|---|---|
| `Airplane`  | `Plane`              |
| `Refresh`   | `Renew`              |
| `Users`     | `UserMultiple`       |
| `Check`     | `Checkmark`          |
| `Airport`   | `AirlineManageGates` |

Always verify before writing the import statement.

---

## 9 — Clean up Vite boilerplate

Remove generated files that conflict with the Carbon-based layout:

```bash
rm -f src/index.css src/App.css src/assets/react.svg public/vite.svg
```

Update `index.html`: change `<title>` to match the screen name and remove the
`public/vite.svg` favicon reference.

---

## 10 — Run the build

```bash
npm run build
```

A successful build looks like:

```
✓ 915 modules transformed.
dist/index.html                   0.88 kB │ gzip:  0.50 kB
dist/assets/index.css           731 kB    │ gzip: 77 kB
dist/assets/index.js             10 kB    │ gzip:  3.3 kB
dist/assets/carbon.js           229 kB    │ gzip: 74 kB
✓ built in ~20s
```

---

## 11 — Start the dev server

```bash
npm run dev
```

Access at `http://<ibmi-hostname>:<port>`. The `0.0.0.0` bind makes it reachable
from any host on the network, not just `localhost` inside PASE.

---

## Troubleshooting quick-reference

| Symptom | Root cause | Fix |
|---|---|---|
| `Error: Unsupported platform: os400 ppc64 BE` | esbuild native binary missing | Re-run `node patch-esbuild.cjs` (Step 5) |
| `Cannot find module 'esbuild-wasm/bin/esbuild'` | `esbuild-wasm` not installed | `npm install --ignore-scripts esbuild-wasm@0.18.20` then re-patch |
| `"<Icon>" is not exported by ...@carbon/icons-react` | Wrong icon name | Use Step 8 snippet to find the correct export |
| SCSS `@use` resolution error for `@carbon/*` | `loadPaths` missing | Add `loadPaths: [path.resolve(__dirname, 'node_modules')]` |
| Carbon renders in **white** despite `$g100` | Theme `@use` is after components | Move theme `@use` **before** `@use components` in `theme.scss` |
| `DEPRECATION WARNING [mixed-decls] is obsolete` | Listed in `silenceDeprecations` but removed from Sass | Remove `'mixed-decls'` from the list |
| `DEPRECATION WARNING [legacy-js-api]` floods output | Vite 4 uses Sass legacy JS API | Add `'legacy-js-api'` to `silenceDeprecations` |
| Dev server unreachable from browser | `host` defaults to `localhost` | Set `server: { host: '0.0.0.0' }` in vite config |
| `npm install` hangs or download fails | esbuild/other postinstall scripts run | Always pass `--ignore-scripts` |

---

## Project file checklist

```
<screen-name>/
├── index.html                  ← updated <title>, no vite.svg favicon
├── package.json                ← esbuild-wasm + @carbon/react + sass in deps
├── patch-esbuild.cjs           ← re-runnable os400 esbuild patch script
├── vite.config.js              ← loadPaths + silenceDeprecations + manualChunks
├── node_modules/               ← installed with --ignore-scripts
└── src/
    ├── main.jsx                ← theme.scss imported FIRST
    ├── App.jsx
    ├── <ScreenName>.jsx        ← page component using Carbon components
    └── styles/
        └── theme.scss          ← theme @use BEFORE components @use
```

## IBM i Node Runtime Requirements
Before performing any React, Vite, Carbon, npm, esbuild, or Node.js task:

NODE=/QOpenSys/pkgs/lib/nodejs22/bin/node
NPM_CLI=/QOpenSys/pkgs/lib/nodejs22/lib/node_modules/npm/bin/npm-cli.js

Verify:

`$NODE --version`
`$NODE $NPM_CLI --version`

Never assume node, npm, or npx are available in PATH.

All shell scripts must export:

PATH=/QOpenSys/pkgs/lib/nodejs22/bin:/QOpenSys/pkgs/bin:/QOpenSys/usr/bin:/usr/bin:/bin

When starting development servers:

- Use wrapper scripts.
- Use nohup for background execution.
- Log to /tmp/vite-dev.log.

When a Node.js tool fails with:
node: No such file or directory
assume PATH inheritance is broken before assuming the package is broken.
Prefer fixing PATH once globally rather than modifying installed dependencies.
