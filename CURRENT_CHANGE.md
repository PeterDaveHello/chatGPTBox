# Node.js v22+ Upgrade Plan — ChatGPTBox

## Executive Summary

This document describes the plan to upgrade the ChatGPTBox browser extension project from **Node.js 20** to **Node.js 22** (LTS). The upgrade affects CI/CD pipelines, project metadata, and developer documentation. No source code changes are required.

| Item | Current | Target |
|---|---|---|
| Node.js version (CI) | 20 | 22 |
| `engines` field in `package.json` | absent | `">=22"` |
| `AGENTS.md` documentation | "requires Node 20+" | "requires Node 22+" |
| `.nvmrc` | absent | `22` (recommended) |

**Risk level: LOW.** All production and development dependencies are compatible with Node.js 22. No breaking API changes affect this project. The source code targets browser environments and contains no Node.js runtime APIs. The only files that need to change are configuration and documentation files.

---

## Pre-Upgrade Checklist

Before making any changes, verify the following on your local machine:

### 1. Confirm current Node.js version

```bash
node --version
# Expected: v20.x.x (current baseline)
npm --version
# Expected: 10.x.x
```

### 2. Install Node.js 22

Use `nvm` (recommended) or download from https://nodejs.org/en/download:

```bash
# Using nvm
nvm install 22
nvm use 22
node --version
# Expected: v22.x.x
```

Or using `fnm`:

```bash
fnm install 22
fnm use 22
node --version
```

### 3. Verify npm version bundled with Node 22

```bash
npm --version
# Expected: 10.x.x (npm 10 ships with Node 22)
```

### 4. Confirm the project builds cleanly on Node 20 before switching

```bash
# On Node 20 (baseline)
npm ci
npm run build
# Verify build/chromium/, build/firefox/, build/chromium-without-katex-and-tiktoken/, build/firefox-without-katex-and-tiktoken/ all exist
ls build/chromium/manifest.json build/chromium/background.js build/chromium/content-script.js
```

### 5. Record baseline test and lint results

```bash
npm test
npm run lint
# Note any pre-existing warnings or failures — do not introduce new ones
```

---

## Upgrade Steps

The following steps are ordered. Complete each step before proceeding to the next.

### Step 1 — Update `.github/workflows/pr-tests.yml`

**File:** [`.github/workflows/pr-tests.yml`](.github/workflows/pr-tests.yml:35)

Change line 35:

```yaml
# Before
        node-version: 20

# After
        node-version: 22
```

Full context for the change (lines 33–36):

```yaml
      - uses: actions/setup-node@v6
        with:
          node-version: 22   # changed from 20
      - run: npm ci
```

---

### Step 2 — Update `.github/workflows/pre-release-build.yml`

**File:** [`.github/workflows/pre-release-build.yml`](.github/workflows/pre-release-build.yml:26)

Change line 26:

```yaml
# Before
          node-version: 20

# After
          node-version: 22
```

Full context for the change (lines 24–28):

```yaml
      - uses: actions/setup-node@v6
        with:
          node-version: 22   # changed from 20
          cache: 'npm'
          cache-dependency-path: '**/package-lock.json'
```

---

### Step 3 — Update `.github/workflows/tagged-release.yml`

**File:** [`.github/workflows/tagged-release.yml`](.github/workflows/tagged-release.yml:50)

Change line 50:

```yaml
# Before
          node-version: 20

# After
          node-version: 22
```

Full context for the change (lines 48–51):

```yaml
      - uses: actions/setup-node@v6
        with:
          node-version: 22   # changed from 20
      - run: npm ci
```

---

### Step 4 — Update `.github/workflows/verify-configs.yml`

**File:** [`.github/workflows/verify-configs.yml`](.github/workflows/verify-configs.yml:15)

Change line 15:

```yaml
# Before
          node-version: 20

# After
          node-version: 22
```

Full context for the change (lines 13–16):

```yaml
      - uses: actions/setup-node@v6
        with:
          node-version: 22   # changed from 20
      - run: npm ci
```

---

### Step 5 — Add `engines` field to `package.json`

**File:** [`package.json`](package.json:1)

Add an `"engines"` field after the `"name"` field (after line 2):

```json
{
  "name": "chatgptbox",
  "engines": {
    "node": ">=22"
  },
  "scripts": {
```

This makes the Node.js requirement machine-readable and causes `npm install` / `npm ci` to warn (or error with `--engine-strict`) when run on an incompatible Node.js version.

---

### Step 6 — Update `AGENTS.md` documentation

**File:** [`AGENTS.md`](AGENTS.md)

Search for the phrase `Node 20+` and replace with `Node 22+`.

The relevant line is in the **Build Issues** section under **Troubleshooting**:

```markdown
# Before
- Build failures: Check Node.js version (requires Node 20+), clear caches and rebuild.

# After
- Build failures: Check Node.js version (requires Node 22+), clear caches and rebuild.
```

---

### Step 7 — Add `.nvmrc` (recommended)

**File:** [`.nvmrc`](.nvmrc) (new file)

Create a new file `.nvmrc` at the project root with the single line:

```
22
```

This allows developers using `nvm` or `fnm` to automatically switch to the correct Node.js version by running `nvm use` or `fnm use` in the project directory.

---

## Validation Plan

After completing all upgrade steps, run the following validation sequence on Node.js 22:

### Local Validation

```bash
# 1. Switch to Node 22
nvm use 22
node --version   # Must print v22.x.x

# 2. Clean install
rm -rf node_modules
npm ci
# Expected: installs cleanly, no engine mismatch warnings

# 3. Run tests
npm test
# Expected: all tests pass (same result as on Node 20)

# 4. Run linter
npm run lint
# Expected: no new errors or warnings compared to Node 20 baseline

# 5. Run formatter check (do not write — just verify)
npm run pretty -- --check
# Expected: no formatting differences

# 6. Production build
npm run build
# Expected: completes in ~35 seconds, no errors

# 7. Verify build output structure
ls -la build/chromium/manifest.json \
        build/chromium/background.js \
        build/chromium/content-script.js \
        build/chromium/content-script.css \
        build/chromium/popup.html \
        build/chromium/popup.js \
        build/chromium/IndependentPanel.html \
        build/chromium/IndependentPanel.js \
        build/chromium/shared.js \
        build/chromium/logo.png \
        build/chromium/rules.json
# Expected: all files exist and are non-empty

ls -la build/firefox/manifest.json \
        build/firefox-without-katex-and-tiktoken/manifest.json \
        build/chromium-without-katex-and-tiktoken/manifest.json
# Expected: all four build variants present
```

### CI Validation

After pushing the workflow changes to a branch:

1. Open a pull request — the `pr-tests` workflow should trigger automatically.
2. Confirm the workflow uses `node-version: 22` in the job summary.
3. Confirm all steps (`npm ci`, `npm test`, `npm run lint`, `npm run build`) pass.
4. Manually trigger `verify-configs` via GitHub Actions → **Run workflow** to confirm it runs on Node 22.

### Manual Browser Extension Testing

Load the built extension in a browser and verify core functionality (per `AGENTS.md`):

1. **Chrome**: Go to `chrome://extensions/`, enable Developer Mode, click **Load unpacked**, select `build/chromium/`.
2. Press `Ctrl+B` to open the chat dialog on any webpage.
3. Select text on a page — verify selection tools appear.
4. Right-click — verify **Ask ChatGPT** context menu appears.
5. Click the extension icon — verify the popup opens.
6. Press `Ctrl+Shift+H` — verify the independent conversation page opens.
7. Visit YouTube.com — verify video summary features work.
8. Visit Reddit.com — verify ChatGPT integration appears in sidebar.

---

## Rollback Plan

If any validation step fails after the upgrade, revert as follows:

### Revert CI workflows (Steps 1–4)

In each of the four workflow files, change `node-version: 22` back to `node-version: 20`.

```bash
# Quick revert using git
git diff --name-only   # confirm only workflow files changed
git checkout -- .github/workflows/pr-tests.yml
git checkout -- .github/workflows/pre-release-build.yml
git checkout -- .github/workflows/tagged-release.yml
git checkout -- .github/workflows/verify-configs.yml
```

### Revert `package.json` (Step 5)

Remove the `"engines"` block that was added:

```bash
git checkout -- package.json
```

### Revert `AGENTS.md` (Step 6)

```bash
git checkout -- AGENTS.md
```

### Revert `.nvmrc` (Step 7)

```bash
rm .nvmrc
```

### Switch back to Node 20 locally

```bash
nvm use 20
node --version   # Must print v20.x.x
npm ci
npm run build
```

---

## Optional Improvements (Post-Upgrade Recommendations)

These changes are not required for the Node 22 upgrade but are recommended as follow-up work.

### OPT-1 — Add npm ecosystem to Dependabot

**File:** [`.github/dependabot.yml`](.github/dependabot.yml) (new or existing file)

Add an `npm` ecosystem entry so Dependabot automatically opens PRs for outdated npm dependencies:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

### OPT-2 — Upgrade ESLint from v8 to v9

**Current:** [`eslint@8.57.1`](package.json:81) — ESLint 8 is EOL and deprecated. It works on Node 22 but will not receive security fixes.

**Target:** `eslint@9.x` with flat config format.

**Effort:** Medium. ESLint 9 replaces `.eslintrc.json` with `eslint.config.js` (flat config). The migration requires:

1. Install ESLint 9: `npm install --save-dev eslint@^9`
2. Convert [`.eslintrc.json`](.eslintrc.json) to [`eslint.config.js`](eslint.config.js) (flat config format)
3. Update `eslint-plugin-react` to a version compatible with ESLint 9
4. Update the `lint` script in [`package.json`](package.json:8) if needed (the `--ext` flag is removed in ESLint 9)
5. Run `npm run lint` and fix any new rule violations

Reference: https://eslint.org/docs/latest/use/migrate-to-9.0.0

### OPT-3 — Upgrade Prettier from v2 to v3

**Current:** [`prettier@2.8.8`](package.json:90) — Prettier 2 is old; Prettier 3 is the current stable release.

**Effort:** Low. Prettier 3 has minimal breaking changes for this project:

1. Install Prettier 3: `npm install --save-dev prettier@^3`
2. Run `npm run pretty` — Prettier 3 may reformat some files differently
3. Review and commit any formatting changes
4. Update [`.prettierrc`](.prettierrc) if any options were removed in v3

Reference: https://prettier.io/blog/2023/07/05/3.0.0

### OPT-4 — Pin exact Node.js version in CI (optional hardening)

Instead of `node-version: 22` (which resolves to the latest 22.x), pin to a specific patch version for reproducibility:

```yaml
node-version: '22.14.0'   # or whatever the current LTS patch is
```

Check the current Node 22 LTS release at https://nodejs.org/en/about/previous-releases.

---

## Test Coverage Gap Analysis

### Current Coverage

The project uses Node.js built-in test runner (`node:test`) invoked via:

```bash
npm test
# Expands to: node --import ./tests/setup/browser-shim.mjs --test
```

The `--import` flag requires Node.js ≥ 20.6.0, which is satisfied by both Node 20 and Node 22.

**What is currently tested:**
- Unit tests in the `tests/` directory (exact scope depends on test files present)
- Linting via `npm run lint` (ESLint)
- Build integrity via `npm run build` (webpack compilation)
- Search engine adapter parsing via `npm run verify` (network-dependent, may fail in CI)

**What is NOT tested (gaps):**

| Gap | Description | Risk |
|---|---|---|
| Browser extension loading | No automated test that loads the extension in a real browser | High — regressions only caught manually |
| Content script injection | No automated test that verifies content scripts inject correctly | High |
| Popup UI rendering | No automated test for popup component rendering | Medium |
| Site adapter correctness | `npm run verify` is network-dependent and may be blocked in CI | Medium |
| Cross-browser compatibility | No automated Firefox testing | Medium |
| Keyboard shortcuts | No automated test for `Ctrl+B`, `Ctrl+Shift+H` | Low |
| API integration | No automated test for AI provider API clients | Low (manual testing required) |

**Recommendation:** Consider adding Playwright or Puppeteer-based end-to-end tests that load the extension in a headless Chromium instance. This would catch regressions that currently require manual testing.

---

## Risk Assessment Matrix

| Change | Risk Level | Likelihood of Issue | Mitigation |
|---|---|---|---|
| CI `node-version: 20` → `22` in `pr-tests.yml` | Low | Very Low | All deps compatible; revert is one-line change |
| CI `node-version: 20` → `22` in `pre-release-build.yml` | Low | Very Low | Same as above; webpack 5 fully supports Node 22 |
| CI `node-version: 20` → `22` in `tagged-release.yml` | Low | Very Low | Runs on `macos-14`; Node 22 available on that runner |
| CI `node-version: 20` → `22` in `verify-configs.yml` | Low | Very Low | Script uses only standard Node.js APIs |
| Add `"engines": {"node": ">=22"}` to `package.json` | Low | Very Low | Informational only; does not affect runtime behavior |
| Update `AGENTS.md` documentation | None | None | Documentation change only |
| Add `.nvmrc` with `22` | None | None | Optional convenience file; no build impact |
| ESLint 8 → 9 (optional) | Medium | Medium | Flat config migration required; may expose new lint errors |
| Prettier 2 → 3 (optional) | Low | Low | May reformat files; no logic changes |

### Node.js 22 Compatibility Details

| Dependency | Version | Node 22 Compatible | Notes |
|---|---|---|---|
| `webpack` | `^5.92.1` | Yes | Webpack 5 supports Node ≥ 10.13 |
| `esbuild` | `^0.25.9` | Yes | esbuild requires Node ≥ 18 |
| `babel-loader` | `^9.1.3` | Yes | Babel 7 supports Node ≥ 6.9 |
| `sass` | `^1.91.0` | Yes | Dart Sass supports Node ≥ 14 |
| `eslint` | `^8.57.1` | Yes | Works on Node 22; EOL but functional |
| `prettier` | `^2.8.8` | Yes | Works on Node 22; older but functional |
| `node-fetch` | `^3.3.2` | Yes | Node-fetch 3.x supports Node ≥ 12.20 |
| `jsdom` | `^21.1.2` | Yes | jsdom 21 supports Node ≥ 16 |
| `thread-loader` | `^4.0.4` | Yes | No Node version restriction |
| `archiver` | `^5.3.2` | Yes | No Node version restriction |

**Conclusion:** No dependency blockers exist. The upgrade is safe to proceed.

---

## Summary of Files to Change

### Required Changes (6 files)

| File | Change |
|---|---|
| [`.github/workflows/pr-tests.yml`](.github/workflows/pr-tests.yml:35) | `node-version: 20` → `node-version: 22` |
| [`.github/workflows/pre-release-build.yml`](.github/workflows/pre-release-build.yml:26) | `node-version: 20` → `node-version: 22` |
| [`.github/workflows/tagged-release.yml`](.github/workflows/tagged-release.yml:50) | `node-version: 20` → `node-version: 22` |
| [`.github/workflows/verify-configs.yml`](.github/workflows/verify-configs.yml:15) | `node-version: 20` → `node-version: 22` |
| [`package.json`](package.json:2) | Add `"engines": {"node": ">=22"}` after `"name"` field |
| [`AGENTS.md`](AGENTS.md) | Update "requires Node 20+" → "requires Node 22+" |

### Optional Changes (1 new file + 3 dependency upgrades)

| File / Action | Change |
|---|---|
| [`.nvmrc`](.nvmrc) | Create new file with content `22` |
| [`.github/dependabot.yml`](.github/dependabot.yml) | Add npm ecosystem entry |
| `eslint` upgrade | `8.57.1` → `9.x` with flat config migration |
| `prettier` upgrade | `2.8.8` → `3.x` |
