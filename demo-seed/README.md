# WE EHS — Demo Account Seeder

Creates **one shared demo organization** named **`WE EHS`** with an admin login
(`demo@weehs.app` / `Demo@123`) inside each WE EHS app's Firebase project — the
same credentials shown on the landing page.

It does this by replicating exactly what each app's own *"Register Organization"*
flow writes to Firebase Auth + Firestore, so the seeded account behaves like a
normal admin signup.

> ⚠️ Run this **locally** (it needs internet + each app's Firebase config).
> It can't run from the Claude Code web sandbox, which has no outbound network.

## Setup

```bash
cd demo-seed
cp apps.config.example.mjs apps.config.mjs   # apps.config.mjs is git-ignored
```

Edit `apps.config.mjs` and, for each app, paste its **Firebase Web config** — the
six `VITE_FIREBASE_*` values from that app's **Vercel → Settings → Environment
Variables** (or its local `.env`). Then flip `enabled: true` on the apps you want
to seed. These config values are public client identifiers, not secrets.

## Run

```bash
npm install
npm run seed
```

You'll see a line per app, e.g.:

```
• HECP · LOTO: auth user created
• HECP · LOTO: ✓ demo org + admin profile created
• Fire Marshal: ✓ demo org + admin profile created
```

The script is **idempotent** — re-running it reuses the existing login and skips
apps that already have the demo org.

## Adapters

Each app entry names an `adapter` describing how that app stores orgs/users:

| Adapter | Status | Writes |
| --- | --- | --- |
| `hecp` | ✅ verified from source | `organizations/{id}` + `users/{uid}` (admin, approved, full `permissions[]`, `joinCode`) |
| `firemarshal` | ✅ verified from source | `organizations/{id}` + `users/{uid}` (admin, approved) + public `orgIndex/{nameLower}` |
| `generic` | ⚠️ best-guess | `organizations/{id}` + `users/{uid}` (admin, approved) + `orgIndex/{nameLower}` |
| `authOnly` | safe fallback | only the Firebase Auth login; create the org via the app's signup UI |

**Only HECP and Fire Marshal are verified.** For the other six apps the `generic`
adapter is a best guess based on the common pattern. If an app's signup uses
different field names/collections, either:

- set its `adapter: "authOnly"` (creates just the login; then click *Register
  Organization → WE EHS* inside the app once), **or**
- send me that app's signup/register function and I'll add an exact adapter.

## Notes

- **Email verification:** Firebase Email/Password doesn't verify addresses by
  default, so `demo@weehs.app` works as a login even though it's not a real inbox.
  If an app enforces verification or password reset, use a mailbox you control and
  update both this config and the landing page.
- **Firestore rules:** these apps allow a freshly-signed-up user to create their
  own org/profile, so the seed writes succeed under normal rules. If a rule blocks
  a write you'll see a `permission-denied` line — tell me and we'll adjust.
