# App patch — "Try the demo" on each login screen

Adds a small panel to each app's **Login** screen that shows the shared WE EHS
demo credentials (`demo@weehs.app` / `Demo@123`) with copy buttons and a
**Use demo account** button that fills the form for one-click sign-in.

> ⚠️ These changes belong in the **individual app repos**, not in `safetyhub`.
> They couldn't be pushed from the web session that generated them (it only has
> write access to `safetyhub`). So either apply the files below per repo, or open
> a Claude Code session **on each app repo** and ask it to copy these files in.

## Finished, ready-to-commit files

Each app has a folder here mirroring its real paths. To apply an app, copy its two
files over the same paths in that repo and commit:

| App | Files to copy (this folder → app repo) |
| --- | --- |
| permit-to-work | `permit-to-work/src/components/DemoCredentials.jsx`, `permit-to-work/src/pages/Login.jsx` |
| hecp-loto | `hecp-loto/src/components/DemoCredentials.jsx`, `hecp-loto/src/pages/Login.jsx` |
| hira | `hira/src/components/DemoCredentials.jsx`, `hira/src/pages/Login.jsx` |
| incident-ira | `incident-ira/src/components/DemoCredentials.jsx`, `incident-ira/src/pages/Login.jsx` |
| hse-committee-meeting | `hse-committee-meeting/src/components/DemoCredentials.jsx`, `hse-committee-meeting/src/pages/Login.jsx` |
| inspections-portal | `inspections-portal/src/components/DemoCredentials.jsx`, `inspections-portal/src/pages/Login.jsx` |
| fire-marshal | `fire-marshal/src/components/DemoCredentials.jsx`, `fire-marshal/src/pages/Login.jsx` |
| internal-audit-portal | `internal-audit-portal/src/components/DemoCredentials.jsx`, `internal-audit-portal/src/pages/auth/Login.jsx` |

Each `Login.jsx` here is that app's real login page with just **two additions**:
an `import DemoCredentials …` line and a `<DemoCredentials onUse={…} />` line right
after the Sign-in button — nothing else changed. The component (`DemoCredentials.jsx`)
is identical in every app; the top-level `DemoCredentials.jsx` in this folder is the
canonical copy.

### Quick apply with a Claude session per repo
Open a Claude Code session on an app repo and say:
> "Copy `app-patches/<this-repo>/` from my `safetyhub` repo over the matching paths
> here, then commit and push."

## Notes

- **What it does:** "Use demo account" fills the email + password fields; the visitor
  clicks **Sign in**. (To log in on a single click instead, point `onUse` at the
  submit handler — see the inline comment in `DemoCredentials.jsx`.)
- **internal-audit-portal** stores its login fields as separate `email`/`password`
  state, so its `onUse` is `(c) => { setEmail(c.email); setPassword(c.password) }`.
  All other apps use `form`/`setForm`, so theirs is `(c) => setForm(c)`.
- **Credentials** live in `DemoCredentials.jsx` as `DEMO_LOGIN`. Change them there
  (and on the landing page) if the demo account ever changes.
- These accounts must exist first — run `demo-seed/` (see its README) or sign up the
  **WE EHS** org once in each app.
